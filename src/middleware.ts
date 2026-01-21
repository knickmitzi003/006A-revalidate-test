import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔒 仅拦截 /admin 开头的路径
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      // 解码 Base64
      const [user, pwd] = atob(authValue).split(':')

      // 读取 Vercel 环境变量 (如果没有设置，默认 admin/123456)
      const validUser = process.env.AUTH_USER || 'admin'
      const validPass = process.env.AUTH_PASS || '123456'

      if (user === validUser && pwd === validPass) {
        return NextResponse.next()
      }
    }

    // 验证失败：返回 401，Body 必须为 null (Next.js 13 要求)
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    })
  }

  return NextResponse.next()
}

// ✅ 关键：精准匹配，防止误伤首页
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}