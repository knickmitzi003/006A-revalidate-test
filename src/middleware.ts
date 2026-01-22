import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🛡️ 核心修复：路径白名单
  // 如果路径不是以 /admin 开头，直接放行，绝对不弹窗
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // --- 以下是 Admin 区域的鉴权逻辑 ---
  
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    // 防止 base64 解析报错
    try {
      const [user, pwd] = atob(authValue).split(':')
      const validUser = process.env.AUTH_USER || 'admin'
      const validPass = process.env.AUTH_PASS || '123456'

      if (user === validUser && pwd === validPass) {
        return NextResponse.next()
      }
    } catch (e) {
      // 解析失败视为未登录
    }
  }

  // 验证失败，返回 401 并弹出登录框
  // Body 必须为 null 以兼容 Edge Runtime
  return new NextResponse(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

// 匹配器配置
export const config = {
  matcher: [
    // 只匹配 admin 路径
    '/admin', 
    '/admin/:path*'
  ],
}