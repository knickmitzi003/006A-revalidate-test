import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl

  // 拦截 /admin
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')
    
    // 如果没有 Auth 头，或者验证失败
    if (!basicAuth) {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      })
    }

    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 默认值兜底，防止环境变量未设置导致无法登录
    const validUser = process.env.AUTH_USER || 'admin'
    const validPass = process.env.AUTH_PASS || '123456'

    if (user === validUser && pwd === validPass) {
      return NextResponse.next()
    }

    // 密码错误
    return new NextResponse('Invalid Credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}