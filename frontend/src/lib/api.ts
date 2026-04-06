import axios from "axios";

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005") + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token and optional GPS headers
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Also include GPS headers if they exist in localStorage (set by LocationSelector or Navbar)
            const coordsStr = localStorage.getItem('userCoordinates');
            if (coordsStr) {
                try {
                    const { lat, lng } = JSON.parse(coordsStr);
                    if (lat && lng) {
                        config.headers['X-User-Lat'] = lat;
                        config.headers['X-User-Lng'] = lng;
                    }
                } catch (e) {
                    console.error("Failed to parse coordinates from storage", e);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
