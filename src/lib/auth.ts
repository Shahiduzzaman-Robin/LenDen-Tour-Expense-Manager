import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const auth = headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  const cookie = headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    return match ? match[1] : null;
  }
  return null;
}

export function getUserFromRequest(headers: Headers): JWTPayload | null {
  const token = getTokenFromHeaders(headers);
  if (!token) return null;
  return verifyToken(token);
}
