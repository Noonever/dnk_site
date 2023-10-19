import { useState } from "react";

import { uploadFile } from "~/backend/file";
import { updateReleaseRequest } from "~/backend/release";

import type { BackCatalogReleaseUpload, BackCatalogTrackUpload, ReleaseRequest, ReleaseRequestUpdate } from "~/types/release";

import ReleaseGenreOptions from "./release-genres";
import { fullNamesRePattern, multipleNicknamesRePattern, timeRePattern, tenDigitsRePattern } from "~/utils/regexp";

interface BackCatalogTrackForm extends BackCatalogTrackUpload {
    wavFile?: File
    textFile?: File
}

export default function BackCatalogReleaseSection(
    props: {
        request: ReleaseRequest,
    }
) {

    const request = props.request
    const data: BackCatalogReleaseUpload = request.data as BackCatalogReleaseUpload;

    const [releaseDate, setReleaseDate] = useState(request.date);
    const [releaseImprint, setReleaseImprint] = useState(request.imprint);

    const [releasePerformers, setReleasePerformers] = useState(data.performers);
    const [releaseTitle, setReleaseTitle] = useState(data.title);
    const [releaseVersion, setReleaseVersion] = useState(data.version);
    const [releaseGenre, setReleaseGenre] = useState(data.genre);
    const [releaseCoverFile, setReleaseCoverFile] = useState<File | undefined>(undefined);
    const [releaseUPC, setReleaseUPC] = useState(data.upc)
    const [backCatalogDate, setBackCatalogDate] = useState(data.date)
    const [releaseSource, setReleaseSource] = useState(data.source)

    const [trackForms, setTrackForms] = useState(data.tracks as BackCatalogTrackForm[]);

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());
    const [modalIsOpened, setModalIsOpened] = useState(false);

    const minTracks = 1
    const maxTracks = 100

    const handleChangeReleasePerformers = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releasePerformers = event.target.value

        let isValid = multipleNicknamesRePattern.test(releasePerformers)
        if (releasePerformers === '') {
            isValid = true
        }

        const newTrackForms = [...trackForms]
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        for (let index = 0; index < trackForms.length; index++) {
            const track = trackForms[index]
            track.performers = releasePerformers

            if (!isValid) {
                newInvalidFieldKeys.add(`${index}-track-performers`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-performers`)
            }
        }

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

    const handleChangeReleaseUPC = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releaseUPC = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!tenDigitsRePattern.test(releaseUPC) && releaseUPC !== '') {
            newInvalidFieldKeys.add(`release-upc`)
        } else {
            newInvalidFieldKeys.delete(`release-upc`)
        }

        setReleaseUPC(releaseUPC);
        setInvalidFieldKeys(newInvalidFieldKeys);
    }

    const handleChangeReleaseDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releaseDate = event.target.value

        setBackCatalogDate(releaseDate);
    }

    const handleChangeReleaseSource = (event: React.ChangeEvent<HTMLInputElement>) => {
        // validated
        const releaseSource = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!tenDigitsRePattern.test(releaseSource) && releaseSource !== '') {
            newInvalidFieldKeys.add(`release-source`)
        } else {
            newInvalidFieldKeys.delete(`release-source`)
        }

        setReleaseSource(releaseSource);
        setInvalidFieldKeys(newInvalidFieldKeys);
    }

    const handleChangeTrackPerformers = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const performers = event.target.value;
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!multipleNicknamesRePattern.test(performers) && performers !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-performers`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-performers`)
        }

        newTrackForms[trackId].performers = performers;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackTitle = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // no validation
        const newTrackForms = [...trackForms];

        newTrackForms[trackId].title = event.target.value;

        setTrackForms(newTrackForms);
    }

    const handleChangeTrackVersion = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // no validation
        const newTrackForms = [...trackForms];

        newTrackForms[trackId].version = event.target.value;

        setTrackForms(newTrackForms);
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

        newTrackForms[trackId].musicAuthorsNames = musicAuthors;

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

        newTrackForms[trackId].lyricistsNames = lyricists;

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

        newTrackForms[trackId].phonogramProducersNames = phonogramProducers;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackISRC = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const ISRC = event.target.value
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!tenDigitsRePattern.test(ISRC) && ISRC !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-ISRC`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-ISRC`)
        }

        newTrackForms[trackId].isrc = ISRC;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleAddTrack = () => {
        const newTrackForms = [...trackForms];

        newTrackForms.push({
            performers: "",
            title: "",
            version: "",
            explicit: false,
            preview: "0:00",
            isCover: false,
            wavFile: undefined,
            textFile: undefined,
            performersNames: "",
            musicAuthorsNames: "",
            lyricistsNames: "",
            phonogramProducersNames: "",
            isrc: "",
            wavFileId: "",
            textFileId: "",
        })

        setTrackForms(newTrackForms);
    }

    const handleDeleteTrack = (trackId: number) => {
        const newTrackForms = [...trackForms]
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        for (let invalidFieldKey of invalidFieldKeys) {
            if (invalidFieldKey.startsWith(`${trackId}-track-`)) {
                newInvalidFieldKeys.delete(invalidFieldKey)
            }
        }

        newTrackForms.splice(trackId, 1);

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleCopyFields = (trackId: number) => {
        const newTrackForms = [...trackForms]

        for (let track of newTrackForms) {
            track.performersNames = trackForms[trackId].performersNames
            track.musicAuthorsNames = trackForms[trackId].musicAuthorsNames
            track.lyricistsNames = trackForms[trackId].lyricistsNames
            track.phonogramProducersNames = trackForms[trackId].phonogramProducersNames
        }

        const newInvalidFieldKeys = new Set(invalidFieldKeys)


        for (let index = 0; index < newTrackForms.length; index++) {

            if (invalidFieldKeys.has(`${trackId}-track-performersNames`)) {
                newInvalidFieldKeys.add(`${index}-track-performersNames`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-performersNames`)
            }
            if (invalidFieldKeys.has(`${trackId}-track-musicAuthors`)) {
                newInvalidFieldKeys.add(`${index}-track-musicAuthors`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-musicAuthors`)
            }
            if (invalidFieldKeys.has(`${trackId}-track-lyricists`)) {
                newInvalidFieldKeys.add(`${index}-track-lyricists`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-lyricists`)
            }
            if (invalidFieldKeys.has(`${trackId}-track-phonogramProducers`)) {
                newInvalidFieldKeys.add(`${index}-track-phonogramProducers`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-phonogramProducers`)
            }

        }

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

        const tracks: BackCatalogTrackUpload[] = []

        for (let [index, track] of trackForms.entries()) {

            let textFileId = track.textFileId
            let wavFileId = track.wavFileId

            if (track.wavFile === undefined) {
                if (track.wavFileId === "") {
                    alert("Прикрепите wavFile")
                    return
                }
            } else {
                wavFileId = await uploadFile(track.wavFile)
            }
            if (track.textFile !== undefined) {
                textFileId = await uploadFile(track.textFile)
            }

            if (track.performers === "") {
                err_notificate()
                break
            }
            if (track.title === "") {
                err_notificate()
                break
            }
            if (track.performersNames === "") {
                err_notificate()
                break
            }
            if (track.musicAuthorsNames === "") {
                err_notificate()
                break
            }
            if (track.phonogramProducersNames === "") {
                err_notificate()
                break
            }

            const trackData: BackCatalogTrackUpload = {
                performers: track.performers,
                title: track.title,
                version: track.version,
                explicit: track.explicit,
                preview: track.preview,
                isCover: track.isCover,
                performersNames: track.performersNames,
                musicAuthorsNames: track.musicAuthorsNames,
                lyricistsNames: track.lyricistsNames,
                phonogramProducersNames: track.phonogramProducersNames,
                isrc: track.isrc,
                wavFileId: wavFileId,
                textFileId: textFileId,
            }

            tracks.push(trackData)
        }

        let coverFileId = data.coverFileId
        if (releaseCoverFile !== undefined) {
            coverFileId = await uploadFile(releaseCoverFile)
        }

        const backCatalogRelease: BackCatalogReleaseUpload = {
            performers: releasePerformers,
            title: releaseTitle,
            version: releaseVersion,
            genre: releaseGenre,
            upc: releaseUPC,
            date: backCatalogDate,
            source: releaseSource,
            tracks: tracks,
            coverFileId: coverFileId,
        }
        try {
            const updatingReleaseRequest: ReleaseRequestUpdate = {
                date: releaseDate,
                imprint: releaseImprint,
                data: backCatalogRelease,
            }
            setModalIsOpened(true)
            const response = await updateReleaseRequest(request.id, updatingReleaseRequest)
            if (response !== null) {
                setModalIsOpened(false)
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
                            <path d="M3.6 18.6563C2.03222 17.58 1 15.7469 1 13.6667C1 10.5419 3.32896 7.97506 6.30366 7.69249C6.91216 3.89618 10.1263 1 14 1C17.8737 1 21.0878 3.89618 21.6963 7.69249C24.671 7.97506 27 10.5419 27 13.6667C27 15.7469 25.9678 17.58 24.4 18.6563M8.8 18.3333L14 13M14 13L19.2 18.3333M14 13V25" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="28" height="26" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                {/* release back catalog */}
                <div className='back-catalog-fields'>

                    {/* Release UPC */}
                    <div className="back-catalog-field">
                        <label className="input">UPC: </label>
                        <input
                            value={releaseUPC}
                            onChange={handleChangeReleaseUPC}
                            {...invalidFieldKeys.has(`release-upc`) ? { style: { border: "1px solid red" } } : null}
                            className="back-catalog"
                            placeholder="000000000000"
                        />
                    </div>

                    {/* Release date */}
                    <div className="back-catalog-field">
                        <label className="input">ДАТА РЕЛИЗА: </label>
                        <input
                            value={backCatalogDate}
                            onChange={handleChangeReleaseDate}
                            {...invalidFieldKeys.has(`release-date`) ? { style: { border: "1px solid red" } } : null}
                            className="back-catalog"
                            placeholder="00.00.0000"
                        />
                    </div>

                    {/* Release source */}
                    <div className="back-catalog-field">
                        <label className="input">ИСХОДНИКИ: </label>
                        <input
                            value={releaseSource}
                            onChange={handleChangeReleaseSource}
                            {...invalidFieldKeys.has(`release-source`) ? { style: { border: "1px solid red" } } : null}
                            className="back-catalog"
                            placeholder="000000000000"
                        />
                    </div>

                </div>
            </div>

            {trackForms.map((trackForm, index) => {
                return (
                    <div key={index} style={{ width: '100%' }}>
                        <div key={index} className="track-header">

                            {/* track number */}
                            <div className="index-button-container">
                                <button className="round">{index + 1}</button>
                            </div>

                            <div className="row-fields">

                                {/* track performers */}
                                <div className="row-field" >
                                    <label className="input shifted">ИСПОЛНИТЕЛИ*</label>
                                    <div className="row-field-input-container" style={{ marginBottom: '2vh' }}>
                                        <input
                                            value={trackForm.performers}
                                            onChange={(e) => handleChangeTrackPerformers(e, index)}
                                            placeholder="Кобяков"
                                            required={true}
                                            id="left"
                                            className="field release"
                                            {...invalidFieldKeys.has(`${index}-track-performers`) ? { style: { border: "1px solid red" } } : null}
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* track title */}
                                <div className="row-field">
                                    <label className="input shifted">НАЗВАНИЕ ТРЕКА*</label>
                                    <div className="row-field-input-container">
                                        <input
                                            value={trackForm.title}
                                            onChange={(e) => handleChangeTrackTitle(e, index)}
                                            name="release-title"
                                            placeholder="Пушка"
                                            required={true}
                                            className="field release"
                                            {...invalidFieldKeys.has(`${index}-track-title`) ? { style: { border: "1px solid red" } } : null}
                                            type="text"
                                        />
                                    </div>
                                </div>

                                {/* track version */}
                                <div className="row-field" id="right">
                                    <label className="input shifted">ВЕРСИЯ</label>
                                    <div className="row-field-input-container">
                                        <input
                                            value={trackForm.version ? trackForm.version : ""}
                                            onChange={(e) => handleChangeTrackVersion(e, index)}
                                            name="release-version"
                                            placeholder="Remix"
                                            id="right"
                                            className="field release"
                                            {...invalidFieldKeys.has(`${index}-track-version`) ? { style: { border: "1px solid red" } } : null}
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="track-buttons">
                                {/* add button */}
                                {trackForms.length < maxTracks && (
                                    <svg onClick={() => handleAddTrack()} className='track-controls' width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.4706 25.1663V5.169C19.4706 3.78782 19.4706 3.09723 19.7573 2.68131C20.0077 2.31813 20.3945 2.07562 20.8267 2.01084C21.3216 1.93666 21.9305 2.2455 23.1482 2.86319L29 5.83145M19.4706 25.1663C19.4706 27.8359 17.3374 30 14.7059 30C12.0744 30 9.94118 27.8359 9.94118 25.1663C9.94118 22.4967 12.0744 20.3326 14.7059 20.3326C17.3374 20.3326 19.4706 22.4967 19.4706 25.1663ZM6.76471 12.2764V2.60898M2 7.44269H11.5294" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}

                                {/* delete button */}
                                {trackForms.length > minTracks && (
                                    <svg onClick={() => handleDeleteTrack(index)} className='track-controls' width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.6667 2H21.3333M2 6.83333H31M27.7778 6.83333L26.6479 23.7811C26.4784 26.3238 26.3937 27.5952 25.8445 28.5592C25.361 29.4079 24.6317 30.0902 23.7527 30.5162C22.7543 31 21.4801 31 18.9317 31H14.0683C11.5199 31 10.2457 31 9.24732 30.5162C8.36833 30.0902 7.63903 29.4079 7.15553 28.5592C6.60635 27.5952 6.52159 26.3238 6.35207 23.7811L5.22222 6.83333M13.2778 14.0833V22.1389M19.7222 14.0833V22.1389" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
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
                                            {(!trackForm.wavFile && trackForm.wavFileId === '') ? (
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
                                            {(!trackForm.textFile && trackForm.textFileId === null) ? (
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
                                        value={trackForm.musicAuthorsNames}
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
                                        value={trackForm.lyricistsNames ? trackForm.lyricistsNames : ""}
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
                                        value={trackForm.phonogramProducersNames}
                                        onChange={(e) => handleChangeTrackPhonogramProducers(e, index)}
                                        className="track-field"
                                        {...invalidFieldKeys.has(`${index}-track-phonogramProducers`) ? { style: { border: "1px solid red" } } : null}
                                        placeholder="Иванов Иван Иванович"
                                        type="text"
                                    />
                                </div>

                            </div>
                            <div className="copy-button-container">
                                <svg onClick={() => handleCopyFields(index)} className="button" width="23" height="27" viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 15.5833L11.5 26L22 15.5833M1 1L11.5 11.4167L22 1" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>


                        {/* UPC */}
                        <div className="back-catalog-field" style={{ marginTop: "2vh" }}>
                            <label className="input">ISRC: </label>
                            <input
                                value={trackForm.isrc}
                                onChange={(e) => handleChangeTrackISRC(e, index)}
                                {...invalidFieldKeys.has(`${index}-track-ISRC`) ? { style: { border: "1px solid red" } } : null}
                                className="back-catalog"
                                placeholder="000000000000"
                            />
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
