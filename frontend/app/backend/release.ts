import fastAPI from "./fastapi";
import type { Author } from "~/types/author";
import type { NewMusicReleaseUpload, ClipReleaseUpload, BackCatalogReleaseUpload, ReleaseRequest, ReleaseRequestUpdate } from "~/types/release";


export async function uploadNewMusicReleaseRequest(
    username: string,
    releaseData: NewMusicReleaseUpload,
    authors: Author[],
) {
    const release = {
        username: username,
        type: 'new-music',
        data: releaseData,
        authors: authors
    }

    try {
        await fastAPI.post(`/release/request`, release)
        return 200
    } catch (error) {
        console.error('Release upload error:', error);
    }
}

export async function uploadClipReleaseRequest(
    username: string,
    releaseData: ClipReleaseUpload,
    authors: Author[]
) {
    const release = {
        username: username,
        type: 'clip',
        data: releaseData,
        authors: authors
    }

    try {
        await fastAPI.post(`/release/request`, release)
        return 200
    } catch (error) {
        console.error('Release upload error:', error);
    }
}

export async function uploadBackCatalogReleaseRequest(
    username: string,
    releaseData: BackCatalogReleaseUpload,
    authors: Author[]
) {
    const release = {
        username: username,
        type: 'back-catalog',
        data: releaseData,
        authors: authors
    }
        
    try {
        await fastAPI.post(`/release/request`, release)
        return 200
    } catch (error) {
        console.error('Release upload error:', error);
    }
}


export async function getReleaseRequests(): Promise<ReleaseRequest[]> {
    try {
        const response = await fastAPI.get('/release/requests')
        const requests: ReleaseRequest[] = response.data
        return requests
    } catch (error) {
        console.error('Releases get error:', error);
        return []
    }
}

export async function getReleaseRequest(id: string): Promise<ReleaseRequest | null> {
    try {
        const response = await fastAPI.get(`/release/request/`, { params: { id } })
        return response.data
    } catch (error) {
        console.error('Release get error:', error);
        return null
    }
}

export async function updateReleaseRequest(id: string, data: ReleaseRequestUpdate): Promise<ReleaseRequest | null> {
    try {
        const response = await fastAPI.put(`/release/request/`, data, { params: { id } })
        return response.data
    } catch (error) {
        console.error('Release update error:', error);
        return null
    }
}

export async function addReleaseRequestToDeliveryTable(id: string): Promise<number | null> {
    try {
        const response = await fastAPI.post(`/release/add-to-delivery/`, {timeout: 100000}, { params: {id} })
        return response.status
    } catch (error) {
        console.error('Release delivery add error:', error);
        return null
    }
}

export async function getProcessedReleaseRequests(username: string) {
    try {
        const response = await fastAPI.get('/release/processed-requests', { params: { username } })
        console.log(response)
        const requests = response.data
        return requests
    } catch (error) {
        console.error('Releases get error:', error);
        return []
    }
}
