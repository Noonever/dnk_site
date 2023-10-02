import { redirect, type LinksFunction, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { getUserById } from "~/backend/user";

import styles from "~/styles/admin.request.css";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Заявка на отгрузку" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};


export async function loader({request}: LoaderArgs) {
    if (request.url.endsWith("/request")) {
        return redirect("/admin/request/single");
    }
    return null
}   

export default function ReleaseRequest() {

    return (
        <>
            <div id='request-navbar'>
                <div id='request-navbar-items'>
                    <NavLink className={"link admin"} to="/admin/request/single">СИНГЛ</NavLink>
                    <NavLink className={"link admin"} to="/admin/request/album">АЛЬБОМ</NavLink>
                    <NavLink className={"link admin"} to="/admin/request/video-clip">ВИДЕОКЛИП</NavLink>
                    <NavLink className={"link admin"} to="/admin/request/back-catalog">БЭК-КАТАЛОГ</NavLink>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    );
}