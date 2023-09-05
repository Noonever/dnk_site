"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";

import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import {useForm} from "react-hook-form";
import Track from "~/components/TrackForm";
import {useState} from "react";

const formSchema = z.object({
    username: z.string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .refine(value => /^[a-zA-Z0-9]+$/.test(value), {
            message: "Username can only contain alphanumeric characters.",
        }),
    test: z.string(),
    contractNumber: z.string(),
    conclusionDate: z.string(),
    releaseArtist: z.string()
        .min(1, {
            message: "Must be at least 2 characters.",
        }),
    rightsHolderFullName: z.string(),
    rightsHolderCountry: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    tracks: z.array(z.object({
        artist: z.string().min(1, {message: "Artist must be provided."}),
        title: z.string().min(1, {message: "Title must be provided."})
    }))
});

const ReleaseForm: React.FC = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            test: "",
            contractNumber: "",
            conclusionDate: "",
            releaseArtist: "",
            rightsHolderFullName: "",
            rightsHolderCountry: "",
            name: "",
            title: "",
            tracks: []
        },
    });
    const {setValue} = form;
    const [tracks, setTracks] = useState([{id: 1, artist: "", title: ""}]);
    // Add a new track
    const addTrack = () => {
        console.log(tracks.length);
        setTracks([...tracks, {id: Date.now(), artist: "", title: ""}]);
    };

    // Delete a specific track
    const deleteTrack = (id: number, index: number) => {
        // Remove the track from the tracks array
        setTracks(tracks.filter(track => track.id !== id));
        console.log(index);
        console.log(tracks[index].artist)
        console.log(tracks[index].title)
        // Clear form values
        setValue(`tracks[${index}].artist`, '');
        setValue(`tracks[${index}].title`, '');
    };


    const showSubForm = form.watch("test") === "new";

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <div className="mx-auto mt-5 grid w-full max-w-sm items-center gap-1.5">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex space-x-4"> {/* This is the horizontal container */}
                        <FormItem className="flex-1"> {/* Taking up half the space */}
                            <FormLabel>Username</FormLabel>
                            <FormField name="username" render={({field}) => (
                                <FormControl>
                                    <Input placeholder="Имя" {...field} />
                                </FormControl>
                            )}/>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                        <FormItem className="flex-1"> {/* Taking up the other half */}
                            <FormLabel>Test</FormLabel>
                            <FormField name="test" render={({field}) => (
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            )}/>
                            <FormMessage/>
                        </FormItem>
                    </div>
                    {/* End of the horizontal container */}
                    <FormItem>
                        <FormLabel>Contract Number</FormLabel>
                        <FormField name="contractNumber" render={({field}) => (
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Conclusion Date</FormLabel>
                        <FormField name="conclusionDate" render={({field}) => (
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Release Artist</FormLabel>
                        <FormField name="releaseArtist" render={({field}) => (
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Full Name of Rightsholder</FormLabel>
                        <FormField name="rightsHolderFullName" render={({field}) => (
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Country of Rightsholder</FormLabel>
                        <FormField name="rightsHolderCountry" render={({field}) => (
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Birthdate of Rightsholder</FormLabel>
                        <FormField name="rightsHolderBirthdate" render={({field}) => (
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                        )}/>
                        <FormMessage/>
                    </FormItem>

                    {showSubForm && (
                        <>
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormField name="name" render={({field}) => (
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                )}/>
                                <FormMessage/>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormField name="title" render={({field}) => (
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                )}/>
                                <FormMessage/>
                            </FormItem>
                        </>
                    )}

                    {tracks.map((track, index) => (
                        <Track
                            key={track.id}
                            index={index}
                            onDelete={() => deleteTrack(track.id, index)}
                            refProp={index === tracks.length - 1}// only for the last track
                        />
                    ))}

                    <Button type="button" onClick={addTrack}>
                        Add Track
                    </Button>

                    <Button type="submit" className="mx-auto block">Submit</Button>
                </form>
            </Form>
        </div>
    );
};

export default ReleaseForm;
