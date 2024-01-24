import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getUserData, updateUserData } from "~/backend/user.data";
import { uploadFile } from "~/backend/file";
import styles from "~/styles/me.css";
import { requireUserName } from "~/utils/session.server";

import type { UserData, RuPassportData, KzPassportData, ByPassportData, ForeignPassportData } from "~/types/user_data";
import { getUserByUsername } from "~/backend/user";
import CustomSelect from "~/components/select";
import { fullNameRePattern } from "~/utils/regexp";

const tenDigitsRePattern = /^\d{10}$/
const kzPassportNumberRePattern = /^[A-Za-zА-Яа-яёЁ]\d{8}$/
const kzPassportIdRePattern = /^\d{12}$/
const byPassportNumberRePattern = /^[A-Za-zА-Яа-яёЁ]{2}\d{7}$/
const innRePattern = /^\d{12}$/
const bankAccountRePattern = /^\d{20}$/
const bikRePattern = /^\d{9}$/
const ogrnipRePattern = /^\d{15}$/
const ogrnRePattern = /^\d{13}$/
const innOOORePattern = /^\d{10}$/
const kppRePattern = /^\d{9}$/

const ruPassportNumberRePattern = /^\d{4} \d{6}$/
const ruCodeRePattern = /^\d{3}-\d{3}$/
const snilsRePattern = /^\d{3}-\d{3}-\d{3} \d{2}$/


