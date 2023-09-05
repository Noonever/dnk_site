import type { V2_MetaFunction } from "@remix-run/node";
import FormGroup from "~/components/FormGroup";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const testFieldsDefinitions = [
  {
    alias: "firstName",
    placeholder: "First Name",
  },
  {
    alias: "lastName",
    regExpValidationPattern: "^[a-zA-Z]+$",
    placeholder: "Last Name",
  },
  {
    alias: "email",
    regExpValidationPattern: "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
    placeholder: "Email",
  }
]

// const testFieldsDefinitions2 = [
//   {
//     alias: "letters",
//     regExpValidationPattern: "^[a-zA-Z]+$",
//     placeholder: "letters",
//   },
//   {
//     alias: "numbers",
//     regExpValidationPattern: "^[0-9]+$",
//     placeholder: "numbers",
//   }
// ]

const FormDefinition1 = {
  title: "Test Form 1",
  fields: testFieldsDefinitions,
  startAmount: 1,
  maxAmount: 3,
}

// const FormDefinition2 = {
//   title: "Test Form 2",
//   fields: testFieldsDefinitions2,
//   startAmount: 1,
//   maxAmount: 10,
// }

export default function Index() {
  return (
    <>
      <FormGroup
        title="Test Form"
        fields={FormDefinition1.fields}
        startAmount={FormDefinition1.startAmount}
        maxAmount={FormDefinition1.maxAmount}
      />
    </>
  );
}
