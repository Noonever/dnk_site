import React, { Component } from 'react';
import type { ChangeEvent } from 'react';
import './multiform-styles.css';

type FieldConfig = {
	type: string;
	validation: RegExp;
	placeholder?: string;
	errorMessage?: string;
	isRequired?: boolean;
	defaultValue?: string;
}

interface FormTypeConfig {
	maxAmount: number;
	startAmount: number;
	fields: Record<string, FieldConfig>;
}

interface MultiFormProps {
	formTypeConfigurations: Record<string, FormTypeConfig>;
	className?: string;
	onSubmitCallback?: (formData: Record<string, Record<number, Record<string, string>>>) => void;
	title?: string;
}

interface MultiFormState {
	formData: Record<string, Record<number, Record<string, { data: string; validity: boolean }>>>;
	invalidFields: string[]; // Add the invalidFields property here
}

class MultiForm extends Component<MultiFormProps, MultiFormState> {
	constructor(props: MultiFormProps) {
		super(props);
		this.state = {
			formData: this.initializeFormData(),
			invalidFields: [],
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

	initializeFormFields(formType: string): Record<string, { data: string; validity: boolean; }> {
		const { fields } = this.props.formTypeConfigurations[formType];
		const formFields: Record<string, { data: string; validity: boolean; }> = {};

		Object.keys(fields).forEach((fieldAlias) => {
			formFields[fieldAlias] = {
				data: fields[fieldAlias].defaultValue || '',
				validity: true,
			};
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
		const { formData } = this.state;

		let allFieldsValid = true; // Flag to check if all fields are valid

		// Check the validity of all fields and collect invalid field keys
		const invalidFieldKeys = [];

		for (const formType in formData) {
			for (const formIndex in formData[formType]) {
				for (const fieldAlias in formData[formType][formIndex]) {
					const inputField = formData[formType][formIndex][fieldAlias];
					const validity = this.validateField(formType, fieldAlias, inputField.data);
					const data = inputField.data;

					const isRequired = this.props.formTypeConfigurations[formType].fields[fieldAlias].isRequired !== false;

					if (!validity || (!data && isRequired)) {
						console.log(`${formType} - ${formIndex} - ${fieldAlias}`);
						allFieldsValid = false;
						invalidFieldKeys.push(`${formType}-${formIndex}-${fieldAlias}`);
					}
				}
			}
		}

		if (!allFieldsValid || invalidFieldKeys.length === 0) {
			// If any field is invalid or the form is empty, set invalidFields state to trigger re-render
			this.setState({ invalidFields: invalidFieldKeys });

			// Remove the blinking class after 1 second (adjust as needed)
			setTimeout(() => {
				this.setState({ invalidFields: [] });
			}, 1000);
		}

		if (allFieldsValid && invalidFieldKeys.length > 0) {
			// All fields are valid, but the form is empty, do not log data
			return;
		}

		if (allFieldsValid) {
			// All fields are valid, log data without "validity"
			const dataWithoutValidity: Record<string, Record<number, Record<string, string>>> = {};
			for (const formType in formData) {
				dataWithoutValidity[formType] = {};
				for (const formIndex in formData[formType]) {
					dataWithoutValidity[formType][formIndex] = {};
					for (const fieldAlias in formData[formType][formIndex]) {
						dataWithoutValidity[formType][formIndex][fieldAlias] =
							formData[formType][formIndex][fieldAlias].data;
					}
				}
			}
			console.log(dataWithoutValidity);
			if (this.props.onSubmitCallback) {
				this.props.onSubmitCallback(dataWithoutValidity);
			}
		}
	};

	render() {
		const { formTypeConfigurations } = this.props;
		const { formData, invalidFields } = this.state;

		return (
			<div className="multi-form-container">
				<center>
				<p className='multi-form-title'>{this.props.title}</p>
				</center>
				{Object.keys(formTypeConfigurations).map((formType) => (
					<div key={formType} className={`block-container`}>
						{Object.keys(formData[formType]).map((formIndex, serial) => (
							<div key={formIndex} className={`form-entry`}>
								<p className="form-title">{formType + ' ' + (serial + 1)}</p>
								{Object.keys(formTypeConfigurations[formType].fields).map((fieldAlias) => {
									const inputFieldState = formData[formType][Number(formIndex)][fieldAlias];
									const isInvalid = !inputFieldState.validity;
									const fieldKey = `${formType}-${formIndex}-${fieldAlias}`;
									const placeholder = formTypeConfigurations[formType].fields[fieldAlias].placeholder;
									const errorMessage = formTypeConfigurations[formType].fields[fieldAlias].errorMessage;

									// Add a conditional class based on invalidFields state
									const inputClassName = `input-field ${isInvalid ? 'invalid' : ''} ${invalidFields.includes(fieldKey) ? 'invalid-blink' : ''
										}`;

									return (
										<div key={fieldAlias} className={`form-field ${isInvalid ? 'invalid' : ''}`}>
											<label className="field-label">{fieldAlias}</label>
											<input
												type={formTypeConfigurations[formType].fields[fieldAlias].type}
												value={inputFieldState.data}
												onChange={(event) =>
													this.handleInputChange(formType, parseInt(formIndex), fieldAlias, event)
												}
												className={inputClassName}
												data-field-key={fieldKey}
												placeholder={placeholder}
											/>
											{isInvalid && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
										</div>
									);
								})}
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
