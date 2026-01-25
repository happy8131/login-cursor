import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 요청 헤더에서 Authorization 토큰 추출
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있으면 헤더에 포함
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // 백엔드 서버로 프록시 요청
    const response = await fetch('http://localhost:8080/api/admin/users', {
      method: 'GET',
      headers,
      credentials: 'include', // 쿠키 포함
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
      data = { message: text || '데이터를 가져올 수 없습니다.' };
    }

    // 백엔드 응답을 그대로 전달
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('유저 목록 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}
