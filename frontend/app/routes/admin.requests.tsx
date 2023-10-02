import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "~/styles/admin.request.css";
import styles2 from "~/styles/admin.requests.css";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: styles2 }];
};

type newMusicTrack = {
    performers: string,
    title: string,
    version: string,
    explicit: boolean,
    preview: string,
    isCover: boolean,
    wavFile: string,
    textFile: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
}

type musicReleaseRequest = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverFile: string,
    tracks: newMusicTrack[],
}

type backCatalogTrack = {
    performers: string,
    title: string,
    version: string,
    explicit: boolean,
    preview: string,
    isCover: boolean,
    wavFile: string,
    textFile: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
    ISRC: string,
}

type backCatalogReleaseRequest = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverFile: string,
    tracks: backCatalogTrack[],
}

type clipReleaseRequest = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverFile: string,
    clipLink: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
    directorsNames: string,
}

type releaseRequest = {
    id: string,
    type: 'music' | 'clip' | 'back-catalog',
    status: 'pending' | 'accepted' | 'rejected',
    data: musicReleaseRequest | backCatalogReleaseRequest | clipReleaseRequest,
}

export async function loader({ request }: LoaderArgs): Promise<{ requests: releaseRequest[] }> {

    return {requests: []};
}

export default function Requests() {

    const loadedData = useLoaderData<typeof loader>();
    const requests = loadedData.requests

    const [filteredIndices, setFilteredIndices] = useState<number[]>([]);
    const [selectedReleaseIndex, setSelectedReleaseIndex] = useState<number | null>(null);

    const [filter, setFilter] = useState("")

    const renderMusicReleaseRequest = (request: musicReleaseRequest) => {
        
    }

    const renderClipReleaseRequest = (request: clipReleaseRequest) => {
        
    }

    const renderBackCatalogReleaseRequest = (request: backCatalogReleaseRequest) => {
        
    }

    useEffect(() => {
        const filteredIndices: number[] = []

        for (let i = 0; i < requests.length; i++) {
            const releaseData = requests[i].data
            const joinedFields = releaseData.performers + releaseData.title + releaseData.version;
            if (joinedFields.toLowerCase().includes(filter.toLowerCase())) {
                filteredIndices.push(i);
            }
        }

        setFilteredIndices(filteredIndices);

    }, [filter, requests]);

    if (selectedReleaseIndex !== null) {
        return (
            <div className="my-releases">

                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            disabled={true}
                            onChange={(e) => setFilter(e.target.value)}
                            value={filter}
                            className="field release"
                            style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                        />
                    </div>
                </div>
                <span>{selectedReleaseIndex}</span>
            </div>
        )
    }

    if (filteredIndices.length === 0) {
        return (
            <div className="my-releases">
                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            onChange={(e) => setFilter(e.target.value)}
                            value={filter}
                            className="field release"
                            style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                        />
                    </div>
                </div>
                <div className="release-container" style={{ textAlign: "center", justifyContent: "flex-start" }}>
                    <h2 className="info-text">НИЧЕГО НЕ НАЙДЕНО</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="my-releases">

            <div className="search-container">
                <div className="row-field-input-container">
                    <input
                        onChange={(e) => setFilter(e.target.value)}
                        value={filter}
                        className="field release"
                        style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                    />
                </div>
            </div>

            {
                requests.map((release, index) => {

                    if (!filteredIndices.includes(index)) {
                        return null
                    }

                    return (
                        <div key={index} className="release-container">

                            {/* release performers */}
                            <div className="row-field" >
                                <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue={release.data.performers}
                                        disabled={true}
                                        id="left"
                                        className="field release"
                                    />
                                </div>
                            </div>

                            {/* release title */}
                            <div className="row-field">
                                <label className="input shifted">НАЗВАНИЕ</label>
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue={release.data.title}
                                        disabled={true}
                                        className="field release"
                                    />
                                </div>
                            </div>

                            {/* release version */}
                            <div className="row-field">
                                <label className="input shifted">ДАТА РЕЛИЗА</label>
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue=''
                                        disabled={true}
                                        className="field release"
                                    />
                                </div>
                            </div>
                            <div className="row-field">
                                <label className="input shifted">ДАТА РЕЛИЗА</label>
                                <div className="row-field-input-container">
                                    <input
                                        id='right'
                                        defaultValue=''
                                        disabled={true}
                                        className="field release"
                                    />
                                </div>
                            </div>
                            <svg onClick={() => setSelectedReleaseIndex(index)} style={{ marginLeft: '2vw', marginRight: '2vw', marginTop: '3.5vh', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.75 12.5V10C8.75 6.54822 11.5482 3.75 15 3.75C17.5629 3.75 19.7655 5.29262 20.7299 7.5M15 18.125V20.625M11 26.25H19C21.1002 26.25 22.1503 26.25 22.9525 25.8413C23.6581 25.4817 24.2317 24.9081 24.5913 24.2025C25 23.4003 25 22.3502 25 20.25V18.5C25 16.3998 25 15.3497 24.5913 14.5475C24.2317 13.8419 23.6581 13.2683 22.9525 12.9087C22.1503 12.5 21.1002 12.5 19 12.5H11C8.8998 12.5 7.8497 12.5 7.04754 12.9087C6.34193 13.2683 5.76825 13.8419 5.40873 14.5475C5 15.3497 5 16.3998 5 18.5V20.25C5 22.3502 5 23.4003 5.40873 24.2025C5.76825 24.9081 6.34193 25.4817 7.04754 25.8413C7.8497 26.25 8.8998 26.25 11 26.25Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )
                })
            }
        </div>
    );
}