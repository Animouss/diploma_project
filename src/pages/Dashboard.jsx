import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummaryRequest } from '../api/tests';
import { useAuth } from '../context/auth-context';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { (async () => {
    if (!token || token.startsWith('demo-token-')) return;
    try { setData(await getDashboardSummaryRequest(token)); } catch (e) { setError(e.message || 'Ошибка загрузки'); }
  })(); }, [token]);

  if (!data) return <div className="page">Загрузка...</div>;

  if (user?.role === 'student') {
    return <div className="page"><h1 className="page__title">Главная</h1>{error && <p className="page__hint">{error}</p>}
      <div className="cards"><div className="card"><div className="card__title">Доступные тесты</div><div className="card__value">{data.available_count ?? 0}</div></div>
      <div className="card"><div className="card__title">Завершённые тесты</div><div className="card__value">{data.finished_count ?? 0}</div></div>
      <div className="card"><div className="card__title">Средний результат</div><div className="card__value">{Number(data.average_score || 0).toFixed(1)}%</div></div></div>
      <div className="admin-card" style={{marginTop:16}}><h2 className="admin-card__title">Последний пройденный тест</h2>{data.last_result ? <p>{data.last_result.test_title} · {Number(data.last_result.score_percent).toFixed(1)}% · {data.last_result.preparation_level || '—'}</p> : <p className="page__hint">Завершённых тестов пока нет</p>}</div>
      <div className="admin-card" style={{marginTop:16}}><h2 className="admin-card__title">Тесты к прохождению</h2>{(data.pending_tests||[]).length===0 ? <p className="page__hint">Нет тестов к прохождению</p> : <div className="admin-table-wrapper"><table className="table"><thead><tr><th>Тест</th><th>Комментарий</th><th>Длительность</th><th></th></tr></thead><tbody>{data.pending_tests.map((t)=><tr key={t.id}><td>{t.title}</td><td>{t.comment || "—"}</td><td>{t.duration_minutes} мин</td><td><Link className="btn-primary" to={`/tests/${t.id}`}>Начать</Link></td></tr>)}</tbody></table></div>}</div>
    </div>;
  }

  return <div className="page"><h1 className="page__title">Главная</h1><div className="cards"><div className="card"><div className="card__title">Всего студентов</div><div className="card__value">{data.students_count ?? 0}</div></div><div className="card"><div className="card__title">Средний результат студентов</div><div className="card__value">{Number(data.students_average_score || 0).toFixed(1)}%</div></div><div className="card"><div className="card__title">Завершённые попытки</div><div className="card__value">{data.students_finished_attempts ?? 0}</div></div></div></div>;
};

export default Dashboard;
