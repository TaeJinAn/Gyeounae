import { NextResponse } from "next/server";
import { LocalUploadService } from "@infra/uploads/LocalUploadService";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }

  const uploadService = new LocalUploadService();
  const result = await uploadService.upload({ file, folder: "listings" });
  return NextResponse.json({ url: result.url });
}
