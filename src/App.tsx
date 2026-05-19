import { useState } from 'react'
import './App.css'
import { introVideo, quizQuestions, type QuizQuestion } from './data/quiz'

type Stage = 'intro' | 'question' | 'reveal' | 'video' | 'finish'

type AnswerResult = {
  isCorrect: boolean
  submittedAnswer: string
}

const normalizeAnswer = (answer: string) => answer.trim().toLowerCase()

const getCorrectAnswerLabel = (question: QuizQuestion) =>
  question.type === 'multipleChoice'
    ? question.correctAnswer
    : question.displayAnswer

function App() {
  const [stage, setStage] = useState<Stage>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [shotCount, setShotCount] = useState(0)
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
          <strong>Video placeholder</strong>
          <span>Add the file at {src} when it is ready.</span>
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
            <p className="eyebrow">Bachelorette Quiz Night</p>
            <h1>How well does she know him?</h1>
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
              <p className="section-label">Hosted with love from afar</p>
              <h2>First, play your intro video.</h2>
              <p>
                Replace this placeholder with your game explanation. After the
                intro, start the quiz and let the bride answer each question
                before the groom reveals the truth.
              </p>
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
              <span>{currentQuestion.type === 'text' ? 'Text' : 'Multiple choice'}</span>
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
          <div className="screen reveal-screen">
            <p className="section-label">
              {answerResult.isCorrect ? 'She got it right' : 'Not quite'}
            </p>
            <h2>
              {answerResult.isCorrect
                ? 'No shot needed this time.'
                : 'Wrong answer. Everyone takes a shot.'}
            </h2>
            <div className="answer-card">
              <span>Her answer</span>
              <strong>{answerResult.submittedAnswer}</strong>
            </div>
            <div className="answer-card highlight">
              <span>Correct answer</span>
              <strong>{getCorrectAnswerLabel(currentQuestion)}</strong>
            </div>
            {!answerResult.isCorrect && (
              <p className="shot-note">
                Drink prompt: pause here for the shot before watching the groom
                explain his answer.
              </p>
            )}
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
              End with a toast, a group photo, and one last cheer for the bride.
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

        <footer className="host-note">
          <p>
            Host note: if a video is not ready yet, the placeholder explains
            which file to add.
          </p>
        </footer>
      </section>
    </main>
  )
}

export default App
