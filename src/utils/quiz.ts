import type {
  AnswerMap,
  Attempt,
  PointDiagnosis,
  Question,
  QuizScope,
  SectionDiagnosis,
} from '@/types'

export function isAnswerCorrect(question: Question, selected: string[] | undefined) {
  if (!selected || selected.length !== question.answer.length) return false
  const chosen = [...selected].sort()
  const expected = [...question.answer].sort()
  return chosen.every((value, index) => value === expected[index])
}

export function normalizeAnswers(values: string[]) {
  return [...new Set(values)].sort()
}

export function buildPointDiagnoses(
  questions: Question[],
  answers: AnswerMap,
): PointDiagnosis[] {
  const pointMap = new Map<string, PointDiagnosis>()

  for (const question of questions) {
    const correct = isAnswerCorrect(question, answers[question.id])
    for (const pointId of question.pointIds) {
      const existing = pointMap.get(pointId)
      if (existing) {
        existing.total += 1
        if (correct) existing.correct += 1
      } else {
        pointMap.set(pointId, {
          pointId,
          sectionId: question.sectionId,
          chapterId: question.chapterId,
          correct: correct ? 1 : 0,
          total: 1,
          accuracy: 0,
        })
      }
    }
  }

  return [...pointMap.values()].map((point) => ({
    ...point,
    accuracy: Math.round((point.correct / point.total) * 100),
  }))
}

export function createAttempt(params: {
  scope: QuizScope
  questions: Question[]
  answers: AnswerMap
  startedAt: number
  finishedAt?: number
}): Attempt {
  const { scope, questions, answers, startedAt } = params
  const finishedAt = params.finishedAt ?? Date.now()
  const sectionMap = new Map<string, SectionDiagnosis>()
  let correctCount = 0

  for (const question of questions) {
    const correct = isAnswerCorrect(question, answers[question.id])
    if (correct) correctCount += 1

    const existing = sectionMap.get(question.sectionId)
    if (existing) {
      existing.total += 1
      if (correct) existing.correct += 1
      if (!correct && !existing.wrongConcepts.includes(question.concept)) {
        existing.wrongConcepts.push(question.concept)
      }
    } else {
      sectionMap.set(question.sectionId, {
        sectionId: question.sectionId,
        chapterId: question.chapterId,
        correct: correct ? 1 : 0,
        total: 1,
        accuracy: 0,
        wrongConcepts: correct ? [] : [question.concept],
      })
    }
  }

  const sectionResults = [...sectionMap.values()].map((section) => ({
    ...section,
    accuracy: Math.round((section.correct / section.total) * 100),
  }))

  const total = questions.length
  const pointResults = buildPointDiagnoses(questions, answers)

  return {
    id: `attempt-${finishedAt}-${Math.random().toString(36).slice(2, 8)}`,
    scope,
    questionIds: questions.map((question) => question.id),
    answers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, [...value]]),
    ),
    startedAt,
    finishedAt,
    durationSec: Math.max(1, Math.round((finishedAt - startedAt) / 1000)),
    score: total === 0 ? 0 : Math.round((correctCount / total) * 100),
    correctCount,
    total,
    sectionResults,
    pointResults,
  }
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours} 小时 ${minutes % 60} 分`
  }
  return minutes > 0 ? `${minutes} 分 ${rest} 秒` : `${rest} 秒`
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function scoreVerdict(score: number) {
  if (score >= 90) {
    return {
      eyebrow: 'SIGNAL LOCKED',
      title: '内核级理解',
      text: '这一组知识掌握得很稳，可以把重点转向源码细节与边界场景。',
    }
  }
  if (score >= 75) {
    return {
      eyebrow: 'CLEAR PATH',
      title: '结构清晰',
      text: '主干已经连成线，回看标红的节点即可补齐最后一公里。',
    }
  }
  if (score >= 60) {
    return {
      eyebrow: 'NEEDS TUNING',
      title: '基础在线',
      text: '概念大致认识，但关键机制之间的因果关系还不稳定。',
    }
  }
  return {
    eyebrow: 'REBUILD NEEDED',
    title: '需要回炉',
    text: '先别急着刷新题。回到薄弱小节的知识卡，把机制重新串一遍。',
  }
}
