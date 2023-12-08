import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { getUserByUsername } from "~/backend/user";

import styles from "~/styles/request.css";
import { requireUserName } from "~/utils/session.server";


// @ts-ignore
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
    const page = request.url.split('/').pop();
    return {user, page};
}

export default function ReleaseRequest() {

    const { user, page } = useLoaderData();
    const navigate = useNavigate();

    useEffect(() => {
        // Perform a redirect when the page is visited
        if (page === 'request') {
            navigate('/request/single');
        }
    }, [navigate, page]);

    if (!user.isVerified) {
        return (
            <div style={{
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.24)",
                padding: "10px",
                height: '30vh',
                width: '60%',
                borderRadius: "30px",
                marginTop: "10%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"

            }} onClick={() => navigate('/me')}>
                <div style={{height: '60%', display: "flex", flexDirection: "column", gap: "20%", paddingTop: '10%', textAlign: "center" }}>
                    <div>
                        <span style={{ textAlign: "center", width: '100%' }} className="info-text">Для отправки заявок необходимо</span>
                    </div>
                    <div>
                        <span style={{ textAlign: "center", width: '100%' }} className="info-text"> заполнить данные в профиле артиста</span>
                    </div>
                </div>
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