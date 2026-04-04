// Configuración centralizada para las URLs del backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://204.216.129.68'  // URL de producción (Oracle Cloud) - HTTP temporal
  : 'http://localhost:8080';       // URL de desarrollo local

export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300x200?text=Sin+Imagen";
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export default API_BASE_URL; 