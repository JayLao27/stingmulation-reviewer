"use client";

import { useEffect, useMemo, useState } from "react";
import firstExam from "../../assets/first-exam.json";
import secondExam from "../../assets/second-exam.json";
import thirdExam from "../../assets/third-exam.json";
import fourthExam from "../../assets/fourth-exam.json";

type Mode = "quiz" | "review" | "missed";
type Filter = string | "all";
type AnswerLetter = "A" | "B" | "C" | "D";

type Question = {
  id: number;
  topic: string;
  text: string;
  options: string[];
  answer: AnswerLetter;
};

type QuestionState = {
  answered: boolean;
  selected: AnswerLetter | null;
  correct: boolean | null;
};

type QuizSet = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

const QUIZ_SETS: QuizSet[] = [
  firstExam as QuizSet,
  secondExam as QuizSet,
  thirdExam as QuizSet,
  fourthExam as QuizSet,
];

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];

function createInitialState(questions: Question[]): Record<number, QuestionState> {
  return Object.fromEntries(
    questions.map((question) => [question.id, { answered: false, selected: null, correct: null }]),
  ) as Record<number, QuestionState>;
}

function shuffleQuestions(list: Question[]) {
  const items = [...list];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;

}

function shuffleQuestionOptions(question: Question): Question {
  const indexedOptions = question.options.map((option, index) => ({ option, index }));

  for (let current = indexedOptions.length - 1; current > 0; current -= 1) {
    const randomIndex = Math.floor(Math.random() * (current + 1));
    [indexedOptions[current], indexedOptions[randomIndex]] = [
      indexedOptions[randomIndex],
      indexedOptions[current],
    ];
  }

  const originalAnswerIndex = LETTERS.indexOf(question.answer);
  const newAnswerIndex = indexedOptions.findIndex(({ index }) => index === originalAnswerIndex);

  return {
    ...question,
    options: indexedOptions.map(({ option }) => option),
    answer: LETTERS[newAnswerIndex] ?? question.answer,
  };
}

function prepareQuestions(list: Question[]) {
  return list.map((question) => shuffleQuestionOptions(question));
}

