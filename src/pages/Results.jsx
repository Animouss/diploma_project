import React from 'react';

const mockResults = [
    { id: 1, date: '12.11.2025', test: 'Комплексный тест', score: '78%', level: 'B1' },
    { id: 2, date: '01.11.2025', test: 'Грамматика', score: '92%', level: 'A2' },
];

const Results = () => {
    return (
        <div className="page">
            <h1 className="page__title">Результаты</h1>

            <table className="table">
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Тест</th>
                    <th>Результат</th>
                    <th>Уровень</th>
                </tr>
                </thead>
                <tbody>
                {mockResults.map((r) => (
                    <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{r.test}</td>
                        <td>{r.score}</td>
                        <td>{r.level}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Results;
