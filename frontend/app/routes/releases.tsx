import type { V2_MetaFunction } from "@remix-run/react";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";
import type { LoaderArgs } from "@remix-run/node";

import { getReleases } from "~/backend/axios";

import Table from "~/components/Table";
import type { MultiFormConfig, FormConfig } from "~/components/MultiForm";
import { getAlbums } from "~/backend/release.album";

export const meta: V2_MetaFunction = () => {
    return [
        { title: "DNK | Releases" },
        { name: "description", content: "Welcome to DNK site!" },
    ];
};


const columns = [
    {
        name: "type",
        alias: "Тип релиза",
        filterable: true,
        visible: true
    },
    {
        name: "performer",
        alias: "Исполнитель",
        filterable: true,
        visible: true
    },
    {
        name: "title",
        alias: "Название релиза",
        filterable: true,
        visible: true
    },
]

const releaseUpdateFormConfig: FormConfig = {
    title: "Релиз",
    maxAmount: 1,
    startAmount: 1,
    fields: {
        type: {
            alias: "Тип релиза",
            type: "text",
            validation: /^[a-zA-Z0-9\s-]*$/,
            placeholder: "Enter Release Type",
            errorMessage: "Release Type is required and should contain only letters, numbers, spaces, or hyphens.",
            isRequired: false,
        },
        performer: {
            alias: "Исполнитель",
            type: "text",
            validation: /^[a-zA-Z0-9\s-]*$/,
            placeholder: "Enter Release Performer",
            errorMessage: "Release Performer is required and should contain only letters, numbers, spaces, or hyphens.",
            isRequired: false,
        },
        title: {
            alias: "Название релиза",
            type: "text",
            validation: /^[a-zA-Z0-9\s-]*$/,
            placeholder: "Enter Release Title",
            errorMessage: "Release Title is required and should contain only letters, numbers, spaces, or hyphens.",
            isRequired: false,
        },
    }
}

const formConfig: MultiFormConfig = {
    formConfigurations: {
        'main': releaseUpdateFormConfig
    },
    title: "Релиз",
    addButtonText: "Добавить",
    deleteButtonText: "Удалить",
    submitButtonText: "Обновить",
    onSubmitCallback: (userId: any, formData: any) => {
        alert(JSON.stringify(formData))
    }
}
export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    const releases = await getAlbums(userId)
    return releases;
}

export default function Releases() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="page">
            <Table data={data} multiFormConfig={formConfig} columns={columns} pageSize={10} />
            <Outlet />
        </div>
    );
}
