import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { AuthProvider } from './auth'
import { useAuth } from './auth-context'
import { api } from './api'
import { NOTIFICATIONS_READ_EVENT } from './notification-events'
import { QuestionListPage } from './pages/QuestionListPage'
import { QuestionDetailPage } from './pages/QuestionDetailPage'
import { AskPage } from './pages/AskPage'
import { LoginPage } from './pages/LoginPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { CoursesPage } from './pages/CoursesPage'

function Header() {
  const { me, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!me) return
    const load = () =>
      api
        .unreadCount()
        .then((r) => setUnread(r.count))
        .catch(() => undefined)
    load()
    // 通知页标已读后立即刷新角标；同时保留 30s 轮询兜底
    window.addEventListener(NOTIFICATIONS_READ_EVENT, load)
    const timer = setInterval(load, 30_000)
    return () => {
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, load)
      clearInterval(timer)
    }
  }, [me])

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        CampusOverflow
      </Link>
      {/* 窄屏（<=768px）才显示，宽屏由 CSS 隐藏 */}
      <button
        className="nav-toggle"
        aria-label="菜单"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        ☰
      </button>
      <nav
        className={menuOpen ? 'open' : ''}
        onClick={() => setMenuOpen(false)}
      >
        <Link to="/">问题</Link>
        <Link to="/courses">课程</Link>
        <Link to="/leaderboard">排行榜</Link>
        {me && (
          <Link to="/notifications">
            通知{unread > 0 && <span className="badge">{unread}</span>}
          </Link>
        )}
      </nav>
      <div className="spacer" />
      {me ? (
        <div className="user">
          <span>{me.displayName}</span>
          <span className="role">{me.role}</span>
          <button onClick={() => logout().then(() => navigate('/'))}>
            退出
          </button>
        </div>
      ) : (
        <Link className="primary" to="/login">
          登录 / 注册
        </Link>
      )}
    </header>
  )
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { me, loading } = useAuth()
  if (loading) return <p className="muted">加载中…</p>
  return me ? children : <Navigate to="/login" replace />
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<QuestionListPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route
              path="/ask"
              element={
                <RequireAuth>
                  <AskPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <NotificationsPage />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
