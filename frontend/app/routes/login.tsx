import { Form } from "@remix-run/react";

import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { createUserSession, getUserId } from "~/utils/session.server";
import { verifyLogin } from "~/backend/axios";

import type { User } from "~/types/user";

export async function loader({ request }: LoaderArgs) {
    const userId = await getUserId(request);
    if (userId) return redirect("/me");
    return json({});
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();
    const email = formData.get("username");
    const password = formData.get("password");

    const user: User = await verifyLogin(email, password);

    // If no user is returned, return the error

    return createUserSession({
        request,
        userId: user.id,
    });
}


export default function LoginPage() {
    return (
        <div className="page">
            <div className="component-container"></div>
            <Form method="post">
                <div className="multi-form-container">
                    <center>
                        <p className='multi-form-title'>Вход</p>
                    </center>
                    <div className={`form-field`}>
                        <div className='field-container'>
                            <div className='field-label-container'>
                                <label htmlFor="email" className="field-label">Email</label>
                            </div>
                            <div className='field-input-container'>
                                <input
                                    className="input-field"
                                    id="email"
                                    required
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`form-field`}>
                        <div className='field-container'>
                            <div className='field-label-container'>
                                <label htmlFor="password" className="field-label">Password</label>
                            </div>
                            <div className='field-input-container'>
                                <input
                                    id="password"
                                    required
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit">Log in</button>
                </div>
            </Form>
        </div>
    )
}