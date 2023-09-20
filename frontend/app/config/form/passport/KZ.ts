import type { FieldConfig, FormConfig } from "~/components/MultiForm";

const KZPassportFormFields: Record<string, FieldConfig> = {
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
        validation: /^[A-Z]\d{8}$/,
        placeholder: "N12345678",
        errorMessage: "Должна быть буква и 8 цифр",
        isRequired: true,
    },
    numberID: {
        alias: "Номер ID",
        type: "text",
        validation: /^\d{12}$/,
        placeholder: "123456789012",
        errorMessage: "Должно быть 12 цифр",
        isRequired: true,
    },
    issuedBy: {
        alias: "Кем выдан",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "Ministry of Internal Affairs",
        isRequired: true,
    },
    issuedDate: {
        alias: "Дата выдачи",
        type: "text",
        validation: /^\d{2}.\d{2}.\d{4}$/,
        placeholder: "13.11.2000",
        isRequired: true,
    },
    expirationDate: {
        alias: "Дата окончания",
        type: "text",
        validation: /^\d{2}.\d{2}.\d{4}$/,
        placeholder: "13.11.2010",
        isRequired: true,
    },
    registrationAddress: {
        alias: "Адрес регистрации",
        type: "text",
        validation: /^[А-Яа-я\s]+$/,
        placeholder: "Казахстан, г. Алматы, ул. Байтурсынова, д. 5",
        isRequired: true,
    },
};

const KZPassportFormConfig: FormConfig = {
    title: "Паспортные данные артиста КЗ",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: KZPassportFormFields,
};

export default KZPassportFormConfig;
