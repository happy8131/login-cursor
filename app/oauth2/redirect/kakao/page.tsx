'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserFromToken } from '@/store/userSlice';
import axiosInstance from '@/lib/axios';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      alert('카카오 로그인에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code) {
      handleKakaoCallback(code);
    } else {
      alert('인증 코드를 받지 못했습니다.');
      router.push('/login');
    }
  }, [searchParams, router, dispatch]);
//
  const handleKakaoCallback = async (code: string) => {
    try {
      // 카카오 인증 코드를 백엔드로 전달하여 로그인 처리
      const response = await axiosInstance.post('/api/auth/kakao', {
        code,
        redirectUri: 'http://localhost:3000/oauth2/redirect/kakao',
      });

      if (response.status === 200 || response.status === 201) {
        const accessToken = response.data?.accessToken || response.data?.token;
        
        if (accessToken) {
          // 토큰을 localStorage에 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }
          
          // Redux store에 토큰 정보 저장
          dispatch(setUserFromToken(accessToken));
          
          alert('카카오 로그인 성공!');
          router.push('/');
        } else {
          alert('로그인에 실패했습니다.');
          router.push('/login');
        }
      } else {
        alert('카카오 로그인에 실패했습니다.');
        router.push('/login');
      }
    } catch (err: any) {
      console.error('카카오 로그인 에러:', err);
      alert('카카오 로그인 중 오류가 발생했습니다.');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl text-gray-600 mb-4">카카오 로그인 처리 중...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
