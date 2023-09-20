import type { FieldConfig, FormConfig } from "~/components/MultiForm";

const RUPassportFormFields: Record<string, FieldConfig> = {
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
        validation: /^\d{2}\.\d{2}\.\d{4}$/,
        placeholder: "13.11.1990",
        isRequired: true,
    },
    passportNumber: {
        alias: "Серия и номер паспорта",
        type: "text",
        validation: /^\d{10}$/,
        placeholder: "4455 226611",
        errorMessage: "Должно быть 10 цифр",
        isRequired: true,
    },
    issuedBy: {
        alias: "Кем выдан",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "отделом УФМС России по г. Москве",
        isRequired: true,
    },
    issuedDate: {
        alias: "Дата выдачи",
        type: "text",
        validation: /^\d{2}.\d{2}.\d{4}$/,
        placeholder: "13.11.2000",
        isRequired: true,
    },
    departmentCode: {
        alias: "Код подразделения",
        type: "text",
        validation: /^\d{6}$/,
        placeholder: "770-560",
        errorMessage: "Должно быть 6 цифр",
        isRequired: true,
    },
    registrationAddress: {
        alias: "Адрес регистрации",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "г. Москва, ул. Иванова, д.6, кв.15",
        isRequired: true,
    },
};

const RUPassportFormConfig: FormConfig = {
    title: "Паспортные данные артиста РФ",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: RUPassportFormFields,
};


export default RUPassportFormConfig;
