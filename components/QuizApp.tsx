"use client";

import { useMemo, useState } from "react";

type Topic = "applications" | "advantages" | "when" | "concepts" | "steps";
type Mode = "quiz" | "review" | "missed";
type Filter = Topic | "all";
type AnswerLetter = "A" | "B" | "C" | "D";

type Question = {
  id: number;
  topic: Topic;
  text: string;
  options: [string, string, string, string];
  answer: AnswerLetter;
};

type QuestionState = {
  answered: boolean;
  selected: AnswerLetter | null;
  correct: boolean | null;
};

const QUESTIONS: Question[] = [
  { id: 1, topic: "applications", text: "Simulation helps test machine layouts, production schedules, bottlenecks, and downtime or delays. This application refers to _____.", options: ["Evaluating Service Organizations", "Designing and Operating Transportation Systems", "Designing and Analyzing Manufacturing Systems", "Re-engineering of Business Processes"], answer: "C" },
  { id: 2, topic: "applications", text: "Simulation helps determine required bandwidth, router capacity, and the best communication protocols. This problem area is _____.", options: ["Designing Computer Systems", "Determining Hardware Requirements for Manufacturing", "Determining Hardware Requirements or Protocols for Communication Networks", "Analyzing Supply Chains"], answer: "C" },
  { id: 3, topic: "applications", text: "Simulation is used to estimate CPU speed, memory requirements, and software response time in _____.", options: ["Determining Hardware Requirements or Protocols for Communication Networks", "Manufacturing System Analysis", "Determining Hardware and Software Requirements for a Computer System", "Evaluating Service Organizations"], answer: "C" },
  { id: 4, topic: "applications", text: "Transportation systems that involve vehicles, passengers, traffic signals, and time constraints are best studied under _____.", options: ["Designing and Analyzing Manufacturing Systems", "Designing and Operating Transportation Systems", "Analyzing Supply Chains", "Re-engineering Business Processes"], answer: "B" },
  { id: 5, topic: "applications", text: "Simulation focusing on customer waiting time, number of servers, and service speed applies to _____.", options: ["Determining Hardware and Software Requirements for a Computer System", "Designing and Operating Transportation Systems", "Evaluating Service Organizations", "Analyzing Supply Chains"], answer: "C" },
  { id: 6, topic: "applications", text: "Simulation that compares old processes with new processes and identifies delays and redundancies is used in _____.", options: ["Determining Ordering Policies for an Inventory System", "Analyzing Supply Chains", "Re-engineering of Business Processes", "Evaluating Service Organizations"], answer: "C" },
  { id: 7, topic: "applications", text: "Supply chains consisting of suppliers, manufacturers, warehouses, and retailers are analyzed through simulation under _____.", options: ["Evaluating Service Organizations", "Analyzing Supply Chains", "Manufacturing System Design", "Inventory Ordering Systems"], answer: "B" },
  { id: 8, topic: "applications", text: "Simulation that helps minimize shortages and overstocking is used in _____.", options: ["Supply Chain Transportation", "Manufacturing Process Control", "Determining Ordering Policies for an Inventory System", "Evaluating Service Speed"], answer: "C" },
  { id: 9, topic: "applications", text: "Simulation involving equipment, workers, transportation, and safety concerns applies to _____.", options: ["Designing Manufacturing Systems", "Evaluating Service Organizations", "Analyzing Mining Operations", "Designing Transportation Systems"], answer: "C" },
  { id: 10, topic: "advantages", text: "Which statement BEST describes an advantage of simulation?", options: ["It completely eliminates real-world risks", "It allows safe and cost-effective experimentation", "It removes the need for physical testing", "It guarantees accurate real-life results"], answer: "B" },
  { id: 11, topic: "advantages", text: "One major benefit of simulation is its ability to _____.", options: ["Replace real systems permanently", "Predict future behavior of a system", "Avoid using assumptions in modeling", "Provide exact real-time outcomes"], answer: "B" },
  { id: 12, topic: "advantages", text: "Which advantage of simulation enables comparison of different outcomes?", options: ["Analyzing complex systems", "Predicting future behavior", "Testing multiple scenarios", "Simplifying system structure"], answer: "C" },
  { id: 13, topic: "advantages", text: "Why does simulation accuracy sometimes become a problem?", options: ["Because models run on computers", "Because results are generated randomly", "Because accuracy depends on assumptions", "Because simulation is cost-effective"], answer: "C" },
  { id: 14, topic: "advantages", text: "Which factor is considered a disadvantage of simulation?", options: ["It requires time to develop and analyze models", "It helps in understanding complex systems", "It allows testing without real-world risk", "It predicts system behavior"], answer: "A" },
  { id: 15, topic: "advantages", text: "Which situation represents a common pitfall in simulation modeling?", options: ["Using different scenarios for testing", "Including variability in the model", "Ignoring randomness or variability", "Evaluating multiple outputs"], answer: "C" },
  { id: 16, topic: "advantages", text: "Over-simplifying a simulation model may result in _____.", options: ["Faster execution with better accuracy", "Easier implementation without loss of meaning", "Misleading or incorrect results", "Improved representation of the real system"], answer: "C" },
  { id: 17, topic: "advantages", text: "Which pitfall occurs when simulation output is not properly analyzed?", options: ["Over-simplifying the system", "Ignoring system complexity", "Misinterpreting simulation results", "Assuming randomness exists"], answer: "C" },
  { id: 18, topic: "advantages", text: "Which statement BEST describes a disadvantage of simulation?", options: ["It supports experimentation on complex systems", "It allows testing of many alternatives", "It depends heavily on computing resources", "It improves system understanding"], answer: "C" },
  { id: 19, topic: "advantages", text: "Which option reflects a limitation rather than a benefit of simulation?", options: ["Predicting system behavior", "Analyzing complex processes", "Depending on assumptions for accuracy", "Evaluating different scenarios"], answer: "C" },
  { id: 20, topic: "when", text: "Simulation is MOST appropriate to use when _____.", options: ["Real systems are easy and cheap to modify", "Real systems are expensive, dangerous, or complex to test", "Real systems require no experimentation", "Real systems always have analytical solutions"], answer: "B" },
  { id: 21, topic: "when", text: "Which situation BEST justifies the use of simulation?", options: ["When changes can be safely applied directly", "When real-world testing involves risk or high cost", "When exact formulas are readily available", "When system behavior is fully predictable"], answer: "B" },
  { id: 22, topic: "when", text: "Simulation is useful for testing \"what-if\" scenarios because it allows _____.", options: ["Immediate real system modification", "Evaluation of alternatives before implementation", "Removal of uncertainty from decisions", "Elimination of modeling assumptions"], answer: "B" },
  { id: 23, topic: "when", text: "Why are \"what-if\" scenarios commonly analyzed using simulation?", options: ["They remove system complexity", "They allow safe experimentation before real changes", "They replace the need for planning", "They guarantee optimal decisions"], answer: "B" },
  { id: 24, topic: "when", text: "Simulation is preferred when analytical formulas are not used because they _____.", options: ["Are always inaccurate", "Are impractical or unavailable", "Require computer programming", "Are too simple"], answer: "B" },
  { id: 25, topic: "when", text: "Which condition MOST strongly indicates the need for simulation?", options: ["Simple systems with known equations", "Systems with exact mathematical models", "Systems lacking practical analytical solutions", "Systems with predictable outcomes"], answer: "C" },
  { id: 26, topic: "when", text: "Which of the following is NOT a reason to use simulation?", options: ["Testing changes before real implementation", "Avoiding experimentation on real systems", "Replacing all analytical methods", "Handling complex systems"], answer: "C" },
  { id: 27, topic: "when", text: "Simulation is often chosen over direct experimentation primarily to _____.", options: ["Speed up real-world processes", "Reduce cost and risk", "Eliminate uncertainty completely", "Avoid data collection"], answer: "B" },
  { id: 28, topic: "when", text: "When a system is too complex for direct mathematical analysis, simulation helps by _____.", options: ["Ignoring system details", "Approximating system behavior", "Removing variability", "Providing exact predictions"], answer: "B" },
  { id: 29, topic: "when", text: "The MAIN reason simulation is used instead of real experimentation is to _____.", options: ["Guarantee perfect results", "Safely explore possible outcomes", "Eliminate the need for models", "Avoid computational effort"], answer: "B" },
  { id: 30, topic: "concepts", text: "What refers to the imitation of a real-world process or system over time, usually via a model?", options: ["System", "Model", "Simulation", "Experiment"], answer: "C" },
  { id: 31, topic: "concepts", text: "Which type of system includes randomness where different runs produce different results?", options: ["Deterministic", "Continuous", "Stochastic", "Discrete"], answer: "C" },
  { id: 32, topic: "concepts", text: "What type of system produces the same output for the same input every time?", options: ["Stochastic", "Dynamic", "Deterministic", "Simulation-based"], answer: "C" },
  { id: 33, topic: "concepts", text: "Using a model to study the behavior of a system is known as:", options: ["Modeling", "Simulation", "Verification", "Validation"], answer: "B" },
  { id: 34, topic: "concepts", text: "What is a simplified representation of a real system?", options: ["System", "Simulation", "Process", "Model"], answer: "D" },
  { id: 35, topic: "concepts", text: "A collection of interacting components forming a whole is called a:", options: ["Model", "Simulation", "System", "Process"], answer: "C" },
  { id: 36, topic: "concepts", text: "Problems solved using computer models are classified as:", options: ["Analytical", "Manual", "Simulation-based", "Deterministic"], answer: "C" },
  { id: 37, topic: "concepts", text: "Problems solved using mathematical formulas are known as:", options: ["Simulation-based", "Analytical", "Experimental", "Stochastic"], answer: "B" },
  { id: 38, topic: "concepts", text: "Which type of system includes time evolution?", options: ["Static", "Discrete", "Dynamic", "Deterministic"], answer: "C" },
  { id: 39, topic: "concepts", text: "A system that changes only at specific points in time is called:", options: ["Continuous", "Dynamic", "Discrete", "Stochastic"], answer: "C" },
  { id: 40, topic: "concepts", text: "A system that changes smoothly over time is classified as:", options: ["Discrete", "Continuous", "Static", "Deterministic"], answer: "B" },
  { id: 41, topic: "concepts", text: "A simulation where state changes occur only at specific events is known as:", options: ["Continuous Simulation", "Discrete-Event Simulation", "Deterministic Simulation", "Analytical Simulation"], answer: "B" },
  { id: 42, topic: "steps", text: "Comparing simulation results with the real system is referred to as:", options: ["Verification", "Translation", "Validation", "Execution"], answer: "C" },
  { id: 43, topic: "steps", text: "Ensuring the logic and code of a simulation work as intended is known as:", options: ["Validation", "Verification", "Translation", "Interpretation"], answer: "B" },
  { id: 44, topic: "steps", text: "Converting a conceptual model into a computer program is called:", options: ["Model Conceptualization", "Model Translation", "Simulation Execution", "Output Analysis"], answer: "B" },
  { id: 45, topic: "steps", text: "Parameter variations and simulation length are part of which phase?", options: ["Simulation Execution", "Experimental Design", "Validation", "Implementation"], answer: "B" },
  { id: 46, topic: "steps", text: "Running the simulation and collecting output data belongs to:", options: ["Model Translation", "Simulation Execution", "Output Analysis", "Documentation"], answer: "B" },
  { id: 47, topic: "steps", text: "Interpreting findings from simulation results for decision-making is called:", options: ["Verification", "Validation", "Output Analysis and Interpretation", "Implementation"], answer: "C" },
  { id: 48, topic: "steps", text: "Documenting assumptions, model details, and results is part of:", options: ["Simulation Execution", "Documentation and Reporting", "Validation", "Experimental Design"], answer: "B" },
  { id: 49, topic: "steps", text: "Applying simulation recommendations to the real system is known as:", options: ["Verification", "Validation", "Implementation", "Translation"], answer: "C" },
  { id: 50, topic: "steps", text: "Creating a conceptual or logical model is called:", options: ["Model Translation", "Model Conceptualization", "Simulation Execution", "Output Analysis"], answer: "B" },
];

