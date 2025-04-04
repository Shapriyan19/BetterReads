import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to handle authentication
axiosInstance.interceptors.request.use(
    (config) => {
        // Don't modify the content-type for FormData requests
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect if we're not already on the login page
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;