import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { bookParts, chapters, partById, totalSections } from '@/data/book'
import {
  assessableKnowledgePoints,
  knowledgePointById,
  knowledgePoints,
  totalKnowledgePoints,
} from '@/data/knowledge'
import {
  questionById,
  questions,
  questionsByChapter,
  questionsBySection,
  seedQuestionCount,
  totalQuestions,
  questionPointMap,
} from '@/data/questions'
import { pointIdFor } from '@/data/questions/pointMap'
import { pointTitleMap } from '@/data/pointTitles'
import { useProgressStore } from '@/stores/progress'
import {
  buildPointDiagnoses,
  createAttempt,
  isAnswerCorrect,
  normalizeAnswers,
  shuffle,
} from '@/utils/quiz'
import type { Question, QuizScope } from '@/types'

const chapterScope: QuizScope = {
  type: 'chapter',
  id: 4,
  title: '第 4 章 · 响应系统的作用与实现',
  subtitle: '章节检测',
}

describe('book knowledge structure', () => {
  it('contains all 18 chapters across 6 parts', () => {
    expect(bookParts).toHaveLength(6)
    expect(chapters).toHaveLength(18)
    expect(chapters.map((chapter) => chapter.id)).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    )
  })

  it('has unique chapter and section identifiers', () => {
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(18)
    expect(new Set(chapters.flatMap((chapter) => chapter.sections.map((section) => section.id))).size).toBe(
      totalSections,
    )
    expect(totalSections).toBe(104)
  })

  it('every chapter belongs to a valid part and has learning content', () => {
    for (const chapter of chapters) {
      expect(partById.get(chapter.partId)).toBeTruthy()
      expect(chapter.sections.length).toBeGreaterThan(0)
      for (const section of chapter.sections) {
        expect(section.id.startsWith(`${chapter.id}.`)).toBe(true)
        expect(section.overview.length).toBeGreaterThan(0)
        expect(section.points.length).toBe(3)
      }
    }
  })
})

describe('knowledge point structure', () => {
  it('turns every section into three atomic knowledge points', () => {
    expect(knowledgePoints).toHaveLength(totalSections * 3)
    expect(totalKnowledgePoints).toBe(312)
    expect(new Set(knowledgePoints.map((point) => point.id)).size).toBe(312)

    for (const chapter of chapters) {
      for (const section of chapter.sections) {
        const points = knowledgePoints.filter(
          (point) => point.sectionId === section.id,
        )
        expect(points, `knowledge points for ${section.id}`).toHaveLength(3)
        expect(points.map((point) => point.index)).toEqual([1, 2, 3])
        expect(
          new Set(points.map((point) => point.id)).size,
        ).toBe(3)
        expect(
          new Set(points.map((point) => point.title)).size,
          `titles for ${section.id}`,
        ).toBe(3)
        for (const point of points) {
          expect(pointTitleMap[point.id], `title map for ${point.id}`).toBeTruthy()
          expect(point.title).toBe(pointTitleMap[point.id])
        }

        for (const point of points) {
          expect(point.chapterId).toBe(chapter.id)
          expect(point.title.length).toBeGreaterThan(0)
          expect(point.detail.length).toBeGreaterThan(0)
          expect(point.id).toBe(pointIdFor(section.id, point.index))
          expect(knowledgePointById.get(point.id)).toBe(point)
        }
      }
    }
  })

  it('has a curated title for every atomic knowledge point', () => {
    expect(Object.keys(pointTitleMap)).toHaveLength(312)
    expect(new Set(Object.keys(pointTitleMap)).size).toBe(312)
    for (const point of knowledgePoints) {
      expect(pointTitleMap[point.id], `missing title for ${point.id}`).toBeTruthy()
      expect(point.title).toBe(pointTitleMap[point.id])
    }
  })

  it('maps all questions to valid knowledge points of their own section', () => {
    expect(Object.keys(questionPointMap)).toHaveLength(seedQuestionCount)

    for (const question of questions) {
      expect(question.pointIds.length).toBeGreaterThan(0)
      for (const pointId of question.pointIds) {
        const point = knowledgePointById.get(pointId)
        expect(point, `invalid point ${pointId} for ${question.id}`).toBeTruthy()
        expect(point?.sectionId).toBe(question.sectionId)
        expect(point?.chapterId).toBe(question.chapterId)
      }
    }
  })

  it('gives every knowledge point at least one directly mapped question', () => {
    expect(assessableKnowledgePoints).toHaveLength(totalKnowledgePoints)
    for (const point of knowledgePoints) {
      expect(
        point.questionIds.length,
        `no question for ${point.id} ${point.title}`,
      ).toBeGreaterThan(0)
    }
    expect(
      questions.every((question) => question.id.startsWith('dq-') || questionPointMap[question.id]),
    ).toBe(true)
  })

  it('adds one dedicated deep question for each formerly unassessed knowledge point', () => {
    const deepQuestions = questions.filter((question) => question.id.startsWith('dq-'))
    expect(deepQuestions).toHaveLength(113)
    expect(new Set(deepQuestions.map((question) => question.id)).size).toBe(113)
    expect(
      new Set(deepQuestions.flatMap((question) => question.pointIds)).size,
    ).toBe(113)
    for (const question of deepQuestions) {
      expect(question.pointIds).toHaveLength(1)
      expect(question.id).toBe(`dq-${question.pointIds[0]}`)
      expect(question.stem.length).toBeGreaterThan(10)
      expect(question.explanation.length).toBeGreaterThan(25)
    }
  })

  it('counts every mapped question on its knowledge point', () => {
    for (const point of knowledgePoints) {
      const expectedIds = questions
        .filter((question) => question.pointIds.includes(point.id))
        .map((question) => question.id)
      expect(point.questionIds).toEqual(expectedIds)
    }
  })
})

