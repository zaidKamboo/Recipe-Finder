import axios from "axios";
const BASE_URL = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});
export default BASE_URL;
 