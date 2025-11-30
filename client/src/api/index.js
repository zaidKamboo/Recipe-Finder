import axios from "axios";
const BASE_URL = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
export default BASE_URL;
