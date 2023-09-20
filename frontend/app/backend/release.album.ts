import axios from "axios";

const formatFormDataToSchema = (formData: Record<string, Record<string, Record<string, any>>>) => {

    const album = formData["album"][1];
    const trackData = formData.track;

    console.log('album', album);
    console.log('trackData', trackData);

    // Initialize an empty array for tracks
    const formattedTracks: any[] = [];

    // Iterate over the track data and format each track
    for (const formIndex in trackData) {
        const track = trackData[formIndex];
        const formattedTrack = {
            performer: track.performer,
            title: track.title,
            version: track.version || null, // Handle optional fields
            musicAuthor: track.musicAuthor,
            lyricist: track.lyricist || null, // Handle optional fields
            phonogramProducer: track.phonogramProducer,
            explicit: track.explicit,
            preview: track.preview,
            isCover: track.isCover,
            file: Array.from(new Uint8Array(track.file)), // Convert ArrayBuffer to an array of integers
        };

        // Add the formatted track to the array of tracks
        formattedTracks.push(formattedTrack);
    }

    // Format album data
    const formattedAlbum = {
        userId: '',
        type: 'Альбом',
        genre: album.genre,
        performer: album.performer,
        title: album.title,
        version: album.version || null, // Handle optional fields
        tracks: formattedTracks, // Assign the array of formatted tracks
    };
    return formattedAlbum;
};

const handleUploadAlbum = async (userId: string, formData: Record<string, Record<string, Record<string, any>>>): Promise<boolean> => {
    try {
        // Format the form data to match the FastAPI schema
        const formattedData = { ...formatFormDataToSchema(formData) };
        formattedData.userId = userId;
        const response = await axios.post('http://localhost:8000/release', formattedData)
        const success = response.status === 200
        if (success) {
            return true
        } else {
            return false
        }
    } catch (error) {
        // Handle errors here if needed
        console.error('Error formatting data:', error);
        return false
    }
};

const getAlbums = async (id: string): Promise<any> => {
    try {
        const response = await axios.get('http://localhost:8000/release', { params: { userId: id } })
        const data = response.data
        console.log('From getAlbums', data)
        if (data === null) {
            return []
        }
        return response.data
    } catch (error) {
        // Handle errors here if needed
        console.log(error)
    }
}

export { handleUploadAlbum, getAlbums }
