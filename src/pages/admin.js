import React from 'react'
import dynamic from 'next/dynamic'

// 关键：禁用 SSR，强制在客户端渲染
const AdminComponent = dynamic(
  () => import('../components/AdminSystem/AdminDashboard'),
  { ssr: false }
)

const AdminPage = () => {
  return (
    <div id="admin-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1a1a1a', overflow: 'auto' }}>
      <AdminComponent />
    </div>
  )
}

export default AdminPage