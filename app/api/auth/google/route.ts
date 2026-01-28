import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 백엔드 서버로 구글 로그인 요청 (http://localhost:8080/api/auth/google)
    const response = await fetch('http://localhost:8080/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || '구글 로그인 성공!' };
    }

    console.log('구글 로그인 응답 상태:', response.status);
    console.log('구글 로그인 응답 데이터:', data);

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    const accessToken = data?.accessToken || data?.token;
    if (accessToken && (response.status === 200 || response.status === 201)) {
      nextResponse.cookies.set('accessToken', accessToken, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    const refreshToken = data?.refreshToken;
    if (refreshToken && (response.status === 200 || response.status === 201)) {
      nextResponse.cookies.set('refreshToken', refreshToken, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        const [nameValue, ...attributes] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          const cookieOptions: Record<string, unknown> = { path: '/' };
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
              cookieOptions.sameSite =
                sameSiteValue === 'none'
                  ? 'none'
                  : sameSiteValue === 'lax'
                    ? 'lax'
                    : sameSiteValue === 'strict'
                      ? 'strict'
                      : 'lax';
            }
          });
          nextResponse.cookies.set(name.trim(), value.trim(), cookieOptions as any);
        }
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('구글 로그인 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
