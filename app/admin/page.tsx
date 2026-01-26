'use client';

import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface User {
  username: string;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 페이지 접근 시 바로 유저 목록 가져오기 (서버에서 권한 체크)
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsAccessDenied(false);
      
      // 인터셉터가 자동으로 토큰 헤더를 추가합니다
      const response = await axiosInstance.get('/api/admin/users');

      if (response.status === 200) {
        // 응답 데이터가 배열인지 확인
        const userData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.users || response.data?.data || [];
        setUsers(userData);
      } else {
        // 200이 아닌 경우 접근 제한으로 처리
        setIsAccessDenied(true);
        setError('유저 정보를 가져올 수 없습니다. 접근 권한이 없습니다.');
      }
    } catch (err: any) {
      // 모든 에러 상황에서 접근 제한 메시지 표시
      setIsAccessDenied(true);
      
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data?.error || '유저 목록을 불러오는데 실패했습니다.';
        
        // 401, 403 등 권한 관련 에러
        if (status === 401 || status === 403) {
          setError('접근 권한이 없습니다. 관리자(admin) 계정만 접근할 수 있습니다.');
        } else if (status === 500) {
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(`유저 정보를 가져올 수 없습니다. (${errorMessage})`);
        }
      } else if (err.request) {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setError('유저 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-8">
      <Navigation />
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          관리자 페이지
        </h1>
        
        {isAccessDenied ? (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">접근 제한</h2>
            <p className="text-yellow-700 text-lg mb-4">
              접근 권한이 없습니다. 관리자(ROLE_ADMIN) 계정만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              홈으로 이동
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-gray-600">
            로딩 중...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            유저가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">사용자명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">역할</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
