import Config from 'app/config';
import axios from 'axios';

const axiosServices = axios.create({ baseURL: Config.API_URL });

// interceptor for http
axiosServices.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Share the Load is not available at the moment. Please try again later.')
);

export default axiosServices;