//@ts-ignore
export const meta: MetaFunction = () => {
    return [
        { title: "DNK | Профиль" },
        { name: "description", content: "Добро пожаловать в DNK" },
    ];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export async function loader({ request }: LoaderArgs) {
    const username = await requireUserName(request);
    const user = await getUserByUsername(username);
    const userData = await getUserData(username);
    console.log(userData);
    if (!userData) {
        throw new Response("Not found", { status: 404 });
    }
    return { username, user, userData };
}

export default function UserProfile() {
    const loaderData = useLoaderData<typeof loader>();
    const { username, userData } = loaderData;

    const [currentPassportType, setCurrentPassportType] = useState(userData.currentPassport);
    const [currentLegalEntityType, setCurrentLegalEntityType] = useState(userData.currentLegalEntity);

    console.log('Setup:', 'currentPassportType', currentPassportType, 'currentLegalEntityType', currentLegalEntityType)

    const [passportEditable, setPassportEditable] = useState(false);
    const [legalEntityEditable, setLegalEntityEditable] = useState(false);

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());

    const [ruPassport, setRuPassport] = useState<RuPassportData>(userData.ruPassport.data);
    const [kzPassport, setKzPassport] = useState<KzPassportData>(userData.kzPassport.data)
    const [byPassport, setByPassport] = useState<ByPassportData>(userData.byPassport.data);
    const [foreignPassport, setForeignPassport] = useState<ForeignPassportData>(userData.foreignPassport.data);
    const [userEmail, setUserEmail] = useState(userData.email);
    const [userSocials, setUserSocials] = useState(userData.socials);

    const currentPassport = {
        ru: userData["ruPassport"],
        kz: userData["kzPassport"],
        by: userData["byPassport"],
        foreign: userData["foreignPassport"]
    }[currentPassportType]

    console.log('Setup:', 'currentPassport', currentPassport)

    const [passportFiles, setPassportFiles] = useState<{ 'firstPage': File | undefined, 'secondPage': File | undefined }>({
        firstPage: undefined,
        secondPage: undefined
    });

    const [selfEmployedLegalEntity, setSelfEmployedLegalEntity] = useState<UserData["selfEmployedLegalEntity"]>(userData.selfEmployedLegalEntity);
    const [individualEntrepreneurLegalEntity, setIndividualEntrepreneurLegalEntity] = useState<UserData['individualEntrepreneurLegalEntity']>(userData.individualEntrepreneurLegalEntity);
    const [OOOLegalEntity, setOOOLegalEntity] = useState<UserData["oooLegalEntity"]>(userData.oooLegalEntity);
    const [foreignLegalEntity, setForeignLegalEntity] = useState<UserData["foreignLegalEntity"]>(userData.foreignLegalEntity);

    const handleChangeRuPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof UserData["ruPassport"]['data']) => {

        const value = event.target.value
        console.log('ru', fieldName, value)
        let isValid = true
        const newRuPassport = { ...ruPassport }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

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

        newRuPassport[fieldName] = value

        console.log(newInvalidFieldKeys)

        setInvalidFieldKeys(newInvalidFieldKeys)
        setRuPassport(newRuPassport)
    }

    const handleChangeKzPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof UserData['kzPassport']['data']) => {

        const value = event.target.value
        console.log('kz', fieldName, value)
        let isValid = true
        const newKzPassport = { ...kzPassport }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (fieldName === 'fullName') {
            isValid = fullNameRePattern.test(value) || value === ''
        } else if (fieldName === 'number') {
            isValid = kzPassportNumberRePattern.test(value) || value === ''
        } else if (fieldName === 'idNumber') {
            isValid = kzPassportIdRePattern.test(value) || value === ''
        }

        if (!isValid) {
            newInvalidFieldKeys.add(`passport-${fieldName}`)
        } else {
            newInvalidFieldKeys.delete(`passport-${fieldName}`)
        }

        newKzPassport[fieldName] = value

        console.log(newInvalidFieldKeys)

        setKzPassport(newKzPassport)
        setInvalidFieldKeys(newInvalidFieldKeys)
    }

    const handleChangeByPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof UserData['byPassport']['data']) => {

        const value = event.target.value
        console.log('by', fieldName, value)
        let isValid = true
        const newByPassport = { ...byPassport }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

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

        newByPassport[fieldName] = value

        console.log(newInvalidFieldKeys)

        setByPassport(newByPassport)
        setInvalidFieldKeys(newInvalidFieldKeys)
    }

    const handleChangeForeignPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof UserData['foreignPassport']['data']) => {

        const value = event.target.value
        console.log('foreign', fieldName, value)
        const newForeignPassport = { ...foreignPassport }

        newForeignPassport[fieldName] = value

        setForeignPassport(newForeignPassport)
    }

    const ruPassportSection = (
        <div className="passport-section">
            <div className="passport-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.fullName}
                        onChange={(event) => handleChangeRuPassport(event, 'fullName')}
                        {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
                        placeholder="Иванов Иван Иванович"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата рождения</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.birthDate}
                        onChange={(event) => handleChangeRuPassport(event, 'birthDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Серия и номер</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.number}
                        onChange={(event) => handleChangeRuPassport(event, 'number')}
                        {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                        placeholder="1234 567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Кем выдан</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.issuedBy}
                        onChange={(event) => handleChangeRuPassport(event, 'issuedBy')}
                        {...invalidFieldKeys.has('passport-issuedBy') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата выдачи</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.issueDate}
                        onChange={(event) => handleChangeRuPassport(event, 'issueDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Код подразделения</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.code}
                        onChange={(event) => handleChangeRuPassport(event, 'code')}
                        {...invalidFieldKeys.has('passport-code') && { style: { border: "1px solid red" } }}
                        placeholder="123-456"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.registrationAddress}
                        onChange={(event) => handleChangeRuPassport(event, 'registrationAddress')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">СНИЛС</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.snils}
                        onChange={(event) => handleChangeRuPassport(event, 'snils')}
                        {...invalidFieldKeys.has('passport-snils') && { style: { border: "1px solid red" } }}
                        placeholder="123-456-789 00"
                    />
                </div>
            </div>
        </div>
    )

    const kzPassportSection = (
        <div className="passport-section">
            <div className="passport-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.fullName}
                        onChange={(event) => handleChangeKzPassport(event, 'fullName')}
                        placeholder="Иванов Иван Иванович"
                        {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
    data
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата рождения</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.birthDate}
                        onChange={(event) => handleChangeKzPassport(event, 'birthDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер паспорта</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.number}
                        onChange={(event) => handleChangeKzPassport(event, 'number')}
                        {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                        placeholder="N12345678"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер ID</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.idNumber}
                        onChange={(event) => handleChangeKzPassport(event, 'idNumber')}
                        {...invalidFieldKeys.has('passport-idNumber') && { style: { border: "1px solid red" } }}
                        placeholder="123456789012"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Кем выдан</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.issuedBy}
                        onChange={(event) => handleChangeKzPassport(event, 'issuedBy')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата выдачи</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.issueDate}
                        onChange={(event) => handleChangeKzPassport(event, 'issueDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата окончания</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.endDate}
                        onChange={(event) => handleChangeKzPassport(event, 'endDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={kzPassport.registrationAddress}
                        onChange={(event) => handleChangeKzPassport(event, 'registrationAddress')}
                    />
                </div>
            </div>
        </div>
    )

    const byPassportSection = (
        <div className="passport-section">
            <div className="passport-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.fullName}
                        onChange={(event) => handleChangeByPassport(event, 'fullName')}
                        placeholder="Иванов Иван Иванович"
                        {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата рождения</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.birthDate}
                        onChange={(event) => handleChangeByPassport(event, 'birthDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер паспорта</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.number}
                        onChange={(event) => handleChangeByPassport(event, 'number')}
                        {...invalidFieldKeys.has('passport-number') && { style: { border: "1px solid red" } }}
                        placeholder="МР1234567"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Кем выдан</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.issuedBy}
                        onChange={(event) => handleChangeByPassport(event, 'issuedBy')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата выдачи</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.issueDate}
                        onChange={(event) => handleChangeByPassport(event, 'issueDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={byPassport.registrationAddress}
                        onChange={(event) => handleChangeByPassport(event, 'registrationAddress')}
                    />
                </div>
            </div>
        </div>
    )

    const foreignPassportSection = (
        <div className="passport-section">
            <div className="passport-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.fullName}
                        onChange={(event) => handleChangeForeignPassport(event, 'fullName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Гражданство</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.citizenship}
                        onChange={(event) => handleChangeForeignPassport(event, 'citizenship')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата рождения</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.birthDate}
                        onChange={(event) => handleChangeForeignPassport(event, 'birthDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер паспорта</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.number}
                        onChange={(event) => handleChangeForeignPassport(event, 'number')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер ID</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.idNumber}
                        onChange={(event) => handleChangeForeignPassport(event, 'idNumber')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Кем выдан</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.issuedBy}
                        onChange={(event) => handleChangeForeignPassport(event, 'issuedBy')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата выдачи</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.issueDate}
                        onChange={(event) => handleChangeForeignPassport(event, 'issueDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата окончания</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.endDate}
                        onChange={(event) => handleChangeForeignPassport(event, 'endDate')}
                        type={"date"}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={foreignPassport.registrationAddress}
                        onChange={(event) => handleChangeForeignPassport(event, 'registrationAddress')}
                    />
                </div>
            </div>
        </div>
    )

    const handleChangeSelfEmployedLegalEntity = (
        event: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof UserData['selfEmployedLegalEntity']
    ) => {

        const value = event.target.value
        console.log('by', fieldName, value)
        let isValid = true
        const newSelfEmployedLegalEntity = { ...selfEmployedLegalEntity }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (fieldName === 'inn') {
            isValid = innRePattern.test(value) || value === ''
        } else if (fieldName === 'checkingAccount' || fieldName === 'correspondentAccount') {
            isValid = bankAccountRePattern.test(value) || value === ''
        } else if (fieldName === 'bik') {
            isValid = bikRePattern.test(value) || value === ''
        }

        if (!isValid) {
            newInvalidFieldKeys.add(`legalEntity-${fieldName}`)
        } else {
            newInvalidFieldKeys.delete(`legalEntity-${fieldName}`)
        }

        newSelfEmployedLegalEntity[fieldName] = value

        setInvalidFieldKeys(newInvalidFieldKeys)
        setSelfEmployedLegalEntity(newSelfEmployedLegalEntity)
    }

    const handleChangeIndividualEntrepreneurLegalEntity = (
        value: string,
        fieldName: keyof UserData['individualEntrepreneurLegalEntity']
    ) => {

        console.log('IE', fieldName, value)
        let isValid = true
        const newIndividualEntrepreneurLegalEntity = { ...individualEntrepreneurLegalEntity }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (fieldName === 'fullName') {
            isValid = fullNameRePattern.test(value) || value === ''
        } else if (fieldName === 'inn') {
            isValid = innRePattern.test(value) || value === ''
        } else if (fieldName === 'ogrnip') {
            isValid = ogrnipRePattern.test(value) || value === ''
        } else if (fieldName === 'checkingAccount' || fieldName === 'correspondentAccount') {
            isValid = bankAccountRePattern.test(value) || value === ''
        } else if (fieldName === 'bik') {
            isValid = bikRePattern.test(value) || value === ''
        }

        if (!isValid) {
            newInvalidFieldKeys.add(`legalEntity-${fieldName}`)
        } else {
            newInvalidFieldKeys.delete(`legalEntity-${fieldName}`)
        }

        newIndividualEntrepreneurLegalEntity[fieldName] = value

        console.log(newIndividualEntrepreneurLegalEntity)
        setInvalidFieldKeys(newInvalidFieldKeys)
        setIndividualEntrepreneurLegalEntity(newIndividualEntrepreneurLegalEntity)
    }

    const handleChangeOOOLegalEntity = (
        value: string | boolean,
        fieldName: keyof UserData['oooLegalEntity']
    ) => {
        console.log('by', fieldName, value)
        let isValid = true
        const newOOOLegalEntity = { ...OOOLegalEntity }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (fieldName === 'directorFullName') {
            isValid = fullNameRePattern.test(value) || value === ''
        } else if (fieldName === 'inn') {
            isValid = innOOORePattern.test(value) || value === ''
        } else if (fieldName === 'kpp') {
            isValid = kppRePattern.test(value) || value === ''
        } else if (fieldName === 'ogrn') {
            isValid = ogrnRePattern.test(value) || value === ''
        } else if (fieldName === 'checkingAccount' || fieldName === 'correspondentAccount') {
            isValid = bankAccountRePattern.test(value) || value === ''
        } else if (fieldName === 'bik') {
            isValid = bikRePattern.test(value) || value === ''
        }

        if (!isValid) {
            newInvalidFieldKeys.add(`legalEntity-${fieldName}`)
        } else {
            newInvalidFieldKeys.delete(`legalEntity-${fieldName}`)
        }

        newOOOLegalEntity[fieldName] = value

        setInvalidFieldKeys(newInvalidFieldKeys)
        setOOOLegalEntity(newOOOLegalEntity)
    }

    const handleChangeForeignLegalEntity = (
        value: string,
        fieldName: keyof UserData['foreignLegalEntity']
    ) => {
        console.log('foreign', fieldName, value)
        let isValid = true
        const newForeignLegalEntity = { ...foreignLegalEntity }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (!isValid) {
            newInvalidFieldKeys.add(`legalEntity-${fieldName}`)
        } else {
            newInvalidFieldKeys.delete(`legalEntity-${fieldName}`)
        }

        newForeignLegalEntity[fieldName] = value

        setInvalidFieldKeys(newInvalidFieldKeys)
        setForeignLegalEntity(newForeignLegalEntity)
    }

    const selfEmployedLegalEntitySection = (
        <div className="legal-entity-section">
            <div className="legal-entity-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.inn}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'inn')}
                        {...invalidFieldKeys.has('legalEntity-inn') && { style: { border: "1px solid red" } }}
                        placeholder="123456789012"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.bankName}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'bankName')}
                        placeholder="ПАО Сбербанк"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Расчетный счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.checkingAccount}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'checkingAccount')}
                        {...invalidFieldKeys.has('legalEntity-checkingAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.bik}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'bik')}
                        {...invalidFieldKeys.has('legalEntity-bik') && { style: { border: "1px solid red" } }}
                        placeholder="123456789"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Корреспондентский счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.correspondentAccount}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'correspondentAccount')}
                        {...invalidFieldKeys.has('legalEntity-correspondentAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
            </div>
        </div>
    );

    const individualEntrepreneurLegalEntitySection = (
        <div className="legal-entity-section">
            <div className="legal-entity-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.fullName}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'fullName')}
                        {...invalidFieldKeys.has('legalEntity-fullName') && { style: { border: "1px solid red" } }}
                        placeholder="Иванов Иван Иванович"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ОГРНИП</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.ogrnip}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'ogrnip')}
                        {...invalidFieldKeys.has('legalEntity-ogrnip') && { style: { border: "1px solid red" } }}
                        placeholder="123456789012345"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.inn}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'inn')}
                        {...invalidFieldKeys.has('legalEntity-inn') && { style: { border: "1px solid red" } }}
                        placeholder="123456789012"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.registrationAddress}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'registrationAddress')}
                        placeholder="г. Москва, ул. Иванова, д.6, кв.15"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.bankName}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'bankName')}
                        placeholder="ПАО Сбербанк"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Расчетный счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.checkingAccount}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'checkingAccount')}
                        {...invalidFieldKeys.has('legalEntity-checkingAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.bik}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'bik')}
                        {...invalidFieldKeys.has('legalEntity-bik') && { style: { border: "1px solid red" } }}
                        placeholder="123456789"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Корреспондентский счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.correspondentAccount}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event.target.value, 'correspondentAccount')}
                        {...invalidFieldKeys.has('legalEntity-correspondentAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">У вас есть ЭДО?</label>
                    <CustomSelect
                        style={{ height: "3.17vh", width: '50%' }}
                        options={
                            [
                                { value: 'diadok', label: 'Да, в Контур Диадок' },
                                { value: 'sbis', label: 'Да, в СБИС' },
                                { value: 'both', label: 'И там и там' },
                                { value: 'no', label: 'Нет ЭДО' },
                            ]
                        }
                        defaultLabel="Да, в Контур Диадок"
                        defaultValue={individualEntrepreneurLegalEntity.edoAvailability}
                        onChange={(value) => handleChangeIndividualEntrepreneurLegalEntity(value, 'edoAvailability')}
                        disabled={!legalEntityEditable}
                    ></CustomSelect>
                </div>
            </div>
        </div>
    );

    const OOOLegalEntitySection = (
        <div className="legal-entity-section">
            <div className="legal-entity-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование юр.лица</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.entityName)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'entityName')}
                        placeholder="ООО Ромашка"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО Генерального директора</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.directorFullName)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'directorFullName')}
                        {...invalidFieldKeys.has('legalEntity-directorFullName') && { style: { border: "1px solid red" } }}
                        placeholder="Иванов Иван Иванович"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ОГРН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.ogrn)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'ogrn')}
                        {...invalidFieldKeys.has('legalEntity-ogrn') && { style: { border: "1px solid red" } }}
                        placeholder="1234567890123"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.inn)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'inn')}
                        {...invalidFieldKeys.has('legalEntity-inn') && { style: { border: "1px solid red" } }}
                        placeholder="1234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">КПП</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.kpp)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'kpp')}
                        {...invalidFieldKeys.has('legalEntity-kpp') && { style: { border: "1px solid red" } }}
                        placeholder="123456789"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Юридический адрес</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.legalAddress)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'legalAddress')}
                        placeholder="г. Москва, ул. Иванова, д.6, кв.15"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Фактический адрес</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.actualAddress)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'actualAddress')}
                        placeholder="г. Москва, ул. Иванова, д.6, кв.15"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.bankName)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'bankName')}
                        placeholder="ПАО Сбербанк"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Расчетный счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.checkingAccount)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'checkingAccount')}
                        {...invalidFieldKeys.has('legalEntity-checkingAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.bik)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'bik')}
                        {...invalidFieldKeys.has('legalEntity-bik') && { style: { border: "1px solid red" } }}
                        placeholder="123456789"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Корреспондентский счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.correspondentAccount)}
                        onChange={(event) => handleChangeOOOLegalEntity(event.target.value, 'correspondentAccount')}
                        {...invalidFieldKeys.has('legalEntity-correspondentAccount') && { style: { border: "1px solid red" } }}
                        placeholder="12345678901234567890"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">У вас есть ЭДО?</label>
                    <CustomSelect
                        style={{ height: "3.17vh", width: '50%' }}
                        options={
                            [
                                { value: 'diadok', label: 'Да, в Контур Диадок' },
                                { value: 'sbis', label: 'Да, в СБИС' },
                                { value: 'both', label: 'И там и там' },
                                { value: 'no', label: 'Нет ЭДО' },
                            ]
                        }
                        defaultLabel="Да, в Контур Диадок"
                        defaultValue={OOOLegalEntity.edoAvailability}
                        onChange={(value) => handleChangeOOOLegalEntity(value, 'edoAvailability')}
                        disabled={!legalEntityEditable}
                    ></CustomSelect>
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ООО на УСН или НДС</label>
                    <div className="responsive-selector-field" style={legalEntityEditable ? { marginLeft: "2vw", cursor: "pointer" } : { marginLeft: "2vw", cursor: "initial" }}>
                        <span onClick={() => {
                            if (legalEntityEditable === false) {
                                return
                            }
                            setOOOLegalEntity({ ...OOOLegalEntity, usnOrNds: true })
                        }}
                            className={"responsive-selector" + (OOOLegalEntity.usnOrNds ? " active" : '')} id="0">УСН /</span>

                        <span onClick={() => {
                            if (legalEntityEditable === false) {
                                return
                            }
                            setOOOLegalEntity({ ...OOOLegalEntity, usnOrNds: false })
                        }} className={"responsive-selector" + (!OOOLegalEntity.usnOrNds ? " active" : '')} id="0"> НДС</span>
                    </div>
                </div>
            </div>
        </div>
    )
    
    const foreignLegalEntitySection = (
        <div className="legal-entity-section">
            <div className="legal-entity-fields">
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование юр.лица</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.entityName)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'entityName')}
                        placeholder="ООО Ромашка"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО ИП / ФИО ген директора / CEO</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.directorFullName)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'directorFullName')}
                        {...invalidFieldKeys.has('legalEntity-directorFullName') && { style: { border: "1px solid red" } }}
                        placeholder="Иванов Иван Иванович"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Юридический адрес</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.legalAddress)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'legalAddress')}
                        placeholder="г. Москва, ул. Иванова, д.6, кв.15"
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата регистрации</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.registrationDate)}
                        type="date"
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'registrationDate')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Регистрационный номер</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.registrationNumber)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'registrationNumber')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.bankName)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'bankName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК / SWIFT</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.bik)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'bik')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер счёта</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.accountNumber)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'accountNumber')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка корреспондента</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.correspondentBankName)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'correspondentBankName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН банка корреспондента</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.correspondentBankInn)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'correspondentBankInn')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК / SWIFT банка корреспондента</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.correspondentBankBik)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'correspondentBankBik')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Рублёвый счёт</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.rublesAccount)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'rublesAccount')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Номер счёта банка корреспондента</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(foreignLegalEntity.correspondentAccount)}
                        onChange={(event) => handleChangeForeignLegalEntity(event.target.value, 'correspondentAccount')}
                    />
                </div>
            </div>
        </div>
    )

    const flushLegalEntityInvalidKeys = () => {
        let newInvalidFieldKeys = new Set(invalidFieldKeys);
        newInvalidFieldKeys.forEach((item) => {
            if (item.includes('legalEntity-')) {
                newInvalidFieldKeys.delete(item);
            }
        });
        setInvalidFieldKeys(newInvalidFieldKeys);
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

    function hasEmptyValues(obj: Record<string, any>) {
        return Object.values(obj).some(value => (value === '' || value === null || value === undefined));
    }

    const handleSavePassportData = async () => {
        for (const item of invalidFieldKeys) {
            if (item.includes('passport-')) {
                alert(`Некоторые поля заполнены некорректно`);
                return
            }
        }
        const passportToSave = {
            ru: ruPassport,
            kz: kzPassport,
            by: byPassport,
            foreign: foreignPassport,
        }[currentPassportType]

        console.log(passportToSave)

        const passportFilesFilled = (
            (passportFiles.firstPage !== undefined || currentPassport.firstPageScanId !== '') && (passportFiles.secondPage !== undefined || currentPassport.secondPageScanId !== '')
        )

        console.log(passportFilesFilled)

        if (hasEmptyValues(passportToSave) || !passportFilesFilled) {
            alert(`Все поля должны быть заполнены`);
            return
        }
        console.log('from handleSavePassportData', passportFiles)
        try {

            const newUserData = { ...userData }
            newUserData.currentPassport = currentPassportType
            let newFirstPageScanId = currentPassport.firstPageScanId
            let newSecondPageScanId = currentPassport.secondPageScanId
            if (passportFiles.firstPage !== undefined) {
                newFirstPageScanId = await uploadFile(passportFiles.firstPage)
            }
            if (passportFiles.secondPage !== undefined) {
                newSecondPageScanId = await uploadFile(passportFiles.secondPage)
            }
            if (currentPassportType === 'ru') {
                newUserData.ruPassport.data = passportToSave as UserData['ruPassport']['data']
                newUserData.ruPassport.firstPageScanId = newFirstPageScanId
                newUserData.ruPassport.secondPageScanId = newSecondPageScanId

            } else if (currentPassportType === 'kz') {
                newUserData.kzPassport.data = passportToSave as UserData['kzPassport']['data']
                newUserData.kzPassport.firstPageScanId = newFirstPageScanId
                newUserData.kzPassport.secondPageScanId = newSecondPageScanId

            } else if (currentPassportType === 'by') {
                newUserData.byPassport.data = passportToSave as UserData['byPassport']['data']
                newUserData.byPassport.firstPageScanId = newFirstPageScanId
                newUserData.byPassport.secondPageScanId = newSecondPageScanId

            } else {
                newUserData.foreignPassport.data = passportToSave as UserData['foreignPassport']['data']
                newUserData.foreignPassport.firstPageScanId = newFirstPageScanId
                newUserData.foreignPassport.secondPageScanId = newSecondPageScanId
            }
            console.log(newUserData)

            await updateUserData(username, newUserData)

            setPassportEditable(false)

        } catch (error) {
            console.error(error);
        }
    }

    const handleSaveLegalEntityData = async () => {
        for (const item of invalidFieldKeys) {
            if (item.includes('legalEntity-')) {
                alert(`Некоторые поля заполнены некорректно`);
                return
            }
        }
        const legalEntityToSave = {
            self: selfEmployedLegalEntity,
            individual: individualEntrepreneurLegalEntity,
            ooo: OOOLegalEntity,
            foreign: foreignLegalEntity
        }[currentLegalEntityType]

        if (hasEmptyValues(legalEntityToSave)) {
            console.log(legalEntityToSave)
            alert(`Все поля должны быть заполнены`);
            return
        }

        try {
            const newUserData = { ...userData }
            newUserData.currentLegalEntity = currentLegalEntityType
            if (currentLegalEntityType === 'self') {
                newUserData.selfEmployedLegalEntity = legalEntityToSave
            } else if (currentLegalEntityType === 'individual') {
                newUserData.individualEntrepreneurLegalEntity = legalEntityToSave as UserData['individualEntrepreneurLegalEntity']
            } else if (currentLegalEntityType === 'ooo') {
                newUserData.oooLegalEntity = legalEntityToSave as UserData['oooLegalEntity']
            } else if (currentLegalEntityType === 'foreign') {
                newUserData.foreignLegalEntity = legalEntityToSave as UserData['foreignLegalEntity']
            }
            console.log(newUserData)

            const update_data_response = await updateUserData(username, newUserData)

            setLegalEntityEditable(false)
        } catch (error) {
            console.error(error);
        }
    }

    const handleChangeUserEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = event.target.value
        const newInvalidFieldKeys = new Set(invalidFieldKeys)
        if (!/^[\p{L}!#-'*+\-/\d=?^-~]+(.[\p{L}!#-'*+\-/\d=?^-~])*@[^@\s]{2,}$/u.test(newEmail)) {
            newInvalidFieldKeys.add('user-email')
        } else {
            newInvalidFieldKeys.delete('user-email')
        }
        setUserEmail(newEmail)
        setInvalidFieldKeys(newInvalidFieldKeys)
    }

    const handleSaveAdditionalData = async () => {
        const newUserData = { ...userData }
        newUserData.email = userEmail
        newUserData.socials = userSocials

        await updateUserData(username, newUserData)
    }

    return (
        <>
            <div className="docs-section" style={{ paddingTop: "2vh", width: "77%" }}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "1vh", marginBottom: "1vh", width: "46%" }}>
                        <label className="input shifted">EMAIL ДЛЯ ОТЧЁТОВ</label>
                        <input
                            className="field"
                            value={userEmail}
                            onChange={(event) => handleChangeUserEmail(event)}
                            {...invalidFieldKeys.has('user-email') && { style: { border: "1px solid red" } }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginTop: "1vh", marginBottom: "1vh", width: "46%" }}>
                        <label className="input shifted">СОЦИАЛЬНЫЕ СЕТИ</label>
                        <input
                            className="field"
                            value={userSocials}
                            onChange={(event) => setUserSocials(event.target.value)}
                        />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                    <button
                        className="bubble"
                        style={{ marginTop: '1vh', border: 'none', cursor: 'pointer', padding: '0', width: '20%' }}
                        onClick={handleSaveAdditionalData}
                    >СОХРАНИТЬ</button>
                </div>
            </div>

            <div style={{ height: '3vh', backgroundColor: 'rgba(255, 255, 255, 0.28)', width: '100%', margin: '2vh' }}></div>

            <div className="user-docs">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="bubble" style={{ width: '35vw', marginTop: '1.5vw', background: 'none' }}>
                            <span className="label">ПАСПОРТНЫЕ ДАННЫЕ</span>

                            <CustomSelect
                                defaultValue={currentPassportType}
                                defaultLabel={
                                    {
                                        ru: 'РФ',
                                        kz: 'КЗ',
                                        by: 'РБ',
                                        foreign: 'ИНОСТРАННЫЙ'
                                    }[currentPassportType]
                                }
                                onChange={(val) => {
                                    flushPassportInvalidKeys()
                                    setCurrentPassportType(val as 'ru' | 'kz' | 'by' | 'foreign');
                                }}
                                options={[
                                    {
                                        label: 'РФ',
                                        value: 'ru'
                                    },
                                    {
                                        label: 'КЗ',
                                        value: 'kz'
                                    },
                                    {
                                        label: 'РБ',
                                        value: 'by'
                                    },
                                    {
                                        label: 'ИНОСТРАННЫЙ',
                                        value: 'foreign'
                                    },
                                ]}
                                disabled={!passportEditable}
                                style={{ width: '30%', backgroundColor: 'rgba(255, 255, 255, 0)' }}
                            ></CustomSelect>

                            <svg onClick={() => setPassportEditable(!passportEditable)} className='icon' width="8%" height="60%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_27_61)">
                                    <path d="M9.00001 5L7.00001 3M1.25 10.75L2.94218 10.562C3.14893 10.539 3.2523 10.5275 3.34892 10.4962C3.43464 10.4685 3.51622 10.4293 3.59144 10.3797C3.67623 10.3238 3.74977 10.2502 3.89686 10.1031L10.5 3.5C11.0523 2.94771 11.0523 2.05228 10.5 1.5C9.94773 0.947714 9.0523 0.947714 8.50001 1.5L1.89686 8.10314C1.74977 8.25023 1.67623 8.32377 1.62032 8.40856C1.57072 8.48378 1.53151 8.56535 1.50376 8.65108C1.47248 8.7477 1.46099 8.85107 1.43802 9.05782L1.25 10.75Z" stroke="#5E5EBF" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_27_61">
                                        <rect width="12" height="12" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div className="docs-section" style={!passportEditable ? { background: 'rgba(255, 255, 255, 0.28)', borderRadius: '30px' } : {}}>


                        {{ ru: ruPassportSection, kz: kzPassportSection, by: byPassportSection, foreign: foreignPassportSection }[currentPassportType]}


                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2vh' }}>

                            <label className="input shifted">СКАН ПАСПОРТА</label>

                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <div className="bubble" style={{ marginRight: '1vw', position: 'relative' }}>
                                    <input disabled={!passportEditable} type="file" className="full-cover" onChange={(event) => setPassportFiles(prevState => ({
                                        ...prevState, // Spread the previous state
                                        firstPage: event.target.files[0]// Set the new value for secondPage
                                    }))} />
                                    <span style={{ fontSize: '15px' }}>ПЕРВАЯ СТРАНИЦА</span>
                                    {(!passportFiles.firstPage && currentPassport.firstPageScanId === '') ? (
                                        <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 14.5818C1.79401 13.7538 1 12.3438 1 10.7436C1 8.33993 2.79151 6.36543 5.07974 6.14807C5.54781 3.22783 8.02024 1 11 1C13.9798 1 16.4522 3.22783 16.9203 6.14807C19.2085 6.36543 21 8.33993 21 10.7436C21 12.3438 20.206 13.7538 19 14.5818M7 14.3333L11 10.2308M11 10.2308L15 14.3333M11 10.2308V19.4615" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 10L10 12L14.5 7.5M10.9932 4.13581C8.9938 1.7984 5.65975 1.16964 3.15469 3.31001C0.649644 5.45038 0.296968 9.02898 2.2642 11.5604C3.75009 13.4724 7.97129 17.311 9.94801 19.0749C10.3114 19.3991 10.4931 19.5613 10.7058 19.6251C10.8905 19.6805 11.0958 19.6805 11.2805 19.6251C11.4932 19.5613 11.6749 19.3991 12.0383 19.0749C14.015 17.311 18.2362 13.4724 19.7221 11.5604C21.6893 9.02898 21.3797 5.42787 18.8316 3.31001C16.2835 1.19216 12.9925 1.7984 10.9932 4.13581Z" stroke="white" strokeOpacity="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}

                                </div>
                                <div className="bubble" style={{ position: 'relative' }}>
                                    <span style={{ fontSize: '15px' }}>ПРОПИСКА</span>
                                    <input disabled={!passportEditable} type="file" className="full-cover" onChange={(event) => setPassportFiles(prevState => ({
                                        ...prevState, // Spread the previous state
                                        secondPage: event.target.files[0] // Set the new value for secondPage
                                    }))} />
                                    {(!passportFiles.secondPage && currentPassport.secondPageScanId === '') ? (
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
                        {passportEditable ? (
                            <div>
                                <button className="bubble" onClick={handleSavePassportData} style={{ marginTop: '2vh', border: 'none', cursor: 'pointer', padding: '0' }} >СОХРАНИТЬ</button>
                            </div>
                        ) : <></>}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="bubble" style={{ width: '35vw', marginTop: '1.5vw', background: 'none' }}>
                        <span className="label">РЕКВИЗИТЫ</span>
                        <CustomSelect
                            defaultValue={currentLegalEntityType}
                            defaultLabel={{
                                'self': 'САМОЗАНЯТЫЙ',
                                'individual': 'ИП',
                                'ooo': 'ООО',
                                'foreign': 'Иностранное юр. лицо'
                            }[currentLegalEntityType]}
                            onChange={(val) => {
                                flushLegalEntityInvalidKeys();
                                setCurrentLegalEntityType(val as 'self' | 'individual' | 'ooo' | 'foreign');
                            }}
                            options={[
                                {
                                    value: 'self',
                                    label: 'САМОЗАНЯТЫЙ'
                                },
                                {
                                    value: 'individual',
                                    label: 'ИП'
                                },
                                {
                                    value: 'ooo',
                                    label: 'ООО'
                                },
                                {
                                    value: 'foreign',
                                    label: 'Иностранное юр. лицо'
                                }

                            ]}
                            disabled={!legalEntityEditable}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}></CustomSelect>

                        <svg onClick={() => setLegalEntityEditable(!legalEntityEditable)} className='icon' width="8%" height="60%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_27_61)">
                                <path d="M9.00001 5L7.00001 3M1.25 10.75L2.94218 10.562C3.14893 10.539 3.2523 10.5275 3.34892 10.4962C3.43464 10.4685 3.51622 10.4293 3.59144 10.3797C3.67623 10.3238 3.74977 10.2502 3.89686 10.1031L10.5 3.5C11.0523 2.94771 11.0523 2.05228 10.5 1.5C9.94773 0.947714 9.0523 0.947714 8.50001 1.5L1.89686 8.10314C1.74977 8.25023 1.67623 8.32377 1.62032 8.40856C1.57072 8.48378 1.53151 8.56535 1.50376 8.65108C1.47248 8.7477 1.46099 8.85107 1.43802 9.05782L1.25 10.75Z" stroke="#5E5EBF" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_27_61">
                                    <rect width="12" height="12" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>

                    <div className="docs-section" style={!legalEntityEditable ? { background: 'rgba(255, 255, 255, 0.28)', borderRadius: '30px' } : {}}>

                        {{ self: selfEmployedLegalEntitySection, individual: individualEntrepreneurLegalEntitySection, ooo: OOOLegalEntitySection, foreign: foreignLegalEntitySection }[currentLegalEntityType]}

                        {legalEntityEditable ? (
                            <div>
                                <button onClick={handleSaveLegalEntityData} className="bubble" style={{ marginTop: '2vh', border: 'none', cursor: 'pointer', padding: '0' }} >СОХРАНИТЬ</button>
                            </div>
                        ) : <></>}
                    </div>

                </div>
            </div>
        </>
    );
}