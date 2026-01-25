'use client';

import Navigation from '../components/Navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Next.js API Route를 통해 프록시 요청 (CORS 문제 해결)
      // 인터셉터가 자동으로 토큰 헤더를 추가합니다
      const response = await axiosInstance.post('/api/auth/signup', {
        username,
        password,
      });

      // 회원가입 성공
      if (response.status === 200 || response.status === 201) {
        alert('회원가입 성공!');
        router.push('/login');
      }
    } catch (err: any) {
      // 회원가입 실패 - 에러 처리
      if (err.response) {
        // 서버에서 응답이 온 경우
        const errorMessage = err.response.data?.message || err.response.data?.error || '회원가입에 실패했습니다.';
        setError(errorMessage);
        console.error('회원가입 실패:', err.response.data);
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        console.error('서버 응답 없음:', err.request);
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError('회원가입 중 오류가 발생했습니다.');
        console.error('오류:', err.message);
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
          회원가입
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
            {isLoading ? '처리 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}