describe('question bank integrity', () => {
  it('has at least one question for every content section', () => {
    for (const chapter of chapters) {
      for (const section of chapter.sections) {
        const sectionQuestions = questionsBySection.get(section.id)
        expect(sectionQuestions, `missing questions for ${section.id}`).toBeTruthy()
        expect(sectionQuestions?.length).toBeGreaterThan(0)
      }
    }
  })

  it('has unique question IDs and valid section references', () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)
    expect(totalQuestions).toBe(248)
    expect(seedQuestionCount).toBe(135)
    expect(totalQuestions).toBeGreaterThanOrEqual(totalSections)

    for (const question of questions) {
      const chapter = chapters.find((item) => item.id === question.chapterId)
      const section = chapter?.sections.find((item) => item.id === question.sectionId)
      expect(chapter, `invalid chapter for ${question.id}`).toBeTruthy()
      expect(section, `invalid section for ${question.id}`).toBeTruthy()
      expect(questionById.get(question.id)).toBe(question)
    }
  })

  it('has well-formed options and answers', () => {
    for (const question of questions) {
      expect(question.options.length, `${question.id} options`).toBeGreaterThanOrEqual(2)
      const optionValues = new Set(question.options.map((option) => option.value))
      expect(optionValues.size).toBe(question.options.length)
      expect(question.answer.length, `${question.id} answer`).toBeGreaterThan(0)
      expect(new Set(question.answer).size).toBe(question.answer.length)
      for (const value of question.answer) {
        expect(optionValues.has(value), `${question.id} answer ${value}`).toBe(true)
      }

      if (question.type === 'multiple') {
        expect(question.answer.length, `${question.id} should have multiple answers`).toBeGreaterThan(1)
      } else {
        expect(question.answer.length, `${question.id} should have one answer`).toBe(1)
      }

      expect(question.explanation.trim().length, `${question.id} explanation`).toBeGreaterThan(10)
      expect(question.concept.trim().length, `${question.id} concept`).toBeGreaterThan(0)
    }
  })

  it('exposes all chapter questions grouped consistently', () => {
    for (const chapter of chapters) {
      const chapterQuestions = questionsByChapter.get(chapter.id) ?? []
      expect(chapterQuestions.length).toBeGreaterThan(0)
      expect(chapterQuestions.every((question) => question.chapterId === chapter.id)).toBe(true)
    }
  })
})

