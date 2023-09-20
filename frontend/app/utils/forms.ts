import type { FieldConfig, FormConfig } from "~/components/MultiForm";

function fillDefaults(fields: Record<string, FieldConfig>, defaultFields: Record<string, any>) {

    Object.keys(defaultFields).forEach((fieldName) => {
        fields[fieldName].defaultValue = defaultFields[fieldName];
    })

    return fields;
}

export { fillDefaults }
