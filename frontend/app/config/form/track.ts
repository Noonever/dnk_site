import type { FieldConfig } from "~/components/MultiForm";

const trackFormFields: Record<string, FieldConfig> = {
    "performer": {
        alias: "Исполнитель",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "title": {
        alias: "Название",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "version": {
        alias: "Версия",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: false
    },
    "musicAuthor": {
        alias: "Автор музыки",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "lyricist": {
        alias: "Автор слов",
        type: "text",
        validation: /(^((\w+(-\w+)*)(\s(\w+(-\w+)*)){1,2})(,\s(\w+(-\w+)*)(\s(\w+(-\w+)*)){1,2})*$)|(^$)/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: false,
        errorMessage: "Неверный список авторов"
    },
    "phonogramProducer" : {
        alias: "Изготовитель фонограммы",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "explicit": {
        alias: "Explicit",
        type: "checkbox",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: false
    },
    "preview": {
        alias: "Превью",
        type: "text",
        validation: /\d\d?:\d\d?/, /*TODO: validate */
        placeholder: "0:00", /*TODO: set placeholder */
        isRequired: true,
        defaultValue: "0:00",
        errorMessage: "Неверный таймкод"
    },
    "isCover": {    
        alias: "Кавер?",
        type: "checkbox",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: false   
    },
    "file": {
        alias: "Файл",
        type: "file",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    }
}

export default trackFormFields
