

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5269';

// Helper để resolve asset URL
export const resolveAssetUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
        return url;
    }
    return `${API_BASE_URL}${url}`;
};

// Export default cho tiện
export default {
    baseUrl: API_BASE_URL,
    resolveAssetUrl,
};