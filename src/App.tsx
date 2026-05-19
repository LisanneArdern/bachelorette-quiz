import { useEffect, useState } from 'react'
import './App.css'
import { introVideo, quizQuestions, type QuizQuestion } from './data/quiz'

type Stage = 'intro' | 'question' | 'reveal' | 'video' | 'finish'

type AnswerResult = {
  isCorrect: boolean
  submittedAnswer: string
}

type StoredQuizProgress = {
  stage: Stage
  currentQuestionIndex: number
  selectedOption: string
  textAnswer: string
  answerResult: AnswerResult | null
  correctCount: number
  shotCount: number
}

const quizProgressStorageKey = 'bachelorette-quiz-progress'

const normalizeAnswer = (answer: string) => answer.trim().toLowerCase()

const getCorrectAnswerLabel = (question: QuizQuestion) =>
  question.type === 'multipleChoice'
    ? question.correctAnswer
    : question.displayAnswer

const defaultQuizProgress: StoredQuizProgress = {
  stage: 'intro',
  currentQuestionIndex: 0,
  selectedOption: '',
  textAnswer: '',
  answerResult: null,
  correctCount: 0,
  shotCount: 0,
}

const isStage = (stage: unknown): stage is Stage =>
  ['intro', 'question', 'reveal', 'video', 'finish'].includes(String(stage))

const isAnswerResult = (answerResult: unknown): answerResult is AnswerResult | null => {
  if (answerResult === null) {
    return true
  }

  if (!answerResult || typeof answerResult !== 'object') {
    return false
  }

  const result = answerResult as Record<string, unknown>

  return (
    typeof result.isCorrect === 'boolean' &&
    typeof result.submittedAnswer === 'string'
  )
}

const loadQuizProgress = (): StoredQuizProgress => {
  if (typeof window === 'undefined') {
    return defaultQuizProgress
  }

  const savedProgress = window.localStorage.getItem(quizProgressStorageKey)

  if (!savedProgress) {
    return defaultQuizProgress
  }

  try {
    const parsedProgress = JSON.parse(savedProgress) as Partial<StoredQuizProgress>
    const currentQuestionIndex = Number(parsedProgress.currentQuestionIndex)

    if (
      !isStage(parsedProgress.stage) ||
      !Number.isInteger(currentQuestionIndex) ||
      currentQuestionIndex < 0 ||
      currentQuestionIndex >= quizQuestions.length ||
      !isAnswerResult(parsedProgress.answerResult)
    ) {
      return defaultQuizProgress
    }

    if (
      (parsedProgress.stage === 'reveal' || parsedProgress.stage === 'video') &&
      !parsedProgress.answerResult
    ) {
      return defaultQuizProgress
    }

    return {
      stage: parsedProgress.stage,
      currentQuestionIndex,
      selectedOption:
        typeof parsedProgress.selectedOption === 'string'
          ? parsedProgress.selectedOption
          : '',
      textAnswer:
        typeof parsedProgress.textAnswer === 'string'
          ? parsedProgress.textAnswer
          : '',
      answerResult: parsedProgress.answerResult,
      correctCount:
        typeof parsedProgress.correctCount === 'number' &&
        Number.isInteger(parsedProgress.correctCount)
        ? parsedProgress.correctCount
        : 0,
      shotCount:
        typeof parsedProgress.shotCount === 'number' &&
        Number.isInteger(parsedProgress.shotCount)
        ? parsedProgress.shotCount
        : 0,
    }
  } catch {
    return defaultQuizProgress
  }
}

const confettiPieces = Array.from({ length: 34 }, (_, index) => index)
const shotBurstPieces = Array.from({ length: 10 }, (_, index) => index)

