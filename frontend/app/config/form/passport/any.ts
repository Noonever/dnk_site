import type { FieldConfig, FormConfig } from "~/components/MultiForm";

const anyPassportFormFields: Record<string, FieldConfig> = {
    fullName: {
        alias: "ФИО",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    citizenship: {
        alias: "Гражданство",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    birthDate: {
        alias: "Дата рождения",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    passportNumber: {
        alias: "Номер паспорта",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    numberID: {
        alias: "Номер ID",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    issuedBy: {
        alias: "Кем выдан",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    issuedDate: {
        alias: "Дата выдачи",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    expirationDate: {
        alias: "Дата окончания",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
    registrationAddress: {
        alias: "Адрес регистрации",
        type: "text",
        validation: /.*/,
        placeholder: "",
    },
};

const anyPassportFormConfig: FormConfig = {
    title: "Паспортные данные другой страны",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: anyPassportFormFields,
};

export default anyPassportFormConfig;
