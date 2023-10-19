import axios from "axios";

const fastAPI = axios.create({
    baseURL: 'http://185.234.10.244',
    timeout: 20000,
    headers: { 'X-Custom-Header': 'foobar' }
});

export default fastAPI
