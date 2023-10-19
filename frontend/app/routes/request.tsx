import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { getUserByUsername } from "~/backend/user";

import styles from "~/styles/request.css";
import { requireUserName } from "~/utils/session.server";

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
    const userName = await requireUserName(request);
    const user = await getUserByUsername(userName);
    return user;
}   

export default function ReleaseRequest() {

    const user = useLoaderData();
    const navigate = useNavigate();

    useEffect(() => {
        // Perform a redirect when the page is visited
        navigate('/request/single');
    }, [navigate]);

    if (!user.isVerified) {
        return (
            <div style={{cursor: "pointer"}} onClick={() => navigate('/me')}>
                <span className="info-text" style={{textDecoration: "underline"}}>Для отправки заявок необходимо заполнить данные в профиле</span>      
            </div>
        );
    }

    return (
        <>
            <div id='request-navbar'>
                <div id='request-navbar-items'>
                    <NavLink className={"link"} to="/request/single">СИНГЛ</NavLink>
                    <NavLink className={"link"} to="/request/album">АЛЬБОМ</NavLink>
                    <NavLink className={"link"} to="/request/video-clip">ВИДЕОКЛИП</NavLink>
                    <NavLink className={"link"} to="/request/back-catalog">БЭК-КАТАЛОГ</NavLink>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    );
}