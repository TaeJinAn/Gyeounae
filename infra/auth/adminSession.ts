import { getSessionPayload } from "@shared/auth/session";

export async function getAdminActorId() {
  const session = await getSessionPayload();
  return session?.userId ?? "system-admin";
}
