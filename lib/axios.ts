import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: '/',
});

// 토큰 재발급 플래그 (무한 루프 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// refreshToken 함수
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      return null;
    }

    const response = await axios.post('/api/auth/refresh', {
      refreshToken: refreshTokenValue,
    });

    if (response.status === 200 || response.status === 201) {
      const newAccessToken = response.data?.accessToken || response.data?.token;
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        // refreshToken도 업데이트된 경우 저장
        if (response.data?.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return newAccessToken;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

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

// Response 인터셉터: 에러 처리 및 토큰 재발급
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 Unauthorized 에러 시 토큰 재발급 시도
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          // 토큰 재발급 성공 시 대기열 처리 및 원래 요청 재시도
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          isRefreshing = false;
          return axiosInstance(originalRequest);
        } else {
          // 토큰 재발급 실패
          processQueue(error, null);
          isRefreshing = false;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 토큰 재발급 중 에러 발생
        processQueue(error, null);
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
