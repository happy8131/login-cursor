'use client';

import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/lib/axios';
import { useDispatch } from 'react-redux';
import { setUserFromToken } from '@/store/userSlice';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleKakaoLogin = () => {
    if (typeof window === 'undefined') return;
    
    const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    
    if (!KAKAO_REST_API_KEY || !KAKAO_REDIRECT_URI) {
      alert('카카오 로그인 설정이 올바르지 않습니다.');
      return;
    }
    
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    
    window.location.href = kakaoAuthUrl;
  };

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined') return;
    
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      alert('구글 로그인 설정이 올바르지 않습니다.');
      return;
    }
    
    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile`;
    
    window.location.href = GOOGLE_AUTH_URL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Next.js API Route를 통해 프록시 요청 (CORS 문제 해결)
      // 인터셉터가 자동으로 토큰 헤더를 추가합니다
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password,
      });


      // 로그인 성공
      if (response.status === 200 || response.status === 201) {
        const accessToken = response.data?.accessToken || response.data?.token;
     
        if (accessToken) {    
          // 토큰을 localStorage에 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }
          
          // Redux store에 토큰 정보 저장
          dispatch(setUserFromToken(accessToken));
          
          alert('로그인 성공!');
        } else {
          alert('로그인 성공!');
        }
        router.push('/');
      } else {
        // 성공 상태 코드가 아닌 경우
        const errorMessage = response.data?.message || response.data?.error || `예상치 못한 응답: ${response.status}`;
        setError(`로그인 실패: ${errorMessage}`);
        alert(`로그인 실패\n상태: ${response.status}\n에러: ${errorMessage}`);
      }
    } catch (err: any) {
      // 로그인 실패 - 에러 처리
      if (err.response) {
        // 서버에서 응답이 온 경우
        const errorMessage = err.response.data?.message || err.response.data?.error || '로그인에 실패했습니다.';
        const errorData = err.response.data;
        setError(`로그인 실패: ${errorMessage}`);
        alert(`로그인 실패\n에러: ${JSON.stringify(errorData, null, 2)}`);
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        alert('로그인 실패\n서버에 연결할 수 없습니다.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError('로그인 중 오류가 발생했습니다.');
        alert(`로그인 실패\n오류: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-8">
      <Navigation />
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          로그인
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          <div>
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>
        </form>
        
        {/* 카카오 로그인 버튼 */}
        <div className="mt-2 space-y-2">
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] text-[#000000] font-bold py-3 rounded-md hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C4.477 0 0 3.582 0 8c0 2.797 1.768 5.27 4.4 6.7L3.5 20l5.5-2.9c.5.05 1 .1 1.5.1 5.523 0 10-3.582 10-8S15.523 0 10 0z"
                fill="#000000"
              />
            </svg>
            카카오 로그인
          </button>

          {/* 구글 로그인 버튼 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-800 font-medium py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h147.3c-6.4 34.6-25.9 63.9-55.1 83.5v69.4h88.9c52.1-48 80.4-118.7 80.4-197.9z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c73.5 0 135.3-24.3 180.4-66.1l-88.9-69.4c-24.7 16.6-56.4 26.4-91.5 26.4-70.3 0-129.9-47.4-151.2-111.1H30.8v69.9c44.6 88.4 136.1 150.3 241.2 150.3z"
                fill="#34A853"
              />
              <path
                d="M120.8 323.9c-10.8-32.4-10.8-67.4 0-99.8v-69.9H30.8c-40.8 81-40.8 177.1 0 258.1l90-88.4z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c39.9-.6 78.2 14.5 107.4 42.6l79.8-79.8C407.1 24.7 345.4 0 272 0 166.9 0 75.4 61.9 30.8 150.3l90 69.9C142.1 155.1 201.7 107.7 272 107.7z"
                fill="#EA4335"
              />
            </svg>
            구글 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
