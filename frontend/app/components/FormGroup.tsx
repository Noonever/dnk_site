import React, { Component } from 'react';
import { Form, FormData } from './Form';
import type { FieldProps } from './Form';

interface FormGroupProps {
  title: string;
  fields: FieldProps[];
  startAmount: number;
  maxAmount: number;
}

type FormInstance = {
  title: string;
  index: number;
  data: FormData;
};

interface FormGroupState {
  formInstances: FormInstance[];
}

class FormGroup extends Component<FormGroupProps, FormGroupState> {
  constructor(props: FormGroupProps) {
    super(props);

    this.state = {
      formInstances: this.initializeFormInstances(props.startAmount),
    };
  }

  initializeFormInstances(startAmount: number): FormInstance[] {
    const { title } = this.props;
    const formInstances = [];

    for (let i = 0; i < startAmount; i++) {
      formInstances.push({
        title: `${title} ${i + 1}`,
        index: i,
        data: {},
      });
    }

    return formInstances;
  }

  handleAddForm = () => {
    const { maxAmount } = this.props;
    const { formInstances } = this.state;

    if (formInstances.length < maxAmount) {
      const newIndex = formInstances.length;
      const newFormInstance = {
        title: `${this.props.title} ${newIndex + 1}`,
        index: newIndex,
        data: {},
      };

      this.setState((prevState) => ({
        formInstances: [...prevState.formInstances, newFormInstance],
      }));
    }
  };

  handleDeleteForm = (indexToDelete: number) => {
    this.setState((prevState) => {
      // Filter out the deleted form instance
      const updatedFormInstances = prevState.formInstances.filter(
        (formInstance) => formInstance.index !== indexToDelete
      );
  
      // Update the indices of the remaining form instances and their data
      updatedFormInstances.forEach((formInstance, newIndex) => {
        formInstance.index = newIndex;
        formInstance.title = `${this.props.title} ${newIndex + 1}`;
      });
  
      return {
        formInstances: updatedFormInstances,
      };
    });
  };

  handleFormChange = (index: number, formData: FormData) => {
    this.setState((prevState) => {
      const updatedFormInstances = [...prevState.formInstances];
      updatedFormInstances[index].data = formData;

      return { formInstances: updatedFormInstances };
    });
  };

  handleSubmit = () => {
    const { formInstances } = this.state;
    const error = undefined;
    const isValid = formInstances.every((formInstance) => {
      // Implement your validation logic here for each form instance's data
      // You can use the form's fields and their validation patterns from props
      // Return true if the data is valid, otherwise false
      return true; // Replace with your validation logic
    });
    console.log(formInstances)
    if (isValid) {
      const formData = formInstances.map((formInstance) => ({
        index: formInstance.index,
        data: formInstance.data,
      }));

      console.log(formData);
    } else {
      console.error('Form data is not valid.');
    }
  };

  render() {
    const { formInstances } = this.state;
    const { fields } = this.props;

    return (
      <div>
        <h2>{this.props.title}</h2>
        {formInstances.map((formInstance) => (
          <div key={formInstance.index}>
            <Form
              label={formInstance.title}
              fields={fields}
              nested={true}
              onChangeCallback={(formData) =>
                this.handleFormChange(formInstance.index, formData)
              }
            />
            <button onClick={() => this.handleDeleteForm(formInstance.index)}>
              Delete Form
            </button>
          </div>
        ))}
        <button onClick={this.handleAddForm}>Add Form</button>
        <button onClick={this.handleSubmit}>Submit</button>
      </div>
    );
  }
}

export default FormGroup;
