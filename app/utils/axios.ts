import axios from 'axios';

// const axiosServices = axios.create({ baseURL: process.env.SHARE_THE_LOAD_API || 'http://192.168.4.121:3006' });
const axiosServices = axios.create({ baseURL: 'http://localhost:3006' });

// interceptor for http
axiosServices.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Share the Load is not available at the moment. Please try again later.')
);

export default axiosServices;