export default function App() {
  const [activeExamId, setActiveExamId] = useState(QUIZ_SETS[0]?.id ?? "exam1");
  const activeExam = useMemo(
    () => QUIZ_SETS.find((exam) => exam.id === activeExamId) ?? QUIZ_SETS[0],
    [activeExamId],
  );

  const totalQuestions = activeExam.questions.length;
  const [state, setState] = useState<Record<number, QuestionState>>(() =>
    createInitialState(activeExam.questions),
  );
  const [mode, setMode] = useState<Mode>("quiz");
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayOrder, setDisplayOrder] = useState<Question[]>(() => [...activeExam.questions]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);

  const topics = useMemo(() => {
    const list = Array.from(new Set(activeExam.questions.map((question) => question.topic)));
    return list;
  }, [activeExam.questions]);

  useEffect(() => {
    setState(createInitialState(activeExam.questions));
    setDisplayOrder(prepareQuestions(activeExam.questions));
    setMode("quiz");
    setFilter("all");
    setSearchQuery("");
    setCurrentQuestionIndex(0);
    setResultsOpen(false);
  }, [activeExam]);

  const summary = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let answered = 0;

    for (const question of activeExam.questions) {
      const item = state[question.id];
      if (!item?.answered) {
        continue;
      }

      answered += 1;
      if (item.correct) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    const skipped = Math.max(0, totalQuestions - answered);
    const percentage = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);

    return { correct, wrong, answered, skipped, percentage, passed: percentage >= 75 };
  }, [activeExam.questions, state, totalQuestions]);

  const visibleQuestions = useMemo(() => {
    let questions = displayOrder;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (filter !== "all") {
      questions = questions.filter((question) => question.topic === filter);
    }

    if (normalizedQuery) {
      questions = questions.filter((question) => {
        const haystack = `${question.text} ${question.topic} ${question.options.join(" ")}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    if (mode === "missed") {
      questions = questions.filter((question) => state[question.id]?.answered && !state[question.id]?.correct);
    }

    return questions;
  }, [displayOrder, filter, mode, searchQuery, state]);

  useEffect(() => {
    setCurrentQuestionIndex((current) => {
      if (visibleQuestions.length === 0) {
        return 0;
      }

      return Math.min(current, visibleQuestions.length - 1);
    });
  }, [visibleQuestions.length]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const currentState = currentQuestion ? state[currentQuestion.id] : null;
  const canGoPrev = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < visibleQuestions.length - 1;
  const canAdvance =
    mode === "review" || mode === "missed" || Boolean(currentQuestion && currentState?.answered);

  function handleAnswer(questionId: number, selected: AnswerLetter) {
    setState((current) => {
      const currentItem = current[questionId];
      if (currentItem?.answered) {
        return current;
      }

      const question = displayOrder.find((entry) => entry.id === questionId);
      if (!question) {
        return current;
      }

      const correct = selected === question.answer;
      return {
        ...current,
        [questionId]: { answered: true, selected, correct },
      };
    });
  }

  function resetAll() {
    setState(createInitialState(activeExam.questions));
    setDisplayOrder(prepareQuestions(activeExam.questions));
    setMode("quiz");
    setFilter("all");
    setSearchQuery("");
    setCurrentQuestionIndex(0);
    setResultsOpen(false);
  }

  function handleShuffle() {
    setDisplayOrder(shuffleQuestions(activeExam.questions));
    setCurrentQuestionIndex(0);
  }

  return (
    <main className="app-shell">
      <header className="header">
        <div className="tag">Simulation Exam</div>
        <h1 className="title">{activeExam.title}</h1>
        <p className="subtitle">{totalQuestions} items · {activeExam.description}</p>
      </header>

      <section className="exam-switch" aria-label="Exam set selector">
        {QUIZ_SETS.map((exam) => (
          <button
            key={exam.id}
            type="button"
            className={`mode-btn ${activeExamId === exam.id ? "active" : ""}`}
            onClick={() => setActiveExamId(exam.id)}
          >
            {exam.title}
          </button>
        ))}
      </section>

      <section className="score-bar" aria-label="Quiz progress">
        <div className="score-item">
          <div className="label">Correct</div>
          <div className="value correct-color">{summary.correct}</div>
        </div>

        <div className="progress-wrap">
          <div className="progress-meta">
            <span style={{ color: "var(--muted)" }}>{summary.answered} / {totalQuestions} answered</span>
            <span style={{ color: "var(--accent)" }}>{totalQuestions === 0 ? 0 : Math.round((summary.answered / totalQuestions) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${totalQuestions === 0 ? 0 : Math.round((summary.answered / totalQuestions) * 100)}%` }} />
          </div>
        </div>

        <div className="score-item">
          <div className="label">Wrong</div>
          <div className="value wrong-color">{summary.wrong}</div>
        </div>
      </section>

      <section className="mode-toggle" aria-label="Quiz mode">
        <button
          type="button"
          className={`mode-btn ${mode === "quiz" ? "active" : ""}`}
          onClick={() => {
            setMode("quiz");
            setCurrentQuestionIndex(0);
          }}
        >
          Quiz Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "review" ? "active" : ""}`}
          onClick={() => {
            setMode("review");
            setCurrentQuestionIndex(0);
          }}
        >
          Review Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "missed" ? "active" : ""}`}
          onClick={() => {
            setMode("missed");
            setCurrentQuestionIndex(0);
          }}
        >
          Missed Only
        </button>
      </section>

      <section className="filter-bar" aria-label="Topic filters">
        <button
          type="button"
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => {
            setFilter("all");
            setCurrentQuestionIndex(0);
          }}
        >
          All Topics
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            className={`filter-btn ${filter === topic ? "active" : ""}`}
            onClick={() => {
              setFilter(topic);
              setCurrentQuestionIndex(0);
            }}
          >
            {topic}
          </button>
        ))}
      </section>

      <section className="search-bar" aria-label="Question search">
        <input
          type="search"
          className="search-input"
          placeholder="Search questions, topics, or options"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setCurrentQuestionIndex(0);
          }}
        />
        <button
          type="button"
          className="filter-btn"
          onClick={() => {
            setSearchQuery("");
            setCurrentQuestionIndex(0);
          }}
          disabled={searchQuery.trim().length === 0}
        >
          Clear
        </button>
      </section>

      <section className="question-list" aria-live="polite">
        {visibleQuestions.length === 0 ? (
          <div className="no-questions">NO QUESTIONS MATCH THIS FILTER</div>
        ) : (
          <>
            {currentQuestion ? (
              <article
                key={currentQuestion.id}
                className={`question-card ${currentState?.answered && currentState.correct ? "answered-correct" : ""} ${currentState?.answered && !currentState.correct ? "answered-wrong" : ""}`}
                id={`card-${currentQuestion.id}`}
              >
                <div className="q-header">
                  <div className="q-num">Q{String(currentQuestion.id).padStart(2, "0")}</div>
                  <div className="q-text">{currentQuestion.text}</div>
                </div>

                <div className="q-options">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const letter = LETTERS[optionIndex] ?? "A";
                    let className = "option-btn";

                    if (mode === "review") {
                      if (letter === currentQuestion.answer) {
                        className += " reveal-correct";
                      }
                    } else if (currentState?.answered) {
                      if (letter === currentQuestion.answer) {
                        className += " correct";
                      } else if (letter === currentState.selected) {
                        className += " wrong";
                      }
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        className={className}
                        disabled={Boolean(currentState?.answered) || mode === "review"}
                        onClick={() => handleAnswer(currentQuestion.id, letter)}
                      >
                        <span className="letter">{letter}.</span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {currentState?.answered ? (
                  currentState.correct ? (
                    <div className="q-feedback correct-fb show">CORRECT</div>
                  ) : (
                    <div className="q-feedback wrong-fb show">
                      WRONG - Answer: {currentQuestion.answer}. {currentQuestion.options[LETTERS.indexOf(currentQuestion.answer)]}
                    </div>
                  )
                ) : null}
              </article>
            ) : null}

            <div className="question-nav" aria-label="Question navigation">
              <div className="question-position">
                Question {visibleQuestions.length === 0 ? 0 : currentQuestionIndex + 1} of {visibleQuestions.length}
              </div>
              <div className="question-nav-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setCurrentQuestionIndex((current) => Math.max(current - 1, 0))}
                  disabled={!canGoPrev}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    if (!canGoNext || !canAdvance) {
                      return;
                    }

                    setCurrentQuestionIndex((current) => Math.min(current + 1, visibleQuestions.length - 1));
                  }}
                  disabled={!canGoNext || !canAdvance}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="controls">
        <button type="button" className="btn" onClick={resetAll}>
          Reset All
        </button>
        <button type="button" className="btn" onClick={handleShuffle}>
          Shuffle
        </button>
        <button type="button" className="btn primary" onClick={() => setResultsOpen(true)}>
          View Results
        </button>
      </section>

      <div className={`results-overlay ${resultsOpen ? "show" : ""}`} role="dialog" aria-modal="true" aria-label="Quiz results">
        <div className="results-box">
          <div className={`big-score ${summary.passed ? "pass" : "fail"}`}>{summary.percentage}%</div>
          <div className="grade-label">{summary.passed ? "PASSED" : "FAILED (75% to pass)"}</div>

          <div className="results-stats">
            <div className="results-stat">
              <div className="val correct-color">{summary.correct}</div>
              <div className="lbl">Correct</div>
            </div>
            <div className="results-stat">
              <div className="val wrong-color">{summary.wrong}</div>
              <div className="lbl">Wrong</div>
            </div>
            <div className="results-stat">
              <div className="val accent-color">{summary.skipped}</div>
              <div className="lbl">Skipped</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setResultsOpen(false)}>
              Back
            </button>
            <button type="button" className="btn primary" style={{ flex: 1 }} onClick={resetAll}>
              Retry
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
