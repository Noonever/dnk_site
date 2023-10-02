import { useState } from "react";
import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";

import styles from "~/styles/request.single.css";
import { useSubmit } from "@remix-run/react";
import { uploadClipRequest } from "~/backend/release";

export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Заявка | Видеоклип" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    let data = Object.fromEntries(formData);
    await uploadClipRequest(data)
    return new Response('OK', { status: 200 });
}

export default function SingleReleaseRequest() {
    const submit = useSubmit();

    const [releasePerformers, setReleasePerformers] = useState("");
    const [releaseTitle, setReleaseTitle] = useState("");
    const [releaseVersion, setReleaseVersion] = useState("");
    const [releaseGenre, setReleaseGenre] = useState("Жанр 1");
    const [releaseCoverFile, setReleaseCoverFile] = useState<File | undefined>(undefined);
    const [releaseLink, setReleaseLink] = useState("")

    const defaultClip: {
        performersNames: string,
        musicAuthors: string,
        lyricists: string,
        phonogramProducers: string,
        directorsNames: string,
    } = {
        performersNames: "",
        musicAuthors: "",
        lyricists: "",
        phonogramProducers: "",
        directorsNames: "",
    }

    const [clipForms, setClipForms] = useState([
        defaultClip,
    ]);

    const [userAgreed, setUserAgreed] = useState(false)

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());

    const fullNamesRePattern = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/
    const multipleNicknamesRePattern = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/
    const linkRePattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

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

        newTrackForms[trackId].musicAuthors = musicAuthors;

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

        newTrackForms[trackId].lyricists = lyricists;

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

        newTrackForms[trackId].phonogramProducers = phonogramProducers;

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

    function fileToByteArray(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result instanceof ArrayBuffer) {
                    const arrayBuffer = event.target.result;
                    const byteArray = new Uint8Array(arrayBuffer);
                    resolve(byteArray);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer.'));
                }
            };

            reader.onerror = (event) => {
                reject(new Error('Failed to read file: ' + event.target?.error));
            };

            reader.readAsArrayBuffer(file);
        });
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
        if (releaseCoverFile === undefined) {
            err_notificate()
            return
        }

        const coverFileBytes = String(await fileToByteArray(releaseCoverFile))

        formData.append(`releasePerformers`, releasePerformers)
        formData.append(`releaseTitle`, releaseTitle)
        formData.append(`releaseVersion`, releaseVersion)
        formData.append(`releaseGenre`, releaseGenre)
        formData.append(`releaseCoverFile`, coverFileBytes)

        for (let track of clipForms) {

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

            formData.append(`${clipForms.indexOf(track)}-track-performersNames`, track.performersNames)
            formData.append(`${clipForms.indexOf(track)}-track-musicAuthors`, track.musicAuthors)
            formData.append(`${clipForms.indexOf(track)}-track-lyricists`, track.lyricists)
            formData.append(`${clipForms.indexOf(track)}-track-phonogramProducers`, track.phonogramProducers)
        }
        try {
            submit(formData, { method: 'post', action: '/request/video-clip' });
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

            <div className="release-other-fields spaced">

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
                                        value={trackForm.musicAuthors}
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
                                        value={trackForm.lyricists}
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
                                        value={trackForm.phonogramProducers}
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