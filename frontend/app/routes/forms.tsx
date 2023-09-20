import { Outlet } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
    await requireUserId(request);

    return null;
}

export default function Forms() {
    return (
        <div className="page">
            <Outlet />
        </div>
    )
}
