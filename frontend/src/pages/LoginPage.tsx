import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth-context'

/** 注册字段的提示文案：平时显示在输入框里，点进去（聚焦）就隐藏，不挡输入。 */
const HINTS = {
  username: '4–20 位字母或数字，例如 20240099',
  password: '8–64 位，必须同时包含字母和数字',
  displayName: '2–20 字，不能含 @ 或空格',
  email: '校园邮箱，例如 you@xycu.edu.cn',
  college: '选填，最多 50 字，例如 计算机学院',
  className: '选填，最多 50 字，例如 软件工程 2401',
} as const

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    email: '',
    college: '',
    className: '',
  })
  const [error, setError] = useState('')
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value })

  const submit = async () => {
    try {
      if (mode === 'register') {
        await api.register(form)
      }
      await login(form.username, form.password)
      navigate('/')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="form-page narrow">
      <div className="tabs">
        <button
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          登录
        </button>
        <button
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          注册
        </button>
      </div>
      <label>
        学号 / 工号
        <input
          value={form.username}
          onChange={set('username')}
          placeholder={mode === 'register' ? HINTS.username : '输入学号或工号'}
        />
      </label>
      <label>
        密码
        <input
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder={mode === 'register' ? HINTS.password : '输入密码'}
        />
      </label>
      {mode === 'register' && (
        <>
          <label>
            昵称
            <input
              value={form.displayName}
              onChange={set('displayName')}
              placeholder={HINTS.displayName}
            />
          </label>
          <label>
            校园邮箱
            <input
              value={form.email}
              onChange={set('email')}
              placeholder={HINTS.email}
            />
          </label>
          <label>
            学院
            <input
              value={form.college}
              onChange={set('college')}
              placeholder={HINTS.college}
            />
          </label>
          <label>
            班级
            <input
              value={form.className}
              onChange={set('className')}
              placeholder={HINTS.className}
            />
          </label>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <button className="primary" onClick={submit}>
        {mode === 'login' ? '登录' : '注册并登录'}
      </button>
    </div>
  )
}
