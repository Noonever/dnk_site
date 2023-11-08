import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "~/styles/admin.request.css";
import styles2 from "~/styles/admin.requests.css";
import { getReleaseRequests, addReleaseRequestToDeliveryTable } from "~/backend/release";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: styles2 }];
};

export async function loader({ request }: LoaderArgs) {
    const requests = await getReleaseRequests();
    return { requests };
}

export default function Requests() {
    const navigate = useNavigate();

    const loadedData = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const requests = loadedData.requests

    const [filteredIndices, setFilteredIndices] = useState<number[]>([]);

    const [filter, setFilter] = useState("")
    const [modalIsOpened, setModalIsOpened] = useState(false);

    useEffect(() => {
        const filteredIndices: number[] = []

        for (let i = 0; i < requests.length; i++) {
            const releaseData = requests[i].data
            const joinedFields = releaseData.performers + releaseData.title + requests[i].imprint + requests[i].date;
            if (joinedFields.toLowerCase().includes(filter.toLowerCase())) {
                filteredIndices.push(i);
            }
        }

        setFilteredIndices(filteredIndices);

    }, [filter, requests]);

    function formatDate(inputDate: string) {
        const parts = inputDate.split('-');
        if (inputDate === '') {
            return '';
        }
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
            // Handle invalid input
            return 'Invalid date format';
        }
    }

    async function handleAddRequestToDeliveryTable(id: string, inDeliverySheet: boolean) {
        if (inDeliverySheet) {
            const answer = confirm('Релиз уже добавлен в таблицу выгрузки, добавить ещё раз?')
            if (!answer) {
                return
            }
        }
        setModalIsOpened(true);
        const result = await addReleaseRequestToDeliveryTable(id);
        console.log(result)
        if (result === null) {
            setModalIsOpened(false);
            alert('Ошибка')
        } else {
            alert('Релиз добавлен в таблицу выгрузки')
        }
        revalidator.revalidate();
        setModalIsOpened(false);
    }

    if (filteredIndices.length === 0) {
        return (
            <div className="my-releases">
                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            onChange={(e) => setFilter(e.target.value)}
                            value={filter}
                            className={`field release`}
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
        <>
            {modalIsOpened && (
                <div className="overlay">
                    <div className="modal">
                        <span>Загрузка</span>
                    </div>
                </div>
            )}

            <div className="my-releases">



                <div className="search-container">
                    <div className="row-field-input-container">
                        <input
                            onChange={(e) => setFilter(e.target.value)}
                            value={filter}
                            className={`field release`}
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
                            <div key={index} className="release-container" style={{ marginBottom: "1.7vh" }}>

                                {/* release performers */}
                                <div className="row-field" >
                                    {index === 0 ? <label className="input shifted bold">ИСПОЛНИТЕЛИ</label> : null}
                                    <div className="row-field-input-container">
                                        <input
                                            defaultValue={release.data.performers}
                                            disabled={true}
                                            id="left"
                                            className={`field release`}
                                        />
                                    </div>
                                </div>

                                {/* release title */}
                                <div className="row-field">
                                    {index === 0 ? <label className="input shifted bold">НАЗВАНИЕ</label> : null}
                                    <div className="row-field-input-container">
                                        <input
                                            defaultValue={release.data.title}
                                            disabled={true}
                                            className={`field release`}
                                        />
                                    </div>
                                </div>

                                {/* release version */}
                                <div className="row-field">
                                    {index === 0 ? <label className="input shifted bold">ДАТА РЕЛИЗА</label> : null}
                                    <div className="row-field-input-container">
                                        <input
                                            defaultValue={formatDate(release.date)}
                                            disabled={true}
                                            className={`field release`}
                                        />
                                    </div>
                                </div>
                                <div className="row-field">
                                    {index === 0 ? <label className="input shifted bold">ИМПРИНТ</label> : null}
                                    <div className="row-field-input-container">
                                        <input
                                            id='right'
                                            defaultValue={release.imprint}
                                            disabled={true}
                                            className={`field release`}
                                        />
                                    </div>
                                </div>
                                <svg className={index === 0 ? "track-controls-first" : "track-controls"} onClick={() => navigate(`/admin/release-requests/${release.id}`)} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.6316 8.31136C15.2356 7.91535 15.0376 7.71734 14.9634 7.48901C14.8981 7.28817 14.8981 7.07182 14.9634 6.87098C15.0376 6.64265 15.2356 6.44464 15.6316 6.04862L18.47 3.21025C17.7168 2.86962 16.8806 2.67999 16.0002 2.67999C12.6865 2.67999 10.0002 5.36628 10.0002 8.67999C10.0002 9.17103 10.0592 9.64829 10.1705 10.1051C10.2896 10.5942 10.3492 10.8388 10.3387 10.9933C10.3276 11.1551 10.3035 11.2411 10.2289 11.3851C10.1576 11.5226 10.0211 11.6591 9.74804 11.9322L3.50023 18.18C2.6718 19.0084 2.6718 20.3516 3.50023 21.18C4.32865 22.0084 5.6718 22.0084 6.50023 21.18L12.748 14.9322C13.0211 14.6591 13.1576 14.5226 13.2951 14.4514C13.4391 14.3768 13.5251 14.3526 13.6869 14.3416C13.8414 14.331 14.086 14.3906 14.5751 14.5097C15.0319 14.621 15.5092 14.68 16.0002 14.68C19.3139 14.68 22.0002 11.9937 22.0002 8.67999C22.0002 7.79958 21.8106 6.96347 21.47 6.21025L18.6316 9.04862C18.2356 9.44464 18.0376 9.64265 17.8092 9.71684C17.6084 9.78209 17.3921 9.78209 17.1912 9.71684C16.9629 9.64265 16.7649 9.44464 16.3689 9.04862L15.6316 8.31136Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg onClick={() => {
                                    if (release.date === '' || release.imprint === '') {
                                        alert('Заполните дату и импринт')
                                    } else {
                                        handleAddRequestToDeliveryTable(release.id, release.inDeliverySheet)
                                    }
                                }} className={index === 0 ? "track-controls-first" : "track-controls"} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.726 1.30284L18.4472 3.16348C18.9412 3.41047 19.1414 4.01114 18.8944 4.50512C18.6474 4.9991 18.0468 5.19932 17.5528 4.95233L13.8683 3.1101C13.4675 2.9097 13.2281 2.79111 13.0502 2.72162C13.04 2.71762 13.0304 2.71398 13.0215 2.71067C13.0204 2.72014 13.0194 2.73033 13.0184 2.74127C13.001 2.93147 13 3.19864 13 3.64676V16.0579C13 18.267 11.2091 20.0579 9 20.0579C6.79086 20.0579 5 18.267 5 16.0579C5 13.8488 6.79086 12.0579 9 12.0579C9.72857 12.0579 10.4117 12.2527 11 12.593L11 3.6056C11 3.21247 10.9999 2.85173 11.0267 2.55898C11.0543 2.25748 11.1199 1.87444 11.3611 1.52966C11.6764 1.07885 12.1635 0.777823 12.7077 0.697416C13.1239 0.63592 13.4958 0.748532 13.7779 0.858685C14.0517 0.965643 14.3743 1.127 14.726 1.30284ZM11 16.0579C11 14.9533 10.1046 14.0579 9 14.0579C7.89543 14.0579 7 14.9533 7 16.0579C7 17.1625 7.89543 18.0579 9 18.0579C10.1046 18.0579 11 17.1625 11 16.0579ZM4 1.0579C4.55228 1.0579 5 1.50562 5 2.0579V4.0579H7C7.55228 4.0579 8 4.50562 8 5.0579C8 5.61019 7.55228 6.0579 7 6.0579H5V8.0579C5 8.61019 4.55228 9.0579 4 9.0579C3.44772 9.0579 3 8.61019 3 8.0579V6.0579H1C0.447715 6.0579 0 5.61019 0 5.0579C0 4.50562 0.447715 4.0579 1 4.0579H3V2.0579C3 1.50562 3.44772 1.0579 4 1.0579Z" fill={release.inDeliverySheet ? 'green' : 'rgba(0, 0, 0, 0.385)'} strokeWidth='0.3' />
                                </svg>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
}