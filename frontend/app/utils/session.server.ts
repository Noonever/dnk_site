import { createCookieSessionStorage, redirect } from "@remix-run/node";

import type { User } from "~/types/user"

import { getUserByUsername } from "~/backend/user";

const USER_SESSION_KEY = "userId";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: ["lol"],
//         secure: process.env.NODE_ENV === "production"
        secure: false,
    },
});

async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return sessionStorage.getSession(cookie);
}

export async function createUserSession({
    request,
    userName: username,
}: {
    request: Request;
    userName: string;
}) {
    const session = await getSession(request);
    session.set(USER_SESSION_KEY, username);
    const user = await getUserByUsername(username);
    return redirect(user?.isAdmin? "/admin/requests" : "/request", {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 7 // 7 days,
            }),
        },
    });
}

export async function getUserName(
    request: Request
): Promise<User["username"] | undefined> {
    const session = await getSession(request);
    const userId = session.get(USER_SESSION_KEY);
    return userId;
}

export async function getUser(request: Request) {
    const userId = await getUserName(request);
    if (userId === undefined) return null;

    const user = await getUserByUsername(userId);
    if (user) return user;

    throw await logout(request);
}

export async function requireUserName(
  request: Request,
) {
  const userName = await getUserName(request);
  if (!userName) {
    throw redirect('/login');
  }
  return userName;
}


export async function logout(request: Request) {
    const session = await getSession(request);
    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}
