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

    const [cloudLink, setCloudLink] = useState(request.cloudLink);

    const [releaseDate, setReleaseDate] = useState(request.date);
    const [releaseImprint, setReleaseImprint] = useState(request.imprint);

    const [releasePerformers, setReleasePerformers] = useState(data.performers);
    const [releaseTitle, setReleaseTitle] = useState(data.title);
    const [releaseVersion, setReleaseVersion] = useState(data.version);
    const [releaseGenre, setReleaseGenre] = useState(data.genre);

    const [clipForms, setClipForms] = useState<{
        explicit: boolean,
        performersNames: string,
        musicAuthorsNames: string,
        lyricistsNames: string,
        phonogramProducersNames: string,
        directorsNames: string,
    }[]>([
        {
            explicit: data.explicit,
            performersNames: data.performersNames,
            musicAuthorsNames: data.musicAuthorsNames,
            lyricistsNames: data.lyricistsNames,
            phonogramProducersNames: data.phonogramProducersNames,
            directorsNames: data.directorsNames,
        }
    ]);

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());
    const [modalIsOpened, setModalIsOpened] = useState(false);

    const handleChangeClipIsExplicit = (value: boolean) => {
        const newTrackForms = [...clipForms]
        newTrackForms[0].explicit = value
        setClipForms(newTrackForms)
    }

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

    const handleChangeCloudLink = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releaseLink = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!linkRePattern.test(releaseLink) && releaseLink !== '') {
            newInvalidFieldKeys.add(`cloudLink`)
        } else {
            newInvalidFieldKeys.delete(`cloudLink`)
        }

        setInvalidFieldKeys(newInvalidFieldKeys)
        setCloudLink(releaseLink);
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

        const clip = clipForms[0]


        const clipRelease: ClipReleaseUpload = {
            explicit: clip.explicit,
            title: releaseTitle,
            performers: releasePerformers,
            version: releaseVersion,
            genre: releaseGenre,
            performersNames: clip.performersNames,
            musicAuthorsNames: clip.musicAuthorsNames,
            lyricistsNames: clip.lyricistsNames,
            phonogramProducersNames: clip.phonogramProducersNames,
            directorsNames: clip.directorsNames,
        }

        try {
            const updatingReleaseRequest: ReleaseRequestUpdate = {
                date: releaseDate,
                cloudLink: cloudLink,
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
                            value={releaseVersion ? releaseVersion : ""}
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

                <div className="right-track-field" style={{ width: "20vw" }}>
                    <label className="input shifted">ИСХОДНИКИ*<span className="star" style={{ color: 'white' }}>*</span></label>
                    <input
                        value={cloudLink}
                        onChange={(e) => handleChangeCloudLink(e)}
                        className="track-field"
                        {...invalidFieldKeys.has(`cloudLink`) ? { style: { border: "1px solid red" } } : null}
                        placeholder="https://www.example.com"
                        type="text"
                    />
                </div>

            </div>

            {clipForms.map((trackForm, index) => {
                return (
                    <div key={index} style={{ width: '100%' }}>
                        <div className="clip-form">
                            <div className="right-track-fields">

                                <center>
                                    <div>
                                        <label className="input downgap">В КЛИПЕ ЕСТЬ МАТ? <span className="star" style={{ color: 'white' }}>*</span></label>
                                        <div className="responsive-selector-field">
                                            <span onClick={() => handleChangeClipIsExplicit(true)} className={"responsive-selector" + (trackForm.explicit ? " active" : '')} id="0">ДА /</span>
                                            <span onClick={() => handleChangeClipIsExplicit(false)} className={"responsive-selector" + (!trackForm.explicit ? " active" : '')} id="0"> НЕТ</span>
                                        </div>
                                    </div>
                                </center>

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
