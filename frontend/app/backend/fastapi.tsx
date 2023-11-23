import axios from "axios";

const fastAPI = axios.create({
    baseURL: 'http://178.253.23.244:8000',
    timeout: 20000,
});

export default fastAPI
