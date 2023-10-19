import { Form } from "@remix-run/react";

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

    console.log("VERFIGY LOGIN")
    const user = await verifyLogin(String(email), String(password));
    if (!user) {
        return Error("Invalid login");
    }
    console.log("END VERFIGY LOGIN")

    console.log(user)
    // TODO: unsuccessful login
    // If no user is returned, return the error
    
    return createUserSession({
        request,
        userName: user.username,
    });
}

export default function login() {
    return (
        <div id="login-container">
            <div id="row-container">
                <div id='form-container'>
                    <center>
                        <div id='form-title-container'>
                            <span id='form-title'>войти в аккаунт</span>
                        </div>
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
                            КАБИНЕТ
                        </span>
                        <span id='logo-text'>
                            АРТИСТА
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}