// Use the deployed Render URL for production
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://contest-tracker-tle-eliminators-uf9u.onrender.com';
export const API_URL = import.meta.env.VITE_API_URL || `${SERVER_URL}/api`;