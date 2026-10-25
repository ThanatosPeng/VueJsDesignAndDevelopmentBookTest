import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { chapters, totalSections } from '@/data/book'
import {
  knowledgePoints,
  totalKnowledgePoints,
} from '@/data/knowledge'
import {
  questionById,
  questionsByChapter,
  questionsBySection,
} from '@/data/questions'
import { isAnswerCorrect } from '@/utils/quiz'
import type {
  Attempt,
  LatestAnswer,
  MasteryView,
  WeakKnowledgePoint,
  WeakSection,
} from '@/types'

const STORAGE_KEY = 'vue-design-lab:progress:v1'
const MAX_ATTEMPTS = 100

interface PersistedState {
  attempts: Attempt[]
  lastViewedChapterId: number | null
}

function loadState(): PersistedState {
  if (typeof localStorage === 'undefined') {
    return { attempts: [], lastViewedChapterId: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { attempts: [], lastViewedChapterId: null }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      lastViewedChapterId:
        typeof parsed.lastViewedChapterId === 'number'
          ? parsed.lastViewedChapterId
          : null,
    }
  } catch {
    return { attempts: [], lastViewedChapterId: null }
  }
}

export const useProgressStore = defineStore('progress', () => {
  const initial = loadState()
  const attempts = ref<Attempt[]>(initial.attempts)
  const lastViewedChapterId = ref<number | null>(initial.lastViewedChapterId)

  function persist() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          attempts: attempts.value,
          lastViewedChapterId: lastViewedChapterId.value,
        }),
      )
    } catch {
      // Storage can be unavailable in private mode. The app still works in memory.
    }
  }

  function addAttempt(attempt: Attempt) {
    attempts.value = [attempt, ...attempts.value].slice(0, MAX_ATTEMPTS)
    persist()
  }

  function clearAllData() {
    attempts.value = []
    lastViewedChapterId.value = null
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Storage can be unavailable in private mode.
      }
    }
  }

  function setLastViewedChapter(chapterId: number) {
    lastViewedChapterId.value = chapterId
    persist()
  }

  function getAttempt(attemptId: string) {
    return attempts.value.find((attempt) => attempt.id === attemptId)
  }

  /**
   * For every question we only keep the newest answer across all attempts.
   * Re-answering a question correctly therefore clears it from the wrong book.
   */
  const latestAnswers = computed(() => {
    const result = new Map<string, LatestAnswer>()
    const ascending = [...attempts.value].sort((a, b) => a.finishedAt - b.finishedAt)

    for (const attempt of ascending) {
      for (const questionId of attempt.questionIds) {
        const question = questionById.get(questionId)
        if (!question) continue
        result.set(questionId, {
          questionId,
          correct: isAnswerCorrect(question, attempt.answers[questionId]),
          attemptedAt: attempt.finishedAt,
        })
      }
    }

    return result
  })

  const wrongQuestionIds = computed(() =>
    [...latestAnswers.value.values()]
      .filter((answer) => !answer.correct)
      .map((answer) => answer.questionId)
      .sort((a, b) => {
        const left = questionById.get(a)
        const right = questionById.get(b)
        if (!left || !right) return 0
        return left.chapterId - right.chapterId || left.id.localeCompare(right.id)
      }),
  )

  const sectionStats = computed(() => {
    const stats = new Map<string, MasteryView>()
    for (const [sectionId, sectionQuestions] of questionsBySection) {
      let answered = 0
      let correct = 0
      for (const question of sectionQuestions) {
        const latest = latestAnswers.value.get(question.id)
        if (!latest) continue
        answered += 1
        if (latest.correct) correct += 1
      }
      stats.set(sectionId, {
        answered,
        total: sectionQuestions.length,
        correct,
        accuracy: answered === 0 ? null : Math.round((correct / answered) * 100),
      })
    }
    return stats
  })

  const pointStats = computed(() => {
    const stats = new Map<string, MasteryView>()
    for (const point of knowledgePoints) {
      let answered = 0
      let correct = 0
      for (const questionId of point.questionIds) {
        const latest = latestAnswers.value.get(questionId)
        if (!latest) continue
        answered += 1
        if (latest.correct) correct += 1
      }
      stats.set(point.id, {
        answered,
        total: point.questionIds.length,
        correct,
        accuracy: answered === 0 ? null : Math.round((correct / answered) * 100),
      })
    }
    return stats
  })

  const chapterStats = computed(() => {
    const stats = new Map<number, MasteryView>()
    for (const chapter of chapters) {
      const chapterQuestions = questionsByChapter.get(chapter.id) ?? []
      let answered = 0
      let correct = 0
      for (const question of chapterQuestions) {
        const latest = latestAnswers.value.get(question.id)
        if (!latest) continue
        answered += 1
        if (latest.correct) correct += 1
      }
      stats.set(chapter.id, {
        answered,
        total: chapterQuestions.length,
        correct,
        accuracy: answered === 0 ? null : Math.round((correct / answered) * 100),
      })
    }
    return stats
  })

  const overall = computed(() => {
    const latest = [...latestAnswers.value.values()]
    const correct = latest.filter((answer) => answer.correct).length
    const testedSections = [...sectionStats.value.values()].filter(
      (section) => section.answered > 0,
    ).length
    const weakSections = [...sectionStats.value.entries()].filter(
      ([, section]) => section.accuracy !== null && section.accuracy < 70,
    ).length
    const testedKnowledgePoints = [...pointStats.value.values()].filter(
      (point) => point.answered > 0,
    ).length
    const weakPointCount = [...pointStats.value.values()].filter(
      (point) => point.accuracy !== null && point.accuracy < 70,
    ).length

    return {
      answeredQuestions: latest.length,
      correctQuestions: correct,
      totalQuestions: questionById.size,
      accuracy:
        latest.length === 0 ? null : Math.round((correct / latest.length) * 100),
      testedSections,
      totalSections,
      weakSections,
      testedKnowledgePoints,
      totalKnowledgePoints,
      weakPointCount,
      attemptCount: attempts.value.length,
    }
  })

  const weakSections = computed<WeakSection[]>(() => {
    const result: WeakSection[] = []
    for (const chapter of chapters) {
      for (const section of chapter.sections) {
        const stats = sectionStats.value.get(section.id)
        if (!stats || stats.accuracy === null || stats.accuracy >= 70) continue
        const sectionQuestions = questionsBySection.get(section.id) ?? []
        const wrongConcepts = sectionQuestions
          .filter((question) => {
            const latest = latestAnswers.value.get(question.id)
            return latest && !latest.correct
          })
          .map((question) => question.concept)
        result.push({
          chapterId: chapter.id,
          sectionId: section.id,
          accuracy: stats.accuracy,
          total: stats.total,
          correct: stats.correct,
          wrongConcepts: [...new Set(wrongConcepts)],
        })
      }
    }
    return result.sort((a, b) => a.accuracy - b.accuracy)
  })

  const weakKnowledgePoints = computed<WeakKnowledgePoint[]>(() => {
    const result: WeakKnowledgePoint[] = []
    for (const point of knowledgePoints) {
      const stats = pointStats.value.get(point.id)
      if (!stats || stats.accuracy === null || stats.accuracy >= 70) continue
      const wrongConcepts = point.questionIds
        .map((questionId) => questionById.get(questionId))
        .filter((question): question is NonNullable<typeof question> => Boolean(question))
        .filter((question) => {
          const latest = latestAnswers.value.get(question.id)
          return latest && !latest.correct
        })
        .map((question) => question.concept)
      result.push({
        chapterId: point.chapterId,
        sectionId: point.sectionId,
        pointId: point.id,
        title: point.title,
        detail: point.detail,
        questionCount: point.questionIds.length,
        accuracy: stats.accuracy,
        total: stats.total,
        correct: stats.correct,
        wrongConcepts: [...new Set(wrongConcepts)],
      })
    }
    return result.sort((a, b) => a.accuracy - b.accuracy)
  })

  const lastAttempt = computed(() => attempts.value[0] ?? null)

  function sectionMastery(sectionId: string) {
    return (
      sectionStats.value.get(sectionId) ?? {
        answered: 0,
        total: 0,
        correct: 0,
        accuracy: null,
      }
    )
  }

  function chapterMastery(chapterId: number) {
    return (
      chapterStats.value.get(chapterId) ?? {
        answered: 0,
        total: 0,
        correct: 0,
        accuracy: null,
      }
    )
  }

  function pointMastery(pointId: string) {
    return (
      pointStats.value.get(pointId) ?? {
        answered: 0,
        total: 0,
        correct: 0,
        accuracy: null,
      }
    )
  }

  const nextChapter = computed(() => {
    const untested = chapters.find((chapter) => {
      return chapter.sections.some((section) => {
        const stats = sectionStats.value.get(section.id)
        return !stats || stats.answered === 0
      })
    })
    if (untested) return untested

    const sorted = [...chapters].sort((a, b) => {
      const accuracyA = chapterStats.value.get(a.id)?.accuracy ?? 0
      const accuracyB = chapterStats.value.get(b.id)?.accuracy ?? 0
      return accuracyA - accuracyB
    })
    return sorted[0] ?? chapters[0]
  })

  return {
    attempts,
    lastViewedChapterId,
    latestAnswers,
    wrongQuestionIds,
    sectionStats,
    pointStats,
    chapterStats,
    overall,
    weakSections,
    weakKnowledgePoints,
    lastAttempt,
    nextChapter,
    addAttempt,
    clearAllData,
    getAttempt,
    setLastViewedChapter,
    sectionMastery,
    chapterMastery,
    pointMastery,
  }
})
