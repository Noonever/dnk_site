import React, { Component, ChangeEvent } from 'react';
import './multiform-styles.css';

interface FormTypeConfig {
  maxAmount: number;
  startAmount: number;
  fields: Record<string, { type: string; validation: RegExp }>;
}

interface MultiFormProps {
  formTypeConfigurations: Record<string, FormTypeConfig>;
  className?: string;
}

interface MultiFormState {
  formData: Record<string, Record<number, Record<string, { data: string; validity: boolean }>>>;
}

class MultiForm extends Component<MultiFormProps, MultiFormState> {
  constructor(props: MultiFormProps) {
    super(props);
    this.state = {
      formData: this.initializeFormData(),
    };
  }

  initializeFormData(): Record<string, Record<number, Record<string, { data: string; validity: boolean }>>> {
    const { formTypeConfigurations } = this.props;
    const formData: Record<string, Record<number, Record<string, { data: string; validity: boolean }>>> = {};

    Object.keys(formTypeConfigurations).forEach((formType) => {
      formData[formType] = {};
      for (let i = 1; i <= formTypeConfigurations[formType].startAmount; i++) {
        formData[formType][i] = this.initializeFormFields(formType);
      }
    });

    return formData;
  }

  initializeFormFields(formType: string): Record<string, { data: string; validity: boolean }> {
    const { fields } = this.props.formTypeConfigurations[formType];
    const formFields: Record<string, { data: string; validity: boolean }> = {};

    Object.keys(fields).forEach((fieldAlias) => {
      formFields[fieldAlias] = { data: '', validity: true };
    });

    return formFields;
  }

  handleInputChange = (
    formType: string,
    formIndex: number,
    fieldAlias: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [formType]: {
          ...prevState.formData[formType],
          [formIndex]: {
            ...prevState.formData[formType][formIndex],
            [fieldAlias]: {
              data: value,
              validity: this.validateField(formType, fieldAlias, value),
            },
          },
        },
      },
    }));
  };

  validateField(formType: string, fieldAlias: string, value: string): boolean {
    const { fields } = this.props.formTypeConfigurations[formType];
    const regex = fields[fieldAlias].validation;
    return regex.test(value);
  }

  handleAddForm = (formType: string) => {
    const { maxAmount } = this.props.formTypeConfigurations[formType];
    const formIndices = Object.keys(this.state.formData[formType]);
    const newIndex = formIndices.length ? Math.max(...formIndices.map(Number)) + 1 : 1;

    if (formIndices.length < maxAmount) {
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          [formType]: {
            ...prevState.formData[formType],
            [newIndex]: this.initializeFormFields(formType),
          },
        },
      }));
    }
  };

  handleDeleteForm = (formType: string, formIndex: number) => {
    const formDataCopy = { ...this.state.formData };
    delete formDataCopy[formType][formIndex];

    this.setState({
      formData: formDataCopy,
    });
  };

  handleSubmit = () => {
    console.log(this.state.formData);
  };

  render() {
    const { formTypeConfigurations, className } = this.props;
    const { formData } = this.state;

    return (
      <div className={className}>
        {Object.keys(formTypeConfigurations).map((formType) => (
          <div key={formType} className={`${formType}-container`}>
            {Object.keys(formData[formType]).map((formIndex, serial) => (
              <div key={formIndex} className="form-entry">
                <p className="form-title">{formType + ' ' + (serial + 1)}</p>
                {Object.keys(formTypeConfigurations[formType].fields).map((fieldAlias) => (
                  <div key={fieldAlias} className="form-field">
                    <label className="field-label">{fieldAlias}</label>
                    <input
                      type={formTypeConfigurations[formType].fields[fieldAlias].type}
                      value={formData[formType][formIndex][fieldAlias].data}
                      onChange={(event) =>
                        this.handleInputChange(formType, parseInt(formIndex), fieldAlias, event)
                      }
                    />
                  </div>
                ))}
                {serial >= formTypeConfigurations[formType].startAmount && (
                  <button
                    className="delete-button"
                    onClick={() => this.handleDeleteForm(formType, parseInt(formIndex))}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {Object.keys(formData[formType]).length < formTypeConfigurations[formType].maxAmount && (
              <button className="add-button" onClick={() => this.handleAddForm(formType)}>
                Add {formType}
              </button>
            )}
          </div>
        ))}
        <button className="submit-button" onClick={this.handleSubmit}>
          Submit
        </button>
      </div>
    );
  }
}

export default MultiForm;
export type { FormTypeConfig };