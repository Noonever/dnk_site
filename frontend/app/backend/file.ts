import fastAPI from "./fastapi";

const uploadFile = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fastAPI.post('/file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('File upload successful:', response.data);
        return response.data
    } catch (error) {
        console.error('File upload error:', error);
    }
};

export { uploadFile }
