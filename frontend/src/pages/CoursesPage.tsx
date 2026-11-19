import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Course } from '../types'

/** US-01：按课程浏览问题的入口。点进某个课程后回到列表页并带上 courseId 过滤。 */
export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .courses()
      .then(setCourses)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="layout">
      <section>
        <h1>课程</h1>
        <p className="muted">选一门课，只看这门课下的问题。</p>

        {error && <p className="error">{error}</p>}

        <ul className="qlist">
          {courses.map((c) => (
            <li key={c.id}>
              <div className="qmain">
                <Link className="qtitle" to={`/?courseId=${c.id}`}>
                  {c.code} · {c.name}
                </Link>
                <p className="excerpt">
                  {c.term} · 授课教师 {c.teacherName}
                  {c.myRole ? ` · 我的角色：${c.myRole}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {!error && courses.length === 0 && (
          <p className="muted">还没有课程。</p>
        )}
      </section>
    </div>
  )
}
