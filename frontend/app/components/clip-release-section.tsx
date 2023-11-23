import { useState } from "react";

import { uploadFile } from "~/backend/file";
import { updateReleaseRequest } from "~/backend/release";

import type { ClipReleaseUpload, ReleaseRequest, ReleaseRequestUpdate } from "~/types/release";

import ReleaseGenreOptions from "./release-genres";
import { fullNamesRePattern, multipleNicknamesRePattern, linkRePattern } from "~/utils/regexp";
import { useNavigate } from "@remix-run/react";

export default function ClipReleaseSection(
    props: {
        request: ReleaseRequest,
    }
) {

    const request = props.request
    const data: ClipReleaseUpload = request.data as ClipReleaseUpload;

    const navigate = useNavigate()

    const [releaseDate, setReleaseDate] = useState(request.date);
    const [releaseImprint, setReleaseImprint] = useState(request.imprint);

    const [releasePerformers, setReleasePerformers] = useState(data.performers);
    const [releaseTitle, setReleaseTitle] = useState(data.title);
    const [releaseVersion, setReleaseVersion] = useState(data.version);
    const [releaseGenre, setReleaseGenre] = useState(data.genre);
    const [releaseCoverFile, setReleaseCoverFile] = useState<File | undefined>(undefined);
    const [releaseLink, setReleaseLink] = useState(data.releaseLink)

    const [clipForms, setClipForms] = useState<{
        performersNames: string,
        musicAuthorsNames: string,
        lyricistsNames: string,
        phonogramProducersNames: string,
        directorsNames: string,
    }[]>([
        {
            performersNames: data.performersNames,
            musicAuthorsNames: data.musicAuthorsNames,
            lyricistsNames: data.lyricistsNames,
            phonogramProducersNames: data.phonogramProducersNames,
            directorsNames: data.directorsNames,
        }
    ]);

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());
    const [modalIsOpened, setModalIsOpened] = useState(false);

    // release fields
    const handleChangeReleasePerformers = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releasePerformers = event.target.value

        let isValid = multipleNicknamesRePattern.test(releasePerformers)
        if (releasePerformers === '') {
            isValid = true
        }

        const newTrackForms = [...clipForms]
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!isValid) {
            newInvalidFieldKeys.add(`release-performers`)
        } else {
            newInvalidFieldKeys.delete(`release-performers`)
        }

        setInvalidFieldKeys(newInvalidFieldKeys)
        setReleasePerformers(releasePerformers);
        setClipForms(newTrackForms);
    }

    const handleChangeReleaseTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        // no validation
        const releaseTitle = event.target.value

        setReleaseTitle(releaseTitle);
    }

    const handleChangeReleaseVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
        // no validation
        const releaseVersion = event.target.value
        setReleaseVersion(releaseVersion);
    }

    const handleChangeReleaseGenre = (event: React.ChangeEvent<HTMLInputElement>) => {
        // no validation
        setReleaseGenre(event.target.value);
    }

    const handleChangeReleaseCoverFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        //@ts-ignore
        const file = event.target.files[0];

        if (file.type === "image/jpeg" || file.type === "image/png") {
            setReleaseCoverFile(file);
        } else {
            alert("Неверный формат файла");
            setReleaseCoverFile(undefined);
        }
    }

    const handleChangeReleaseLink = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releaseLink = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!linkRePattern.test(releaseLink) && releaseLink !== '') {
            newInvalidFieldKeys.add(`release-link`)
        } else {
            newInvalidFieldKeys.delete(`release-link`)
        }

        setInvalidFieldKeys(newInvalidFieldKeys)
        setReleaseLink(releaseLink);
    }

    const handleChangeClipPerformersNames = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const performersNames = event.target.value
        const newTrackForms = [...clipForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(performersNames) && performersNames !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-performersNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-performersNames`)
        }

        newTrackForms[trackId].performersNames = performersNames

        setInvalidFieldKeys(newInvalidFieldKeys)
        setClipForms(newTrackForms);
    }

    const handleChangeClipMusicAuthors = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const musicAuthors = event.target.value;
        const newTrackForms = [...clipForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(musicAuthors) && musicAuthors !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-musicAuthors`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-musicAuthors`)
        }

        newTrackForms[trackId].musicAuthorsNames = musicAuthors;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setClipForms(newTrackForms);
    }

    const handleChangeClipLyricists = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const lyricists = event.target.value
        console.log(lyricists)
        const newTrackForms = [...clipForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(lyricists) && lyricists !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-lyricists`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-lyricists`)
        }

        newTrackForms[trackId].lyricistsNames = lyricists;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setClipForms(newTrackForms);
    }

    const handleChangeClipPhonogramProducers = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const phonogramProducers = event.target.value
        const newTrackForms = [...clipForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(phonogramProducers) && phonogramProducers !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-phonogramProducers`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-phonogramProducers`)
        }

        newTrackForms[trackId].phonogramProducersNames = phonogramProducers;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setClipForms(newTrackForms);
    }

    const handleChangeClipDirectorsNames = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const directorsNames = event.target.value
        const newTrackForms = [...clipForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(directorsNames) && directorsNames !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-directorsNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-directorsNames`)
        }

        newTrackForms[trackId].directorsNames = directorsNames;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setClipForms(newTrackForms);
    }

    const err_notificate = () => {
        alert('Заполните все обязательные поля')
    }

    const handleSubmit = async () => {

        if (invalidFieldKeys.size) {
            alert("Некоторые поля заполнены некорректно")
            return
        }

        if (releasePerformers === "") {
            err_notificate()
            return
        }
        if (releaseTitle === "") {
            err_notificate()
            return
        }
        if (releaseCoverFile === undefined && data.coverFileId === "") {
            err_notificate()
            return
        }

        const clip = clipForms[0]

        let coverFileId = data.coverFileId

        if (releaseCoverFile !== undefined) {
            coverFileId = await uploadFile(releaseCoverFile)
        }

        const clipRelease: ClipReleaseUpload = {
            title: releaseTitle,
            performers: releasePerformers,
            version: releaseVersion,
            genre: releaseGenre,
            releaseLink: releaseLink,
            performersNames: clip.performersNames,
            musicAuthorsNames: clip.musicAuthorsNames,
            lyricistsNames: clip.lyricistsNames,
            phonogramProducersNames: clip.phonogramProducersNames,
            directorsNames: clip.directorsNames,
            coverFileId: coverFileId,
        }

        try {
            const updatingReleaseRequest: ReleaseRequestUpdate = {
                date: releaseDate,
                imprint: releaseImprint,
                data: clipRelease,
            }
            setModalIsOpened(true)
            const response = await updateReleaseRequest(request.id, updatingReleaseRequest)
            if (response !== null) {
                setModalIsOpened(false)
                console.log(response)
                navigate('/admin/requests')
            }
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
        }
    }
    console.log('invalidFieldKeys', invalidFieldKeys)

    return (
        <div className="request-container">

            {modalIsOpened && (
                <div className="overlay">
                    <div className="modal">
                        <span>Загрузка</span>
                    </div>
                </div>
            )}

            <div className="release-container">

                {/* release performers */}
                <div className="row-field" >
                    <label className="input shifted">ИСПОЛНИТЕЛИ</label>
                    <div className="row-field-input-container">
                        <input
                            value={releasePerformers}
                            onChange={handleChangeReleasePerformers}
                            placeholder="Кобяков"
                            required={true}
                            id="left"
                            className="field release"
                            {...invalidFieldKeys.has(`release-performers`) ? { style: { border: "1px solid red" } } : null}
                            type="text"
                        />
                    </div>
                </div>

                {/* release title */}
                <div className="row-field">
                    <label className="input shifted">НАЗВАНИЕ</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseTitle}
                            onChange={handleChangeReleaseTitle}
                            placeholder="Пушка"
                            required={true}
                            className="field release"
                            {...invalidFieldKeys.has(`release-title`) ? { style: { border: "1px solid red" } } : null}
                            type="text"
                        />
                    </div>
                </div>

                {/* release version */}
                <div className="row-field">
                    <label className="input shifted">ВЕРСИЯ</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseVersion? releaseVersion : ""}
                            onChange={handleChangeReleaseVersion}
                            placeholder="Remix"
                            className="field release"
                            {...invalidFieldKeys.has(`release-version`) ? { style: { border: "1px solid red" } } : null}
                            type="text"
                        />
                    </div>
                </div>

                <div className="row-field">
                    <label className="input shifted">ДАТА РЕЛИЗА</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="field release"
                            type="date"
                            style={{ paddingRight: '0px' }}
                        />
                    </div>
                </div>
                <div className="row-field">
                    <label className="input shifted">ИМПРИНТ</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseImprint}
                            onChange={(e) => setReleaseImprint(e.target.value)}
                            id='right'
                            className="field release"
                        />
                    </div>
                </div>

            </div>

            <div className="release-other-fields spaced">

                {/* release genre */}
                <div
                    className="release-genre-selector"
                    {...invalidFieldKeys.has(`release-genre`) ? { style: { border: "1px solid red" } } : null}
                >
                    <label className="input genre">ЖАНР*</label>
                    <select
                        value={releaseGenre}
                        onChange={handleChangeReleaseGenre as any}
                        required={true}
                        className="input"
                    >
                        <ReleaseGenreOptions />
                    </select>
                </div>

                {/* release cover */}
                <div className="release-cover-selector">
                    <input accept="image/*" onChange={handleChangeReleaseCoverFile} type="file" className="full-cover" />
                    <label className="input cover">ОБЛОЖКА*</label>
                    {(!releaseCoverFile && data.coverFileId === '') ? (
                        <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.6 18.6563C2.03222 17.58 1 15.7469 1 13.6667C1 10.5419 3.32896 7.97506 6.30366 7.69249C6.91216 3.89618 10.1263 1 14 1C17.8737 1 21.0878 3.89618 21.6963 7.69249C24.671 7.97506 27 10.5419 27 13.6667C27 15.7469 25.9678 17.58 24.4 18.6563M8.8 18.3333L14 13M14 13L19.2 18.3333M14 13V25" stroke="black" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="28" height="26" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="black" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

                {/* release link */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label className="input shifted">ССЫЛКА НА КЛИП*</label>
                    <input
                        value={releaseLink}
                        onChange={(e) => handleChangeReleaseLink(e)}
                        {...invalidFieldKeys.has(`release-link`) ? { style: { border: "1px solid red" } } : null}
                        className="back-catalog"
                        type="text"
                    />
                </div>

            </div>

            {clipForms.map((trackForm, index) => {
                return (
                    <div key={index} style={{ width: '100%' }}>
                        <div className="clip-form">
                            <div className="right-track-fields">

                                {/* track performers names */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ*</label>
                                    <input
                                        value={trackForm.performersNames}
                                        onChange={(e) => handleChangeClipPerformersNames(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-performersNames`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                                {/* track music authors */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ МУЗЫКИ*</label>
                                    <input
                                        value={trackForm.musicAuthorsNames}
                                        onChange={(e) => handleChangeClipMusicAuthors(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-musicAuthors`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                                {/* track lyricists */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ СЛОВ</label>
                                    <input
                                        value={trackForm.lyricistsNames}
                                        onChange={(e) => handleChangeClipLyricists(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-lyricists`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                                {/* track phonogram producers */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИЗГОТОВИТЕЛЕЙ ФОНОГРАММЫ*</label>
                                    <input
                                        value={trackForm.phonogramProducersNames}
                                        onChange={(e) => handleChangeClipPhonogramProducers(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-phonogramProducers`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                                {/* track directors */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО РЕЖИССЁРОВ*</label>
                                    <input
                                        value={trackForm.directorsNames}
                                        onChange={(e) => handleChangeClipDirectorsNames(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-directorsNames`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                )
            })}


            <div className="submit-container">

                <div className="submit-button-container">
                    <button onClick={handleSubmit} className="submit">СОХРАНИТЬ</button>
                </div>

            </div>
        </div>
    )
}
