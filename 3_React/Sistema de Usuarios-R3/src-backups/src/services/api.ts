// Instancia central de Axios: todas las pantallas reutilizan la misma configuración.
import axios from 'axios';
// VITE_API_URL permite cambiar la URL sin editar código al desplegar.
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:4000/api'});
// Antes de cada petición se agrega el JWT guardado al iniciar sesión.
api.interceptors.request.use(c=>{const token=localStorage.getItem('petcare_token');if(token)c.headers.Authorization=`Bearer ${token}`;return c});
export default api;
