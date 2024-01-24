import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getProcessedReleaseRequests } from "~/backend/release";
import styles from "~/styles/my-releases.css";
import styles2 from "~/styles/request.single.css";
import { formatDate } from "~/utils/format";
import { requireUserName } from "~/utils/session.server";

//@ts-ignore
export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Мои релизы" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};


export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: styles2 }];
};

type processedTrackData = {
    performers: string,
    title: string,
    version: string,
    explicit: boolean,
    preview: string,
    isCover: boolean,
    wavLink: string,
    textLink: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
}

type processedMusicReleaseData = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverLink: string,
    tracks: processedTrackData[],
}

type processedBackCatalogTrackData = {
    performers: string,
    title: string,
    version: string,
    explicit: boolean,
    preview: string,
    isCover: boolean,
    wavLink: string,
    textLink: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
    isrc: string,
}

type processedBackCatalogReleaseData = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverLink: string,
    upc: string,
    tracks: processedBackCatalogTrackData[],
}

type processedClipReleaseData = {
    performers: string,
    title: string,
    version: string,
    genre: string,
    coverLink: string,
    clipLink: string,
    performersNames: string,
    musicAuthorsNames: string,
    lyricistsNames: string,
    phonogramProducersNames: string,
    directorsNames: string,
}

type processedRelease = {
    id: string,
    type: "new-music" | "clip" | "back-catalog",
    cloudLink: string,
    data: processedMusicReleaseData | processedBackCatalogReleaseData | processedClipReleaseData,
    date: string,
}

export async function loader({ request }: LoaderArgs): Promise<processedRelease[]> {
    const username = await requireUserName(request);
    const processedRequests = await getProcessedReleaseRequests(username);
    console.log(processedRequests)
    return processedRequests;
}

