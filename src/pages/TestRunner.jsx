import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import {
    finishAttemptRequest,
    saveAttemptAnswerRequest,
    startAttemptRequest,
} from '../api/attempts';

const demoTest = {
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
        }
    ]
};

const TestRunner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [attemptId, setAttemptId] = useState(null);
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [resultSummary, setResultSummary] = useState(null);
    const [finishError, setFinishError] = useState('');
    const finishingRef = useRef(false);

    useEffect(() => {
        const bootstrap = async () => {
            setLoading(true);
            setLoadError('');
            setFinishError('');
            setCurrentIndex(0);
            setAnswers({});
            setIsFinished(false);
            setResultSummary(null);
            setAttemptId(null);

            if (!token || token.startsWith('demo-token-')) {
                setTest(demoTest);
                setSecondsLeft((demoTest.durationMinutes || 10) * 60);
                setLoading(false);
                return;
            }

            try {
                const attempt = await startAttemptRequest(token, id);
                setAttemptId(attempt.attemptId);
                setTest(attempt.test);
                setSecondsLeft(attempt.remainingSeconds || (attempt.test.durationMinutes || 10) * 60);
            } catch (err) {
                setLoadError(err.message || 'Не удалось запустить попытку.');
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, [id, token]);

    const handleFinishAttempt = useCallback(async () => {
        if (finishingRef.current || isFinished) {
            return;
        }

        finishingRef.current = true;

        if (!token || token.startsWith('demo-token-') || !attemptId) {
            setIsFinished(true);
            finishingRef.current = false;
            return;
        }

        try {
            const summary = await finishAttemptRequest(token, attemptId);
            setResultSummary(summary.result);
            setIsFinished(true);
        } catch (err) {
            setFinishError(err.message || 'Не удалось завершить попытку.');
        } finally {
            finishingRef.current = false;
        }
    }, [attemptId, isFinished, token]);

    useEffect(() => {
        if (loading || isFinished || !test) {
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinishAttempt();
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, isFinished, test, handleFinishAttempt]);

    const handleExit = () => navigate('/tests');

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const currentQuestion = useMemo(() => test?.questions?.[currentIndex] || null, [test, currentIndex]);

    const progressPercent = useMemo(() => {
        if (!test?.questions?.length) {
            return 0;
        }

        return Math.round(((currentIndex + 1) / test.questions.length) * 100);
    }, [test, currentIndex]);

    const handleSelectOption = async (optionId) => {
        if (!currentQuestion) {
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionId,
        }));

        if (token && !token.startsWith('demo-token-') && attemptId) {
            try {
                await saveAttemptAnswerRequest(token, attemptId, currentQuestion.id, optionId);
            } catch (err) {
                setFinishError(err.message || 'Не удалось сохранить ответ.');
            }
        }
    };

    const handleNext = () => {
        if (!test) {
            return;
        }

        if (currentIndex < test.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleFinishAttempt();
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

    if (loadError) {
        return (
            <div className="page">
                <h1 className="page__title">Тест недоступен</h1>
                <p className="page__subtitle">{loadError}</p>
                <button className="btn-primary" onClick={handleExit} type="button">
                    Вернуться к списку тестов
                </button>
            </div>
        );
    }

    if (!test || !test.questions?.length) {
        return (
            <div className="page">
                <h1 className="page__title">Тест недоступен</h1>
                <p className="page__subtitle">В тесте пока нет вопросов.</p>
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
            {finishError && <p className="page__hint">{finishError}</p>}

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
                                        (answers[currentQuestion.id] === option.id ? ' test-option--selected' : '')
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
                    {resultSummary ? (
                        <p className="test-result__text">
                            Результат: {resultSummary.score_percent}% · Уровень: {resultSummary.level_result} ·{' '}
                            {resultSummary.passed ? 'Зачёт' : 'Незачёт'}.
                        </p>
                    ) : (
                        <p className="test-result__text">
                            Ответы сохранены в демо-режиме. Для реального подсчёта завершите попытку через backend.
                        </p>
                    )}

                    <button className="btn-primary" onClick={handleExit} type="button">
                        Вернуться к списку тестов
                    </button>
                </div>
            )}
        </div>
    );
};

export default TestRunner;
