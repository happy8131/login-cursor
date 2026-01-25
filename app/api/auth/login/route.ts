import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 백엔드 서버로 프록시 요청 (withCredentials는 서버 간 통신이므로 자동 처리)
    const response = await fetch('http://localhost:8080/api/auth/login', {
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
      data = { message: text || '로그인 성공!' };
    }

    // 디버깅: 응답 상태와 데이터 로그
    console.log('로그인 응답 상태:', response.status);
    console.log('로그인 응답 데이터:', data);
    console.log('Set-Cookie 헤더:', response.headers.getSetCookie());

    // NextResponse 생성
    const nextResponse = NextResponse.json(data, { 
      status: response.status,
    });

    // 쿠키가 있다면 클라이언트로 전달
    // getAll을 사용하여 모든 Set-Cookie 헤더 가져오기
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
    console.error('로그인 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
