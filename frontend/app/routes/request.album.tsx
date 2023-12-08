import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";

import { uploadFile } from "~/backend/file";
import { uploadNewMusicReleaseRequest } from "~/backend/release";
import type { NewMusicReleaseUpload, NewMusicTrackUpload } from "~/types/release";
import type { AuthorForm, AuthorDocs, Author } from "~/types/author";
import type { ByPassportData, ForeignPassportData, KzPassportData, RuPassportData } from "~/types/user_data";

import { requireUserName } from "~/utils/session.server";

import styles from "~/styles/request.single.css";
import passportStyles from "~/styles/me.css";
import indexSelectStyles from "~/styles/index-picker.css";

import ReleaseGenreOptions from "~/components/release-genres";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip"

import { fullNamesRePattern, multipleNicknamesRePattern, timeRePattern } from "~/utils/regexp";

import CustomSelect from "~/components/select";
import { getUserByUsername } from "~/backend/user";
import type { User } from "~/types/user";

const fullNameRePattern = fullNamesRePattern
const tenDigitsRePattern = /^\d{10}$/
const kzPassportNumberRePattern = /^[A-Za-z]\d{8}$/
const byPassportNumberRePattern = /^[A-Za-z]{2}\d{7}$/

const ruPassportNumberRePattern = /^\d{4} \d{6}$/
const ruCodeRePattern = /^\d{3}-\d{3}$/
const snilsRePattern = /^\d{3}-\d{3}-\d{3} \d{2}$/
const cloudLinkRePattern = /^https:\/\/[\w.-]+(?:\/[\w.-]+)*$/

//@ts-ignore
export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Заявка | Альбом" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: passportStyles }, { rel: "stylesheet", href: styles }, { rel: "stylesheet", href: indexSelectStyles }];
};

export async function loader({ request }: LoaderArgs): Promise<{ username: string, user: User }> {
    const username = await requireUserName(request);
    const user = await getUserByUsername(username);
    if (!user) {
        throw new Response("Not found", { status: 404 });
    }
    return { username, user };
}


