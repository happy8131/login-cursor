'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/login', label: '로그인' },
    { href: '/signup', label: '회원가입' },
    { href: '/admin', label: '관리자' },
  ];

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
        </div>
      </div>
    </nav>
  );
}
