import type { FieldConfig, FormConfig } from "~/components/MultiForm";
import trackFormFields from "../track";

const singleFormFields: Record<string, FieldConfig> = {
    genre: {
        alias: "Жанр",
        type: "select",
        validation: /.*/,
        placeholder: "",
        isRequired: true,
        options: [
            "Rock",
            "Pop",
            "Rap",
            "Jazz",

        ]
    }
}

const singleFormConfig: FormConfig = {
    title: "Сингл",
    maxAmount: 1, // Assuming only one form of this type
    startAmount: 1, // Starting with one form
    fields: singleFormFields
}

const singleTrackFormConfig: FormConfig = {
    title: "Трек",
    maxAmount: 3, 
    startAmount: 1,
    fields: trackFormFields
}

export { singleFormConfig, singleTrackFormConfig }