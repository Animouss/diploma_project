import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { getTestDetailRequest } from '../api/tests';

const demoTestsById = {
    1: {
        id: 1,
        title: 'Лексика и грамматика (демо)',
        durationMinutes: 10,
        questions: [
            {
                id: 1,
                questionType: 'single_choice',
                text: 'Выберите правильный вариант: Он ___ в университет каждое утро.',
                passageText: '',
                options: [
                    { id: 11, text: 'ходит' },
                    { id: 12, text: 'ездит' },
                    { id: 13, text: 'идёт' },
                    { id: 14, text: 'приходит' }
                ]
            },
            {
                id: 2,
                questionType: 'reading_single_choice',
                text: 'Какова основная мысль текста?',
                passageText: 'Студенты подготовительного факультета изучают русский язык ежедневно. В программу входят лексика, грамматика и практика чтения научных текстов.',
                options: [
                    { id: 21, text: 'Студенты изучают только разговорную речь.' },
                    { id: 22, text: 'Программа включает комплексное языковое обучение.' },
                    { id: 23, text: 'На факультете нет практики чтения.' },
                    { id: 24, text: 'Изучается только грамматика.' }
                ]
            }
        ]
    }
};

const TestRunner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const loadTest = async () => {
            setLoading(true);
            setLoadError('');

            const demoTest = demoTestsById[id] || demoTestsById[1];

            if (!token || token.startsWith('demo-token-')) {
                setTest(demoTest);
                setSecondsLeft((demoTest.durationMinutes || 10) * 60);
                setLoading(false);
                return;
            }

            try {
                const apiTest = await getTestDetailRequest(token, id);
                setTest(apiTest);
                setSecondsLeft((apiTest.durationMinutes || 10) * 60);
            } catch {
                setTest(demoTest);
                setSecondsLeft((demoTest.durationMinutes || 10) * 60);
                setLoadError('Не удалось загрузить тест с сервера. Показана демо-версия.');
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [id, token]);

    useEffect(() => {
        if (loading || isFinished || !test) {
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsFinished(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, isFinished, test]);

    const handleExit = () => {
        navigate('/tests');
    };

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const currentQuestion = useMemo(
        () => test?.questions?.[currentIndex] || null,
        [test, currentIndex]
    );

    const progressPercent = useMemo(() => {
        if (!test?.questions?.length) {
            return 0;
        }

        return Math.round(((currentIndex + 1) / test.questions.length) * 100);
    }, [test, currentIndex]);

    const handleSelectOption = (optionId) => {
        if (!currentQuestion) {
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionId
        }));
    };

    const handleNext = () => {
        if (!test) {
            return;
        }

        if (currentIndex < test.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    if (loading) {
        return <div className="page">Загрузка теста...</div>;
    }

    if (!test || !test.questions?.length) {
        return (
            <div className="page">
                <h1 className="page__title">Тест недоступен</h1>
                <p className="page__subtitle">Не удалось получить структуру теста.</p>
                <button className="btn-primary" onClick={handleExit} type="button">
                    Вернуться к списку тестов
                </button>
            </div>
        );
    }

    return (
        <div className="page">
            <h1 className="page__title">{test.title}</h1>
            <p className="page__subtitle">
                Вопрос {currentIndex + 1} из {test.questions.length}
            </p>
            {loadError && <p className="page__hint">{loadError}</p>}

            <div className="test-panel">
                <div className="test-panel__timer">⏱ Время: {formatTime(secondsLeft)}</div>
                <div className="test-panel__progress">
                    <div className="test-panel__progress-bar">
                        <div className="test-panel__progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="test-panel__progress-text">{progressPercent}%</span>
                </div>
            </div>

            {!isFinished ? (
                <>
                    <div className="test-question">
                        {currentQuestion.passageText && (
                            <div className="test-question__passage">{currentQuestion.passageText}</div>
                        )}

                        <div className="test-question__text">{currentQuestion.text}</div>

                        <div className="test-question__options">
                            {currentQuestion.options.map((option) => (
                                <label
                                    key={option.id}
                                    className={
                                        'test-option' +
                                        (answers[currentQuestion.id] === option.id
                                            ? ' test-option--selected'
                                            : '')
                                    }
                                >
                                    <input
                                        type="radio"
                                        name={`q-${currentQuestion.id}`}
                                        checked={answers[currentQuestion.id] === option.id}
                                        onChange={() => handleSelectOption(option.id)}
                                    />
                                    <span className="test-option__text">{option.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="test-actions">
                        <button className="btn-secondary" onClick={handleExit} type="button">
                            Выйти
                        </button>

                        <div className="test-actions__right">
                            <button
                                className="btn-secondary"
                                onClick={handlePrev}
                                type="button"
                                disabled={currentIndex === 0}
                            >
                                Назад
                            </button>

                            <button className="btn-primary" onClick={handleNext} type="button">
                                {currentIndex === test.questions.length - 1 ? 'Завершить' : 'Далее'}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="test-result">
                    <h2 className="test-result__title">Тест завершён</h2>
                    <p className="test-result__text">
                        Ответы сохранены локально в текущей MVP-версии. Подсчёт результатов будет
                        подключён после реализации attempt/result API.
                    </p>

                    <button className="btn-primary" onClick={handleExit} type="button">
                        Вернуться к списку тестов
                    </button>
                </div>
            )}
        </div>
    );
};

export default TestRunner;
