import type { MetaFunction, LinksFunction, ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { updateUserLegalEntity, updateUserPassport } from "~/backend/user";
import styles from "~/styles/me.css";
import { requireUserId } from "~/utils/session.server";

const fullNameRePattern = /^([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+)$/;
const sixDigitsRePattern = /^\d{6}$/
const tenDigitsRePattern = /^\d{10}$/
const kzPassportNumberRePattern = /^[A-Za-z]\d{8}$/
const byPassportNumberRePattern = /^[A-Za-z]{2}\d{7}$/
const innRePattern = /^\d{12}$/
const bankAccountRePattern = /^\d{20}$/
const bikRePattern = /^\d{9}$/
const ogrnipRePattern = /^\d{15}$/
const ogrnRePattern = /^\d{13}$/
const innOOORePattern = /^\d{10}$/
const kppRePattern = /^\d{9}$/

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
    const userId = await requireUserId(request);
    return userId;
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();

    const userId = formData.get('userId')

    if (!userId) {
        console.error('No userId for updateUserData')
        return null
    }

    const passportType = formData.get('passportType')
    const legalEntityType = formData.get('legalEntityType')

    if (passportType) {
        console.log('from action: passport')
        const passportData = JSON.parse(String(formData.get('passportData')))
        // TODO: handle files
        // const passportScan1 = formData.get('passportScan-1')
        // const passportScan2 = formData.get('passportScan-2')

        await updateUserPassport(Number(userId), String(passportType), passportData)

    } else if (legalEntityType) {
        console.log('from action: legalEntity')
        const legalEntityData = JSON.parse(String(formData.get('legalEntityData')))

        await updateUserLegalEntity(Number(userId), String(legalEntityType), legalEntityData)
    } else {
        console.error('No passportType or legalEntityType for updateUserData')
    }

    return null
}

export default function UserProfile() {

    const userId = useLoaderData();
    const submit = useSubmit();

    const [currentPassportType, setCurrentPassportType] = useState('ru');
    const [currentLegalEntityType, setCurrentLegalEntityType] = useState('selfEmployed');

    const [passportEditable, setPassportEditable] = useState(false);
    const [legalEntityEditable, setLegalEntityEditable] = useState(false);

    const [passportTypeSelectOpened, setPassportTypeSelectOpened] = useState(false);
    const [legalEntityTypeSelectOpened, setLegalEntityTypeSelectOpened] = useState(false);

    const [invalidFieldKeys, setInvalidFieldKeys] = useState<Set<string>>(new Set());

    const [ruPassport, setRuPassport] = useState<Record<string, string>>({
        fullName: "",
        birthDate: "",
        number: "",
        issuedBy: "",
        issueDate: "",
        code: "",
        registrationDate: ""
    });

    const [kzPassport, setKzPassport] = useState<Record<string, string>>({
        fullName: "",
        birthDate: "",
        number: "",
        idNumber: "",
        issuedBy: "",
        issueDate: "",
        endDate: "",
        registrationAddress: "",
    })

    const [byPassport, setByPassport] = useState<Record<string, string>>({
        fullName: "",
        birthDate: "",
        number: "",
        issuedBy: "",
        issueDate: "",
        registrationAddress: "",
    });

    const [foreignPassport, setForeignPassport] = useState<Record<string, string>>({
        fullName: "",
        citizenship: "",
        birthDate: "",
        number: "",
        idNumber: "",
        issuedBy: "",
        issueDate: "",
        endDate: "",
        registrationAddress: "",
    })

    const [passportFiles, setPassportFiles] = useState<{ 'firstPage': File | undefined, 'secondPage': File | undefined }>({
        firstPage: undefined,
        secondPage: undefined
    });

    const [selfEmployedLegalEntity, setSelfEmployedLegalEntity] = useState<Record<string, string>>({
        inn: "",
        bankName: "",
        checkingAccount: "",
        bik: "",
        correspondentAccount: "",
    })

    const [individualEntrepreneurLegalEntity, setIndividualEntrepreneurLegalEntity] = useState<Record<string, string>>({
        fullName: "",
        ogrnip: "",
        inn: "",
        registrationAddress: "",
        bankName: "",
        checkingAccount: "",
        bik: "",
        correspondentAccount: "",
        EDOAvailability: "",
    })

    const [OOOLegalEntity, setOOOLegalEntity] = useState<Record<string, string | boolean>>({
        entityName: "",
        directorFullName: "",
        ogrn: "",
        inn: "",
        kpp: "",
        legalAddress: "",
        actualAddress: "",
        bankName: "",
        checkingAccount: "",
        bik: "",
        correspondentAccount: "",
        EDOAvailability: "",
        USNorNDS: true,
    });

    const handleChangeRuPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

        const value = event.target.value
        console.log('ru', fieldName, value)
        let isValid = true
        const newRuPassport = { ...ruPassport }
        const newInvalidFieldKeys = new Set(invalidFieldKeys)

        if (fieldName === 'fullName') {
            isValid = fullNameRePattern.test(value) || value === ''
        } else if (fieldName === 'number') {
            isValid = tenDigitsRePattern.test(value) || value === ''
            console.log('value', value, 'pattern', tenDigitsRePattern, isValid)
        } else if (fieldName === 'code') {
            isValid = sixDigitsRePattern.test(value) || value === ''
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

    const handleChangeKzPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

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
            isValid = /^d{12}&/.test(value) || value === ''
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

    const handleChangeByPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

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

    const handleChangeForeignPassport = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

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
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Дата регистрации</label>
                    <input
                        disabled={!passportEditable}
                        className="field"
                        value={ruPassport.registrationDate}
                        type={"date"}
                        onChange={(event) => handleChangeRuPassport(event, 'registrationDate')}
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
                        {...invalidFieldKeys.has('passport-fullName') && { style: { border: "1px solid red" } }}
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
                        value={foreignPassport.issueDate}
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

    const handleChangeSelfEmployedLegalEntity = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

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

    const handleChangeIndividualEntrepreneurLegalEntity = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

        const value = event.target.value
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

    const handleChangeOOOLegalEntity = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {

        const value = event.target.value
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
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={selfEmployedLegalEntity.bankName}
                        onChange={(event) => handleChangeSelfEmployedLegalEntity(event, 'bankName')}
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
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'fullName')}
                        {...invalidFieldKeys.has('legalEntity-fullName') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ОГРНИП</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.ogrnip}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'ogrnip')}
                        {...invalidFieldKeys.has('legalEntity-ogrnip') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.inn}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'inn')}
                        {...invalidFieldKeys.has('legalEntity-inn') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Адрес регистрации</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.registrationAddress}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'registrationAddress')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.bankName}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'bankName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Расчетный счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.checkingAccount}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'checkingAccount')}
                        {...invalidFieldKeys.has('legalEntity-checkingAccount') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.bik}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'bik')}
                        {...invalidFieldKeys.has('legalEntity-bik') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Корреспондентский счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.correspondentAccount}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'correspondentAccount')}
                        {...invalidFieldKeys.has('legalEntity-correspondentAccount') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">У вас есть ЭДО?</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={individualEntrepreneurLegalEntity.EDOAvailability}
                        onChange={(event) => handleChangeIndividualEntrepreneurLegalEntity(event, 'EDOAvailability')}
                    />
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
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'entityName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ФИО Генерального директора</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.directorFullName)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'directorFullName')}
                        {...invalidFieldKeys.has('legalEntity-directorFullName') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ОГРН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.ogrn)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'ogrn')}
                        {...invalidFieldKeys.has('legalEntity-ogrn') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ИНН</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.inn)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'inn')}
                        {...invalidFieldKeys.has('legalEntity-inn') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">КПП</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.kpp)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'kpp')}
                        {...invalidFieldKeys.has('legalEntity-kpp') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Юридический адрес</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.legalAddress)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'legalAddress')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Фактический адрес</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.actualAddress)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'actualAddress')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Наименование банка</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.bankName)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'bankName')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Расчетный счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.checkingAccount)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'checkingAccount')}
                        {...invalidFieldKeys.has('legalEntity-checkingAccount') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">БИК</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.bik)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'bik')}
                        {...invalidFieldKeys.has('legalEntity-bik') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">Корреспондентский счет</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.correspondentAccount)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'correspondentAccount')}
                        {...invalidFieldKeys.has('legalEntity-correspondentAccount') && { style: { border: "1px solid red" } }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">У вас есть ЭДО?</label>
                    <input
                        disabled={!legalEntityEditable}
                        className="field"
                        value={String(OOOLegalEntity.EDOAvailability)}
                        onChange={(event) => handleChangeOOOLegalEntity(event, 'EDOAvailability')}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2vh", marginBottom: "3vh" }}>
                    <label className="input shifted">ООО на УСН или НДС</label>
                    <div onClick={
                        () => {
                            if (!legalEntityEditable) {
                                return;
                            }
                            if (OOOLegalEntity.USNorNDS) {
                                setOOOLegalEntity({ ...OOOLegalEntity, USNorNDS: false })
                            } else {
                                setOOOLegalEntity({ ...OOOLegalEntity, USNorNDS: true })
                            }
                        }
                    } className="responsive-selector-field" style={legalEntityEditable ? { marginLeft: "2vw", cursor: "pointer" } : { marginLeft: "2vw", cursor: "initial" }}>
                        <span className={"responsive-selector" + (OOOLegalEntity.USNorNDS ? " active" : '')} id="0">УСН /</span>
                        <span className={"responsive-selector" + (!OOOLegalEntity.USNorNDS ? " active" : '')} id="0"> НДС</span>
                    </div>
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

    function hasEmptyStringValues(obj: Record<string, any>) {
        return Object.values(obj).some(value => (value === '' || value === null || value === undefined));
    }

    const handleUpdatePassport = () => {
        const passportData = {
            ru: ruPassport,
            kz: kzPassport,
            by: byPassport,
            foreign: foreignPassport
        }[currentPassportType]
        if (passportData && hasEmptyStringValues(passportData)) {
            alert('Все поля должны быть заполнены')
            return
        }
        const formData = new FormData()

        if (passportFiles.firstPage) {
            formData.append('passportScan-1', passportFiles.firstPage)
        }

        if (passportFiles.secondPage) {
            formData.append('passportScan-2', passportFiles.secondPage)
        }

        formData.append('userId', userId)
        formData.append('passportType', currentPassportType)
        formData.append('passportData', JSON.stringify(passportData))

        setPassportEditable(false)
        submit(formData, { method: 'post', action: '/me' })
    }

    const handleUpdateLegalEntity = () => {
        const legalEntityData = {
            selfEmployed: selfEmployedLegalEntity,
            individualEntrepreneur: individualEntrepreneurLegalEntity,
            OOO: OOOLegalEntity,
        }[currentLegalEntityType]

        if (legalEntityData && hasEmptyStringValues(legalEntityData)) {
            alert('Все поля должны быть заполнены')
            return
        }

        const formData = new FormData()

        formData.append('userId', userId)
        formData.append('legalEntityType', currentLegalEntityType)
        formData.append('legalEntityData', JSON.stringify(legalEntityData))

        setLegalEntityEditable(false)
        submit(formData, { method: 'post', action: '/me' })
    }

    return (
        <div className="user-profile">
            <div className="profile-section">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="bubble">
                        <span className="label">ПАСПОРТНЫЕ ДАННЫЕ - {{ ru: 'РФ', kz: 'КЗ', by: 'РБ', foreign: 'ИНОСТРАННЫЙ' }[currentPassportType]}</span>

                        <svg onClick={() => setPassportTypeSelectOpened(!passportTypeSelectOpened)} className="icon" width="8%" height="60%" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 3.125V11.875M7.5 11.875L11.875 7.5M7.5 11.875L3.125 7.5" stroke="#5E5EBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

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

                {passportTypeSelectOpened ? (
                    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '2vh' }}>
                        <div className="bubble">
                            <span className="label">ТИП ПАСПОРТА</span>
                            <select
                                value={currentPassportType}
                                onChange={(e) => {
                                    flushPassportInvalidKeys()
                                    setCurrentPassportType(e.target.value);
                                    setPassportTypeSelectOpened(false);
                                }}
                            >
                                <option value="ru">РФ</option>
                                <option value="kz">КЗ</option>
                                <option value="by">РБ</option>
                                <option value="foreign">ИНОСТРАННЫЙ</option>
                            </select>
                        </div>
                    </div>
                ) : null}

                {{ ru: ruPassportSection, kz: kzPassportSection, by: byPassportSection, foreign: foreignPassportSection }[currentPassportType]}

                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2vh' }}>

                    <label className="input shifted">СКАН ПАСПОРТА</label>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="bubble" style={{ marginRight: '1vw', position: 'relative' }}>
                            <input type="file" className="full-cover" onChange={(event) => setPassportFiles(prevState => ({
                                ...prevState, // Spread the previous state
                                firstPage: event.target.files[0] // Set the new value for secondPage
                            }))} />
                            <span>ПЕРВАЯ СТРАНИЦА</span>
                            {!passportFiles.firstPage ? (
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
                            <span>ПРОПИСКА</span>
                            <input type="file" className="full-cover" onChange={(event) => setPassportFiles(prevState => ({
                                ...prevState, // Spread the previous state
                                secondPage: event.target.files[0] // Set the new value for secondPage
                            }))} />
                            {!passportFiles.secondPage ? (
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
                        <button className="bubble" style={{ marginTop: '2vh', border: 'none', cursor: 'pointer' }} onClick={handleUpdatePassport}>СОХРАНИТЬ</button>
                    </div>
                ) : <></>}
            </div>


            <div className="profile-section">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="bubble">

                        <span className="label">{{ selfEmployed: 'Самозанятый', individualEntrepreneur: 'Реквизиты ИП', OOO: 'Реквизиты ООО' }[currentLegalEntityType]}</span>

                        <svg onClick={() => setLegalEntityTypeSelectOpened(!legalEntityTypeSelectOpened)} className="icon" width="8%" height="60%" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 3.125V11.875M7.5 11.875L11.875 7.5M7.5 11.875L3.125 7.5" stroke="#5E5EBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

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
                </div>

                {legalEntityTypeSelectOpened ? (
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2vh' }}>
                        <div className="bubble">
                            <span className="label">ТИП ЮР.ЛИЦА</span>
                            <select
                                value={currentLegalEntityType}
                                onChange={(e) => {
                                    flushLegalEntityInvalidKeys();
                                    setCurrentLegalEntityType(e.target.value);
                                    setLegalEntityTypeSelectOpened(false);
                                }}
                            >
                                <option value="selfEmployed">Самозанятый</option>
                                <option value="individualEntrepreneur">ИП</option>
                                <option value="OOO">ООО</option>
                            </select>
                        </div>
                    </div>

                ) : null}


                {{ selfEmployed: selfEmployedLegalEntitySection, individualEntrepreneur: individualEntrepreneurLegalEntitySection, OOO: OOOLegalEntitySection }[currentLegalEntityType]}

                {legalEntityEditable ? (
                    <div>
                        <button className="bubble" style={{ marginTop: '2vh', border: 'none', cursor: 'pointer' }} onClick={handleUpdateLegalEntity}>СОХРАНИТЬ</button>
                    </div>
                ) : <></>}
            </div>

        </div>
    );
}