const LETTERS: AnswerLetter[] = ["A", "B", "C", "D"];
const TOTAL_QUESTIONS = QUESTIONS.length;

function createInitialState(): Record<number, QuestionState> {
  return Object.fromEntries(
    QUESTIONS.map((question) => [question.id, { answered: false, selected: null, correct: null }]),
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

export default function QuizApp() {
  const [state, setState] = useState<Record<number, QuestionState>>(createInitialState);
  const [mode, setMode] = useState<Mode>("quiz");
  const [filter, setFilter] = useState<Filter>("all");
  const [displayOrder, setDisplayOrder] = useState<Question[]>(() => [...QUESTIONS]);
  const [resultsOpen, setResultsOpen] = useState(false);

  const summary = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let answered = 0;

    for (const question of QUESTIONS) {
      const item = state[question.id];
      if (item.answered) {
        answered += 1;
        if (item.correct) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }
    }

    const skipped = TOTAL_QUESTIONS - answered;
    const percentage = Math.round((correct / TOTAL_QUESTIONS) * 100);

    return { correct, wrong, answered, skipped, percentage, passed: percentage >= 75 };
  }, [state]);

  const visibleQuestions = useMemo(() => {
    let questions = displayOrder;

    if (filter !== "all") {
      questions = questions.filter((question) => question.topic === filter);
    }

    if (mode === "missed") {
      questions = questions.filter((question) => state[question.id].answered && !state[question.id].correct);
    }

    return questions;
  }, [displayOrder, filter, mode, state]);

  function handleAnswer(questionId: number, selected: AnswerLetter) {
    setState((current) => {
      const currentItem = current[questionId];
      if (currentItem.answered) {
        return current;
      }

      const question = QUESTIONS.find((entry) => entry.id === questionId);
      if (!question) {
        return current;
      }

      const correct = selected === question.answer;

      return {
        ...current,
        [questionId]: { answered: true, selected, correct },
      };
    });

    window.setTimeout(() => {
      const nextCard = document.querySelector<HTMLElement>(
        ".question-card:not(.answered-correct):not(.answered-wrong)",
      );
      nextCard?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  function resetAll() {
    setState(createInitialState());
    setDisplayOrder([...QUESTIONS]);
    setMode("quiz");
    setFilter("all");
    setResultsOpen(false);
  }

  function handleShuffle() {
    setDisplayOrder(shuffleQuestions(QUESTIONS));
  }

  return (
    <main className="app-shell">
      <header className="header">
        <div className="tag">Stingmulation Exam</div>
        <h1 className="title">
          Stingimulation Systems
          <br />
          1st Examination
        </h1>
        <p className="subtitle">50 items · Systems Simulation & Modeling</p>
      </header>

      <section className="score-bar" aria-label="Quiz progress">
        <div className="score-item">
          <div className="label">Correct</div>
          <div className="value correct-color">{summary.correct}</div>
        </div>

        <div className="progress-wrap">
          <div className="progress-meta">
            <span style={{ color: "var(--muted)" }}>{summary.answered} / {TOTAL_QUESTIONS} answered</span>
            <span style={{ color: "var(--accent)" }}>{Math.round((summary.answered / TOTAL_QUESTIONS) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round((summary.answered / TOTAL_QUESTIONS) * 100)}%` }} />
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
          onClick={() => setMode("quiz")}
        >
          Quiz Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "review" ? "active" : ""}`}
          onClick={() => setMode("review")}
        >
          Review Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "missed" ? "active" : ""}`}
          onClick={() => setMode("missed")}
        >
          Missed Only
        </button>
      </section>

      <section className="filter-bar" aria-label="Topic filters">
        <button type="button" className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All Topics
        </button>
        <button type="button" className={`filter-btn ${filter === "applications" ? "active" : ""}`} onClick={() => setFilter("applications")}>
          Applications
        </button>
        <button type="button" className={`filter-btn ${filter === "advantages" ? "active" : ""}`} onClick={() => setFilter("advantages")}>
          Advantages/Disadvantages
        </button>
        <button type="button" className={`filter-btn ${filter === "when" ? "active" : ""}`} onClick={() => setFilter("when")}>
          When to Use
        </button>
        <button type="button" className={`filter-btn ${filter === "concepts" ? "active" : ""}`} onClick={() => setFilter("concepts")}>
          Core Concepts
        </button>
        <button type="button" className={`filter-btn ${filter === "steps" ? "active" : ""}`} onClick={() => setFilter("steps")}>
          Simulation Steps
        </button>
      </section>

      <section className="question-list" aria-live="polite">
        {visibleQuestions.length === 0 ? (
          <div className="no-questions">NO QUESTIONS MATCH THIS FILTER</div>
        ) : (
          visibleQuestions.map((question, index) => {
            const current = state[question.id];
            const isReview = mode === "review";
            const isAnswered = current.answered;
            const answeredCorrectly = Boolean(current.correct);
            const isDisabled = isAnswered || isReview;

            return (
              <article
                key={question.id}
                className={`question-card ${isAnswered && answeredCorrectly ? "answered-correct" : ""} ${isAnswered && !answeredCorrectly ? "answered-wrong" : ""}`}
                style={{ animationDelay: `${index * 0.03}s` }}
                id={`card-${question.id}`}
              >
                <div className="q-header">
                  <div className="q-num">Q{String(question.id).padStart(2, "0")}</div>
                  <div className="q-text">{question.text}</div>
                </div>

                <div className="q-options">
                  {question.options.map((option, optionIndex) => {
                    const letter = LETTERS[optionIndex];
                    let className = "option-btn";

                    if (isReview) {
                      if (letter === question.answer) {
                        className += " reveal-correct";
                      }
                    } else if (isAnswered) {
                      if (letter === question.answer) {
                        className += " correct";
                      } else if (letter === current.selected) {
                        className += " wrong";
                      }
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        className={className}
                        disabled={isDisabled}
                        onClick={() => handleAnswer(question.id, letter)}
                      >
                        <span className="letter">{letter}.</span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered ? (
                  current.correct ? (
                    <div className="q-feedback correct-fb show">CORRECT</div>
                  ) : (
                    <div className="q-feedback wrong-fb show">
                      WRONG - Answer: {question.answer}. {question.options[LETTERS.indexOf(question.answer)]}
                    </div>
                  )
                ) : null}
              </article>
            );
          })
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