function App() {
  const [initialQuizProgress] = useState(loadQuizProgress)
  const [stage, setStage] = useState<Stage>(initialQuizProgress.stage)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    initialQuizProgress.currentQuestionIndex,
  )
  const [selectedOption, setSelectedOption] = useState(
    initialQuizProgress.selectedOption,
  )
  const [textAnswer, setTextAnswer] = useState(initialQuizProgress.textAnswer)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(
    initialQuizProgress.answerResult,
  )
  const [correctCount, setCorrectCount] = useState(
    initialQuizProgress.correctCount,
  )
  const [shotCount, setShotCount] = useState(initialQuizProgress.shotCount)
  const [videoUnavailable, setVideoUnavailable] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const questionNumber = currentQuestionIndex + 1
  const totalQuestions = quizQuestions.length
  const progressPercent =
    stage === 'intro'
      ? 0
      : stage === 'finish'
        ? 100
        : (questionNumber / totalQuestions) * 100

  useEffect(() => {
    const progress: StoredQuizProgress = {
      stage,
      currentQuestionIndex,
      selectedOption,
      textAnswer,
      answerResult,
      correctCount,
      shotCount,
    }

    window.localStorage.setItem(
      quizProgressStorageKey,
      JSON.stringify(progress),
    )
  }, [
    answerResult,
    correctCount,
    currentQuestionIndex,
    selectedOption,
    shotCount,
    stage,
    textAnswer,
  ])

  const resetAnswerInputs = () => {
    setSelectedOption('')
    setTextAnswer('')
    setAnswerResult(null)
    setVideoUnavailable(false)
  }

  const checkAnswer = () => {
    const submittedAnswer =
      currentQuestion.type === 'multipleChoice' ? selectedOption : textAnswer

    if (!submittedAnswer.trim()) {
      return
    }

    const isCorrect =
      currentQuestion.type === 'multipleChoice'
        ? submittedAnswer === currentQuestion.correctAnswer
        : currentQuestion.acceptedAnswers
            .map(normalizeAnswer)
            .includes(normalizeAnswer(submittedAnswer))

    setAnswerResult({ isCorrect, submittedAnswer })

    if (isCorrect) {
      setCorrectCount((count) => count + 1)
    } else {
      setShotCount((count) => count + 1)
    }

    setStage('reveal')
  }

  const goToVideo = () => {
    setVideoUnavailable(false)
    setStage('video')
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex === totalQuestions - 1) {
      setStage('finish')
      return
    }

    resetAnswerInputs()
    setCurrentQuestionIndex((index) => index + 1)
    setStage('question')
  }

  const restartQuiz = () => {
    resetAnswerInputs()
    setCurrentQuestionIndex(0)
    setCorrectCount(0)
    setShotCount(0)
    setStage('intro')
  }

  const renderVideo = (src: string, title: string) => (
    <div className="video-frame">
      {videoUnavailable ? (
        <div className="video-placeholder">
          <p>{title}</p>
          <strong>Video loading</strong>
          <span>Get ready for the reveal.</span>
        </div>
      ) : (
        <video
          controls
          playsInline
          preload="metadata"
          src={src}
          onError={() => setVideoUnavailable(true)}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )

  return (
    <main className="app-shell">
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />

      <section className="quiz-card" aria-live="polite">
        <div className="card-header">
          <div>
            <p className="eyebrow">Bachelorette Quiz</p>
            <h1>How well do you know him?</h1>
          </div>
          <div className="score-pill">
            <span>{correctCount}</span> correct
          </div>
        </div>

        <div className="progress-track" aria-hidden="true">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {stage === 'intro' && (
          <div className="screen intro-screen">
            <div className="intro-copy">
              <p className="section-label">A little message first</p>
              <h2>Ready for the quiz?</h2>
            </div>
            {renderVideo(introVideo, 'Intro video')}
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                resetAnswerInputs()
                setStage('question')
              }}
            >
              Start the quiz
            </button>
          </div>
        )}

        {stage === 'question' && (
          <div className="screen question-screen">
            <div className="question-meta">
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
            <h2>{currentQuestion.question}</h2>

            {currentQuestion.type === 'multipleChoice' ? (
              <div className="options-grid">
                {currentQuestion.options.map((option) => (
                  <button
                    className={
                      selectedOption === option
                        ? 'option-button selected'
                        : 'option-button'
                    }
                    key={option}
                    type="button"
                    onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <label className="text-answer-label">
                Bride's answer
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(event) => setTextAnswer(event.target.value)}
                  placeholder="Type the answer here"
                />
              </label>
            )}

            <button
              className="primary-button"
              type="button"
              onClick={checkAnswer}
            >
              Lock in answer
            </button>
          </div>
        )}

        {stage === 'reveal' && answerResult && (
          <div
            className={
              answerResult.isCorrect
                ? 'screen reveal-screen correct-reveal'
                : 'screen reveal-screen wrong-reveal'
            }
          >
            {answerResult.isCorrect ? (
              <div className="confetti-burst" aria-hidden="true">
                {confettiPieces.map((piece) => (
                  <span key={piece} />
                ))}
              </div>
            ) : (
              <div className="shot-burst" aria-hidden="true">
                {shotBurstPieces.map((piece) => (
                  <span key={piece} />
                ))}
              </div>
            )}
            <p className="section-label">
              {answerResult.isCorrect ? 'She got it right' : 'Not quite'}
            </p>
            <h2>
              {answerResult.isCorrect
                ? 'Correct! Confetti moment.'
                : 'Wrong answer.'}
            </h2>
            {!answerResult.isCorrect && (
              <div className="shot-callout">
                <span>Drink a shot</span>
                <strong>Everyone drinks now</strong>
              </div>
            )}
            <div className="answer-card">
              <span>Her answer</span>
              <strong>{answerResult.submittedAnswer}</strong>
            </div>
            <div className="answer-card highlight">
              <span>Correct answer</span>
              <strong>{getCorrectAnswerLabel(currentQuestion)}</strong>
            </div>
            <button className="primary-button" type="button" onClick={goToVideo}>
              Play groom's answer
            </button>
          </div>
        )}

        {stage === 'video' && (
          <div className="screen video-screen">
            <p className="question-meta-single">
              Groom reveal for question {questionNumber}
            </p>
            <h2>Now hear it from him.</h2>
            {renderVideo(currentQuestion.groomVideo, 'Groom answer video')}
            <button
              className="primary-button"
              type="button"
              onClick={goToNextQuestion}
            >
              {currentQuestionIndex === totalQuestions - 1
                ? 'See final score'
                : 'Next question'}
            </button>
          </div>
        )}

        {stage === 'finish' && (
          <div className="screen finish-screen">
            <p className="section-label">Final score</p>
            <h2>The bride scored {correctCount} out of {totalQuestions}.</h2>
            <div className="final-stats">
              <div>
                <span>{correctCount}</span>
                <p>Correct answers</p>
              </div>
              <div>
                <span>{shotCount}</span>
                <p>Shots owed</p>
              </div>
            </div>
            <p>
              Cheers to the bride.
            </p>
            <button
              className="secondary-button"
              type="button"
              onClick={restartQuiz}
            >
              Restart quiz
            </button>
          </div>
        )}

      </section>
    </main>
  )
}

export default App
