import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { getMyTestsRequest } from '../api/tests';

const Tests = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [tests, setTests] = useState([]);
  const [hint, setHint] = useState('');

  useEffect(() => { (async () => {
    if (!token || token.startsWith('demo-token-')) return;
    try { setTests(await getMyTestsRequest(token)); } catch (e) { setHint(e.message || 'Ошибка загрузки'); }
  })(); }, [token]);

  if (user?.role !== 'student') return <div className="page"><h1 className="page__title">Мои тесты</h1><p className="page__hint">Для преподавателя используйте раздел «Тесты» в панели управления.</p></div>;

  return <div className="page"><h1 className="page__title">Мои тесты</h1>{hint && <p className="page__hint">{hint}</p>}<table className="table"><thead><tr><th>Название теста</th><th>Уровень</th><th>Статус</th><th>Время</th><th></th></tr></thead><tbody>{tests.map((test)=><tr key={test.id}><td>{test.title}</td><td>{test.level}</td><td>{test.status}</td><td>{test.duration}</td><td>{test.status==='Пройден' ? <span className="page__hint">Пройден</span> : <button className="btn-primary" onClick={()=>navigate(`/tests/${test.id}`)}>{test.status === 'В процессе' ? 'Продолжить' : 'Начать'}</button>}</td></tr>)}</tbody></table></div>;
};

export default Tests;
