import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'mystica_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Set the auth cookie in the response */
export async function setAuthCookie(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    expires,
    path: '/',
  });
}

/** Clear the auth cookie */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Get the auth cookie value */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/** Also support reading from Authorization header (for client-side fetch) */
export function getTokenFromRequest(req: NextRequest): string | undefined {
  // 1. Try HTTP-only cookie
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;
  // 2. Try Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }
  return undefined;
}

/** Resolve the authenticated user from a request, or null */
export async function getUserFromRequest(
  req: NextRequest
): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Confirm user still exists in DB
  const user = await db.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true },
  });
  return user;
}

export { COOKIE_NAME };
