import { NextResponse } from 'next/server';

// 这是一个模拟的JWT token，实际应用中应该从登录后的存储中获取
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IllPTE8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export async function POST(request: Request) {
  try {
    // 从请求中获取数据
    const body = await request.json();
    
    console.log('正在发送请求到后端API:', body);
    
    // 发送请求到后端API
    const response = await fetch('http://30.201.220.226:8080/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 添加认证头
        'Authorization': `Bearer ${MOCK_TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    
    console.log('后端API响应状态:', response.status);
    
    // 检查响应状态
    if (response.status === 401) {
      console.error('认证失败: 未授权访问');
      return NextResponse.json(
        { error: '认证失败，请先登录' },
        { status: 401 }
      );
    }
    
    if (!response.ok) {
      // 如果后端API返回错误，将错误传递给前端
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || '服务器错误' };
      }
      
      return NextResponse.json(
        { error: errorData.message || errorData.error || '创建帖子失败' },
        { status: response.status }
      );
    }
    
    // 返回成功响应
    const data = await response.json();
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('API路由错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
} 