import type { V2_MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

export const meta: V2_MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export default function InputDemo() {
    return <Input type="email" placeholder="Email" />
}

