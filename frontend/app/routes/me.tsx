import type { V2_MetaFunction } from "@remix-run/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

export const meta: V2_MetaFunction = () => {
    return [
        {title: "DNK | Личный кабинет"},
        {name: "description", content: "Welcome to DNK site!"},
    ];
};

export async function loader({ request }: any) {
    return requireUserId(request);
}

export default function Me() {

    const user = useLoaderData();

    return (
        <div className="page">
            <p>{JSON.stringify(user)}</p>
            <Outlet />
        </div>
    );

}
