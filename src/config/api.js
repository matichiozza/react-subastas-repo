// Configuración centralizada para las URLs del backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://204.216.129.68'  // URL de producción (Oracle Cloud) - HTTPS
  : 'http://localhost:8080';       // URL de desarrollo local

export default API_BASE_URL; 