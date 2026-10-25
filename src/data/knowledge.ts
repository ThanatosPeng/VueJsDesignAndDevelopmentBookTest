import type { KnowledgePoint } from '@/types'
import { chapters } from './book'
import { pointTitleMap } from './pointTitles'
import { questionsByPoint } from './questions'
import { pointIdFor } from './questions/pointMap'

function derivePointTitle(detail: string) {
  const plain = detail
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const firstSentence = plain.split(/[。；]/)[0]?.trim() || plain
  if (firstSentence.length <= 32) return firstSentence
  return `${firstSentence.slice(0, 30).trim()}…`
}

export const knowledgePoints: KnowledgePoint[] = []

for (const chapter of chapters) {
  for (const section of chapter.sections) {
    const entries = section.points.map((detail, index) => {
      const id = pointIdFor(section.id, index + 1)
      const relatedQuestions = questionsByPoint.get(id) ?? []
      return {
        id,
        sectionId: section.id,
        chapterId: chapter.id,
        index: index + 1,
        concept: relatedQuestions[0]?.concept ?? '',
        detail,
        questionIds: relatedQuestions.map((question) => question.id),
      }
    })
    const conceptCounts = new Map<string, number>()
    for (const entry of entries) {
      if (!entry.concept) continue
      conceptCounts.set(entry.concept, (conceptCounts.get(entry.concept) ?? 0) + 1)
    }

    for (const entry of entries) {
      const useConceptTitle =
        Boolean(entry.concept) && conceptCounts.get(entry.concept) === 1
      knowledgePoints.push({
        id: entry.id,
        sectionId: entry.sectionId,
        chapterId: entry.chapterId,
        index: entry.index,
        title:
          pointTitleMap[entry.id] ??
          (useConceptTitle ? entry.concept : derivePointTitle(entry.detail)),
        detail: entry.detail,
        questionIds: entry.questionIds,
      })
    }
  }
}

export const knowledgePointById = new Map(
  knowledgePoints.map((point) => [point.id, point]),
)

export const knowledgePointsBySection = new Map<string, KnowledgePoint[]>()
export const knowledgePointsByChapter = new Map<number, KnowledgePoint[]>()

for (const point of knowledgePoints) {
  const sectionList = knowledgePointsBySection.get(point.sectionId) ?? []
  sectionList.push(point)
  knowledgePointsBySection.set(point.sectionId, sectionList)

  const chapterList = knowledgePointsByChapter.get(point.chapterId) ?? []
  chapterList.push(point)
  knowledgePointsByChapter.set(point.chapterId, chapterList)
}

export const totalKnowledgePoints = knowledgePoints.length
export const assessableKnowledgePoints = knowledgePoints.filter(
  (point) => point.questionIds.length > 0,
)
export const totalAssessableKnowledgePoints = assessableKnowledgePoints.length

export function getKnowledgePointsForSection(sectionId: string) {
  return knowledgePointsBySection.get(sectionId) ?? []
}

export function getKnowledgePointsForChapter(chapterId: number) {
  return knowledgePointsByChapter.get(chapterId) ?? []
}
