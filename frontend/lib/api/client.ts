import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',//nestjs backend url
    headers: {
    'Content-Type': 'application/json',
  },
});

//add token to requests automatically 
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {    
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
