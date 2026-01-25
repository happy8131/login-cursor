import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: '/',
  withCredentials: true, // 쿠키 포함
});

// Request 인터셉터: 모든 요청에 토큰 헤더 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 에러 처리 (선택사항)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        // 필요시 로그인 페이지로 리다이렉트
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
