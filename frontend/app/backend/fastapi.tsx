import axios from "axios";

const fastAPI = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 20000,
    headers: { 'X-Custom-Header': 'foobar' }
});

export default fastAPI