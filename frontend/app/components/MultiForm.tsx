import { Component } from 'react';
import type { ChangeEvent } from 'react';

type fieldData = string | boolean | Uint8Array

type multiFormField = { data: fieldData; validity: boolean }

type multiFormFields = Record<string, Record<number, Record<string, multiFormField>>>

type multiFormData = Record<string, Record<number, Record<string, fieldData>>>

type FieldConfig = {
	alias: string;
	type: string;
	options?: string[];
	validation: RegExp;
	placeholder?: string;
	errorMessage?: string;
	isRequired?: boolean;
	defaultValue?: string;
}

interface FormConfig {
	title: string;
	maxAmount: number;
	startAmount: number;
	fields: Record<string, FieldConfig>;
}

interface MultiFormConfig {
	formConfigurations: Record<string, FormConfig>;
	title?: string;
	className?: string;
	addButtonText: string;
	submitButtonText: string;
	deleteButtonText: string;
	userId: string;
	onSubmitCallback?: (userId: string, formData: multiFormData) => Promise<boolean>;
}

interface MultiFormState {
	formFields: multiFormFields;
	blockingFieldKeys: string[]
}

class MultiForm extends Component<MultiFormConfig, MultiFormState> {
	constructor(props: MultiFormConfig) {
		super(props);
		this.state = {
			formFields: this.initializeFormData(),
			blockingFieldKeys: [],
		};
		this.handleDeleteForm = this.handleDeleteForm.bind(this);
		this.handleAddForm = this.handleAddForm.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	initializeFormData(): multiFormFields {
		const { formConfigurations: formTypeConfigurations } = this.props;
		const formFields: multiFormFields = {};

		Object.keys(formTypeConfigurations).forEach((formType) => {
			formFields[formType] = {};
			for (let i = 1; i <= formTypeConfigurations[formType].startAmount; i++) {
				formFields[formType][i] = this.initializeFormFields(formType);
			}
		});

		return formFields;
	}

	initializeFormFields(formType: string): Record<string, multiFormField> {
		const { fields } = this.props.formConfigurations[formType];
		const formFields: Record<string, multiFormField> = {};

		Object.keys(fields).forEach((fieldName) => {
			const fieldType = fields[fieldName].type;
			if (fieldType === "checkbox") {
				formFields[fieldName] = {
					data: false,
					validity: true,
				};
			} else if (fieldType === "select") {
				let options = fields[fieldName].options;
				if (options === undefined) {
					options = ["select an option"];
				}
				formFields[fieldName] = {
					data: options[0],
					validity: true,
				};
			} else {
				let defaultValue = fields[fieldName].defaultValue
				if (defaultValue === undefined) {
					defaultValue = "";
				}
				formFields[fieldName] = {
					data: defaultValue,
					validity: true,
				};
			}
		});
		return formFields;
	}

	handleInputChange = (
		formType: string,
		formIndex: number,
		fieldName: string,
		event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
	) => {
		const { formFields } = this.state;

		if (event.target.type === "file") {
			// @ts-ignore
			const file: File | null = event.target.files?.[0];
			if (file) {
				const reader = new FileReader();

				reader.onload = (event) => {
					const fileContent = event.target?.result as ArrayBuffer;
					const byteArray = new Uint8Array(fileContent);

					this.setState((prevState) => ({
						formFields: {
							...prevState.formFields,
							[formType]: {
								...prevState.formFields[formType],
								[formIndex]: {
									...prevState.formFields[formType][formIndex],
									[fieldName]: {
										data: byteArray,
										validity: this.validateField(formType, fieldName, byteArray),
									},
								},
							},
						},
					}));

					console.log(byteArray); // Now you can log the Uint8Array
				};

				reader.readAsArrayBuffer(file);
			}
		} else {
			let { value }: any = event.target;

			if (event.target.type === "checkbox") {
				const prevValue = formFields[formType][formIndex][fieldName].data;
				value = !prevValue;
			}

			console.log(value);

			this.setState((prevState) => ({
				formFields: {
					...prevState.formFields,
					[formType]: {
						...prevState.formFields[formType],
						[formIndex]: {
							...prevState.formFields[formType][formIndex],
							[fieldName]: {
								data: value,
								validity: this.validateField(formType, fieldName, value),
							},
						},
					},
				},
			}));
		}
	};

	validateField(formType: string, fieldName: string, value: fieldData): boolean {
		const { fields } = this.props.formConfigurations[formType];
		if (fields[fieldName].type === 'checkbox') {
			return true;
		}
		if (fields[fieldName].defaultValue === value) {
			return true;
		}
		const regex = fields[fieldName].validation;
		return regex.test(String(value));
	}

	handleSubmit = async () => {
		const { formFields } = this.state;
		console.log('submit');
		// Define fields, that block the form submission
		const blockingFields: string[] = [];

		for (const formType in formFields) {
			for (const formIndex in formFields[formType]) {
				for (const fieldName in formFields[formType][formIndex]) {

					const field = formFields[formType][formIndex][fieldName];
					const data = field.data;
					const validity = this.validateField(formType, fieldName, data);

					let isRequired = this.props.formConfigurations[formType].fields[fieldName].isRequired;
					if (isRequired === undefined) {
						isRequired = true
					}
					// Check if the field is blocking the form submission
					// invalid or empty while but required
					if (!validity || (!String(data) && isRequired)) {
						blockingFields.push(`${formType}-${formIndex}-${fieldName}`);
					}
				}
			}
		}

		// Check if there are any blocking fields
		if (blockingFields.length !== 0) {
			// Add blinking class to the blocking fields
			this.setState({ blockingFieldKeys: blockingFields });
			// Remove the blinking class after 1 second (adjust as needed)
			setTimeout(() => {
				this.setState({ blockingFieldKeys: [] });
			}, 1000);

		} else {
			// Submit the form if there are no blocking fields
			const rawData: multiFormData = {};

			for (const formType in formFields) {
				rawData[formType] = {};
				for (const formIndex in formFields[formType]) {
					rawData[formType][formIndex] = {};
					for (const fieldName in formFields[formType][formIndex]) {
						rawData[formType][formIndex][fieldName] = formFields[formType][formIndex][fieldName].data;
					}
				}
			}

			console.log("Multiform submit:", rawData);
			if (this.props.onSubmitCallback) {
				const result = await this.props.onSubmitCallback(this.props.userId, rawData);
				if (result) {
					this.setState({ formFields: this.initializeFormData() });
					alert('Заявка успешно отправлена!')
				} else {
					alert('Что-то произошло не так!')
				}
			}
		}
	};

	handleAddForm = (formType: string) => {
		const { maxAmount } = this.props.formConfigurations[formType];
		const formIndices = Object.keys(this.state.formFields[formType]);
		const newIndex = formIndices.length ? Math.max(...formIndices.map(Number)) + 1 : 1;

		if (formIndices.length < maxAmount) {
			this.setState((prevState) => ({
				formFields: {
					...prevState.formFields,
					[formType]: {
						...prevState.formFields[formType],
						[newIndex]: this.initializeFormFields(formType),
					},
				},
			}));
		}
	};

	handleDeleteForm = (formType: string, formIndex: number) => {
		const formDataCopy = { ...this.state.formFields };
		delete formDataCopy[formType][formIndex];

		this.setState({
			formFields: formDataCopy,
		});
	};

	render() {
		const { formConfigurations: formTypeConfigurations, addButtonText, submitButtonText, deleteButtonText } = this.props;
		const { formFields: formData, blockingFieldKeys } = this.state;

		return (
			<div className="component-container">
				<div className="multi-form-container">
					<center>
						<p className='multi-form-title'>{this.props.title}</p>
					</center>
					{Object.keys(formTypeConfigurations).map((formType) => (
						<div key={formType} className={`block-container`}>
							{Object.keys(formData[formType]).map((formIndex, serial) => {

								return <div key={formIndex} className={`form-entry`}>
									<p className="form-title">{formTypeConfigurations[formType].title + ' ' + (formTypeConfigurations[formType].maxAmount > 1 ? (serial + 1) : '')}</p>
									{Object.keys(formTypeConfigurations[formType].fields).map((fieldName) => {
										const inputFieldState = formData[formType][Number(formIndex)][fieldName];
										const isInvalid = !inputFieldState.validity;

										const placeholder = formTypeConfigurations[formType].fields[fieldName].placeholder;
										const errorMessage = formTypeConfigurations[formType].fields[fieldName].errorMessage;
										const fieldAlias = formTypeConfigurations[formType].fields[fieldName].alias;
										const fieldType = formTypeConfigurations[formType].fields[fieldName].type
										const options = formTypeConfigurations[formType].fields[fieldName].options;
										const isRequired = formTypeConfigurations[formType].fields[fieldName].isRequired

										const fieldKey = `${formType}-${formIndex}-${fieldName}`;

										// Add a conditional class based on invalidFields state
										const inputClassName = `input-field ${isInvalid ? 'invalid' : ''} ${blockingFieldKeys.includes(fieldKey) ? 'invalid-blink' : ''}`;

										let input = <></>
										if (fieldType === 'text' || fieldType === 'password') {
											input = (
												<input
													type={fieldType}
													value={String(inputFieldState.data)}
													onChange={(event) =>
														this.handleInputChange(formType, parseInt(formIndex), fieldName, event)
													}
													required={isRequired}
													className={inputClassName}
													data-field-key={fieldKey}
													placeholder={placeholder}

												/>
											)
										} else if (fieldType === 'checkbox') {
											input = (
												<input
													type={fieldType}
													checked={Boolean(inputFieldState.data)}
													onChange={(event) =>
														this.handleInputChange(formType, parseInt(formIndex), fieldName, event)
													}
													className={inputClassName}
													data-field-key={fieldKey}
													placeholder={placeholder}
												/>
											)
										} else if (fieldType === 'file') {
											input = (
												<input
													type={fieldType}
													onChange={(event) =>
														this.handleInputChange(formType, parseInt(formIndex), fieldName, event)
													}
													className={inputClassName}
													data-field-key={fieldKey}
													placeholder={placeholder}
												/>
											)
										} else if (fieldType === 'select') {
											if (options === undefined) {
												input = <></>
											} else
												input = (
													<select
														value={String(inputFieldState.data)}
														onChange={(event) =>
															this.handleInputChange(formType, parseInt(formIndex), fieldName, event)
														}
														className={inputClassName}
														data-field-key={fieldKey}
													>
														{options.map((option) => (
															<option key={option} value={option}>
																{option}
															</option>
														))}
													</select>
												)
										}
										return (
											<div key={fieldName} className={`form-field ${isInvalid ? 'invalid' : ''}}`}>
												<div className='field-container'>
													<div className='field-label-container'>
														<label className="field-label">{fieldAlias}</label>
													</div>
													<div className='required-container'>
													{isRequired && <span className="required">*</span>}
													</div>
													<div className='field-input-container'>
														{input}
													</div>
												</div>
												{isInvalid && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
											</div>
										);

									})}
									{serial >= formTypeConfigurations[formType].startAmount && (
										<button
											className="delete-button"
											onClick={() => this.handleDeleteForm(formType, parseInt(formIndex))}
										>
											{deleteButtonText}
										</button>
									)}

								</div>
							})}

							{Object.keys(formData[formType]).length < formTypeConfigurations[formType].maxAmount && (
								<button className="add-button" onClick={() => this.handleAddForm(formType)}>
									{addButtonText} {formTypeConfigurations[formType].title}
								</button>
							)}

						</div>
					))}
					<button className="submit-button" onClick={this.handleSubmit}>
						{submitButtonText}
					</button>
				</div>
			</div>
		);
	}

}

export default MultiForm;
export type { FieldConfig, FormConfig, MultiFormConfig, multiFormData };
