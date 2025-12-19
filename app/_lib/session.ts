"use server";

import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const secret = process.env.SECRET;
if (!secret) {
  throw new Error("Missing SECRET environment variable");
}

const key = new TextEncoder().encode(process.env.SECRET);

const SESSION_COOKIE = {
  name: "session",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  },
  duration: 24 * 60 * 60 * 1000, // 1 day
} as const;

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);
}

export async function decrypt(token: string | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

// --- Account Sessions ---

export async function createSession(userId: string) {
  try {
    const expires = new Date(Date.now() + SESSION_COOKIE.duration);
    const session = await encrypt({ userId, expires });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE.name, session, {
      ...SESSION_COOKIE.options,
      expires,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Error creating session");
  }
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE.name)?.value;

  const session = await decrypt(sessionCookie);

  if (!session || !session.userId) {
    redirect("/");
  }

  return { userId: session.userId };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE.name);

  redirect("/");
}

// --- Game Sessions ---

const GAME_SESSION_COOKIE = {
  name: "gameSession",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  },
  duration: 24 * 60 * 60 * 1000, // 1 day
} as const;

export async function createGameSession(playerId: string) {
  try {
    const expires = new Date(Date.now() + GAME_SESSION_COOKIE.duration);
    const session = await encrypt({ playerId, expires });

    const cookieStore = await cookies();
    cookieStore.set(GAME_SESSION_COOKIE.name, session, {
      ...GAME_SESSION_COOKIE.options,
      expires,
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    throw new Error("Error creating game session");
  }
}

export async function verifyGameSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(GAME_SESSION_COOKIE.name)?.value;

  const session = await decrypt(sessionCookie);

  if (!session || !session.playerId) {
    throw new Error("Error verifying game session");
  }

  return { playerId: session.playerId };
}

export async function deleteGameSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE.name);
}
