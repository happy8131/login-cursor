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
      </div>
    </div>
  );
}
