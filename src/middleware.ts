import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔒 双重保险：只有路径以 /admin 开头才进行拦截
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

    // 验证失败：返回 401，Body 必须为空 (null)
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // 其他所有页面（包括首页）直接放行
  return NextResponse.next()
}

// ⚠️ 配置匹配器：告诉 Next.js 只在这些路径下运行 middleware
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}