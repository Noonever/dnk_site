import { json } from "@remix-run/node";
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

import styles from "./styles.css";

import { getUser } from "~/utils/session.server";
import Navbar from "./components/Navbar";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader({ request }: LoaderArgs) {
    return json({
        user: await getUser(request),
    });
}

const adminNavbar: NavbarProps = {
    links: {
        "Отправить заявку на релиз": "/forms/release",
        "Заявки на релизы": "/releases",
        "Пользователи": "/users",
    }
}

const defaultNavbar: NavbarProps = {
    links: {
        "Отправить заявку на релиз": "/forms/release",
        "Релизы": "/releases",
    }
}

export default function App() {
    const data = useLoaderData();
    const user = data.user;
    let isAdmin = false
    let isVerified = false
    if (user) {
        isAdmin = user.isAdmin
        isVerified = user.isVerified
    }

    console.log('from root', isAdmin, isVerified);

    let navbarLinks = {}

    if (isAdmin) {
        navbarLinks = adminNavbar.links
    } else if (user) {
        navbarLinks = defaultNavbar.links
    } else {
        navbarLinks = {}
    }

    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <header className="header">
                    <div className="header-left">
                        <p className="header-text">DNK</p>
                    </div>
                    <div className="header-center">
                        <Navbar links={navbarLinks} />
                    </div>
                    <div className="header-right">
                        <div className="user-block">
                            <nav className='navbar'>
                                <NavLink to="/me">
                                    <p className='navbar-text'>Личный кабинет</p>
                                </NavLink>
                            </nav>
                            {user ? (
                                <Form method="post" action="/logout">
                                    <button type='submit'>Выйти</button>
                                </Form>
                            ) : <></>}

                        </div>
                    </div>
                </header>

                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}