export default function MyReleases() {

    const data = useLoaderData<typeof loader>();
    const userProcessedReleases = data

    const [selectedReleaseIndex, setSelectedReleaseIndex] = useState<number | undefined>(undefined);
    let currentCloudLink: string | undefined
    if (selectedReleaseIndex) {
        currentCloudLink = userProcessedReleases[selectedReleaseIndex]?.cloudLink
    } else {
        currentCloudLink = undefined
    }
    console.log(selectedReleaseIndex)
    const [filteredIndices, setFilteredIndices] = useState<number[]>([]);

    const [filter, setFilter] = useState("")

    useEffect(() => {
        const filteredIndices: number[] = []

        for (let i = 0; i < userProcessedReleases.length; i++) {
            const release = userProcessedReleases[i]
            const joinedFields = release.data.performers + release.data.title + release.data.version;
            if (joinedFields.toLowerCase().includes(filter.toLowerCase())) {
                filteredIndices.push(i);
            }
        }

        setFilteredIndices(filteredIndices);

    }, [filter, userProcessedReleases]);

    const renderMusicRelease = (release: processedRelease) => {
        const releaseData = release.data as processedMusicReleaseData
        return (
            <div className="my-releases">

                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            disabled={true}
                            onChange={(e) => setFilter(e.target.value)}
                            defaultValue={filter}
                            className="field release"
                            style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                        />
                    </div>
                </div>

                <div className="release-container">

                    {/* release performers */}
                    <div className="row-field" >
                        <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.performers}
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
                                defaultValue={releaseData.title}
                                disabled={true}
                                className="field release"
                            />
                        </div>
                    </div>

                    {/* release version */}
                    <div className="row-field" id="right">
                        <label className="input shifted">ВЕРСИЯ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.version}
                                disabled={true}
                                id="right"
                                className="field release"
                            />
                        </div>
                    </div>

                    <svg onClick={() => setSelectedReleaseIndex(undefined)} style={{ marginLeft: '2vw', marginRight: '2vw', marginTop: '3.5vh', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.25 12.5V10C21.25 6.54822 18.4518 3.75 15 3.75C11.5482 3.75 8.75 6.54822 8.75 10V12.5M15 18.125V20.625M11 26.25H19C21.1002 26.25 22.1503 26.25 22.9525 25.8413C23.6581 25.4817 24.2317 24.9081 24.5913 24.2025C25 23.4003 25 22.3502 25 20.25V18.5C25 16.3998 25 15.3497 24.5913 14.5475C24.2317 13.8419 23.6581 13.2683 22.9525 12.9087C22.1503 12.5 21.1002 12.5 19 12.5H11C8.8998 12.5 7.8497 12.5 7.04754 12.9087C6.34193 13.2683 5.76825 13.8419 5.40873 14.5475C5 15.3497 5 16.3998 5 18.5V20.25C5 22.3502 5 23.4003 5.40873 24.2025C5.76825 24.9081 6.34193 25.4817 7.04754 25.8413C7.8497 26.25 8.8998 26.25 11 26.25Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <div className="row-field">
                        <label className="input shifted">ДАТА РЕЛИЗА</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={formatDate(release.date)}
                                disabled={true}
                                className="field release"
                                style={{ borderRadius: "30px" }}
                            />
                        </div>
                    </div>

                </div>

                <div className="release-other-fields">

                    {/* release genre */}
                    <div
                        className="release-genre-selector"
                        style={{ justifyContent: "center", alignItems: "center" }}
                    >
                        <label className="input genre">{"ЖАНР:   " + releaseData.genre}</label>
                    </div>

                    {currentCloudLink ? (
                        <>
                            <div className="right-track-field" style={{ width: "20vw" }}>
                                <label className="input shifted">ИСХОДНИКИ <span className="star" style={{ color: 'white' }}>*</span></label>
                                <input
                                    value={currentCloudLink}
                                    className="track-field"
                                    placeholder="https://www.example.com"
                                    type="text"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="release-cover-selector">
                            <label className="input cover">ОБЛОЖКА</label>
                            <a className="full-cover" href={releaseData.coverLink} target="_blank" rel="noreferrer">{releaseData.coverLink}</a>
                            {false ? (
                                <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.6 18.6563C2.03222 17.58 1 15.7469 1 13.6667C1 10.5419 3.32896 7.97506 6.30366 7.69249C6.91216 3.89618 10.1263 1 14 1C17.8737 1 21.0878 3.89618 21.6963 7.69249C24.671 7.97506 27 10.5419 27 13.6667C27 15.7469 25.9678 17.58 24.4 18.6563M8.8 18.3333L14 13M14 13L19.2 18.3333M14 13V25" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="28" height="26" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    )}


                </div>
                {releaseData.tracks.map((track, index) => (
                    <div key={index} style={{ width: '100%' }}>
                        <div className="track-header">

                            {/* track number */}
                            <div className="index-button-container">
                                <button className="round">{index + 1}</button>
                            </div>

                            <div className="row-fields" style={{ width: '100%' }}>

                                {/* track performers */}
                                <div className="row-field" >
                                    <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                                    <div className="row-field-input-container" style={{ marginBottom: '2vh' }}>
                                        <input
                                            defaultValue={track.performers}
                                            disabled={true}
                                            id="left"
                                            className="field release"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* track title */}
                                <div className="row-field">
                                    <label className="input shifted">НАЗВАНИЕ ТРЕКА</label>
                                    <div className="row-field-input-container">
                                        <input
                                            defaultValue={track.title}
                                            disabled={true}
                                            className="field release"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* track version */}
                                <div className="row-field" id="right">
                                    <label className="input shifted">ВЕРСИЯ</label>
                                    <div className="row-field-input-container">
                                        <input
                                            defaultValue={track.version}
                                            disabled={true}
                                            id="right"
                                            className="field release"
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="track-form">

                            <div className="left-track-fields">

                                <div id='upper-left-track-fields'>

                                    {/* explicit */}
                                    <label className="input downgap">В ПЕСНЕ ЕСТЬ МАТ?</label>
                                    <div className="responsive-selector-field">
                                        <span className="responsive-selector active" id="0">{track.explicit ? 'ДА' : 'НЕТ'}</span>
                                    </div>

                                    <label className="input downgap">ПРЕВЬЮ</label>
                                    <input
                                        defaultValue={track.preview}
                                        disabled={true}
                                        className="preview"
                                        type="text"
                                    />

                                    {/* isCover */}
                                    <label className="input downgap">КАВЕР</label>
                                    <div className="responsive-selector-field">
                                        <span className="responsive-selector active" id="0">{track.isCover ? 'ДА' : 'НЕТ'}</span>
                                    </div>

                                </div>

                                {!currentCloudLink && (
                                    <div className="lower-left-track-fields">

                                        {/* wav file */}
                                        <div className="load-row">
                                            <div className="load-file">
                                                <label className="input">.WAV</label>
                                                <a className="full-cover" target="_blank" rel="noreferrer" href={track.wavLink}>{track.wavLink}</a>
                                                {false ? (
                                                    <svg className="button" width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 14.5818C1.79401 13.7538 1 12.3438 1 10.7436C1 8.33993 2.79151 6.36543 5.07974 6.14807C5.54781 3.22783 8.02024 1 11 1C13.9798 1 16.4522 3.22783 16.9203 6.14807C19.2085 6.36543 21 8.33993 21 10.7436C21 12.3438 20.206 13.7538 19 14.5818M7 14.3333L11 10.2308M11 10.2308L15 14.3333M11 10.2308V19.4615" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                ) : (
                                                    <svg className="button" width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* text file */}
                                        <div className="load-row" >
                                            <div className="load-file">
                                                <label className="input">ТЕКСТ</label>
                                                <a className="full-cover" href={track.textLink ? track.textLink : undefined}>{track.textLink}</a>
                                                {!track.textLink ? (
                                                    <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 14.5818C1.79401 13.7538 1 12.3438 1 10.7436C1 8.33993 2.79151 6.36543 5.07974 6.14807C5.54781 3.22783 8.02024 1 11 1C13.9798 1 16.4522 3.22783 16.9203 6.14807C19.2085 6.36543 21 8.33993 21 10.7436C21 12.3438 20.206 13.7538 19 14.5818M7 14.3333L11 10.2308M11 10.2308L15 14.3333M11 10.2308V19.4615" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                ) : (
                                                    <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="right-track-fields">

                                {/* track performers names */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ</label>
                                    <input
                                        defaultValue={track.performersNames}
                                        disabled={true}
                                        className="track-field"
                                        type="text"
                                    />
                                </div>

                                {/* track music authors */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ МУЗЫКИ</label>
                                    <input
                                        defaultValue={track.musicAuthorsNames}
                                        disabled={true}
                                        className="track-field"
                                        type="text"
                                    />
                                </div>

                                {/* track lyricists */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ СЛОВ</label>
                                    <input
                                        defaultValue={track.lyricistsNames}
                                        disabled={true}
                                        className="track-field"
                                        type="text"
                                    />
                                </div>

                                {/* track phonogram producers */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИЗГОТОВИТЕЛЕЙ ФОНОГРАММЫ</label>
                                    <input
                                        defaultValue={track.phonogramProducersNames}
                                        disabled={true}
                                        className="track-field"
                                        type="text"
                                    />
                                </div>

                            </div>
                            <div className="copy-button-container">
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderBackCatalogRelease = (release: processedRelease) => {
        const releaseData = release.data as processedBackCatalogReleaseData
        return (
            <div className="my-releases">

                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            disabled={true}
                            onChange={(e) => setFilter(e.target.value)}
                            defaultValue={filter}
                            className="field release"
                            style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                        />
                    </div>
                </div>

                <div className="release-container">

                    {/* release performers */}
                    <div className="row-field" >
                        <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.performers}
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
                                defaultValue={releaseData.title}
                                disabled={true}
                                className="field release"
                            />
                        </div>
                    </div>

                    {/* release version */}
                    <div className="row-field" id="right">
                        <label className="input shifted">ВЕРСИЯ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.version}
                                disabled={true}
                                id="right"
                                className="field release"
                            />
                        </div>
                    </div>

                    <svg onClick={() => setSelectedReleaseIndex(undefined)} style={{ marginLeft: '2vw', marginRight: '2vw', marginTop: '3.5vh', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.25 12.5V10C21.25 6.54822 18.4518 3.75 15 3.75C11.5482 3.75 8.75 6.54822 8.75 10V12.5M15 18.125V20.625M11 26.25H19C21.1002 26.25 22.1503 26.25 22.9525 25.8413C23.6581 25.4817 24.2317 24.9081 24.5913 24.2025C25 23.4003 25 22.3502 25 20.25V18.5C25 16.3998 25 15.3497 24.5913 14.5475C24.2317 13.8419 23.6581 13.2683 22.9525 12.9087C22.1503 12.5 21.1002 12.5 19 12.5H11C8.8998 12.5 7.8497 12.5 7.04754 12.9087C6.34193 13.2683 5.76825 13.8419 5.40873 14.5475C5 15.3497 5 16.3998 5 18.5V20.25C5 22.3502 5 23.4003 5.40873 24.2025C5.76825 24.9081 6.34193 25.4817 7.04754 25.8413C7.8497 26.25 8.8998 26.25 11 26.25Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <div className="row-field">
                        <label className="input shifted">ДАТА РЕЛИЗА</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={formatDate(release.date)}
                                disabled={true}
                                className="field release"
                                style={{ borderRadius: "30px" }}
                            />
                        </div>
                    </div>

                </div>

                <div className="release-other-fields spaced" style={{ alignItems: "center" }}>

                    {/* release genre */}
                    <div
                        className="release-genre-selector"
                        style={{ justifyContent: "center", alignItems: "center" }}
                    >
                        <label className="input genre">{"ЖАНР:   " + releaseData.genre}</label>
                    </div>

                    {currentCloudLink ? (
                        <>
                            <div className="right-track-field" style={{ width: "20vw" }}>
                                <label className="input shifted">ИСХОДНИКИ <span className="star" style={{ color: 'white' }}>*</span></label>
                                <input
                                    value={currentCloudLink}
                                    className="track-field"
                                    placeholder="https://www.example.com"
                                    type="text"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="release-cover-selector">
                            <a className="full-cover" href={releaseData.coverLink}>{releaseData.coverLink}</a>
                            <label className="input cover">ОБЛОЖКА</label>

                            <svg width="28" height="26" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                        </div>
                    )}
                    {/* release back catalog */}
                    <div className='back-catalog-fields' style={{ height: '7.93vh' }}>

                        {/* Release UPC */}
                        <div className="back-catalog-field">
                            <label className="input">UPC: </label>
                            <input
                                disabled={true}
                                defaultValue={releaseData.upc}
                                className="back-catalog"
                            />
                        </div>

                        {/* Release date */}
                        <div className="back-catalog-field">
                            <label className="input">ДАТА РЕЛИЗА: </label>
                            <input
                                disabled={true}
                                defaultValue={formatDate(release.date)}
                                className="back-catalog"
                            />
                        </div>

                    </div>
                </div>

                {
                    releaseData.tracks.map((track, index) => {
                        return (
                            <div key={index} style={{ width: '100%' }}>
                                <div key={index} className="track-header">

                                    {/* track number */}
                                    <div className="index-button-container">
                                        <button disabled={true} className="round">{index + 1}</button>
                                    </div>

                                    <div className="row-fields" style={{ width: '100%' }}>

                                        {/* track performers */}
                                        <div className="row-field" >
                                            <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                                            <div className="row-field-input-container" style={{ marginBottom: '2vh' }}>
                                                <input
                                                    disabled={true}
                                                    defaultValue={track.performers}
                                                    id="left"
                                                    className="field release"
                                                />
                                            </div>
                                        </div>

                                        {/* track title */}
                                        <div className="row-field">
                                            <label className="input shifted">НАЗВАНИЕ ТРЕКА</label>
                                            <div className="row-field-input-container">
                                                <input
                                                    disabled={true}
                                                    defaultValue={track.title}
                                                    name="release-title"
                                                    className="field release"
                                                />
                                            </div>
                                        </div>

                                        {/* track version */}
                                        <div className="row-field" id="right">
                                            <label className="input shifted">ВЕРСИЯ</label>
                                            <div className="row-field-input-container">
                                                <input
                                                    disabled={true}
                                                    defaultValue={track.version}
                                                    id="right"
                                                    className="field release"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="track-form">

                                    <div className="left-track-fields">

                                        <div id='upper-left-track-fields'>

                                            {/* explicit */}
                                            <label className="input downgap">В ПЕСНЕ ЕСТЬ МАТ?</label>
                                            <div className="responsive-selector-field">
                                                <span className="responsive-selector active" id="0">{track.explicit ? "ДА" : 'НЕТ'}</span>
                                            </div>

                                            <label className="input downgap">ПРЕВЬЮ</label>
                                            <input
                                                disabled={true}
                                                defaultValue={track.preview}
                                                className="preview"
                                            />

                                            {/* isCover */}
                                            <label className="input downgap">КАВЕР?</label>
                                            <div className="responsive-selector-field">
                                                <span className="responsive-selector active" id="0">{track.isCover ? "ДА" : 'НЕТ'}</span>
                                            </div>
                                        </div>

                                        <div className="lower-left-track-fields">

                                            {!currentCloudLink && (
                                                <>
                                                    <div className="load-row">
                                                        <div className="load-file">
                                                            <label className="input">.WAV</label>
                                                            <a className="full-cover" href={track.wavLink}>{track.wavLink}</a>
                                                            <svg className="button" width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <div className="load-row">
                                                        <div className="load-file">
                                                            <label className="input">ТЕКСТ</label>
                                                            <a className="full-cover" href={track.textLink}>{track.textLink}</a>
                                                            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    </div>

                                    <div className="right-track-fields">

                                        {/* track performers names */}
                                        <div className="right-track-field">
                                            <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ</label>
                                            <input
                                                disabled={true}
                                                defaultValue={track.performersNames}
                                                className="track-field"
                                            />
                                        </div>

                                        {/* track music authors */}
                                        <div className="right-track-field">
                                            <label className="input shifted">ФИО АВТОРОВ МУЗЫКИ</label>
                                            <input
                                                disabled={true}
                                                defaultValue={track.musicAuthorsNames}
                                                className="track-field"
                                            />
                                        </div>

                                        {/* track lyricists */}
                                        <div className="right-track-field">
                                            <label className="input shifted">ФИО АВТОРОВ СЛОВ</label>
                                            <input
                                                disabled={true}
                                                defaultValue={track.lyricistsNames}
                                                className="track-field"
                                            />
                                        </div>

                                        {/* track phonogram producers */}
                                        <div className="right-track-field">
                                            <label className="input shifted">ФИО ИЗГОТОВИТЕЛЕЙ ФОНОГРАММЫ</label>
                                            <input
                                                disabled={true}
                                                defaultValue={track.phonogramProducersNames}
                                                className="track-field"
                                            />
                                        </div>

                                    </div>
                                    <div className="copy-button-container">

                                    </div>
                                </div>


                                {/* Track ISRC */}
                                <div className="back-catalog-field" style={{ marginTop: "2vh" }}>
                                    <label className="input">ISRC: </label>
                                    <input
                                        disabled={true}
                                        defaultValue={track.isrc}
                                        className="back-catalog"
                                    />
                                </div>

                            </div>
                        )
                    })
                }

            </div >

        )
    }

    const renderClipRelease = (release: processedRelease) => {
        const releaseData = release.data as processedClipReleaseData
        return (
            <div className="my-releases">

                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            disabled={true}
                            onChange={(e) => setFilter(e.target.value)}
                            defaultValue={filter}
                            className="field release"
                            style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                        />
                    </div>
                </div>

                <div className="release-container">

                    {/* release performers */}
                    <div className="row-field" >
                        <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.performers}
                                id="left"
                                className="field release"
                            />
                        </div>
                    </div>

                    {/* release title */}
                    <div className="row-field">
                        <label className="input shifted">НАЗВАНИЕ РЕЛИЗА</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.title}
                                className="field release"
                            />
                        </div>
                    </div>

                    {/* release version */}
                    <div className="row-field" id="right">
                        <label className="input shifted">ВЕРСИЯ</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={releaseData.version}
                                id="right"
                                className="field release"
                            />
                        </div>
                    </div>

                    <svg onClick={() => setSelectedReleaseIndex(undefined)} style={{ marginLeft: '2vw', marginRight: '2vw', marginTop: '3.5vh', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.25 12.5V10C21.25 6.54822 18.4518 3.75 15 3.75C11.5482 3.75 8.75 6.54822 8.75 10V12.5M15 18.125V20.625M11 26.25H19C21.1002 26.25 22.1503 26.25 22.9525 25.8413C23.6581 25.4817 24.2317 24.9081 24.5913 24.2025C25 23.4003 25 22.3502 25 20.25V18.5C25 16.3998 25 15.3497 24.5913 14.5475C24.2317 13.8419 23.6581 13.2683 22.9525 12.9087C22.1503 12.5 21.1002 12.5 19 12.5H11C8.8998 12.5 7.8497 12.5 7.04754 12.9087C6.34193 13.2683 5.76825 13.8419 5.40873 14.5475C5 15.3497 5 16.3998 5 18.5V20.25C5 22.3502 5 23.4003 5.40873 24.2025C5.76825 24.9081 6.34193 25.4817 7.04754 25.8413C7.8497 26.25 8.8998 26.25 11 26.25Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <div className="row-field">
                        <label className="input shifted">ДАТА РЕЛИЗА</label>
                        <div className="row-field-input-container">
                            <input
                                defaultValue={formatDate(release.date)}
                                disabled={true}
                                className="field release"
                                style={{ borderRadius: "30px" }}
                            />
                        </div>
                    </div>

                </div>

                <div className="release-other-fields spaced" style={{ alignItems: "center" }}>

                    {/* release genre */}
                    <div
                        className="release-genre-selector"
                        style={{ justifyContent: "center", alignItems: "center" }}
                    >
                        <label className="input genre">{"ЖАНР:   " + releaseData.genre}</label>
                    </div>

                    <>
                        <div className="right-track-field" style={{ width: "20vw" }}>
                            <label className="input shifted">ИСХОДНИКИ <span className="star" style={{ color: 'white' }}>*</span></label>
                            <input
                                value={currentCloudLink}
                                className="track-field"
                                placeholder="https://www.example.com"
                                type="text"
                            />
                        </div>
                    </>

                </div>

                <div style={{ width: '100%' }}>
                    <div className="clip-form">
                        <div className="right-track-fields">

                            {/* track performers names */}
                            <div className="right-track-field">
                                <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ</label>
                                <input
                                    defaultValue={releaseData.performersNames}
                                    className="track-field"
                                />
                            </div>

                            {/* track music authors */}
                            <div className="right-track-field">
                                <label className="input shifted">ФИО АВТОРОВ МУЗЫКИ</label>
                                <input
                                    defaultValue={releaseData.musicAuthorsNames}
                                    className="track-field"
                                />
                            </div>

                            {/* track lyricists */}
                            <div className="right-track-field">
                                <label className="input shifted">ФИО АВТОРОВ СЛОВ</label>
                                <input
                                    defaultValue={releaseData.lyricistsNames}
                                    className="track-field"
                                />
                            </div>

                            {/* track phonogram producers */}
                            <div className="right-track-field">
                                <label className="input shifted">ФИО ИЗГОТОВИТЕЛЕЙ ФОНОГРАММЫ</label>
                                <input
                                    defaultValue={releaseData.phonogramProducersNames}
                                    className="track-field"
                                />
                            </div>

                            {/* track directors */}
                            <div className="right-track-field">
                                <label className="input shifted">ФИО РЕЖИССЁРОВ</label>
                                <input
                                    defaultValue={releaseData.directorsNames}
                                    className="track-field"
                                />
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        )
    }

    if (selectedReleaseIndex !== undefined) {
        const selectedRelease = userProcessedReleases[selectedReleaseIndex];
        console.log(selectedRelease)
        if (selectedRelease.type === 'new-music') {
            return renderMusicRelease(selectedRelease)
        } else if (selectedRelease.type === 'back-catalog') {
            return renderBackCatalogRelease(selectedRelease)
        } else if (selectedRelease.type === 'clip') {
            return renderClipRelease(selectedRelease)
        }
    }

    if (filteredIndices.length === 0) {
        return (
            <div className="my-releases">
                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            onChange={(e) => setFilter(e.target.value)}
                            defaultValue={filter}
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
                        defaultValue={filter}
                        className="field release"
                        style={{ width: "50%", marginBottom: "4vh", borderRadius: "30px" }}
                    />
                </div>
            </div>

            {
                userProcessedReleases.map((release, index) => {

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
                            <div className="row-field" id="right">
                                <label className="input shifted">ВЕРСИЯ</label>
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue={release.data.version}
                                        disabled={true}
                                        id="right"
                                        className="field release"
                                    />
                                </div>
                            </div>
                            <svg onClick={() => setSelectedReleaseIndex(index)} style={{ marginLeft: '2vw', marginRight: '2vw', marginTop: '3.5vh', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.75 12.5V10C8.75 6.54822 11.5482 3.75 15 3.75C17.5629 3.75 19.7655 5.29262 20.7299 7.5M15 18.125V20.625M11 26.25H19C21.1002 26.25 22.1503 26.25 22.9525 25.8413C23.6581 25.4817 24.2317 24.9081 24.5913 24.2025C25 23.4003 25 22.3502 25 20.25V18.5C25 16.3998 25 15.3497 24.5913 14.5475C24.2317 13.8419 23.6581 13.2683 22.9525 12.9087C22.1503 12.5 21.1002 12.5 19 12.5H11C8.8998 12.5 7.8497 12.5 7.04754 12.9087C6.34193 13.2683 5.76825 13.8419 5.40873 14.5475C5 15.3497 5 16.3998 5 18.5V20.25C5 22.3502 5 23.4003 5.40873 24.2025C5.76825 24.9081 6.34193 25.4817 7.04754 25.8413C7.8497 26.25 8.8998 26.25 11 26.25Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="row-field">
                                <label className="input shifted">ДАТА РЕЛИЗА</label>
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue={formatDate(release.date)}
                                        disabled={true}
                                        className="field release"
                                        style={{ borderRadius: "30px" }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}