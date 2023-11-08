import { Form, useActionData, useRouteError } from "@remix-run/react";

import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { createUserSession, getUserName } from "~/utils/session.server";
import { verifyLogin } from "~/backend/user";

import styles from '~/styles/login.css'
import logo from '~/static/img/dnk_logo.png'

export const links = () => {
    return [{ rel: "stylesheet", href: styles }];
}

export async function loader({ request }: LoaderArgs) {
    const userId = await getUserName(request);
    if (userId) return redirect("/me");
    return json({});
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();
    const email = formData.get("username");
    const password = formData.get("password");

    const user = await verifyLogin(String(email), String(password));
    if (!user) {
        return "Invalid login";
    }

    return createUserSession({
        request,
        userName: user.username,
    });
}

export default function Login() {
    const response = useActionData();
    console.log(response)
    return (
        <div id="login-container">
            <div id="row-container">
                <div id='form-container'>
                    <center>
                        <div id='form-title-container'>
                            <span id='form-title'>войти в аккаунт</span>
                        </div>
                        {response && <span style={{ fontFamily: 'Montserrat', fontSize: '17px', color: 'white' }}>Неверный логин или пароль</span>}
                        <Form method="post">
                            <div id='login-form'>
                                <input
                                    id="username-input"
                                    name="username"
                                    className="input-field"
                                    type="text"
                                    placeholder="логин"
                                >
                                </input>
                                <input
                                    id="password-input"
                                    name="password"
                                    className="input-field"
                                    type="password"
                                    placeholder="пароль"
                                >
                                </input>
                                <button id="enter-button" type="submit">войти</button>
                            </div>
                        </Form>
                    </center>
                </div>
                <div id='logo-container'>
                    <img id='logo' src={logo} alt="logo" />
                    <div id='logo-text-container'>
                        <span id='logo-text'>
                            КАБИНЕТ АРТИСТА
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}