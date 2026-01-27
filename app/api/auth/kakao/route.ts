import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 백엔드 서버로 카카오 로그인 요청
    const response = await fetch('http://localhost:8080/api/auth/kakao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify(body),
    });

    // Content-Type 확인하여 JSON 또는 텍스트 처리
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      // JSON 응답인 경우
      data = await response.json();
    } else {
      // 텍스트 응답인 경우
      const text = await response.text();
      data = { message: text || '카카오 로그인 성공!' };
    }

    // 디버깅: 응답 상태와 데이터 로그
    console.log('카카오 로그인 응답 상태:', response.status);
    console.log('카카오 로그인 응답 데이터:', data);

    // NextResponse 생성
    const nextResponse = NextResponse.json(data, { 
      status: response.status,
    });

    // accessToken이 응답에 있으면 쿠키로 저장
    const accessToken = data?.accessToken || data?.token;
    if (accessToken && (response.status === 200 || response.status === 201)) {
      nextResponse.cookies.set('accessToken', accessToken, {
        path: '/',
        httpOnly: false, // 클라이언트에서 읽을 수 있도록
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });
    }

    // refreshToken이 있으면 쿠키로 저장
    const refreshToken = data?.refreshToken;
    if (refreshToken && (response.status === 200 || response.status === 201)) {
      nextResponse.cookies.set('refreshToken', refreshToken, {
        path: '/',
        httpOnly: false, // 클라이언트에서 읽을 수 있도록
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30일
      });
    }

    // 백엔드에서 전달된 쿠키가 있다면 클라이언트로 전달
    const setCookieHeaders = response.headers.getSetCookie();
    
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // 모든 쿠키를 NextResponse에 설정
      setCookieHeaders.forEach((cookie) => {
        // Set-Cookie 헤더 파싱
        const [nameValue, ...attributes] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        
        if (name && value) {
          // 쿠키 속성 파싱
          const cookieOptions: any = {
            path: '/',
          };
          
          attributes.forEach((attr) => {
            const trimmed = attr.trim().toLowerCase();
            if (trimmed.startsWith('path=')) {
              cookieOptions.path = attr.trim().substring(5);
            } else if (trimmed.startsWith('domain=')) {
              cookieOptions.domain = attr.trim().substring(7);
            } else if (trimmed.startsWith('max-age=')) {
              cookieOptions.maxAge = parseInt(attr.trim().substring(8));
            } else if (trimmed === 'httponly') {
              cookieOptions.httpOnly = true;
            } else if (trimmed === 'secure') {
              cookieOptions.secure = true;
            } else if (trimmed.startsWith('samesite=')) {
              const sameSiteValue = attr.trim().substring(9).toLowerCase();
              cookieOptions.sameSite = sameSiteValue === 'none' ? 'none' : 
                                      sameSiteValue === 'lax' ? 'lax' : 
                                      sameSiteValue === 'strict' ? 'strict' : 'lax';
            }
          });
          
          nextResponse.cookies.set(name.trim(), value.trim(), cookieOptions);
        }
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('카카오 로그인 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
