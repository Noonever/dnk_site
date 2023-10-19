import type { Author } from "./author";

export interface NewMusicTrackUpload {
    title: string;
    performers: string;
    version: string | null;
    explicit: boolean;
    preview: string;
    isCover: boolean;
    performersNames: string;
    musicAuthorsNames: string;
    lyricistsNames: string | null;
    phonogramProducersNames: string;
    wavFileId: string;
    textFileId: string | null;
}

export interface BackCatalogTrackUpload extends NewMusicTrackUpload {
    isrc: string;
}

export interface NewMusicReleaseUpload {
    performers: string;
    title: string;
    version: string;
    genre: string;
    tracks: NewMusicTrackUpload[];
    coverFileId: string;
}

export interface BackCatalogReleaseUpload {
    performers: string;
    title: string;
    version: string | null;
    genre: string;
    upc: string;
    date: string;
    source: string;
    tracks: BackCatalogTrackUpload[];
    coverFileId: string;
}

export interface ClipReleaseUpload {
    performers: string;
    title: string;
    version: string | null;
    genre: string;
    releaseLink: string;
    performersNames: string;
    musicAuthorsNames: string;
    lyricistsNames: string;
    phonogramProducersNames: string;
    directorsNames: string;
    coverFileId: string;
}

export interface ReleaseRequest {
    id: string;
    username: string;
    date: string;
    imprint: string;
    inDeliverySheet: boolean;
    type: "new-music" | "back-catalog" | "clip";
    status: 'pending' | 'accepted' | 'error';
    data: NewMusicReleaseUpload | BackCatalogReleaseUpload | ClipReleaseUpload;
    authors: Author[];
}

export interface ReleaseRequestUpdate {
    date: string;
    imprint: string;
    data: NewMusicReleaseUpload | BackCatalogReleaseUpload | ClipReleaseUpload;
}