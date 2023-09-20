import type { FieldConfig, FormConfig } from "~/components/MultiForm";
import trackFormFields from "../track";

const albumFormFields: Record<string, FieldConfig> = {
    "performer": {
        alias: "Исполнитель альбома",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "title": {
        alias: "Название альбома",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true
    },
    "version": {
        alias: "Версия альбома",
        type: "text",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: false
    },
    "genre": {
        alias: "Жанр",
        type: "select",
        validation: /.*/, /*TODO: validate */
        placeholder: "", /*TODO: set placeholder */
        isRequired: true,
        options: [
            "Rock",
            "Pop",
            "Rap",
            "Jazz",
            "Metal",
            "Hip-Hop",
            "Electronic",
            "Other"
        ]
    }
}

const albumFormConfig: FormConfig = {
    title: "Альбом",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: albumFormFields
}

const albumTrackFormConfig: FormConfig = {
    title: "Трек",
    maxAmount: Infinity, 
    startAmount: 1,
    fields: trackFormFields
}

export { albumFormConfig, albumTrackFormConfig }
