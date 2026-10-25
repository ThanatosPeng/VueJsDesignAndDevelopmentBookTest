import type { Question, QuestionSeed } from '@/types'
import { chapters } from '../book'
import { part1ExtraQuestions } from './extra/part1'
import { part2ExtraQuestions } from './extra/part2'
import { part3ExtraQuestions } from './extra/part3'
import { part4ExtraQuestions } from './extra/part4'
import { part5ExtraQuestions } from './extra/part5'
import { part6ExtraQuestions } from './extra/part6'
import { questionPointMap, pointIdFor } from './pointMap'
import { part1Questions } from './part1'
import { part2Questions } from './part2'
import { part3Questions } from './part3'
import { part4Questions } from './part4'
import { part5Questions } from './part5'
import { part6Questions } from './part6'

const questionSeeds: QuestionSeed[] = [
  ...part1Questions,
  ...part2Questions,
  ...part3Questions,
  ...part4Questions,
  ...part5Questions,
  ...part6Questions,
]

export const seedQuestionCount = questionSeeds.length

const baseQuestions: Question[] = questionSeeds.map((question) => {
  const pointIndexes = questionPointMap[question.id] ?? [1]
  return {
    ...question,
    pointIds: pointIndexes.map((index) => pointIdFor(question.sectionId, index)),
  }
})

const extraQuestions: Question[] = [
  ...part1ExtraQuestions,
  ...part2ExtraQuestions,
  ...part3ExtraQuestions,
  ...part4ExtraQuestions,
  ...part5ExtraQuestions,
  ...part6ExtraQuestions,
]

const sectionOrder = new Map(
  chapters.flatMap((chapter) =>
    chapter.sections.map((section, index) => [section.id, index] as const),
  ),
)

export const questions: Question[] = [...baseQuestions, ...extraQuestions].sort(
  (left, right) => {
    if (left.chapterId !== right.chapterId) return left.chapterId - right.chapterId
    const leftOrder = sectionOrder.get(left.sectionId) ?? 999
    const rightOrder = sectionOrder.get(right.sectionId) ?? 999
    return leftOrder - rightOrder
  },
)

export const questionById = new Map(questions.map((question) => [question.id, question]))

export const questionsByChapter = new Map<number, Question[]>()
export const questionsBySection = new Map<string, Question[]>()
export const questionsByPoint = new Map<string, Question[]>()

for (const question of questions) {
  const chapterList = questionsByChapter.get(question.chapterId) ?? []
  chapterList.push(question)
  questionsByChapter.set(question.chapterId, chapterList)

  const sectionList = questionsBySection.get(question.sectionId) ?? []
  sectionList.push(question)
  questionsBySection.set(question.sectionId, sectionList)

  for (const pointId of question.pointIds) {
    const pointList = questionsByPoint.get(pointId) ?? []
    pointList.push(question)
    questionsByPoint.set(pointId, pointList)
  }
}

export const totalQuestions = questions.length
export { questionPointMap }
