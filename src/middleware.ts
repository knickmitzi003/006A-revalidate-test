import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔒 只有路径以 /admin 开头才触发逻辑
  // 这样绝对不会影响博客首页 (/)
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      // 读取 Vercel 环境变量
      const validUser = process.env.AUTH_USER || 'admin'
      const validPass = process.env.AUTH_PASS || '123456'

      if (user === validUser && pwd === validPass) {
        return NextResponse.next()
      }
    }

    // 验证失败返回 401
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

// ⚠️ 缩小匹配范围：仅匹配 admin 路径
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}