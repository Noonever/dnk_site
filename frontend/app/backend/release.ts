import fastAPI from "./fastapi";

export async function uploadSingleRequest(data: FormData) {
    console.log('backend mock')
    const records = Object.fromEntries(data)
    
    const coverFile = data.get('cover') 
    console.log('a', a)
    console.log('records', records)
}

export async function uploadAlbumRequest(data: Record<string, string>) {
    console.log('backend mock')
    console.log('data', data)
    const records = Object.fromEntries(data)
    console.log('records', records)
    // TODO: sync with backend
}

export async function uploadClipRequest(data: Record<string, string>) {
    console.log('backend mock')
    console.log('data', data)
    // TODO: sync with backend
}

export async function uploadBackCatalogRequest(data: Record<string, string>) {
    console.log('backend mock')
    console.log('data', data)
    // TODO: sync with backend    
}