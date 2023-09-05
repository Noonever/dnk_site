import React, {useEffect, useRef} from 'react';
import {Input} from "~/components/ui/input"
import {Button} from "~/components/ui/button"
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "~/components/ui/form"
import {Label} from "~/components/ui/label";

interface TrackProps {
    onDelete: () => void;
    refProp: boolean;
    index: number;
}

const Track: React.FC<TrackProps> = ({onDelete, refProp, index}) => {
    const artistInputRef = useRef(null);

    useEffect(() => {
        if (refProp && artistInputRef.current) {
            artistInputRef.current.focus();
        }
    }, [refProp]);

    return (
        <div>
            <Label>Track {index + 1}</Label>
            <FormItem>
                <FormLabel>Artist {index + 1}</FormLabel>
                <FormField name={`tracks[${index}].artist`} render={({field}) => (
                    <FormControl>
                        <Input ref={artistInputRef} {...field} />
                    </FormControl>
                )}/>
                <FormMessage/>
            </FormItem>
            <FormItem>
                <FormLabel>Title {index + 1}</FormLabel>
                <FormField name={`tracks[${index}].title`} render={({field}) => (
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                )}/>
                <FormMessage/>
            </FormItem>
            <Button type="button" onClick={onDelete}>
                Delete
            </Button>
        </div>
    );
};

export default Track;