export default function AlbumReleaseRequest() {

    const data = useLoaderData<typeof loader>();
    const { username, user } = data;

    const cloudUpload: boolean = user.linkUpload

    const [releasePerformers, setReleasePerformers] = useState("");
    const [releaseTitle, setReleaseTitle] = useState("");
    const [releaseVersion, setReleaseVersion] = useState("");
    const [releaseGenre, setReleaseGenre] = useState("African");
    const [releaseCoverFile, setReleaseCoverFile] = useState<File | undefined>(undefined);
    const [cloudLink, setCloudLink] = useState<string | undefined>(undefined);

    const [defaultTrackPerformers, setDefaultTrackPerformers] = useState('')

    const defaultTrack: {
        performers: string,
        title: string,
        version: string,
        explicit: boolean,
        preview: string,
        isCover: boolean,
        wavFile: File | undefined,
        textFile: File | undefined,
        performersNames: string,
        musicAuthorsNames: string,
        lyricistsNames: string,
        phonogramProducersNames: string,
    } = {
        performers: defaultTrackPerformers,
        title: "",
        version: "",
        explicit: false,
        preview: "",
        isCover: false,
        wavFile: undefined,
        textFile: undefined,
        performersNames: "",
        musicAuthorsNames: "",
        lyricistsNames: "",
        phonogramProducersNames: "",
    }

    const [trackForms, setTrackForms] = useState([
        defaultTrack,
    ]);

    const [userAgreed, setUserAgreed] = useState(false)

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());
    const [loadingModalIsOpened, setLoadingModalIsOpened] = useState(false);
    const [successModalIsOpened, setSuccessModalIsOpened] = useState(false);

    const [changeIndexModalIsOpened, setChangeIndexModalIsOpened] = useState(false);
    const [indexToChange, setIndexToChange] = useState<number | undefined>(undefined);
    const [targetIndex, setTargetIndex] = useState<number | undefined>(undefined);
    const [currentIndexIsValid, setCurrentIndexIsValid] = useState(false);

    const [authorIsSolo, setAuthorIsSolo] = useState(true);
    const [fullNameToAdd, setFullNameToAdd] = useState('');
    const [fullNameToAddValidity, setFullNameToAddValidity] = useState(true);
    const [authors, setAuthors] = useState<AuthorForm[]>([]);
    const [editableAuthorIndex, setEditableAuthorIndex] = useState<number | null>(null);

    const [authorDocsForm, setAuthorDocsForm] = useState<AuthorDocs>({
        licenseOrAlienation: false,
        paymentType: 'royalty',
        paymentValue: '0',
        passportType: 'ru',
        passport: {
            fullName: "",
            birthDate: "",
            number: "",
            issuedBy: "",
            issueDate: "",
            code: "",
            registrationAddress: "",
        }
    })

    const minTracks = 1
    const maxTracks = 100

    const handleChangeTargetIndex = (event: React.ChangeEvent<HTMLInputElement>) => {

        const currentTracksAmount = trackForms.length
        const index = Number(event.target.value) - 1

        if (!/^\d+$/.test(event.target.value) || index + 1 > currentTracksAmount || index  === indexToChange || index < 0) {
            setCurrentIndexIsValid(false)
            return
        } else {
            setCurrentIndexIsValid(true)
            setTargetIndex(index)
        }
    }

    const handleChangeTrackId = () => {
        const newTrackForms = [...trackForms]
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        const trackToMove = newTrackForms[indexToChange as number]
        const secondTrack = newTrackForms[targetIndex as number]
        newTrackForms[indexToChange as number] = secondTrack
        newTrackForms[targetIndex as number] = trackToMove

        for (const key of invalidFieldKeys) {
            console.log(key)
            if (key.startsWith(`${indexToChange}-track`)) {

                newInvalidFieldKeys.add(key.replace(`${indexToChange}-track`, `${targetIndex}-track`))
                newInvalidFieldKeys.delete(key)

            } else if (key.startsWith(`${targetIndex}-track`)) {

                newInvalidFieldKeys.add(key.replace(`${targetIndex}-track`, `${indexToChange}-track`))
                newInvalidFieldKeys.delete(key)

            }
        }
        console.log(invalidFieldKeys)
        console.log(newInvalidFieldKeys)
        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms)
        setChangeIndexModalIsOpened(false)
    }

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

        setDefaultTrackPerformers(releasePerformers)
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

    const handleChangeCloudLink = (event: React.ChangeEvent<HTMLInputElement>) => {

        const cloudLink = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!cloudLinkRePattern.test(cloudLink) && cloudLink !== '') {
            newInvalidFieldKeys.add(`cloudLink`)
        } else {
            newInvalidFieldKeys.delete(`cloudLink`)
        }

        setCloudLink(cloudLink);
        setInvalidFieldKeys(newInvalidFieldKeys)
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

    const handleChangeTrackIsExplicit = (trackId: number, value: boolean) => {
        // no validation
        const newTrackForms = [...trackForms];
        newTrackForms[trackId].explicit = value
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

    const handleChangeTrackIsCover = (trackId: number, value: boolean) => {
        // no validation
        const newTrackForms = [...trackForms];
        newTrackForms[trackId].isCover = value;
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackWavFile = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        //@ts-ignore
        const file = event.target.files[0];
        const newTrackForms = [...trackForms];

        if (file.type !== "audio/wav") {
            console.error('Неверный формат файла: ' + file.type)
            newTrackForms[trackId].wavFile = undefined
            alert("Неверный формат файла");
        } else {
            newTrackForms[trackId].wavFile = file
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
            newInvalidFieldKeys.add(`${trackId}-track-musicAuthorsNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-musicAuthorsNames`)
        }

        newTrackForms[trackId].musicAuthorsNames = musicAuthors;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleChangeTrackLyricists = (event: React.ChangeEvent<HTMLInputElement>, trackId: number) => {
        // validated
        const lyricists = event.target.value
        const newTrackForms = [...trackForms];
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!fullNamesRePattern.test(lyricists) && lyricists !== '') {
            newInvalidFieldKeys.add(`${trackId}-track-lyricistsNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-lyricistsNames`)
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
            newInvalidFieldKeys.add(`${trackId}-track-phonogramProducersNames`)
        } else {
            newInvalidFieldKeys.delete(`${trackId}-track-phonogramProducersNames`)
        }

        newTrackForms[trackId].phonogramProducersNames = phonogramProducers;

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const handleAddTrack = () => {
        const newTrackForms = [...trackForms];

        newTrackForms.push({
            performers: defaultTrackPerformers,
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
            if (invalidFieldKeys.has(`${trackId}-track-musicAuthorsNames`)) {
                newInvalidFieldKeys.add(`${index}-track-musicAuthorsNames`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-musicAuthorsNames`)
            }
            if (invalidFieldKeys.has(`${trackId}-track-lyricistsNames`)) {
                newInvalidFieldKeys.add(`${index}-track-lyricistsNames`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-lyricistsNames`)
            }
            if (invalidFieldKeys.has(`${trackId}-track-phonogramProducersNames`)) {
                newInvalidFieldKeys.add(`${index}-track-phonogramProducersNames`)
            } else {
                newInvalidFieldKeys.delete(`${index}-track-phonogramProducersNames`)
            }

        }

        setInvalidFieldKeys(newInvalidFieldKeys)
        setTrackForms(newTrackForms);
    }

    const flushForm = () => {
        setReleasePerformers("")
        setReleaseTitle("")
        setReleaseVersion("")
        setReleaseGenre("")
        setReleaseCoverFile(undefined)
        setDefaultTrackPerformers("")
        setCloudLink("")
        setTrackForms([defaultTrack])
        setInvalidFieldKeys(new Set())
        flushPassportInvalidKeys()
        setAuthors([])
    }

    const err_notificate = (message?: string) => {
        alert(message || 'Заполните все обязательные поля')
    }

    const handleSubmit = async () => {

        // Check if all fields are filled correctly
        if (invalidFieldKeys.size) {
            err_notificate("Некоторые поля заполнены некорректно")
            return
        }

        // Check if release main data is filled
        if (releasePerformers === "") {
            err_notificate("Укажите исполнителей релиза")
            return
        }
        if (releaseTitle === "") {
            err_notificate("Укажите название релиза")
            return
        }

        if (cloudUpload === false) {
            if (releaseCoverFile === undefined) {
                err_notificate("Добавьте обложку")
                return
            }
        } else {
            if (cloudLink === "") {
                err_notificate("Добавьте ссылку на исходники")
                return
            }
        }

        // Setting up authors
        const authorsToSend: Author[] = []
        const authorsFiles: Record<number, File> = {}

        if (authorIsSolo !== true) {
            for (let [index, author] of authors.entries()) {

                let authorToSend: Author | null = null

                if (author.docs !== null && author.file === null) {
                    authorToSend = {
                        fullName: author.fullName,
                        data: author.docs,
                    }
                } else if (author.docs === null && author.file !== null) {
                    authorToSend = {
                        fullName: author.fullName,
                        data: undefined,
                    }
                    authorsFiles[index] = author.file
                } else {
                    err_notificate(`Заполните документы автора ${author.fullName}`)
                    return
                }
                authorsToSend.push(authorToSend)
            }
        }

        // Setting up tracks
        const tracks: NewMusicTrackUpload[] = []
        const tracksWavFiles: Record<number, File> = {}
        const tracksTextFiles: Record<number, File> = {}

        for (let [index, track] of trackForms.entries()) {

            if (track.performers === "") {
                err_notificate(`Укажите исполнителей трека ${index + 1}`)
                return
            }
            if (track.title === "") {
                err_notificate(`Укажите название трека ${index + 1}`)
                return
            }
            if (track.performersNames === "") {
                err_notificate(`Укажите исполнителей трека ${index + 1}`)
                return
            }
            if (track.musicAuthorsNames === "") {
                err_notificate(`Укажите авторов музыки трека ${index + 1}`)
                return
            }
            if (track.phonogramProducersNames === "") {
                err_notificate(`Укажите производителей фонограммы трека ${index + 1}`)
                return
            }

            // Defining files
            if (cloudUpload === false) {
                if (track.wavFile === undefined) {
                    err_notificate(`Прикрепите wavFile для трека ${index + 1}`)
                    return
                } else {
                    tracksWavFiles[index] = track.wavFile
                }
                if (track.textFile !== undefined) {
                    tracksTextFiles[index] = track.textFile
                }
            }

            const trackData: NewMusicTrackUpload = {
                performers: track.performers,
                title: track.title,
                version: track.version,
                explicit: track.explicit,
                preview: track.preview == "" ? "0:00" : track.preview,
                isCover: track.isCover,
                performersNames: track.performersNames,
                musicAuthorsNames: track.musicAuthorsNames,
                lyricistsNames: track.lyricistsNames,
                phonogramProducersNames: track.phonogramProducersNames,
                wavFileId: null,
                textFileId: null,
            }
            tracks.push(trackData)
        }

        try {
            setLoadingModalIsOpened(true)

            let coverFileId = null

            if (cloudUpload === false) {
                // Uploading tracks files
                for (let [index, trackWavFile] of Object.entries(tracksWavFiles)) {
                    tracks[Number(index)].wavFileId = await uploadFile(trackWavFile)
                }
                for (let [index, trackTextFile] of Object.entries(tracksTextFiles)) {
                    tracks[Number(index)].textFileId = await uploadFile(trackTextFile)
                }

                for (let [index, authorFile] of Object.entries(authorsFiles)) {
                    authorsToSend[Number(index)].data = await uploadFile(authorFile)
                }
                // Uploading cover
                coverFileId = await uploadFile(releaseCoverFile as File)
            }

            // Setting up release
            const NewMusicRelease: NewMusicReleaseUpload = {
                performers: releasePerformers,
                title: releaseTitle,
                version: releaseVersion,
                genre: releaseGenre,
                tracks: tracks,
                coverFileId: coverFileId,
            }

            // Uploading release
            const response = await uploadNewMusicReleaseRequest(
                username,
                NewMusicRelease,
                authorsToSend,
                cloudLink,
            )
            if (response === 200) {
                setLoadingModalIsOpened(false)
                setSuccessModalIsOpened(true)
                setTimeout(() => {
                    setSuccessModalIsOpened(false)
                }, 2000)
                flushForm()
            }
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
        }
    }

    const flushPassportInvalidKeys = () => {
        let newInvalidFieldKeys = new Set(invalidFieldKeys);
        newInvalidFieldKeys.forEach((item) => {
            if (item.includes('passport-')) {
                newInvalidFieldKeys.delete(item);
            }
        });
        setInvalidFieldKeys(newInvalidFieldKeys);
    }

    const handleDeleteAuthor = (index: number) => {
        const newAuthorsState = [...authors]
        newAuthorsState.splice(index, 1)
        setAuthors(newAuthorsState)
    }

    const handleAddAuthor = () => {
        if (!fullNameToAddValidity || fullNameToAdd === "") {
            return
        }
        const newAuthorsState = [...authors]
        newAuthorsState.push({
            fullName: fullNameToAdd,
            docs: null,
            file: null
        })
        setAuthors(newAuthorsState)
        setFullNameToAdd('')
        setFullNameToAddValidity(true)
    }

    const handleChangeCurrentPassport = (fieldName: keyof RuPassportData | keyof KzPassportData | keyof ByPassportData | keyof ForeignPassportData, value: string) => {
        const currentPassport = authorDocsForm.passport
        const passportType = authorDocsForm.passportType

        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        let newPassport = { ...currentPassport }

        if (passportType === 'ru') {
            let isValid = true
            const newRuPassport = { ...currentPassport } as RuPassportData
            const ruFieldName = fieldName as keyof RuPassportData

            if (fieldName === 'fullName') {
                isValid = fullNameRePattern.test(value) || value === ''
            } else if (fieldName === 'number') {
                isValid = ruPassportNumberRePattern.test(value) || value === ''
                console.log('value', value, 'pattern', tenDigitsRePattern, isValid)
            } else if (fieldName === 'code') {
                isValid = ruCodeRePattern.test(value) || value === ''
            } else if (fieldName === 'snils') {
                isValid = snilsRePattern.test(value) || value === ''
            }

            if (!isValid) {
                newInvalidFieldKeys.add(`passport-${fieldName}`)
            } else {
                newInvalidFieldKeys.delete(`passport-${fieldName}`)
            }
            newRuPassport[ruFieldName] = value
            newPassport = newRuPassport

        } else if (passportType === 'kz') {
            let isValid = true
            const newKzPassport = { ...currentPassport } as KzPassportData
            const kzFieldName = fieldName as keyof KzPassportData

            if (fieldName === 'fullName') {
                isValid = fullNameRePattern.test(value) || value === ''
            } else if (fieldName === 'number') {
                isValid = kzPassportNumberRePattern.test(value) || value === ''
            } else if (fieldName === 'idNumber') {
                isValid = /^\d{12}$/.test(value) || value === ''
            }

            if (!isValid) {
                newInvalidFieldKeys.add(`passport-${fieldName}`)
            } else {
                newInvalidFieldKeys.delete(`passport-${fieldName}`)
            }

            newKzPassport[kzFieldName] = value
            newPassport = newKzPassport

        } else if (passportType === 'by') {
            let isValid = true
            const newByPassport = { ...currentPassport } as ByPassportData
            const byFieldName = fieldName as keyof ByPassportData

            if (fieldName === 'fullName') {
                isValid = fullNameRePattern.test(value) || value === ''
            } else if (fieldName === 'number') {
                isValid = byPassportNumberRePattern.test(value) || value === ''
            }

            if (!isValid) {
                newInvalidFieldKeys.add(`passport-${fieldName}`)
            } else {
                newInvalidFieldKeys.delete(`passport-${fieldName}`)
            }

            newByPassport[byFieldName] = value
            newPassport = newByPassport

        } else if (passportType === 'foreign') {
            const newForeignPassport = { ...currentPassport } as ForeignPassportData
            const foreignFieldName = fieldName as keyof ForeignPassportData

            newForeignPassport[foreignFieldName] = value
            newPassport = newForeignPassport
        }
        setAuthorDocsForm({ ...authorDocsForm, passport: newPassport })
        setInvalidFieldKeys(newInvalidFieldKeys)
        console.log(invalidFieldKeys)
    }

    const handleChangeCurrentPassportType = (value: 'ru' | 'kz' | 'by' | 'foreign') => {
        let newPassport: RuPassportData | KzPassportData | ByPassportData | ForeignPassportData | undefined = undefined

        const fullName = authors[editableAuthorIndex!].fullName

        if (value === 'ru') {
            newPassport = {
                fullName: fullName,
                birthDate: "",
                number: "",
                issuedBy: "",
                issueDate: "",
                code: "",
                registrationAddress: "",
                snils: "",
            } as RuPassportData

        } else if (value === 'kz') {
            newPassport = {
                fullName: fullName,
                birthDate: "",
                number: "",
                idNumber: "",
                issuedBy: "",
                issueDate: "",
                endDate: "",
                registrationAddress: "",
            } as KzPassportData

        } else if (value === 'by') {
            newPassport = {
                fullName: fullName,
                birthDate: "",
                number: "",
                issuedBy: "",
                issueDate: "",
                registrationAddress: "",
            } as ByPassportData

        } else {
            newPassport = {
                fullName: fullName,
                citizenship: "",
                birthDate: "",
                number: "",
                idNumber: "",
                issuedBy: "",
                issueDate: "",
                endDate: "",
                registrationAddress: "",
            } as ForeignPassportData
        }
        const newAuthorDocsForm = { ...authorDocsForm, passport: newPassport, passportType: value }
        flushPassportInvalidKeys()
        setAuthorDocsForm(newAuthorDocsForm)
    }

    const handleChangeAuthorFile = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newAuthors = [...authors]
        const file = event.target.files?.[0]
        if (file === undefined) {
            return
        }
        newAuthors[index].file = file
        setAuthors(newAuthors)
    }

    const handleOpenAuthorsDocs = (index: number) => {
        const currentAuthor = authors[index]
        const authorDocs = currentAuthor.docs
        const fullName = currentAuthor.fullName

        if (authorDocs === null) {
            const emptyRuPassport: RuPassportData = {
                fullName: fullName,
                birthDate: "",
                number: "",
                issuedBy: "",
                issueDate: "",
                code: "",
                registrationAddress: "",
                snils: "",
            }
            const newAuthorDocs: AuthorDocs = {
                passport: emptyRuPassport,
                paymentType: "royalty",
                paymentValue: "",
                licenseOrAlienation: true,
                passportType: "ru",
            }
            setAuthorDocsForm(newAuthorDocs)
        } else {
            setAuthorDocsForm(authorDocs)
        }
        setEditableAuthorIndex(index)
    }

    const authorDocsFormIsOk = (): boolean => {

        for (const [key, value] of Object.entries(authorDocsForm.passport)) {
            console.log(key, value)
            if ((value === '' || value === undefined || value === null) && key !== 'snils') {
                console.log('invalid')
                return false
            }
        }

        for (const key of invalidFieldKeys) {
            if (key.includes('passport-')) {
                return false
            }
        }

        if (authorDocsForm.paymentValue === '' && authorDocsForm.paymentType !== 'free') {
            return false
        }

        console.log(authorDocsForm.passport)


        return true
    }

    const handleSaveAuthorDocs = () => {
        const newAuthorsState = [...authors]
        newAuthorsState[editableAuthorIndex!].docs = authorDocsForm
        setAuthors(newAuthorsState)
        setEditableAuthorIndex(null)
    }

    const renderAuthors = (): JSX.Element => {

        if (authorIsSolo) {
            return (<></>)
        } else {
            return (
                <>
                    {
                        (authors.length > 0) && authors.map((author, index) => (
                            <div key={index} className="author-row">
                                <div className="full-name">
                                    <span className="name" >{author.fullName}</span>
                                </div>
                                <div className="buttons-container">
                                    {author.file ? (<></>) : (
                                        <svg onClick={() => {
                                            handleOpenAuthorsDocs(index)

                                        }} className='track-controls' width="33" height="33" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.9997 8.33326L11.6664 4.99993M2.08301 17.9166L4.90331 17.6032C5.24789 17.5649 5.42018 17.5458 5.58121 17.4937C5.72408 17.4474 5.86005 17.3821 5.98541 17.2994C6.12672 17.2062 6.2493 17.0836 6.49445 16.8385L17.4997 5.83326C18.4202 4.91279 18.4202 3.4204 17.4997 2.49993C16.5792 1.57945 15.0868 1.57945 14.1664 2.49992L3.16112 13.5052C2.91596 13.7503 2.79339 13.8729 2.70021 14.0142C2.61753 14.1396 2.55219 14.2755 2.50594 14.4184C2.4538 14.5794 2.43466 14.7517 2.39637 15.0963L2.08301 17.9166Z" stroke="white" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    )}
                                    {author.docs ? (<></>) : (
                                        <div style={{ position: 'relative' }}>
                                            <input onChange={(e) => handleChangeAuthorFile(index, e)} className="full-cover" type="file"></input>
                                            <svg className='track-controls' width="33" height="33" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 14.5818C1.79401 13.7538 1 12.3438 1 10.7436C1 8.33993 2.79151 6.36543 5.07974 6.14807C5.54781 3.22783 8.02024 1 11 1C13.9798 1 16.4522 3.22783 16.9203 6.14807C19.2085 6.36543 21 8.33993 21 10.7436C21 12.3438 20.206 13.7538 19 14.5818M7 14.3333L11 10.2308M11 10.2308L15 14.3333M11 10.2308V19.4615" stroke="white" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                    <svg onClick={() => handleDeleteAuthor(index)} className='track-controls' width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.6667 2H21.3333M2 6.83333H31M27.7778 6.83333L26.6479 23.7811C26.4784 26.3238 26.3937 27.5952 25.8445 28.5592C25.361 29.4079 24.6317 30.0902 23.7527 30.5162C22.7543 31 21.4801 31 18.9317 31H14.0683C11.5199 31 10.2457 31 9.24732 30.5162C8.36833 30.0902 7.63903 29.4079 7.15553 28.5592C6.60635 27.5952 6.52159 26.3238 6.35207 23.7811L5.22222 6.83333M13.2778 14.0833V22.1389M19.7222 14.0833V22.1389" stroke="white" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        )
                        )
                    }
                </>
            )
        }

    }

    const renderPassport = (): JSX.Element => {

        const passportType = authorDocsForm.passportType
        const passportData = authorDocsForm.passport

        let passportSection = <></>

        if (passportType === 'ru') {
            const ruPassport = passportData as RuPassportData
            passportSection = (
                <div className="passport-section">
                    <div className="passport-fields">
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">ФИО</label>
                            <input
                                disabled={true}
                                className="field"
                                value={ruPassport.fullName}
                                onChange={(event) => handleChangeCurrentPassport('fullName', event.target.value)}
                                {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата рождения</label>
                            <input
                                className="field"
                                value={ruPassport.birthDate}
                                onChange={(event) => handleChangeCurrentPassport('birthDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Серия и номер</label>
                            <input
                                className="field"
                                value={ruPassport.number}
                                onChange={(event) => handleChangeCurrentPassport('number', event.target.value)}
                                {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                                placeholder="1234 567890"
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Кем выдан</label>
                            <input
                                className="field"
                                value={ruPassport.issuedBy}
                                onChange={(event) => handleChangeCurrentPassport('issuedBy', event.target.value)}
                                {...invalidFieldKeys.has('passport-issuedBy') && { style: { border: "1px solid red" } }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата выдачи</label>
                            <input
                                className="field"
                                value={ruPassport.issueDate}
                                onChange={(event) => handleChangeCurrentPassport('issueDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Код подразделения</label>
                            <input
                                className="field"
                                value={ruPassport.code}
                                onChange={(event) => handleChangeCurrentPassport('code', event.target.value)}
                                {...invalidFieldKeys.has('passport-code') && { style: { border: "1px solid red" } }}
                                placeholder="123-456"
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Адрес регистрации</label>
                            <input
                                className="field"
                                value={ruPassport.registrationAddress}
                                onChange={(event) => handleChangeCurrentPassport('registrationAddress', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Снилс</label>
                            <input
                                className="field"
                                value={ruPassport.snils}
                                onChange={(event) => handleChangeCurrentPassport('snils', event.target.value)}
                                placeholder="123-456-789 01"
                                {...invalidFieldKeys.has('passport-snils') && { style: { border: "1px solid red" } }}
                            />
                        </div>
                    </div>
                </div>
            )
        } else if (passportType === 'kz') {
            const kzPassport = passportData as KzPassportData
            passportSection = (
                <div className="passport-section">
                    <div className="passport-fields">
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">ФИО</label>
                            <input
                                disabled={true}
                                className="field"
                                value={kzPassport.fullName}
                                onChange={(event) => handleChangeCurrentPassport('fullName', event.target.value)}
                                {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}

                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата рождения</label>
                            <input
                                className="field"
                                value={kzPassport.birthDate}
                                onChange={(event) => handleChangeCurrentPassport('birthDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Номер паспорта</label>
                            <input
                                className="field"
                                value={kzPassport.number}
                                onChange={(event) => handleChangeCurrentPassport('number', event.target.value)}
                                {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                                placeholder="N12345678"
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Номер ID</label>
                            <input
                                className="field"
                                value={kzPassport.idNumber}
                                onChange={(event) => handleChangeCurrentPassport('idNumber', event.target.value)}
                                {...invalidFieldKeys.has('passport-idNumber') && { style: { border: "1px solid red" } }}
                                placeholder="123456789012"
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Кем выдан</label>
                            <input
                                className="field"
                                value={kzPassport.issuedBy}
                                onChange={(event) => handleChangeCurrentPassport('issuedBy', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата выдачи</label>
                            <input
                                className="field"
                                value={kzPassport.issueDate}
                                onChange={(event) => handleChangeCurrentPassport('issueDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата окончания</label>
                            <input
                                className="field"
                                value={kzPassport.endDate}
                                onChange={(event) => handleChangeCurrentPassport('endDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Адрес регистрации</label>
                            <input
                                className="field"
                                value={kzPassport.registrationAddress}
                                onChange={(event) => handleChangeCurrentPassport('registrationAddress', event.target.value)}
                            />
                        </div>
                    </div>
                </div >
            )
        } else if (passportType === 'by') {
            const byPassport = passportData as ByPassportData
            passportSection = (
                <div className="passport-section">
                    <div className="passport-fields">
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">ФИО</label>
                            <input
                                disabled={true}
                                className="field"
                                value={byPassport.fullName}
                                onChange={(event) => handleChangeCurrentPassport('fullName', event.target.value)}
                                {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата рождения</label>
                            <input
                                className="field"
                                value={byPassport.birthDate}
                                onChange={(event) => handleChangeCurrentPassport('birthDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Номер паспорта</label>
                            <input
                                className="field"
                                value={byPassport.number}
                                onChange={(event) => handleChangeCurrentPassport('number', event.target.value)}
                                {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                                placeholder="МР1234567"
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Кем выдан</label>
                            <input
                                className="field"
                                value={byPassport.issuedBy}
                                onChange={(event) => handleChangeCurrentPassport('issuedBy', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата выдачи</label>
                            <input
                                className="field"
                                value={byPassport.issueDate}
                                onChange={(event) => handleChangeCurrentPassport('issueDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Адрес регистрации</label>
                            <input
                                className="field"
                                value={byPassport.registrationAddress}
                                onChange={(event) => handleChangeCurrentPassport('registrationAddress', event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )
        } else if (passportType === 'foreign') {
            const foreignPassport = passportData as ForeignPassportData
            passportSection = (
                <div className="passport-section">
                    <div className="passport-fields">
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">ФИО</label>
                            <input
                                disabled={true}
                                className="field"
                                value={foreignPassport.fullName}
                                onChange={(event) => handleChangeCurrentPassport('fullName', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Гражданство</label>
                            <input
                                className="field"
                                value={foreignPassport.citizenship}
                                onChange={(event) => handleChangeCurrentPassport('citizenship', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата рождения</label>
                            <input
                                className="field"
                                value={foreignPassport.birthDate}
                                onChange={(event) => handleChangeCurrentPassport('birthDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Номер паспорта</label>
                            <input
                                className="field"
                                value={foreignPassport.number}
                                onChange={(event) => handleChangeCurrentPassport('number', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Номер ID</label>
                            <input
                                className="field"
                                value={foreignPassport.idNumber}
                                onChange={(event) => handleChangeCurrentPassport('idNumber', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Кем выдан</label>
                            <input
                                className="field"
                                value={foreignPassport.issuedBy}
                                onChange={(event) => handleChangeCurrentPassport('issuedBy', event.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата выдачи</label>
                            <input
                                className="field"
                                value={foreignPassport.issueDate}
                                onChange={(event) => handleChangeCurrentPassport('issueDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Дата окончания</label>
                            <input
                                className="field"
                                value={foreignPassport.issueDate}
                                onChange={(event) => handleChangeCurrentPassport('endDate', event.target.value)}
                                type={"date"}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                            <label className="input shifted">Адрес регистрации</label>
                            <input
                                className="field"
                                value={foreignPassport.registrationAddress}
                                onChange={(event) => handleChangeCurrentPassport('registrationAddress', event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '1%', justifyContent: 'space-between', marginTop: '2vh' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>ПАСПОРТНЫЕ ДАННЫЕ</span>

                        <CustomSelect
                            style={{}}
                            onChange={(value) => handleChangeCurrentPassportType(value as 'ru' | 'kz' | 'by' | 'foreign')}
                            defaultValue={authorDocsForm.passportType}
                            defaultLabel={
                                {
                                    ru: 'РФ',
                                    kz: 'КЗ',
                                    by: 'РБ',
                                    foreign: 'ИНОСТРАННЫЙ',
                                }[authorDocsForm.passportType]
                            }
                            options={
                                [
                                    { value: 'ru', label: 'РФ' },
                                    { value: 'kz', label: 'КЗ' },
                                    { value: 'by', label: 'РБ' },
                                    { value: 'foreign', label: 'ИНОСТРАННЫЙ' },
                                ]
                            }
                        ></CustomSelect>
                    </div>
                    <div className="bubble" onClick={() => setEditableAuthorIndex(null)} style={{ width: 'calc(4vh - 2.1vw)', height: '4vh', cursor: 'pointer' }}>X</div>
                </div>
                {passportSection}
            </>
        )
    }

    const renderDocsForm = (): JSX.Element => {
        if (editableAuthorIndex == null) {
            return <></>
        }

        return (
            <div className="docs-section" style={{ width: '70%' }}>
                {renderPassport()}
                <div style={{ marginTop: '3.7vh', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <label className="input downgap" style={{ marginBottom: '0.5vw' }}>УСЛОВИЯ ПЕРЕДАЧИ ПРАВ*</label>
                        <div className="responsive-selector-field" style={{ margin: '0' }}>
                            <span onClick={() => setAuthorDocsForm({ ...authorDocsForm, licenseOrAlienation: true })} className={"responsive-selector" + (authorDocsForm.licenseOrAlienation ? " active" : '')} id="0">ЛИЦЕНЗИЯ /</span>
                            <span onClick={() => setAuthorDocsForm({ ...authorDocsForm, licenseOrAlienation: false })} className={"responsive-selector" + (!authorDocsForm.licenseOrAlienation ? " active" : '')} id="0"> ОТЧУЖДЕНИЕ</span>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '4vh', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <CustomSelect
                            style={{ width: '120%', padding: '6px', paddingLeft: '0.5vw', paddingRight: '20px', height: '3vh', border: '1px solid white', borderRadius: authorDocsForm.paymentType == 'free' ? '30px   ' : '30px 0px 0px 30px' }}
                            defaultValue={authorDocsForm.paymentType}
                            defaultLabel={
                                {
                                    'royalty': 'РОЯЛТИ',
                                    'free': 'БЕЗВОЗМЕЗДНО',
                                    'sum': 'ФИКС. СУММА',
                                    'other': 'ДРУГОЕ',
                                }[authorDocsForm.paymentType]
                            }
                            onChange={(e) => setAuthorDocsForm({ ...authorDocsForm, paymentType: e as 'royalty' | 'free' | 'sum' | 'other' })}
                            options={[
                                {
                                    label: 'РОЯЛТИ',
                                    value: 'royalty'
                                },
                                {
                                    label: 'БЕЗВОЗМЕЗДНО',
                                    value: 'free'
                                },
                                {
                                    label: 'ФИКС. СУММА',
                                    value: 'sum'
                                },
                                {
                                    label: 'ДРУГОЕ',
                                    value: 'other'
                                },
                            ]}
                        ></CustomSelect>
                        {authorDocsForm.paymentType == 'free' ? (<></>) : (
                            <input
                                value={authorDocsForm.paymentValue}
                                onChange={(e) => setAuthorDocsForm({ ...authorDocsForm, paymentValue: e.target.value })}
                                style={{ padding: '6px', paddingLeft: '0.5vw', width: '10vw', height: '3vh', borderRadius: '0px 30px 30px 0px', border: '1px solid white' }}
                                placeholder={{ 'royalty': '70%', 'sum': '500р', 'other': '' }[authorDocsForm.paymentType]}
                            ></input>
                        )}
                    </div>
                    <div className="submit-button-container" style={!authorDocsFormIsOk() ? { color: "none", pointerEvents: "none", opacity: 0.5, cursor: "not-allowed", marginTop: '0' } : { marginTop: '0' }}>
                        <button disabled={!authorDocsFormIsOk()} onClick={handleSaveAuthorDocs} className="submit" >СОХРАНИТЬ</button>
                    </div>
                </div>
            </div>
        )
    }

    const renderDocsSection = (): JSX.Element => {
        return (
            <>
                <div style={{ width: '100vw', height: '4.58vh', backgroundColor: '#ffffff26', marginTop: '6vh', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>ДОКУМЕНТЫ C АВТОРАМИ</span>
                </div>

                <div style={{ width: '100vw', height: '4.58vh', backgroundColor: 'none', marginTop: '2vh', textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0.5vw' }}>
                    <span onClick={() => setAuthorIsSolo(true)} className={"responsive-selector" + (authorIsSolo ? " active" : '')} id="0" style={{ cursor: 'pointer' }}>АРТИСТ АВТОР ВСЕГО /</span>
                    <span onClick={() => setAuthorIsSolo(false)} className={"responsive-selector" + (!authorIsSolo ? " active" : '')} id="0" style={{ cursor: 'pointer' }}> АВТОРОВ НЕСКОЛЬКО</span>
                </div>


                {editableAuthorIndex === null && renderAuthors()}
                {(editableAuthorIndex !== null || authorIsSolo) ? (<></>) : (
                    <div className="author-row">
                        <div className="full-name-container">
                            <input className="full-name add" value={fullNameToAdd} style={{ border: !fullNameToAddValidity ? '1px solid red' : 'none' }} onChange={(e) => {
                                const fullName = e.target.value
                                const isValid = fullNamesRePattern.test(fullName) || fullName === ''
                                setFullNameToAddValidity(isValid)
                                setFullNameToAdd(fullName)
                            }} placeholder="ФИО" />
                        </div>

                        <div className="buttons-container">
                            <svg onClick={fullNameToAddValidity ? (() => handleAddAuthor()) : () => { }} className='track-controls' width="33" height="33" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M19 21V15M16 18H22M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="white" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>

                )}
                {(editableAuthorIndex !== null && !authorIsSolo) && renderDocsForm()}
            </>
        )
    }

    return (
        <div className="request-container">

            {loadingModalIsOpened && (
                <div className="overlay">
                    <div className="modal">
                        <span>Загрузка</span>
                    </div>
                </div>
            )}

            {successModalIsOpened && (
                <div className="overlay">
                    <div className="modal" style={{
                        backgroundColor: "rgba(88,92,154,255)",
                        padding: "10px",
                        height: '30vh',
                        width: '60vw',
                        borderRadius: "30px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1001
                    }}>
                        <div style={{ height: '60%', display: "flex", flexDirection: "column", gap: "20%", paddingTop: '10%', textAlign: "center" }}>
                            <div>
                                <span style={{ textAlign: "center", width: '100%' }} className="info-text">ЗАЯВКА УСПЕШНО ОТПРАВЛЕНА</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* release fields */}
            <div className="row-fields">

                {/* release performers */}
                <div className="row-field" >

                    <label className="input shifted">ИСПОЛНИТЕЛИ <span className="star" style={{ color: 'white' }}>*</span></label>
                    <div className="row-field-input-container">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <input
                                        value={releasePerformers}
                                        onChange={handleChangeReleasePerformers}
                                        placeholder="Кобяков"
                                        id="left"
                                        className="field release"
                                        {...invalidFieldKeys.has(`release-performers`) ? { style: { border: "1px solid red" } } : null}
                                        type="text"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Псевдоним исполнителя в том виде, в каком он будет отражен на площадках.<br></br>
                                    Если в песне несколько основных исполнителей, просьба заполнить всех основных исполнителей через запятую.<br></br>
                                    Пример: "Джиган, Тимати, Егор Крид", если необходимо указать в треке артиста через "feat",<br></br>
                                    то необходимо заполнить в следующем формате: "Джиган feat.Тимати", в таком случае Джиган - основной исполнитель, Тимати - приглашенный.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>


                {/* release title */}
                <div className="row-field">
                    <label className="input shifted">НАЗВАНИЕ РЕЛИЗА <span className="star" style={{ color: 'white' }}>*</span></label>
                    <div className="row-field-input-container">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <input
                                        value={releaseTitle}
                                        onChange={handleChangeReleaseTitle}
                                        placeholder="Пушка"
                                        className="field release"
                                        {...invalidFieldKeys.has(`release-title`) ? { style: { border: "1px solid red" } } : null}
                                        type="text"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Название релиза в том виде, в каком оно будет отражено на площадках.<br></br>
                                    Важно: Пушка и ПУШКА - разные названия.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* release version */}
                <div className="row-field" id="right">
                    <label className="input shifted">ВЕРСИЯ</label>
                    <div className="row-field-input-container">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <input
                                        value={releaseVersion}
                                        onChange={handleChangeReleaseVersion}
                                        placeholder="Remix"
                                        id="right"
                                        className="field release"
                                        {...invalidFieldKeys.has(`release-version`) ? { style: { border: "1px solid red" } } : null}
                                        type="text"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Remix / prod.by / Acoustic и т.д х
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            <div className="release-other-fields">
                {/* release genre */}
                <div
                    className="release-genre-selector"
                    {...invalidFieldKeys.has(`release-genre`) ? { style: { border: "1px solid red" } } : null}
                >
                    <label className="input genre">ЖАНР <span className="star" style={{ color: 'white' }}>*</span></label>
                    <select
                        value={releaseGenre}
                        onChange={handleChangeReleaseGenre as any}
                        className="input"
                    >
                        <ReleaseGenreOptions />
                    </select>
                </div>

                {/* release cover */}
                {cloudUpload ? (
                    <>
                        <div className="right-track-field" style={{ width: "20vw" }}>
                            <label className="input shifted">ИСХОДНИКИ <span className="star" style={{ color: 'white' }}>*</span></label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <input
                                            value={cloudLink}
                                            onChange={(e) => handleChangeCloudLink(e)}
                                            className="track-field"
                                            {...invalidFieldKeys.has(`cloudLink`) ? { style: { border: "1px solid red" } } : null}
                                            placeholder="https://www.example.com"
                                            type="text"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Ссылка на папку с исходниками.<br></br>
                                        Поддерживаются Google Drive, Яндекс Диск и другие.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="release-cover-selector">
                                    <input accept="image/*" onChange={handleChangeReleaseCoverFile} type="file" className="full-cover" />
                                    <label className="input cover">ОБЛОЖКА <span className="star" style={{ color: 'white' }}>*</span></label>
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
                            </TooltipTrigger>
                            <TooltipContent>
                                Обложка в формате jpeg 3000x3000.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {trackForms.map((trackForm, index) => {
                return (
                    <div key={index} style={{ width: '100%', marginBottom: '4vh' }}>
                        <div key={index} className="track-header">

                            {(changeIndexModalIsOpened && index === indexToChange) &&  (
                                <div className="index-picker-container">
                                    <div className="index-picker-title-container">
                                        <label className="input">ВВЕДИТЕ НОМЕР ТРЕКА</label>
                                    </div>
                                    <center>
                                        <input maxLength={3} className="index-picker" onChange={(e) => handleChangeTargetIndex(e)} style={currentIndexIsValid ? { borderColor: 'green' } : { borderColor: 'red' }}></input>
                                    </center>
                                    <div className="index-picker-button-container">
                                        <button disabled={!currentIndexIsValid} onClick={handleChangeTrackId} className="submit index-controls" style={ !currentIndexIsValid ? { backgroundColor: 'rgba(255, 255, 255, 0.3)', cursor: 'default', width: "40%", height: "3vh" } : { width: "40%", height: "3vh" }} >
                                            ОК
                                        </button>
                                        <button onClick={() => { setTargetIndex(undefined); setChangeIndexModalIsOpened(false) }} className="submit index-controls" style={{ width: "40%", height: "3vh" }}>
                                            ОТМЕНА
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* track number */}
                            <div className="index-button-container">
                                <button onClick={() => {setChangeIndexModalIsOpened(true); setIndexToChange(index)}} className="round">{index + 1}</button>
                            </div>

                            <div className="row-fields">

                                {/* track performers */}
                                <div className="row-field" >
                                    <label className="input shifted">ИСПОЛНИТЕЛИ <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <div className="row-field-input-container" style={{ marginBottom: '2vh' }}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
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
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Псевдоним исполнителя в том виде, в каком он будет отражен на площадках.<br></br>
                                                    Если в песне несколько основных исполнителей, просьба заполнить всех основных исполнителей через запятую.<br></br>
                                                    Пример: "Джиган, Тимати, Егор Крид", если необходимо указать в треке артиста через "feat",<br></br>
                                                    то необходимо заполнить в следующем формате: "Джиган feat.Тимати", в таком случае Джиган - основной исполнитель, Тимати - приглашенный.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>


                                {/* track title */}
                                <div className="row-field">
                                    <label className="input shifted">НАЗВАНИЕ ТРЕКА <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <div className="row-field-input-container">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
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
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Название трека в том виде, в каком оно будет отражено на площадках.<br></br>
                                                    Важно: Пушка и ПУШКА - разные названия.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                {/* track version */}
                                <div className="row-field" id="right">
                                    <label className="input shifted">ВЕРСИЯ</label>
                                    <div className="row-field-input-container">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <input
                                                        value={trackForm.version}
                                                        onChange={(e) => handleChangeTrackVersion(e, index)}
                                                        name="release-version"
                                                        placeholder="Remix"
                                                        id="right"
                                                        className="field release"
                                                        {...invalidFieldKeys.has(`${index}-track-version`) ? { style: { border: "1px solid red" } } : null}
                                                        type="text"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Remix / prod.by / Acoustic и т.д.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>

                            <div className="track-buttons">
                                {/* add button */}
                                {trackForms.length < maxTracks && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <svg onClick={() => handleAddTrack()} className='track-controls' width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19.4706 25.1663V5.169C19.4706 3.78782 19.4706 3.09723 19.7573 2.68131C20.0077 2.31813 20.3945 2.07562 20.8267 2.01084C21.3216 1.93666 21.9305 2.2455 23.1482 2.86319L29 5.83145M19.4706 25.1663C19.4706 27.8359 17.3374 30 14.7059 30C12.0744 30 9.94118 27.8359 9.94118 25.1663C9.94118 22.4967 12.0744 20.3326 14.7059 20.3326C17.3374 20.3326 19.4706 22.4967 19.4706 25.1663ZM6.76471 12.2764V2.60898M2 7.44269H11.5294" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Добавить трек
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {/* delete button */}
                                {trackForms.length > minTracks && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <svg onClick={() => handleDeleteTrack(index)} className='track-controls' width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.6667 2H21.3333M2 6.83333H31M27.7778 6.83333L26.6479 23.7811C26.4784 26.3238 26.3937 27.5952 25.8445 28.5592C25.361 29.4079 24.6317 30.0902 23.7527 30.5162C22.7543 31 21.4801 31 18.9317 31H14.0683C11.5199 31 10.2457 31 9.24732 30.5162C8.36833 30.0902 7.63903 29.4079 7.15553 28.5592C6.60635 27.5952 6.52159 26.3238 6.35207 23.7811L5.22222 6.83333M13.2778 14.0833V22.1389M19.7222 14.0833V22.1389" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Удалить трек
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                        <div className="track-form">

                            <div className="left-track-fields">

                                <div id='upper-left-track-fields'>

                                    {/* explicit */}
                                    <label className="input downgap">В ПЕСНЕ ЕСТЬ МАТ? <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="responsive-selector-field">
                                                    <span onClick={() => handleChangeTrackIsExplicit(index, true)} className={"responsive-selector" + (trackForm.explicit ? " active" : '')} id="0">ДА /</span>
                                                    <span onClick={() => handleChangeTrackIsExplicit(index, false)} className={"responsive-selector" + (!trackForm.explicit ? " active" : '')} id="0"> НЕТ</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Выберите “Да” в том случае, если в произведении есть нецензурная лексика.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <label className="input downgap">ПРЕВЬЮ</label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <input
                                                    value={trackForm.preview}
                                                    placeholder="0:00"
                                                    onChange={(e) => handleChangeTrackPreview(e, index)}
                                                    className="preview"
                                                    {...invalidFieldKeys.has(`${index}-track-preview`) ? { style: { border: "1px solid red" } } : null}
                                                    type="text"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                С указанного тайминга будет начинаться минутный отрезок, который будет в тик-токе,<br></br>
                                                а также в качестве предварительного прослушивания на площадках.<br></br>
                                                Если вы не укажете превью, то на площадки будет отправлен отрывок с самого начала песни.<br></br>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* isCover */}
                                    <label className="input downgap">КАВЕР? <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="responsive-selector-field">
                                                    <span onClick={() => handleChangeTrackIsCover(index, true)} className={"responsive-selector" + (trackForm.isCover ? " active" : '')} id="0">ДА /</span>
                                                    <span onClick={() => handleChangeTrackIsCover(index, false)} className={"responsive-selector" + (!trackForm.isCover ? " active" : '')} id="0"> НЕТ</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Выберите “Да”, если оригинал песни написан не вами.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {!cloudUpload && (
                                    <div className="lower-left-track-fields">

                                        {/* wav file */}
                                        <div className="load-row">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="load-file">
                                                            <label className="input">.WAV <span className="star" style={{ color: 'white' }}>*</span></label>
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
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Wav файл трека (перед отправкой рекомендуем проверить корректность версии трека, а также целостность файла).
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        {/* text file */}
                                        <div className="load-row">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="load-file">
                                                            <label className="input">ТЕКСТ</label>
                                                            <input accept=".docx" onChange={(e) => handleChangeTrackTextFile(e, index)} type="file" className="full-cover" />
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
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Текст трека в формате .docx (word) (перед отправкой необходимо убедиться в том, что текст в документе соответствует словам песни).
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className="right-track-fields">

                                {/* track performers names */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИСПОЛНИТЕЛЕЙ <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <input
                                                    value={trackForm.performersNames}
                                                    onChange={(e) => handleChangeTrackPerformersNames(e, index)}
                                                    className="track-field"
                                                    {...invalidFieldKeys.has(`${index}-track-performersNames`) ? { style: { border: "1px solid red" } } : null}
                                                    placeholder="Иванов Иван Иванович, Петров Петр Петрович"
                                                    type="text"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Реальные ФИО исполнителей. Eсли их несколько - укажите через запятую.<br></br>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* track music authors */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ МУЗЫКИ <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <input
                                                    value={trackForm.musicAuthorsNames}
                                                    onChange={(e) => handleChangeTrackMusicAuthors(e, index)}
                                                    className="track-field"
                                                    {...invalidFieldKeys.has(`${index}-track-musicAuthorsNames`) ? { style: { border: "1px solid red" } } : null}
                                                    placeholder="Иванов Иван Иванович, Петров Петр Петрович"
                                                    type="text"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Реальные ФИО авторов музыки. Eсли их несколько - укажите через запятую.<br></br>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                {/* track lyricists */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО АВТОРОВ СЛОВ</label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <input
                                                    value={trackForm.lyricistsNames}
                                                    onChange={(e) => handleChangeTrackLyricists(e, index)}
                                                    className="track-field"
                                                    {...invalidFieldKeys.has(`${index}-track-lyricistsNames`) ? { style: { border: "1px solid red" } } : null}
                                                    placeholder="Иванов Иван Иванович, Петров Петр Петрович"
                                                    type="text"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Реальные ФИО авторов слов. Eсли их несколько - укажите через запятую.<br></br>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* track phonogram producers */}
                                <div className="right-track-field">
                                    <label className="input shifted">ФИО ИЗГОТОВИТЕЛЕЙ ФОНОГРАММЫ <span className="star" style={{ color: 'white' }}>*</span></label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <input
                                                    value={trackForm.phonogramProducersNames}
                                                    onChange={(e) => handleChangeTrackPhonogramProducers(e, index)}
                                                    className="track-field"
                                                    {...invalidFieldKeys.has(`${index}-track-phonogramProducersNames`) ? { style: { border: "1px solid red" } } : null}
                                                    placeholder="Иванов Иван Иванович, Петров Петр Петрович"
                                                    type="text"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Реальные ФИО изготовителей фонограммы.<br></br>
                                                Обычно изготовителем фонограммы является сам артист или человек, который спродюсировал процесс записи, профинансировал, дал идею.<br></br>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            <div className="copy-button-container">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <svg onClick={() => handleCopyFields(index)} className="button" width="23" height="27" viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 15.5833L11.5 26L22 15.5833M1 1L11.5 11.4167L22 1" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Скопировать поля с ФИО из этого трека в остальные
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                )
            })}

            {renderDocsSection()}

            <div className="submit-container">

                <div className="submit-button-container" style={!userAgreed ? { color: "none", pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" } : {}}>
                    <button onClick={handleSubmit} disabled={!userAgreed} className="submit">ОТПРАВИТЬ РЕЛИЗ</button>
                </div>

                <div className="agreement-container" style={{ marginTop: '7px' }}>
                    <svg style={userAgreed ? { backgroundColor: "green" } : { backgroundColor: "rgba(255, 255, 255, 0.00)" }} className="agreement" onClick={() => setUserAgreed(!userAgreed)} width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" clipRule="evenodd">
                        <path d="M5.625 9L7.875 11.25L12.375 6.75M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="white" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                        <a target="_blank" rel="noreferrer" className="agreement" href="https://youtube.com">Даю согласие на  </a><a target="_blank" rel="noreferrer" href="https://youtube.com" style={{ textDecoration: "underline", cursor: "pointer" }}>обработку</a>
                    </div>
                </div>
                <div className="agreement-container" style={{ marginTop: "5px" }}>
                    <a target="_blank" rel="noreferrer" href="https://youtube.com" style={{ textDecoration: "underline", cursor: "pointer" }}>персональных данных.</a>
                </div>

            </div>
        </div>
    )
}
