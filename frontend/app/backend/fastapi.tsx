import axios from "axios";

const fastAPI = axios.create({
    baseURL: 'http://185.234.10.244:8000',
    timeout: 20000,
});

export default fastAPI
