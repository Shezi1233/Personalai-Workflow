import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOKEN_COOKIE = "token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ detail: "Invalid request body." }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { detail: "Auth service unavailable. Is the backend running?" },
      { status: 502 }
    );
  }

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    const status = backendRes.status === 401 ? 401 : 502;
    return Response.json(
      { detail: data.detail ?? "Login failed." },
      { status }
    );
  }

  /* Set the JWT in an httpOnly cookie (more secure than localStorage). */
  const token = data.token;
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return Response.json(
    { id: data.id, name: data.name, email: data.email },
    { status: 200 }
  );
}
