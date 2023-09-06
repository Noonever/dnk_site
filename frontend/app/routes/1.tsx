import type { V2_MetaFunction } from "@remix-run/node";
import MultiForm from "~/components/MultiForm";
import type { FormTypeConfig } from "~/components/MultiForm";

export const meta: V2_MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

const formTypeConfigurations: Record<string, FormTypeConfig> = {
    Release: {
        maxAmount: 1,
        startAmount: 1,
        fields: {
            name: {
                type: 'text',
                validation: /^[A-Za-z\s]+$/,
            },
            age: {
                type: 'number',
                validation: /^\d+$/,
            },
        },
    },
    Track: {
        maxAmount: 10,
        startAmount: 1,
        fields: {
            email: {
                type: 'email',
                validation: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
            },
            phone: {
                type: 'tel',
                validation: /^\d{10}$/,
            },
        },
    },
    // Add more form type configurations as needed
};

export default function Index() {
    return (
        <div className="app-container mx-auto mt-5 grid w-full max-w-sm items-center gap-1.5">
            <MultiForm formTypeConfigurations={formTypeConfigurations}/>
        </div>
    );
}

