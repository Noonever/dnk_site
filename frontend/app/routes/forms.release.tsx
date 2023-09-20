import { Outlet } from "@remix-run/react";
import type { V2_MetaFunction } from "@remix-run/react";
import Navbar from "~/components/Navbar";

export const meta: V2_MetaFunction = () => {
    return [
        { title: "DNK | Заявки на релиз" },
        { name: "description", content: "Welcome to DNK site!" },
    ];
}

export default function ReleaseForms() {
    return (
        <>
            <div className="release-menu">
                <center>
                    <p>Тип релиза:</p>
                </center>
                <div className="release-navbar">
                    <Navbar links={{ "Альбом": "/forms/release/album", "Сингл": "/forms/release/single" }} dark={true} />
                </div>
            </div>
            <Outlet />
        </>
    )
}