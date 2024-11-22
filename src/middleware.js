import { NextResponse } from 'next/server';

export function middleware(request) {
    const userAgent = request.headers.get('user-agent') || '';

    console.log('User-Agent:', userAgent);
    
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    if (!isMobile) {
        return NextResponse.redirect('https://appbase-website.vercel.app/');
    }
    return NextResponse.next();
}
