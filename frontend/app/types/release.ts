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
    wavFileId: string | null;
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
    coverFileId: string | null;
}

export interface BackCatalogReleaseFileUpload {
    performers: string;
    title: string;
    version: string | null;
    genre: string;
    upc: string;
    date: string;
    tracks: BackCatalogTrackUpload[];
    coverFileId: string | null;
}

export interface ClipReleaseUpload {
    performers: string;
    title: string;
    version: string | null;
    genre: string;
    explicit: boolean;
    performersNames: string;
    musicAuthorsNames: string;
    lyricistsNames: string;
    phonogramProducersNames: string;
    directorsNames: string;
    coverFileId: string | null;
    videoFileId: string | null;
}

export interface ReleaseRequest {
    id: string;
    username: string;
    date: string;
    imprint: string;
    inDeliverySheet: boolean;
    inDocsSheet: boolean;
    type: "new-music" | "back-catalog" | "clip";
    source: string;
    status: 'pending' | 'accepted' | 'error';
    data: NewMusicReleaseUpload | BackCatalogReleaseFileUpload | ClipReleaseUpload;
    authors: Author[];
}

export interface ReleaseRequestUpdate {
    date: string;
    imprint: string;
    data: NewMusicReleaseUpload | BackCatalogReleaseFileUpload | ClipReleaseUpload;
}