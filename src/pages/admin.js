import React from 'react'
import dynamic from 'next/dynamic'

// ✅ 路径已修改为新的 admin-view，彻底避开大小写缓存
const AdminComponent = dynamic(
  () => import('../components/admin-view/AdminDashboard'),
  { ssr: false }
)

const AdminPage = () => {
  return (
    <div suppressHydrationWarning>
      <AdminComponent />
    </div>
  )
}

export default AdminPage