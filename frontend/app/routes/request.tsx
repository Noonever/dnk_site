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


export async function loader({ request }: LoaderArgs) {
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
            <div style={{
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.24)",
                padding: "10px",
                textAlign: "center",
                height: '30vh',
                width: '60%',
                borderRadius: "30px",
                display: "flex",
                alignItems: "center",
                marginTop: "10%",
            }} onClick={() => navigate('/me')}>
                <span style={{ textAlign: "center", width: '100%' }} className="info-text">Для отправки заявок необходимо заполнить данные в профиле</span>
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