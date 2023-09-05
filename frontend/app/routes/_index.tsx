"use client"

import ReleaseForm from "~/components/ReleaseForm"
import type {V2_MetaFunction} from "@remix-run/node";
import React from "react";
import {Label} from "~/components/ui/label";

export const meta: V2_MetaFunction = () => {
    return [
        {title: "New Remix App"},
        {name: "description", content: "Welcome to Remix!"},
    ];
};

export default function Index() {
    return (
        <div className="app-container mx-auto mt-5 grid w-full max-w-sm items-center gap-1.5">
            <Label>Release Form</Label>
            <ReleaseForm/>
        </div>
    )
};