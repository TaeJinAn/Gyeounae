import { NextResponse } from "next/server";
import { getSessionPayload } from "@shared/auth/session";
import { MariaDbFootProfileRepository } from "@infra/repositories/MariaDbFootProfileRepository";
import { UpsertFootProfileUsecase } from "@features/usecases/UpsertFootProfileUsecase";

type SaveFootProfileRequest = {
  footLengthMm?: number | null;
  footWidthMm?: number | null;
  footHeightMm?: number | null;
};

export async function POST(request: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as SaveFootProfileRequest;
  await new UpsertFootProfileUsecase(
    new MariaDbFootProfileRepository()
  ).execute({
    userId: session.userId,
    footLengthMm: payload.footLengthMm ?? undefined,
    footWidthMm: payload.footWidthMm ?? undefined,
    footHeightMm: payload.footHeightMm ?? undefined
  });

  return NextResponse.json({ ok: true });
}
