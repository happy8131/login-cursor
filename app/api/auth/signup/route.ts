import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 백엔드 서버로 프록시 요청
    const response = await fetch('http://localhost:8080/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      // 텍스트를 JSON 형태로 변환
      data = { message: text || '회원가입 성공!' };
    }

    // 백엔드 응답을 그대로 전달
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('회원가입 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
