import { useState } from "react";
import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";

import styles from "~/styles/request.single.css";
import { useSubmit } from "@remix-run/react";
import { uploadSingleRequest } from "~/backend/release";
import { uploadFile } from "~/backend/file";

export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Заявка | Сингл" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    await uploadSingleRequest(formData)
    return new Response('OK', { status: 200 });
}

export default function SingleReleaseRequest() {
    const submit = useSubmit();

    const [releasePerformers, setReleasePerformers] = useState("");
    const [releaseTitle, setReleaseTitle] = useState("");
    const [releaseVersion, setReleaseVersion] = useState("");
    const [releaseGenre, setReleaseGenre] = useState("Жанр 1");
    const [releaseCoverFile, setReleaseCoverFile] = useState<File | undefined>(undefined);

    const defaultTrack: {
        explicit: boolean,
        preview: string,
        isCover: boolean,
        wavFile: File | undefined,
        textFile: File | undefined,
        performersNames: string,
        musicAuthors: string,
        lyricists: string,
        phonogramProducers: string,
    } = {
        explicit: false,
        preview: "0:00",
        isCover: false,
        wavFile: undefined,
        textFile: undefined,
        performersNames: "",
        musicAuthors: "",
        lyricists: "",
        phonogramProducers: "",
    }

    const [trackForms, setTrackForms] = useState([
        defaultTrack,
    ]);

    const [userAgreed, setUserAgreed] = useState(false)

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());

    const fullNamesRePattern = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/
    const multipleNicknamesRePattern = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/
    const timeRePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/

    // release fields
    const handleChangeReleasePerformers = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releasePerformers = event.target.value

        let isValid = multipleNicknamesRePattern.test(releasePerformers)
        if (releasePerformers === '') {
            isValid = true
        }

        const newTrackForms = [...trackForms]
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!isValid) {
            newInvalidFieldKeys.add(`release-performers`)
        } else {
            newInvalidFieldKeys.delete(`release-performers`)
        }

        setInvalidFieldKeys(newInvalidFieldKeys)
        setReleasePerformers(releasePerformers);
        setTrackForms(newTrackForms);
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

    const handleChangeTrackIsExplicit = (trackId: number) => {
        // no validation
        const newTrackForms = [...trackForms];

        newTrackForms[trackId].explicit = !trackForms[trackId].explicit;

        setTrackForms(newTrackForms);
    }

    const handleChangeTrackPreview = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const preview = event.target.value
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!timeRePattern.test(preview)) {
            newInvalidFieldKeys.add(`${trackId}-track-preview`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-preview`)
        }

        newTrackForms[trackId].preview = preview;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackIsCover = (trackId: number) => {
        // no validation
        const track = trackForms[trackId];
        const newTrackForms = [...trackForms];

        newTrackForms[trackId].isCover = !track.isCover;

        setTrackForms(newTrackForms);
    }

    const handleChangeTrackWavFile = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        //@ts-ignore
        const file = event.target.files[0];
        const newTrackForms = [...trackForms];

        if (file.type !== "audio/wav") {
            newTrackForms[trackId].wavFile = undefined
            alert("Неверный формат файла");
        } else {
            newTrackForms[trackId].wavFile = file
            console.log(newTrackForms[trackId].wavFile)
        }
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackTextFile = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        //@ts-ignore
        const file = event.target.files[0];
        const newTrackForms = [...trackForms];

        if (file.type !== "text/plain") {
            newTrackForms[trackId].textFile = undefined
            alert("Неверный формат файла");
        } else {
            newTrackForms[trackId].textFile = file;
            console.log(newTrackForms[trackId].textFile)
        }
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackPerformersNames = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const performersNames = event.target.value
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(performersNames) && performersNames !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-performersNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-performersNames`)
        }

        newTrackForms[trackId].performersNames = performersNames

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackMusicAuthors = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const musicAuthors = event.target.value;
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(musicAuthors) && musicAuthors !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-musicAuthors`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-musicAuthors`)
        }

        newTrackForms[trackId].musicAuthors = musicAuthors;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackLyricists = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const lyricists = event.target.value
        console.log(lyricists)
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(lyricists) && lyricists !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-lyricists`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-lyricists`)
        }

        newTrackForms[trackId].lyricists = lyricists;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackPhonogramProducers = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const phonogramProducers = event.target.value
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(phonogramProducers) && phonogramProducers !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-phonogramProducers`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-phonogramProducers`)
        }

        newTrackForms[trackId].phonogramProducers = phonogramProducers;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const err_notificate = () => {
        alert('Заполните все обязательные поля')
    }

    const handleSubmit = async () => {

        if (invalidFieldKeys.size) {
            alert("Некоторые поля заполнены некорректно")
            return
        }

        const formData = new FormData()

        if (releasePerformers === "") {
            err_notificate()
            return
        }
        if (releaseTitle === "") {
            err_notificate()
            return
        }
        if (releaseVersion === "") {
            // not required
        }
        if (releaseCoverFile === undefined) {
            err_notificate()
            return
        }

        formData.append(`performers`, releasePerformers)
        formData.append(`title`, releaseTitle)
        formData.append(`version`, releaseVersion)
        formData.append(`genre`, releaseGenre)
        formData.append(`coverFile`, releaseCoverFile)

        for (let track of trackForms) {
            if (track.wavFile === undefined) {
                alert("Прикрепите wavFile")
                break
            }

            if (track.performersNames === "") {
                err_notificate()
                break
            }
            if (track.musicAuthors === "") {
                err_notificate()
                break
            }
            if (track.phonogramProducers === "") {
                err_notificate()
                break
            }

            formData.append(`${trackForms.indexOf(track)}-track-explicit`, String(track.explicit))
            formData.append(`${trackForms.indexOf(track)}-track-preview`, track.preview)
            formData.append(`${trackForms.indexOf(track)}-track-isCover`, String(track.isCover))
            formData.append(`${trackForms.indexOf(track)}-track-wavFile`, track.wavFile)
            formData.append(`${trackForms.indexOf(track)}-track-textFile`, track.textFile)
            formData.append(`${trackForms.indexOf(track)}-track-performersNames`, track.performersNames)
            formData.append(`${trackForms.indexOf(track)}-track-musicAuthors`, track.musicAuthors)
            formData.append(`${trackForms.indexOf(track)}-track-lyricists`, track.lyricists)
            formData.append(`${trackForms.indexOf(track)}-track-phonogramProducers`, track.phonogramProducers)
        }
        try {
            submit(formData, { method: 'post', action: '/request/single' });
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
        }
    }
    console.log('invalidFieldKeys', invalidFieldKeys)

    return (
        <div className="request-container">

            {/* release fields */}
            <div className="row-fields">

                {/* release performers */}
                <div className="row-field" >
                    <label className="input shifted">ИСПОЛНИТЕЛИ*</label>
                    <div className="row-field-input-container">
                        <input
                            value={releasePerformers}
                            onChange={handleChangeReleasePerformers}
                            name="release-performers"
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
                    <label className="input shifted">НАЗВАНИЕ РЕЛИЗА*</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseTitle}
                            onChange={handleChangeReleaseTitle}
                            name="release-title"
                            placeholder="Пушка"
                            required={true}
                            className="field release"
                            {...invalidFieldKeys.has(`release-title`) ? { style: { border: "1px solid red" } } : null}
                            type="text"
                        />
                    </div>
                </div>

                {/* release version */}
                <div className="row-field" id="right">
                    <label className="input shifted">ВЕРСИЯ</label>
                    <div className="row-field-input-container">
                        <input
                            value={releaseVersion}
                            onChange={handleChangeReleaseVersion}
                            name="release-version"
                            placeholder="Remix"
                            id="right"
                            className="field release"
                            {...invalidFieldKeys.has(`release-version`) ? { style: { border: "1px solid red" } } : null}
                            type="text"
                        />
                    </div>
                </div>

            </div>

            <div className="release-other-fields">

                {/* release genre */}
                <div
                    className="release-genre-selector"
                    {...invalidFieldKeys.has(`release-genre`) ? { style: { border: "1px solid red" } } : null}
                >
                    <label className="input genre">ЖАНР*</label>
                    <select
                        value={releaseGenre}
                        onChange={handleChangeReleaseGenre}
                        required={true}
                        className="input"
                    >
                        <option value={"Жанр 1"}>Жанр 1</option>
                    </select>
                </div>

                {/* release cover */}
                <div className="release-cover-selector">
                    <input accept="image/*" onChange={handleChangeReleaseCoverFile} type="file" className="full-cover" />
                    <label className="input cover">ОБЛОЖКА*</label>
                    {!releaseCoverFile ? (
                        <svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.6 18.6563C2.03222 17.58 1 15.7469 1 13.6667C1 10.5419 3.32896 7.97506 6.30366 7.69249C6.91216 3.89618 10.1263 1 14 1C17.8737 1 21.0878 3.89618 21.6963 7.69249C24.671 7.97506 27 10.5419 27 13.6667C27 15.7469 25.9678 17.58 24.4 18.6563M8.8 18.3333L14 13M14 13L19.2 18.3333M14 13V25" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="28" height="26" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

            </div>

            {trackForms.map((trackForm, index) => {
                return (
                    <div key={index} style={{ width: '100%' }}>
                        <div className="track-form">

                            <div className="left-track-fields">

                                <div id='upper-left-track-fields'>

                                    {/* explicit */}
                                    <label className="input downgap">В ПЕСНЕ ЕСТЬ МАТ?*</label>
                                    <div className="responsive-selector-field" onClick={() => handleChangeTrackIsExplicit(index)}>
                                        <span className={"responsive-selector" + (trackForm.explicit ? " active" : '')} id="0">ДА /</span>
                                        <span className={"responsive-selector" + (!trackForm.explicit ? " active" : '')} id="0"> НЕТ</span>
                                    </div>

                                    <label className="input downgap">ПРЕВЬЮ</label>
                                    <input
                                        value={trackForm.preview}
                                        placeholder="0:00"
                                        onChange={(e) => handleChangeTrackPreview(e, index)}
                                        className="preview"
                                        {...invalidFieldKeys.has(`${index}-track-preview`) ? { style: { border: "1px solid red" } } : null}
                                        type="text"
                                    />

                                    {/* isCover */}
                                    <label className="input downgap">КАВЕР?</label>
                                    <div className="responsive-selector-field" onClick={() => handleChangeTrackIsCover(index)}>
                                        <span className={"responsive-selector" + (trackForm.isCover ? " active" : '')} id="0">ДА /</span>
                                        <span className={"responsive-selector" + (!trackForm.isCover ? " active" : '')} id="0"> НЕТ</span>
                                    </div>

                                </div>

                                <div className="lower-left-track-fields">

                                    {/* wav file */}
                                    <div className="load-row">
                                        <div className="load-file">
                                            <label className="input">.WAV*</label>
                                            <input accept=".wav" onChange={(e) => handleChangeTrackWavFile(e, index)} type="file" className="full-cover" />
                                            {!trackForm.wavFile ? (
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
                                    <div className="load-row">
                                        <div className="load-file">
                                            <label className="input">ТЕКСТ</label>
                                            <input accept=".txt" onChange={(e) => handleChangeTrackTextFile(e, index)} type="file" className="full-cover" />
                                            {!trackForm.textFile ? (
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
                            </div>

                            <div className="right-track-fields">

                                {/* track performers names */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ*</label>
                                    <input
                                        value={trackForm.performersNames}
                                        onChange={(e) => handleChangeTrackPerformersNames(e, index)}
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
                                        value={trackForm.musicAuthors}
                                        onChange={(e) => handleChangeTrackMusicAuthors(e, index)}
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
                                        value={trackForm.lyricists}
                                        onChange={(e) => handleChangeTrackLyricists(e, index)}
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
                                        value={trackForm.phonogramProducers}
                                        onChange={(e) => handleChangeTrackPhonogramProducers(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-phonogramProducers`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                            </div>
                            <div className="copy-button-container">

                            </div>
                        </div>
                    </div>
                )
            })}


            <div className="submit-container">

                <div className="agreement-container">
                    <svg className="agreement" onClick={() => setUserAgreed(!userAgreed)} width="30" height="30" viewBox="0 0 18 18" fill={userAgreed ? "green" : "none"} xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.625 9L7.875 11.25L12.375 6.75M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="white" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <a className="agreement" href="https://youtube.com"> Даю согласие на обработку персональных данных</a>
                </div>

                <div className="submit-button-container" style={!userAgreed ? { color: "none", pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" } : {}}>
                    <button onClick={handleSubmit} disabled={!userAgreed} className="submit">ОТПРАВИТЬ РЕЛИЗ</button>
                </div>

            </div>
        </div>
    )
}