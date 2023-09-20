import {Outlet} from "@remix-run/react";
import type { V2_MetaFunction  } from "@remix-run/react";

import MultiForm from "~/components/MultiForm";
import { singleFormConfig, singleTrackFormConfig } from "~/config/form/release/single";


export const meta: V2_MetaFunction = () => {
    return [
        {title: "DNK | Заявка на релиз"},
        {name: "description", content: "Welcome to DNK site!"},
    ];
};

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    return userId
}

export default function Forms() {


    return (
        <>
            <MultiForm
                formConfigurations={{ "Сингл" : singleFormConfig, "Трек" : singleTrackFormConfig }}
                title="Новый релиз"
                addButtonText="Добавить"
                deleteButtonText="Удалить"
                submitButtonText="Отправить"
                onSubmitCallback={(data) => {alert(data)}}
            />
            <Outlet />
        </>
    )
}