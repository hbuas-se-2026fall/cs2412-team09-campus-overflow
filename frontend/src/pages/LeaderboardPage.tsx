import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth-context';
import type { LeaderboardEntry, ReputationProfile } from '../types';

const PERIODS = [['week', '本周'], ['month', '本月'], ['term', '本学期'], ['all', '总榜']] as const;

export function LeaderboardPage() {
  const { me } = useAuth();
  const [period, setPeriod] = useState<string>('week');
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<ReputationProfile | null>(null);

  useEffect(() => {
    api.leaderboard(period).then(setRows).catch(() => setRows([]));
  }, [period]);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    api
      .reputation(me.id)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [me]);

  // 只认当前登录用户的档案，避免切换账号时短暂显示上一个人的数据
  const mine = me && profile && profile.userId === me.id ? profile : null;
  const myRank = me ? rows.find((r) => r.userId === me.id)?.rank : undefined;

  return (
    <div className="form-page">
      <h1>声誉排行榜</h1>

      {me && (
        <section className="my-rep">
          <h2>我的声誉</h2>
          <div className="stats">
            <span>声誉值 <strong>{mine ? mine.reputation : '—'}</strong></span>
            <span>可用积分 <strong>{mine?.availablePoints ?? '—'}</strong></span>
            <span>冻结积分 <strong>{mine?.frozenPoints ?? 0}</strong></span>
            <span>{periodName(period)}名次 <strong>{myRank ? `#${myRank}` : '未上榜'}</strong></span>
          </div>
          <div className="badges">
            {mine && mine.badges.length > 0 ? (
              mine.badges.map((b) => (
                <span key={b.code} className="badge-chip" title={b.description}>
                  {b.name}
                </span>
              ))
            ) : (
              <p className="muted">还没有获得徽章。</p>
            )}
          </div>
        </section>
      )}

      <div className="tabs">
        {PERIODS.map(([value, label]) => (
          <button key={value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>
            {label}
          </button>
        ))}
      </div>
      <table className="board">
        <thead><tr><th>名次</th><th>用户</th><th>声誉</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userId} className={me && r.userId === me.id ? 'me' : ''}>
              <td>{r.rank}</td>
              <td>{r.displayName}{r.verified && <span className="verified" title="已认证">✔</span>}</td>
              <td>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="muted">这个周期还没有数据。</p>}
    </div>
  );
}

function periodName(period: string): string {
  return PERIODS.find(([value]) => value === period)?.[1] ?? '本期';
}
