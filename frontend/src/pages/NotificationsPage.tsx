import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { notifyRead } from '../notification-events'
import type { Notification } from '../types'

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])

  const load = () =>
    api
      .notifications()
      .then((p) => setItems(p.items))
      .catch(() => undefined)
  useEffect(() => {
    load()
  }, [])

  // 点击某条通知：先本地置已读，再调接口，最后通知顶栏刷新角标
  const markRead = (n: Notification) => {
    if (n.read) return
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
    )
    api
      .markRead(n.id)
      .then(() => notifyRead())
      .catch(() => load())
  }

  const readAll = () =>
    api
      .readAll()
      .then(() => {
        load()
        notifyRead()
      })
      .catch(() => undefined)

  return (
    <div className="form-page">
      <h1>通知</h1>
      <button onClick={readAll}>全部标记为已读</button>
      <ul className="plain">
        {items.map((n) => (
          <li key={n.id} className={n.read ? 'muted' : ''}>
            <Link to={n.link.replace(/^\//, '/')} onClick={() => markRead(n)}>
              {!n.read && <span className="dot" aria-label="未读" />}
              {n.title}
            </Link>
            <span className="muted">
              {' '}
              · {new Date(n.createdAt).toLocaleString('zh-CN')}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="muted">暂时没有通知。</li>}
      </ul>
    </div>
  )
}
