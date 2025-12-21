import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Временный мок-тест. Потом можно заменять данными с бэка.
const mockTestsById = {
    1: {
        title: "Лексика и грамматика (демо)",
        durationMinutes: 10,
        questions: [
            {
                id: 1,
                text: "Выберите правильный вариант: Он ___ в университет каждое утро.",
                options: [
                    "ходит",
                    "ездит",
                    "идёт",
                    "приходит"
                ],
                correctIndex: 0 // пока просто храним, потом можно использовать для проверки
            },
            {
                id: 2,
                text: "Укажите предложение с правильным управлением.",
                options: [
                    "Я жду тебя в течение час.",
                    "Я жду тебя в течение часа.",
                    "Я жду тебя в течение часов.",
                    "Я жду тебя течение часа."
                ],
                correctIndex: 1
            },
            {
                id: 3,
                text: "Какой падеж используется после предлога «о» (говорить о ...)?",
                options: [
                    "именительный",
                    "родительный",
                    "дательный",
                    "предложный"
                ],
                correctIndex: 3
            }
        ]
    }
};

const TestRunner = () => {
    const { id } = useParams();              // берём id теста из URL
    const navigate = useNavigate();
    const test = mockTestsById[id] || mockTestsById[1];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [secondsLeft, setSecondsLeft] = useState(
        (test.durationMinutes || 10) * 60
    );
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = test.questions[currentIndex];

    // Таймер
    useEffect(() => {
        if (isFinished) return;

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
    }, [isFinished]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const handleSelectOption = (optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentIndex < test.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            // последний вопрос — завершаем
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleExit = () => {
        navigate("/tests");
    };

    // простейший подсчёт баллов после завершения
    const calculateScore = () => {
        let correct = 0;
        test.questions.forEach((q) => {
            if (answers[q.id] === q.correctIndex) {
                correct += 1;
            }
        });
        const percent = Math.round((correct / test.questions.length) * 100);
        return { correct, percent };
    };

    const progressPercent = Math.round(
        ((currentIndex + 1) / test.questions.length) * 100
    );

    return (
        <div className="page">
            <h1 className="page__title">{test.title}</h1>
            <p className="page__subtitle">
                Вопрос {currentIndex + 1} из {test.questions.length}
            </p>

            {/* Панель сверху: таймер + прогресс */}
            <div className="test-panel">
                <div className="test-panel__timer">
                    ⏱ Время: {formatTime(secondsLeft)}
                </div>
                <div className="test-panel__progress">
                    <div className="test-panel__progress-bar">
                        <div
                            className="test-panel__progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="test-panel__progress-text">
            {progressPercent}%
          </span>
                </div>
            </div>

            {!isFinished ? (
                <>
                    {/* ВОПРОС */}
                    <div className="test-question">
                        <div className="test-question__text">
                            {currentQuestion.text}
                        </div>

                        <div className="test-question__options">
                            {currentQuestion.options.map((opt, index) => (
                                <label
                                    key={index}
                                    className={
                                        "test-option" +
                                        (answers[currentQuestion.id] === index
                                            ? " test-option--selected"
                                            : "")
                                    }
                                >
                                    <input
                                        type="radio"
                                        name={`q-${currentQuestion.id}`}
                                        checked={answers[currentQuestion.id] === index}
                                        onChange={() => handleSelectOption(index)}
                                    />
                                    <span className="test-option__text">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* КНОПКИ */}
                    <div className="test-actions">
                        <button
                            className="btn-secondary"
                            onClick={handleExit}
                            type="button"
                        >
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

                            <button
                                className="btn-primary"
                                onClick={handleNext}
                                type="button"
                            >
                                {currentIndex === test.questions.length - 1
                                    ? "Завершить"
                                    : "Далее"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                // Блок результатов после завершения
                <div className="test-result">
                    <h2 className="test-result__title">Тест завершён</h2>
                    <p className="test-result__text">
                        {(() => {
                            const { correct, percent } = calculateScore();
                            return `Ваш результат: ${percent}% (${correct} из ${test.questions.length} правильных ответов).`;
                        })()}
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
