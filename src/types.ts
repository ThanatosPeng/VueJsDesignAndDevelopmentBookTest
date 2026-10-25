export type PartId =
  | 'part-1'
  | 'part-2'
  | 'part-3'
  | 'part-4'
  | 'part-5'
  | 'part-6'

export interface BookPart {
  id: PartId
  order: number
  title: string
  kicker: string
  description: string
  accent: string
  chapterIds: number[]
}

export interface KnowledgePoint {
  id: string
  sectionId: string
  chapterId: number
  index: number
  title: string
  detail: string
  questionIds: string[]
}

export interface KnowledgeSection {
  id: string
  title: string
  page: number
  overview: string
  points: string[]
  pitfall?: string
}

export interface Chapter {
  id: number
  partId: PartId
  title: string
  page: number
  tagline: string
  summary: string
  designQuestion: string
  sections: KnowledgeSection[]
}

export type QuestionType = 'single' | 'multiple' | 'judge'
export type Difficulty = '基础' | '进阶' | '挑战'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  chapterId: number
  sectionId: string
  pointIds: string[]
  concept: string
  type: QuestionType
  difficulty: Difficulty
  stem: string
  code?: string
  options: QuestionOption[]
  answer: string[]
  explanation: string
}

export type QuestionSeed = Omit<Question, 'pointIds'>

export type ScopeType = 'chapter' | 'section' | 'point' | 'all' | 'wrong'

export interface QuizScope {
  type: ScopeType
  id?: number | string
  title: string
  subtitle: string
}

export interface AnswerMap {
  [questionId: string]: string[]
}

export interface SectionDiagnosis {
  sectionId: string
  chapterId: number
  correct: number
  total: number
  accuracy: number
  wrongConcepts: string[]
}

export interface PointDiagnosis {
  pointId: string
  sectionId: string
  chapterId: number
  correct: number
  total: number
  accuracy: number
}

export interface Attempt {
  id: string
  scope: QuizScope
  questionIds: string[]
  answers: AnswerMap
  startedAt: number
  finishedAt: number
  durationSec: number
  score: number
  correctCount: number
  total: number
  sectionResults: SectionDiagnosis[]
  pointResults?: PointDiagnosis[]
}

export interface LatestAnswer {
  questionId: string
  correct: boolean
  attemptedAt: number
}

export interface MasteryView {
  answered: number
  total: number
  correct: number
  accuracy: number | null
}

export interface WeakSection {
  chapterId: number
  sectionId: string
  accuracy: number
  total: number
  correct: number
  wrongConcepts: string[]
}

export interface WeakKnowledgePoint extends WeakSection {
  pointId: string
  title: string
  detail: string
  questionCount: number
}
