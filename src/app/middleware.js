import { NextResponse } from 'next/server';

export function middleware(request) {
    const userAgent = request.headers.get('user-agent') || '';

    console.log('User-Agent:', userAgent);
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    if (!isMobile) {
        return NextResponse.redirect('https://appbase-web2.vercel.app/');
    }
    return NextResponse.next();
}
