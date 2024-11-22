import { NextResponse } from 'next/server';

export function middleware(request) {
    const userAgent = request.headers.get('user-agent') || '';

    // 判断是否为移动设备
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    if (!isMobile) {
        // 重定向到移动端页面路径（本地或外部 URL）
        return NextResponse.redirect('https://appbase-web2.vercel.app/');
    }

    // 桌面端继续正常访问
    return NextResponse.next();
}