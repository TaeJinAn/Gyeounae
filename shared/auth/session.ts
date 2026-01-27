import { cookies } from "next/headers";
import {
  createSessionToken,
  sessionCookieName,
  verifySessionToken,
  type SessionPayload
} from "./sessionToken";

export const setSessionCookie = async (payload: SessionPayload) => {
  const token = await createSessionToken(payload);
  cookies().set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
};

export const clearSessionCookie = () => {
  cookies().set(sessionCookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
};

export const getSessionPayload = async () => {
  const token = cookies().get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
};
