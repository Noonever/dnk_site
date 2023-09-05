import React, { Component } from 'react';
import { Field } from './Field';

type FormData = { [key: string]: {data: string, validity: boolean} }


type FieldProps = {
    alias: string;
    placeholder?: string;
    regExpValidationPattern?: string;
}

interface FormProps {
    label: string;
    fields: FieldProps[],
    nested?: boolean;
    onChangeCallback?: (fields: FormData) => void;
}

interface FormState {
    formFields: { [title: string]: {'data': any, 'validity': boolean }};
}

class Form extends Component<FormProps, FormState> {

    constructor(props: FormProps) {
        super(props);

        this.state = {
            formFields: {},
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFieldChange = (fieldName: string, value: string, re_pattern?: string) => {
        this.setState((prevState) => {
            const { formFields } = prevState;

            if (!re_pattern) { re_pattern = '' }
            const validity = new RegExp(re_pattern).test(value);

            const updatedFormFields = {
                ...formFields,
                [fieldName]: {data: value, validity: validity},
            };
            if (this.props.onChangeCallback) {
                this.props.onChangeCallback(updatedFormFields);
            }
            return {
                formFields: updatedFormFields,
            }
        });
    };

    handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form:', this.state.formFields);
    };

    render() {
        const { label, fields, nested } = this.props;
        const { formFields } = this.state;
         
        return (
            <div>
            <p>{label}</p>
            <form onSubmit={this.handleSubmit}>
                {fields.map((field, index) => (
                    <Field
                        key={index}
                        alias={field.alias}
                        onChange={(value) =>
                            this.handleFieldChange(field.alias, value, field.regExpValidationPattern)
                        }
                        isValid={formFields[field.alias]?.validity || false}
                        placeholder={field.placeholder}
                    />
                ))}

                {!nested && (
                    // Render the submit button only if the form is independent
                    <button type="submit">Submit</button>
                )}
            </form>
            </div>
        );
    }
}

export { Form };
export type { FieldProps, FormProps, FormData };
