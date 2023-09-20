import { Outlet, useLoaderData } from "@remix-run/react";
import type { V2_MetaFunction } from "@remix-run/react";

import type { LoaderArgs } from "@remix-run/node";

import MultiForm from "~/components/MultiForm";
import { albumFormConfig, albumTrackFormConfig } from "~/config/form/release/album";

import { requireUserId } from "~/utils/session.server";
import { handleUploadAlbum } from "~/backend/release.album";


export const meta: V2_MetaFunction = () => {
    return [
        { title: "DNK | Заявка на релиз" },
        { name: "description", content: "Welcome to DNK site!" },
    ];
};

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    return userId
}

export default function AlbumForm() {

    const userId = useLoaderData();

    return (
        <>
            <MultiForm
                formConfigurations={{ "album": albumFormConfig, "track": albumTrackFormConfig }}
                title="Новый релиз"
                addButtonText="Добавить"
                deleteButtonText="Удалить"
                submitButtonText="Отправить"
                userId={userId}
                onSubmitCallback={handleUploadAlbum}
            />
            <Outlet />
        </>
    )
}
