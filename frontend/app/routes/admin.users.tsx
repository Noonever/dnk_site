import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "~/styles/admin.request.css";
import styles2 from "~/styles/admin.requests.css";
import { getAllUsers, addUser, deleteUser, changeLinkUploadPermission, changePassword } from "~/backend/user";

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
    const [changePasswordUsername, setChangePasswordUsername] = useState<string | null>(null)
    const [passwordToChange, setPasswordToChange] = useState("")

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
        revalidator.revalidate()
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

    const handleChangePassword = async () => {
        if (changePasswordUsername === null) {
            return
        }
        const result = await changePassword(changePasswordUsername, passwordToChange)
        setChangePasswordUsername(null)
        setPasswordToChange("")
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

            {changePasswordUsername && (
                <div className="overlay">
                    <div className="modal" style={{ width: "30%", height: "30%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <center>
                            <label className="input bold">Сменить пароль</label>
                        </center>
                        <div>
                            <label className="input bold">Пользователь: {changePasswordUsername}</label>
                        </div>

                        <div className="row-field-input-container">
                            <label className="input shifted bold">Новый пароль</label>
                            <input
                                style={{ borderRadius: "30px" }}
                                value={passwordToChange}
                                onChange={(e) => setPasswordToChange(e.target.value)}
                                className="field release"
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button
                                className="submit"
                                onClick={() => {
                                    setChangePasswordUsername(null)
                                    setPasswordToChange("")
                                }}
                            >
                                ОТМЕНИТЬ
                            </button>
                            <button
                                style={passwordToChange === "" ? { cursor: "not-allowed", color: "gray" } : { cursor: "pointer" }}
                                disabled={passwordToChange === ""}
                                className="submit"
                                onClick={() => handleChangePassword()}
                            >
                                СОХРАНИТЬ
                            </button>
                        </div>

                    </div>
                </div>
            )}

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

            <div className="release-container" style={{ marginBottom: "4vh", alignItems: "center" }}>
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
                <svg onClick={() => handleAddUser()} className="" style={{ marginLeft: '1vw', marginRight: '1vw', marginTop: '1vh', cursor: 'pointer' }} width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                            <div className="controls-container" style={index === 0 ? { marginTop: "calc(20px + 1.3vh)" } : {marginTop: "1vh"}}>
                                <svg onClick={() => handleChangeLinkUploadPermission(user.username)} className={"track-controls"} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 7H7C4.23858 7 2 9.23858 2 12C2 14.7614 4.23858 17 7 17H9C11.7614 17 14 14.7614 14 12M16.5 17H17C19.7614 17 22 14.7614 22 12C22 9.23858 19.7614 7 17 7H15C12.2386 7 10 9.23858 10 12" stroke={user.linkUpload ? "black" : "gray"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                                <svg onClick={() => setChangePasswordUsername(user.username)} className={"track-controls"} fill="#000000" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns: xlink="http://www.w3.org/1999/xlink"
                                    viewBox="0 0 485.017 485.017" xml: space="preserve">
                                    <g>
                                        <path d="M361.205,68.899c-14.663,0-28.447,5.71-38.816,16.078c-21.402,21.403-21.402,56.228,0,77.631
		c10.368,10.368,24.153,16.078,38.815,16.078s28.447-5.71,38.816-16.078c21.402-21.403,21.402-56.228,0-77.631
		C389.652,74.609,375.867,68.899,361.205,68.899z M378.807,141.394c-4.702,4.702-10.953,7.292-17.603,7.292
		s-12.901-2.59-17.603-7.291c-9.706-9.706-9.706-25.499,0-35.205c4.702-4.702,10.953-7.291,17.603-7.291s12.9,2.589,17.603,7.291
		C388.513,115.896,388.513,131.688,378.807,141.394z"/>
                                        <path d="M441.961,43.036C414.21,15.284,377.311,0,338.064,0c-39.248,0-76.146,15.284-103.897,43.036
		c-42.226,42.226-54.491,105.179-32.065,159.698L0.254,404.584l-0.165,80.268l144.562,0.165v-55.722h55.705l0-55.705h55.705v-64.492
		l26.212-26.212c17.615,7.203,36.698,10.976,55.799,10.976c39.244,0,76.14-15.282,103.889-43.032
		C499.25,193.541,499.25,100.325,441.961,43.036z M420.748,229.617c-22.083,22.083-51.445,34.245-82.676,34.245
		c-18.133,0-36.237-4.265-52.353-12.333l-9.672-4.842l-49.986,49.985v46.918h-55.705l0,55.705h-55.705v55.688l-84.5-0.096
		l0.078-37.85L238.311,208.95l-4.842-9.672c-22.572-45.087-13.767-99.351,21.911-135.029C277.466,42.163,306.83,30,338.064,30
		c31.234,0,60.598,12.163,82.684,34.249C466.34,109.841,466.34,184.025,420.748,229.617z"/>
                                    </g>
                                </svg>

                                <svg onClick={() => handleDeleteUser(user.username)} className={"track-controls"} style={{ marginLeft: '1vw', marginRight: '1vw', cursor: 'pointer' }} width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1H13M1 4H19M17 4L16.2987 14.5193C16.1935 16.0975 16.1409 16.8867 15.8 17.485C15.4999 18.0118 15.0472 18.4353 14.5017 18.6997C13.882 19 13.0911 19 11.5093 19H8.49065C6.90891 19 6.11803 19 5.49834 18.6997C4.95276 18.4353 4.50009 18.0118 4.19998 17.485C3.85911 16.8867 3.8065 16.0975 3.70129 14.5193L3 4M8 8.5V13.5M12 8.5V13.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}