import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head' // 🟢 引入 Head

// 引用路径保持你的 blog-manager
const AdminComponent = dynamic(
  () => import('../components/blog-manager/AdminDashboard'),
  { 
    ssr: false,
    loading: () => <div style={{color:'#fff', padding:20, background:'#303030', height:'100vh'}}>正在加载后台...</div>
  }
)

// 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("后台崩溃:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', background: '#222', height: '100vh' }}>
          <h2>后台组件发生了错误</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminPage = () => {
  return (
    <div id="admin-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#303030', overflow: 'auto' }}>
      {/* 🟢 在这里设置图标，绝对生效 */}
      <Head>
        <title>Blog Admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ErrorBoundary>
        <AdminComponent />
      </ErrorBoundary>
    </div>
  )
}

export default AdminPage
