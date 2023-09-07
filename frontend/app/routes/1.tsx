import type { V2_MetaFunction } from "@remix-run/node";
import MultiForm from "~/components/MultiForm";
import type { FormTypeConfig } from "~/components/MultiForm";

export const meta: V2_MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};


  const labelReleaseContractFormConfig: Record<string, FormTypeConfig> = {
    Release: {
      maxAmount: 1,
      startAmount: 1,
      fields: {
        ReleaseTitle: {
          type: "text",
          validation: /^[a-zA-Z0-9\s-]*$/,
          placeholder: "Enter Release Title",
          errorMessage: "Release Title is required and should contain only letters, numbers, spaces, or hyphens.",
          isRequired: true,
          defaultValue: "Default Release Title", // Add defaultValue
        },
        ReleaseDate: {
          type: "date",
          validation: /^\d{4}-\d{2}-\d{2}$/,
          placeholder: "Select Release Date",
          errorMessage: "Release Date is required and should be in the format YYYY-MM-DD.",
          isRequired: true,
          defaultValue: "2023-01-01", // Add defaultValue
        },
      },
    },
    Track: {
      maxAmount: 100,
      startAmount: 1,
      fields: {
        TrackTitle: {
          type: "text",
          validation: /^[a-zA-Z0-9\s-]*$/,
          placeholder: "Enter Track Title",
          errorMessage: "Track Title is required and should contain only letters, numbers, spaces, or hyphens.",
          isRequired: true,
          defaultValue: "Default Track Title", // Add defaultValue
        },
        TrackArtist: {
          type: "text",
          validation: /^[a-zA-Z0-9\s-]*$/,
          placeholder: "Enter Track Artist",
          errorMessage: "Track Artist is required and should contain only letters, numbers, spaces, or hyphens.",
          isRequired: true,
          defaultValue: "Default Track Artist", // Add defaultValue
        },
        Duration: {
          type: "text",
          validation: /^[a-zA-Z0-9\s-]*$/,
          placeholder: "Enter Track Duration",
          errorMessage: "Track Duration is required and should contain only letters, numbers, spaces, or hyphens.",
          isRequired: true,
          defaultValue: "00:00", // Add defaultValue
        }
      },
    },
  };

export default function Index() {
    return (
        <div className="app-container mx-auto mt-5 grid w-full max-w-sm items-center gap-1.5">
            <MultiForm formTypeConfigurations={labelReleaseContractFormConfig}/>
        </div>
    );
}
