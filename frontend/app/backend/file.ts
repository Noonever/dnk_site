import fastAPI from "./fastapi";

const uploadFile = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fastAPI.post('/file/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        const file_id = response.data.id
        return file_id
    } catch (error) {
        console.error('File upload error:', error);
        return ''
    }
};


const downloadFile = async (file_id: string): Promise<Blob | null> => {
    try {
        const response = await fastAPI.get('/file/', {
            params: {
                id: file_id
            }
        })

        const fileData = response.data
        let blob = new Blob([fileData]);
        return blob
    } catch (error) {
        console.error(`File not found, id: ${file_id}`);
        return null
    }
}

export { uploadFile, downloadFile }