describe('answer scoring', () => {
  const question: Question = {
    id: 'test-question',
    chapterId: 4,
    sectionId: '4.1',
    pointIds: ['4.1-p1'],
    concept: '测试',
    type: 'multiple',
    difficulty: '基础',
    stem: 'test',
    options: [
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'C', label: 'C' },
      { value: 'D', label: 'D' },
    ],
    answer: ['A', 'C'],
    explanation: 'test explanation is long enough',
  }

  it('accepts multiple answers regardless of selection order', () => {
    expect(isAnswerCorrect(question, ['C', 'A'])).toBe(true)
  })

  it('requires exact answers for multiple choice', () => {
    expect(isAnswerCorrect(question, ['A'])).toBe(false)
    expect(isAnswerCorrect(question, ['A', 'B'])).toBe(false)
    expect(isAnswerCorrect(question, ['A', 'B', 'C'])).toBe(false)
  })

  it('treats unanswered questions as incorrect and calculates diagnostics', () => {
    const first = questions.find((item) => item.id === 'q1-01')!
    const second = questions.find((item) => item.id === 'q1-03')!
    const attempt = createAttempt({
      scope: { type: 'section', id: '1.1', title: '测试', subtitle: '' },
      questions: [first, second],
      answers: { [first.id]: first.answer },
      startedAt: Date.now() - 5000,
    })

    expect(attempt.correctCount).toBe(1)
    expect(attempt.total).toBe(2)
    expect(attempt.score).toBe(50)
    expect(attempt.answers).toEqual({ [first.id]: first.answer })
    expect(attempt.sectionResults).toHaveLength(2)
    expect(attempt.sectionResults.find((row) => row.sectionId === '1.1')?.accuracy).toBe(100)
    expect(attempt.sectionResults.find((row) => row.sectionId === '1.3')?.accuracy).toBe(0)
    expect(attempt.pointResults).toHaveLength(3)
    expect(attempt.pointResults?.find((row) => row.pointId === '1.1-p2')?.accuracy).toBe(100)
    expect(attempt.pointResults?.find((row) => row.pointId === '1.3-p1')?.accuracy).toBe(0)
    expect(attempt.durationSec).toBeGreaterThanOrEqual(1)
  })

  it('builds point diagnoses independently from section diagnoses', () => {
    const question = questions.find((item) => item.id === 'q1-03')!
    const result = buildPointDiagnoses(
      [question],
      { [question.id]: question.answer },
    )
    expect(result.map((row) => row.pointId).sort()).toEqual(['1.3-p1', '1.3-p2'])
    expect(result.every((row) => row.accuracy === 100)).toBe(true)
  })

  it('normalizes selections and preserves all items when shuffling', () => {
    expect(normalizeAnswers(['B', 'A', 'B'])).toEqual(['A', 'B'])
    const original = ['a', 'b', 'c', 'd', 'e']
    const shuffled = shuffle(original)
    expect(shuffled).toHaveLength(original.length)
    expect([...shuffled].sort()).toEqual([...original].sort())
    expect(original).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('progress store diagnostics', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('tracks latest answer state and clears a mastered question from the wrong book', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q4-04')!

    const wrongAttempt = createAttempt({
      scope: chapterScope,
      questions: [question],
      answers: { [question.id]: [question.options.find((option) => !question.answer.includes(option.value))!.value] },
      startedAt: Date.now() - 2000,
    })
    store.addAttempt(wrongAttempt)
    expect(store.wrongQuestionIds).toContain(question.id)
    expect(store.sectionMastery(question.sectionId).accuracy).toBe(0)

    const correctAttempt = createAttempt({
      scope: chapterScope,
      questions: [question],
      answers: { [question.id]: question.answer },
      startedAt: Date.now() - 1000,
    })
    store.addAttempt(correctAttempt)

    expect(store.wrongQuestionIds).not.toContain(question.id)
    expect(store.sectionMastery(question.sectionId).accuracy).toBe(100)
    expect(store.pointMastery(question.pointIds[0]).accuracy).toBe(100)
    expect(store.overall.attemptCount).toBe(2)
    expect(store.getAttempt(correctAttempt.id)?.score).toBe(100)
  })

  it('lets a reviewed wrong question leave the queue without changing mastery', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q5-04')!
    const wrongOption = question.options.find(
      (option) => !question.answer.includes(option.value),
    )!.value

    store.addAttempt(
      createAttempt({
        scope: chapterScope,
        questions: [question],
        answers: { [question.id]: [wrongOption] },
        startedAt: Date.now() - 1000,
      }),
    )
    expect(store.wrongQuestionIds).toContain(question.id)
    const masteryBefore = store.pointMastery(question.pointIds[0]).accuracy

    expect(store.markWrongQuestionReviewed(question.id)).toBe(true)
    expect(store.wrongQuestionIds).not.toContain(question.id)
    expect(store.pointMastery(question.pointIds[0]).accuracy).toBe(masteryBefore)
    expect(store.weakKnowledgePoints.some((point) => point.pointId === question.pointIds[0])).toBe(true)

    store.addAttempt(
      createAttempt({
        scope: chapterScope,
        questions: [question],
        answers: { [question.id]: [wrongOption] },
        startedAt: Date.now() - 500,
      }),
    )
    expect(store.wrongQuestionIds).toContain(question.id)
  })

  it('can clear the whole wrong-book queue and persist that review state', () => {
    const store = useProgressStore()
    const first = questions.find((item) => item.id === 'q3-01')!
    const second = questions.find((item) => item.id === 'q6-01')!
    const wrongValue = (question: Question) =>
      question.options.find((option) => !question.answer.includes(option.value))!.value

    store.addAttempt(
      createAttempt({
        scope: chapterScope,
        questions: [first, second],
        answers: {
          [first.id]: [wrongValue(first)],
          [second.id]: [wrongValue(second)],
        },
        startedAt: Date.now() - 1000,
      }),
    )
    expect(store.wrongQuestionIds).toHaveLength(2)

    expect(store.dismissAllWrongQuestions()).toBe(2)
    expect(store.wrongQuestionIds).toHaveLength(0)
    expect(store.overall.weakPointCount).toBeGreaterThan(0)

    setActivePinia(createPinia())
    const restored = useProgressStore()
    expect(restored.wrongQuestionIds).toHaveLength(0)
    expect(restored.attempts).toHaveLength(1)
  })
  it('calculates weak knowledge points at atomic granularity', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q4-06')!
    const attempt = createAttempt({
      scope: chapterScope,
      questions: [question],
      answers: {},
      startedAt: Date.now() - 1000,
    })
    store.addAttempt(attempt)

    expect(store.weakKnowledgePoints.length).toBeGreaterThan(0)
    expect(
      store.weakKnowledgePoints.every((point) =>
        question.pointIds.includes(point.pointId),
      ),
    ).toBe(true)
    expect(store.overall.testedKnowledgePoints).toBeGreaterThan(0)
    expect(store.overall.totalKnowledgePoints).toBe(totalKnowledgePoints)
  })

  it('can clear all local progress and the persisted storage key', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q4-01')!
    store.setLastViewedChapter(4)
    store.addAttempt(
      createAttempt({
        scope: chapterScope,
        questions: [question],
        answers: { [question.id]: question.answer },
        startedAt: Date.now() - 1000,
      }),
    )
    expect(store.attempts).toHaveLength(1)
    expect(store.lastViewedChapterId).toBe(4)

    store.clearAllData()

    expect(store.attempts).toHaveLength(0)
    expect(store.lastViewedChapterId).toBeNull()
    expect(store.overall.attemptCount).toBe(0)
    expect(store.overall.testedKnowledgePoints).toBe(0)
    expect(store.wrongQuestionIds).toHaveLength(0)
    expect(localStorage.getItem('vue-design-lab:progress:v1')).toBeNull()
  })

  it('keeps a skipped question in the review queue and counts it as incorrect', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q4-01')!

    const attempt = createAttempt({
      scope: chapterScope,
      questions: [question],
      answers: {},
      startedAt: Date.now() - 1000,
    })
    store.addAttempt(attempt)

    expect(attempt.correctCount).toBe(0)
    expect(store.wrongQuestionIds).toContain(question.id)
    expect(store.sectionMastery(question.sectionId).answered).toBe(1)
    expect(store.weakSections.some((section) => section.sectionId === question.sectionId)).toBe(true)
  })

  it('persists attempts for result pages', () => {
    const store = useProgressStore()
    const question = questions.find((item) => item.id === 'q6-03')!
    const attempt = createAttempt({
      scope: chapterScope,
      questions: [question],
      answers: { [question.id]: question.answer },
      startedAt: Date.now() - 1000,
    })
    store.addAttempt(attempt)
    expect(localStorage.getItem('vue-design-lab:progress:v1')).toBeTruthy()

    setActivePinia(createPinia())
    const restored = useProgressStore()
    expect(restored.attempts).toHaveLength(1)
    expect(restored.getAttempt(attempt.id)?.questionIds).toEqual([question.id])
  })
})
