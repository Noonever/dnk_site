import type { FieldConfig, FormConfig } from "~/components/MultiForm";

const BYPassportFormFields: Record<string, FieldConfig> = {
    fullName: {
        alias: "ФИО",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "Иванов Иван Иванович",
        isRequired: true,
    },
    birthDate: {
        alias: "Дата рождения",
        type: "text",
        validation: /^\d{2}.\d{2}.\d{4}$/,
        placeholder: "13.11.1990",
        isRequired: true,
    },
    passportNumber: {
        alias: "Номер паспорта",
        type: "text",
        validation: /^[А-ЯA-Z]{2}\d{7}$/,
        placeholder: "МР1234567",
        errorMessage: "Должно быть 2 буквы и 7 цифр",
        isRequired: true,
    },
    issuedBy: {
        alias: "Кем выдан",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "Фрунзенским РУВД г. Минска",
        isRequired: true,
    },
    issuedDate: {
        alias: "Дата выдачи",
        type: "text",
        validation: /^\d{2}.\d{2}.\d{4}$/,
        placeholder: "13.11.2000",
        isRequired: true,
    },
    registrationAddress: {
        alias: "Адрес регистрации",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "г. Минск, ул. Притыцкого, д. 77, кв. 22",
        isRequired: true,
    },
};

const BYPassportFormConfig: FormConfig = {
    title: "Паспортные данные артиста РБ",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: BYPassportFormFields,
};


export default BYPassportFormConfig;
