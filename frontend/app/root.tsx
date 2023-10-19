import { json, redirect } from "@remix-run/node";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";

import {
    Form,
    Links,
    LiveReload,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";

import styles from "./tailwind.css";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: "https://fonts.cdnfonts.com/css/montserrat" }];
}

export async function loader({ request }: LoaderArgs) {
    const user = await getUser(request);
    // if (!user && !request.url.includes("/login")) {
    //     return redirect("/login");
    // }

    // if (user !== null) {
    //     if (user.isAdmin && !request.url.includes("admin")) {
    //         return redirect("/admin");
    //     }
    //     if (!user.isAdmin && !request.url.includes("request")) {
    //         return redirect("/request");
    //     }
    // }

    return json({
        user: user, currentPath: request.url,
    });
}

export default function App() {

    const data = useLoaderData<typeof loader>();
    const currentPath = data.currentPath;
    const user = data.user;
    const isAdmin = user?.isAdmin;

    console.log(currentPath)
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className={isAdmin ? "admin" : ""}>
                {currentPath.includes('/login') ? <></> : (

                    <header id="header">
                        {isAdmin ? (
                            <>
                                <div id="header-left">
                                    <NavLink className={"link admin"} to="/admin/requests">ЗАЯВКИ НА ОТГРУЗКУ</NavLink>
                                    <NavLink className={"link admin"} to="/admin/users">ПОЛЬЗОВАТЕЛИ</NavLink>
                                </div>
                                <div id="header-right">
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <span className='user-name admin'>Панель администратора</span>
                                    </div>
                                    <Form method="post" action="/logout">
                                        <button className='logout admin' type='submit'>ВЫЙТИ</button>
                                    </Form>
                                </div>
                            </>
                        ) : (
                            <>
                                <div id="header-left">
                                    <NavLink className={"link"} to="/me">ПРОФИЛЬ АРТИСТА</NavLink>
                                    <NavLink className={"link"} to="/request">ЗАЯВКА НА ОТГРУЗКУ</NavLink>
                                    <NavLink className={"link"} to="/my-releases">МОИ РЕЛИЗЫ</NavLink>
                                </div>
                                <div id="header-right">
                                    {user ? (
                                        <>
                                            <div id="user-name-container">
                                                <span className="user-name">{user.username}</span>
                                            </div>
                                            <Form method="post" action="/logout">
                                                <button className='logout' type='submit'>ВЫЙТИ</button>
                                            </Form>
                                        </>
                                    ) : <></>}
                                </div>
                            </>
                        )}

                    </header>
                )}
                {
                    currentPath.includes('/login') ? (
                        <Outlet />
                    ) : (
                        <div className='page'>
                            <Outlet />
                        </div>
                    )
                }
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}

