"use client"

import { Outlet } from "@remix-run/react";
import type {V2_MetaFunction} from "@remix-run/node";


export const meta: V2_MetaFunction = () => {
    return [
        {title: "DNK site."},
        {name: "description", content: "Welcome to DNK site!"},
    ];
};

export default function Index() {
    return (
        <>
            <Outlet />
        </>
    )
}
