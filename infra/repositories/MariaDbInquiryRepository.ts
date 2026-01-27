import type {
  InquiryRepository,
  CreateInquiryCommand,
  UpdateInquiryStatusCommand,
  ReplyInquiryCommand,
  InquiryQueryCommand
} from "@repositories/InquiryRepository";
import { Inquiry } from "@domain/entities/Inquiry";
import { mariaDbPool } from "../db/mariaDbPool";

type InquiryRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  body: string;
  status: "PENDING" | "REPLIED" | "CLOSED";
  admin_reply?: string | null;
  replied_at?: Date | null;
  created_at: Date;
};

export class MariaDbInquiryRepository implements InquiryRepository {
  async findOpenInquiries() {
    return this.findAll({ status: "PENDING" });
  }

  async findAll(command: InquiryQueryCommand) {
    const conditions: string[] = [];
    const params: Array<string> = [];
    if (command.status) {
      conditions.push("status = ?");
      params.push(command.status);
    }
    if (command.userId) {
      conditions.push("user_id = ?");
      params.push(command.userId);
    }
    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await mariaDbPool.query<InquiryRow[]>(
      `SELECT * FROM inquiries ${whereSql} ORDER BY created_at DESC`,
      params
    );
    return rows.map((row) =>
      Inquiry.create({
        id: row.id,
        userId: row.user_id,
        category: row.category,
        title: row.title,
        body: row.body,
        status: row.status,
        adminReply: row.admin_reply ?? null,
        repliedAt: row.replied_at ?? null,
        createdAt: row.created_at
      })
    );
  }

  async findById(command: { inquiryId: string }) {
    const [rows] = await mariaDbPool.query<InquiryRow[]>(
      "SELECT * FROM inquiries WHERE id = ? LIMIT 1",
      [command.inquiryId]
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return Inquiry.create({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      title: row.title,
      body: row.body,
      status: row.status,
      adminReply: row.admin_reply ?? null,
      repliedAt: row.replied_at ?? null,
      createdAt: row.created_at
    });
  }

  async create(command: CreateInquiryCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO inquiries (
        id, user_id, category, title, body, status, admin_reply, replied_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.id,
        command.userId,
        command.category,
        command.title,
        command.body,
        command.status,
        null,
        null,
        command.createdAt
      ]
    );
  }

  async updateStatus(command: UpdateInquiryStatusCommand) {
    await mariaDbPool.query("UPDATE inquiries SET status = ? WHERE id = ?", [
      command.status,
      command.inquiryId
    ]);
  }

  async reply(command: ReplyInquiryCommand) {
    await mariaDbPool.query(
      "UPDATE inquiries SET admin_reply = ?, status = ?, replied_at = ? WHERE id = ?",
      [command.adminReply, command.status, command.repliedAt, command.inquiryId]
    );
  }
}
