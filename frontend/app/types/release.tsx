import type { Track } from "./track";

type Release = {
    id: string;
    name: string;
    description: string;
    releaseDate: string;
    releaseType: string;
    releaseStatus: string;
    tracks: Track[];
}

export type { Release };