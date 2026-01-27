import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { UploadCommand, UploadResult, UploadService } from "@shared/uploads/UploadService";

export class LocalUploadService implements UploadService {
  async upload(command: UploadCommand): Promise<UploadResult> {
    const extension = command.resize ? ".webp" : this.normalizeExtension(command.file);
    const fileName = `${crypto.randomUUID()}${extension}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      command.folder
    );
    await mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, fileName);
    const arrayBuffer = await command.file.arrayBuffer();
    if (command.resize) {
      const { default: sharp } = await import("sharp");
      await sharp(Buffer.from(arrayBuffer))
        .resize(command.resize.width, command.resize.height, {
          fit: "cover",
          position: "center"
        })
        .toFormat("webp", { quality: 82 })
        .toFile(targetPath);
    } else {
      await writeFile(targetPath, Buffer.from(arrayBuffer));
    }
    return {
      url: `/uploads/${command.folder}/${fileName}`
    };
  }

  private normalizeExtension(file: File) {
    const raw = path.extname(file.name || "").toLowerCase();
    if (raw) return raw;
    const mime = file.type.toLowerCase();
    if (mime.includes("png")) return ".png";
    if (mime.includes("webp")) return ".webp";
    if (mime.includes("gif")) return ".gif";
    return ".jpg";
  }
}
