import { Outlet } from "@remix-run/react";
import styles from "../styles/admin.css";
import { LoaderArgs, redirect } from "@remix-run/node";
import { getUserById } from "~/backend/user";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Панель администратора" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export async function  loader({request}:LoaderArgs) {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user?.isAdmin) {
        throw new Response("Unauthorized", { status: 401 });
    }
    if (request.url.endsWith('/admin')) {
        return redirect('/admin/requests');
    }
    return null
}

export default function AdminPanel() {
    return <Outlet/>
}