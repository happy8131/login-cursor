import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 백엔드 서버로 프록시 요청
    const response = await fetch('http://localhost:8080/api/auth/refresh', {
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
      data = { message: text || '토큰 재발급 성공!' };
    }

    // 백엔드 응답을 그대로 전달
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('토큰 재발급 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
