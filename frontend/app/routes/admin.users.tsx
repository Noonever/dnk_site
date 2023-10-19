import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "~/styles/admin.request.css";
import styles2 from "~/styles/admin.requests.css";
import { getAllUsers, addUser, deleteUser, changeLinkUploadPermission } from "~/backend/user";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: styles2 }];
};

export async function loader({ request }: LoaderArgs) {
    const users = await getAllUsers();
    if (!users) {
        return { users: [] };
    }
    return { users };
}

export default function Users() {

    const loadedData = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const users = loadedData.users

    const [filteredIndices, setFilteredIndices] = useState<number[]>([]);
    const [addingUser, setAddingUser] = useState({
        nickname: "",
        username: "",
        password: "",
    });
    const [filter, setFilter] = useState("")
    
    useEffect(() => {
        const filteredIndices: number[] = []

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const joinedFields = user.nickname + user.username;
            if (joinedFields.toLowerCase().includes(filter.toLowerCase())) {
                filteredIndices.push(i);
            }
        }

        setFilteredIndices(filteredIndices);

    }, [filter, users]);

    const handleAddUser = async () => {
        if (addingUser.nickname === "" || addingUser.username === "" || addingUser.password === "") {
            alert('Заполните все поля')
            return
        }
        const result = await addUser(addingUser.username, addingUser.nickname, addingUser.password)
        if (result === null) {
            alert('Пользователь с таким логином уже существует')
        }
        revalidator.revalidate()
        setAddingUser({
            nickname: "",
            username: "",
            password: "",
        })
    }

    const handleDeleteUser = async (username: string) => {
        const result = await deleteUser(username)
        if (result === null) {
            alert('Пользователь не существует')
        }
        revalidator.revalidate()
    }

    const handleChangeLinkUploadPermission = async (username: string) => {
        const result = await changeLinkUploadPermission(username)
        if (result === null) {
            alert('Пользователь не существует')
        }
        revalidator.revalidate()
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

            <div className="release-container" style={{ marginBottom: "4vh" }}>
                <div className="row-field" >
                    <div className="row-field-input-container">
                        <input
                            placeholder="АРТИСТ"
                            id="left"
                            className="field release"
                            value={addingUser.nickname}
                            onChange={(e) => setAddingUser({ ...addingUser, nickname: e.target.value })}
                        />
                    </div>
                </div>
                <div className="row-field" >
                    <div className="row-field-input-container">
                        <input
                            placeholder="ЛОГИН"
                            className="field release"
                            value={addingUser.username}
                            onChange={(e) => setAddingUser({ ...addingUser, username: e.target.value })}
                        />
                    </div>
                </div>
                <div className="row-field">
                    <div className="row-field-input-container">
                        <input
                            placeholder="ПАРОЛЬ"
                            id="right"
                            className="field release"
                            value={addingUser.password}
                            onChange={(e) => setAddingUser({ ...addingUser, password: e.target.value })}
                        />
                    </div>
                </div>
                <svg onClick={() => handleAddUser()} className="track-controls" style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M19 21V15M16 18H22M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            {
                users.map((user, index) => {

                    if (!filteredIndices.includes(index)) {
                        return null
                    }

                    return (
                        <div key={index} className="release-container" style={{ marginBottom: "1.7vh" }}>

                            <div className="row-field" >
                                {index === 0 ? <label className="input shifted bold">АРТИСТ</label> : null}
                                <div className="row-field-input-container">
                                    <input
                                        defaultValue={user.nickname}
                                        disabled={true}
                                        id="left"
                                        className="field release"
                                    />
                                </div>
                            </div>

                            <div className="row-field">
                                {index === 0 ? <label className="input shifted bold">ЛОГИН</label> : null}
                                <div className="row-field-input-container">
                                    <input
                                        id="right"
                                        defaultValue={user.username}
                                        disabled={true}
                                        className="field release"
                                    />
                                </div>
                            </div>

                            <svg onClick={() => handleChangeLinkUploadPermission(user.username)} className={index === 0 ? "track-controls-first" : "track-controls"} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 7H7C4.23858 7 2 9.23858 2 12C2 14.7614 4.23858 17 7 17H9C11.7614 17 14 14.7614 14 12M16.5 17H17C19.7614 17 22 14.7614 22 12C22 9.23858 19.7614 7 17 7H15C12.2386 7 10 9.23858 10 12" stroke={user.linkUpload? "black" : "gray"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            <svg onClick={() => handleDeleteUser(user.username)} className={index === 0 ? "track-controls-first" : "track-controls"} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }}width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 1H13M1 4H19M17 4L16.2987 14.5193C16.1935 16.0975 16.1409 16.8867 15.8 17.485C15.4999 18.0118 15.0472 18.4353 14.5017 18.6997C13.882 19 13.0911 19 11.5093 19H8.49065C6.90891 19 6.11803 19 5.49834 18.6997C4.95276 18.4353 4.50009 18.0118 4.19998 17.485C3.85911 16.8867 3.8065 16.0975 3.70129 14.5193L3 4M8 8.5V13.5M12 8.5V13.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    )
                })
            }
        </div>
    );
}