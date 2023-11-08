import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs, LinksFunction } from "@remix-run/node"

import BackCatalogReleaseSection from "~/components/back-catalog-release-section";
import NewMusicReleaseSection from "~/components/new-music-release-section";
import ClipReleaseSection from "~/components/clip-release-section";

import { getReleaseRequest } from "~/backend/release"

import styles from "~/styles/admin.request.css";
import styles2 from "~/styles/admin.requests.css";


export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: styles2 }];
};

export async function loader({ params }: LoaderArgs) {

    const id = params.releaseId
    if (!id) {
        throw new Response("Not found", { status: 404 });
    }

    const request = await getReleaseRequest(id)
    if (!request) {
        throw new Response("Not found", { status: 404 });
    }

    return {
        request
    }

}

export default function ReleaseRequest() {

    const loaderData = useLoaderData<typeof loader>()
    const request = loaderData.request

    let ReleaseSection = <></>

    if (request.type === "back-catalog") {
        ReleaseSection = <BackCatalogReleaseSection request={request}/>
    } else if (request.type === "new-music") {
        ReleaseSection = <NewMusicReleaseSection request={request}/>
    } else if (request.type === "clip") {
        ReleaseSection = <ClipReleaseSection request={request}/>
    }

    return (
        <>
            {ReleaseSection}
        </>
    )
}
