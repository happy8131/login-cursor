'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/userSlice';
import axiosInstance from '@/lib/axios';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { role, isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      // 로그아웃 API 요청
      await axiosInstance.post('/api/auth/logout');
      
      // Redux store에서 로그아웃 처리 (localStorage도 삭제됨)
      dispatch(logout());
      
      // 홈으로 이동
      router.push('/');
    } catch (error) {
      // API 요청 실패해도 로컬에서 로그아웃 처리
      dispatch(logout());
      router.push('/');
    }
  };

  // 모든 가능한 링크
  const allNavLinks = [
    { href: '/', label: '홈' },
    { href: '/login', label: '로그인' },
    { href: '/signup', label: '회원가입' },
    { href: '/admin', label: '관리자' },
  ];

  // 조건부 필터링
  const navLinks = allNavLinks.filter((link) => {
    // 로그인 상태일 때: 로그인, 회원가입 숨기기
    if (isAuthenticated && (link.href === '/login' || link.href === '/signup')) {
      return false;
    }
    
    // 관리자 메뉴: 관리자(ROLE_ADMIN)일 때만 보이기
    if (link.href === '/admin') {
      return isAuthenticated && role === 'ROLE_ADMIN';
    }
    
    // 나머지는 모두 표시
    return true;
  });

  return (
    <nav className="flex justify-center w-full mb-8">
      <div className="flex items-center bg-blue-500 rounded-lg px-4 py-3 w-full max-w-4xl">
        <Link 
          href="/" 
          className="bg-blue-600 rounded-md px-4 py-2 text-white font-bold mr-4 hover:bg-blue-700 transition-colors"
        >
          MyApp
        </Link>
        <div className="flex gap-4 ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-white rounded-md transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600 font-semibold'
                  : 'hover:bg-blue-600/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-white rounded-md transition-colors hover:bg-blue-600/80"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
