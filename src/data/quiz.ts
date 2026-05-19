export type MultipleChoiceQuestion = {
  id: string
  type: 'multipleChoice'
  question: string
  options: string[]
  correctAnswer: string
  groomVideo: string
}

export type TextQuestion = {
  id: string
  type: 'text'
  question: string
  acceptedAnswers: string[]
  displayAnswer: string
  groomVideo: string
}

export type QuizQuestion = MultipleChoiceQuestion | TextQuestion

export const introVideo = '/videos/intro.mp4'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multipleChoice',
    question: 'Placeholder: Where did the bride and groom have their first date?',
    options: ['A cozy cafe', 'The cinema', 'A beach walk', "A friend's party"],
    correctAnswer: 'A cozy cafe',
    groomVideo: '/videos/q1-answer.mp4',
  },
  {
    id: 'q2',
    type: 'text',
    question: 'Placeholder: What is his favorite nickname for her?',
    acceptedAnswers: ['sunshine', 'my sunshine'],
    displayAnswer: 'Sunshine',
    groomVideo: '/videos/q2-answer.mp4',
  },
  {
    id: 'q3',
    type: 'multipleChoice',
    question: 'Placeholder: What habit of hers does he secretly love most?',
    options: [
      'Her dramatic storytelling',
      'Her snack stash',
      'Her dance moves',
      'Her voice notes',
    ],
    correctAnswer: 'Her dramatic storytelling',
    groomVideo: '/videos/q3-answer.mp4',
  },
]
