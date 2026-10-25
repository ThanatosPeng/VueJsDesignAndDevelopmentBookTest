<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flag,
  Layers3,
  ListChecks,
  RotateCcw,
  Target,
  TriangleAlert,
  XCircle,
} from 'lucide-vue-next'
import RingProgress from '@/components/RingProgress.vue'
import MasteryMeter from '@/components/MasteryMeter.vue'
import { chapterById, getSection } from '@/data/book'
import { knowledgePointById } from '@/data/knowledge'
import { questionById } from '@/data/questions'
import { useProgressStore } from '@/stores/progress'
import type { KnowledgePoint, PointDiagnosis, Question } from '@/types'
import {
  buildPointDiagnoses,
  formatDate,
  formatDuration,
  isAnswerCorrect,
  scoreVerdict,
} from '@/utils/quiz'

const route = useRoute()
const progress = useProgressStore()

const attempt = computed(() => progress.getAttempt(String(route.params.attemptId)) ?? null)
const questions = computed(() =>
  (attempt.value?.questionIds ?? [])
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is Question => Boolean(question)),
)
const wrongQuestions = computed(() => {
  if (!attempt.value) return []
  return questions.value.filter(
    (question) =>
      !isAnswerCorrect(question, attempt.value?.answers[question.id]),
  )
})
const pointResults = computed<PointDiagnosis[]>(() => {
  if (!attempt.value) return []
  return (
    attempt.value.pointResults ??
    buildPointDiagnoses(questions.value, attempt.value.answers)
  )
})
const weakPoints = computed(() => {
  if (!attempt.value) return []
  return pointResults.value
    .filter((result) => result.accuracy < 70)
    .map((result) => {
      const point = knowledgePointById.get(result.pointId)
      const section = getSection(result.sectionId)?.section
      const chapter = chapterById.get(result.chapterId)
      if (!point || !section || !chapter) return null
      const wrongConcepts = questions.value
        .filter(
          (question) =>
            question.pointIds.includes(result.pointId) &&
            !isAnswerCorrect(question, attempt.value?.answers[question.id]),
        )
        .map((question) => question.concept)
      return {
        ...result,
        point,
        section,
        chapter,
        wrongConcepts: [...new Set(wrongConcepts)],
      }
    })
    .filter(
      (item): item is NonNullable<typeof item> => Boolean(item),
    )
    .sort((a, b) => a.accuracy - b.accuracy)
})
const groupedPoints = computed(() => {
  const groups = new Map<
    number,
    {
      chapter: NonNullable<ReturnType<typeof chapterById.get>>
      rows: Array<{
        result: PointDiagnosis
        point: KnowledgePoint
        sectionId: string
        sectionTitle: string
      }>
    }
  >()

  for (const result of pointResults.value) {
    const chapter = chapterById.get(result.chapterId)
    const point = knowledgePointById.get(result.pointId)
    const section = getSection(result.sectionId)?.section
    if (!chapter || !point || !section) continue
    const row = {
      result,
      point,
      sectionId: section.id,
      sectionTitle: section.title,
    }
    const existing = groups.get(chapter.id)
    if (existing) existing.rows.push(row)
    else groups.set(chapter.id, { chapter, rows: [row] })
  }

  return [...groups.values()]
})
const verdict = computed(() => scoreVerdict(attempt.value?.score ?? 0))
const unansweredCount = computed(
  () =>
    questions.value.filter(
      (question) => (attempt.value?.answers[question.id]?.length ?? 0) === 0,
    ).length,
)
const scoreTone = computed(() => {
  const score = attempt.value?.score ?? 0
  if (score >= 80) return '#7ce1b3'
  if (score >= 60) return '#e5bd70'
  return '#ee9b84'
})
const backRoute = computed(() => {
  if (!attempt.value) return '/'
  const scope = attempt.value.scope
  if (scope.type === 'point') {
    const point = knowledgePointById.get(String(scope.id))
    if (point) {
      return `/chapter/${point.chapterId}?section=${encodeURIComponent(point.sectionId)}&point=${encodeURIComponent(point.id)}`
    }
  }
  if ((scope.type === 'chapter' || scope.type === 'section') && typeof scope.id !== 'undefined') {
    if (scope.type === 'section') {
      const found = getSection(String(scope.id))
      if (found) {
        return `/chapter/${found.chapter.id}?section=${encodeURIComponent(found.section.id)}`
      }
    } else {
      return `/chapter/${scope.id}`
    }
  }
  if (scope.type === 'wrong') return '/wrong'
  return '/'
})
const retryRoute = computed(() => {
  if (!attempt.value) return { name: 'practice', query: { scope: 'all' } }
  const scope = attempt.value.scope
  if (scope.type === 'chapter') {
    return { name: 'practice', query: { scope: 'chapter', id: String(scope.id) } }
  }
  if (scope.type === 'section') {
    return { name: 'practice', query: { scope: 'section', id: String(scope.id) } }
  }
  if (scope.type === 'point') {
    return { name: 'practice', query: { scope: 'point', id: String(scope.id) } }
  }
  if (scope.type === 'wrong') {
    return { name: 'practice', query: { scope: 'wrong' } }
  }
  return { name: 'practice', query: { scope: 'all' } }
})
const nextChapter = computed(() => progress.nextChapter)
const reportDate = computed(() =>
  attempt.value ? formatDate(attempt.value.finishedAt) : '',
)
const duration = computed(() =>
  attempt.value ? formatDuration(attempt.value.durationSec) : '',
)

function sectionTitle(sectionId: string) {
  return getSection(sectionId)?.section.title ?? sectionId
}

function optionText(question: Question, values: string[] | undefined) {
  if (!values || values.length === 0) return '未作答'
  return values
    .map((value) => {
      const option = question.options.find((item) => item.value === value)
      return option ? `${value}. ${option.label}` : value
    })
    .join(' / ')
}

function correctText(question: Question) {
  return optionText(question, question.answer)
}

function userText(question: Question) {
  return optionText(question, attempt.value?.answers[question.id])
}

function statusOf(accuracy: number) {
  if (accuracy >= 80) return { label: '稳固', className: 'strong' }
  if (accuracy >= 60) return { label: '待巩固', className: 'mid' }
  return { label: '不熟悉', className: 'weak' }
}

function pointReviewTarget(item: { chapterId: number; sectionId: string; pointId: string }) {
  return `/chapter/${item.chapterId}?section=${encodeURIComponent(item.sectionId)}&point=${encodeURIComponent(item.pointId)}`
}

function questionReviewTarget(question: Question) {
  const pointId = question.pointIds[0]
  return `/chapter/${question.chapterId}?section=${encodeURIComponent(question.sectionId)}${
    pointId ? `&point=${encodeURIComponent(pointId)}` : ''
  }`
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}
</script>

<template>
  <div v-if="!attempt" class="page-container not-found-inline">
    <span class="eyebrow">404 / REPORT NOT FOUND</span>
    <h1>找不到这份检测报告</h1>
    <p>它可能来自旧的浏览器记录，或尚未生成。完成一次检测后即可查看诊断。</p>
    <RouterLink to="/" class="btn btn-primary"><ArrowLeft :size="16" /> 返回学习地图</RouterLink>
  </div>

  <div v-else class="result-view">
    <div class="page-container">
      <nav class="breadcrumbs" aria-label="面包屑">
        <RouterLink :to="backRoute">返回学习内容</RouterLink>
        <span>/</span>
        <span>检测报告</span>
        <span>/</span>
        <strong>{{ attempt.scope.title }}</strong>
      </nav>

      <section class="report-hero">
        <div class="report-hero-copy">
          <div class="eyebrow report-eyebrow">
            <span class="report-live-dot" />
            DIAGNOSTIC REPORT · {{ reportDate }}
          </div>
          <span class="report-scope">{{ attempt.scope.subtitle }}</span>
          <h1>{{ attempt.scope.title }}</h1>
          <p class="report-verdict-text">{{ verdict.text }}</p>
          <div class="report-hero-meta">
            <span><Clock3 :size="14" /> {{ duration }}</span>
            <span><ListChecks :size="14" /> {{ attempt.total }} 道题</span>
            <span><Target :size="14" /> {{ pointResults.length }} 个知识颗粒</span>
            <span v-if="unansweredCount"><Flag :size="14" /> {{ unansweredCount }} 道未作答</span>
          </div>
          <div class="report-hero-actions">
            <RouterLink :to="retryRoute" class="btn btn-invert">
              <RotateCcw :size="16" /> 再测一次
            </RouterLink>
            <RouterLink :to="backRoute" class="btn btn-outline-invert">
              <ArrowLeft :size="16" /> 返回复习
            </RouterLink>
          </div>
        </div>

        <div class="report-score-panel">
          <RingProgress :value="attempt.score" :size="188" :stroke="5" :tone="scoreTone">
            <div class="report-ring-content">
              <strong>{{ attempt.score }}</strong>
              <span>SCORE / 100</span>
            </div>
          </RingProgress>
          <div class="report-verdict">
            <span>{{ verdict.eyebrow }}</span>
            <h2>{{ verdict.title }}</h2>
            <p>{{ attempt.correctCount }} / {{ attempt.total }} 题正确</p>
          </div>
        </div>
      </section>

      <section class="report-stats">
        <article>
          <span class="report-stat-label"><CheckCircle2 :size="15" /> 正确题数</span>
          <strong>{{ attempt.correctCount }}<small> / {{ attempt.total }}</small></strong>
        </article>
        <article>
          <span class="report-stat-label"><Target :size="15" /> 本次正确率</span>
          <strong>{{ attempt.score }}<small>%</small></strong>
        </article>
        <article>
          <span class="report-stat-label"><Clock3 :size="15" /> 作答用时</span>
          <strong>{{ duration }}</strong>
        </article>
        <article :class="{ 'has-warning': weakPoints.length > 0 }">
          <span class="report-stat-label"><TriangleAlert :size="15" /> 薄弱知识颗粒</span>
          <strong>{{ weakPoints.length }}<small> 个</small></strong>
        </article>
      </section>

      <div class="report-layout">
        <main class="report-main">
          <section class="report-block">
            <div class="section-heading section-heading--compact">
              <div>
                <span class="eyebrow"><Target :size="13" /> KNOWLEDGE GAPS</span>
                <h2>还不熟悉的知识颗粒</h2>
                <p>
                  {{ weakPoints.length
                    ? '这些原子知识点在本次检测中正确率低于 70%。一个题目可能关联多个知识颗粒，建议逐一回看。'
                    : '本次检测没有发现低于 70% 的知识颗粒。知识结构清晰，可以继续向前。' }}
                </p>
              </div>
              <span class="section-note">{{ weakPoints.length }} 个待复习颗粒</span>
            </div>

            <div v-if="weakPoints.length" class="weak-knowledge-grid">
              <article
                v-for="(item, index) in weakPoints"
                :key="item.pointId"
                class="weak-knowledge-card"
              >
                <div class="weak-knowledge-top">
                  <span class="weak-rank">{{ padNumber(index + 1) }}</span>
                  <span class="accuracy-badge accuracy-badge--weak">{{ item.accuracy }}%</span>
                </div>
                <span class="weak-chapter">第 {{ item.chapter.id }} 章 · {{ item.section.id }} {{ item.section.title }}</span>
                <h3>{{ item.point.title }}</h3>
                <p>{{ item.point.detail }}</p>
                <div v-if="item.wrongConcepts.length" class="concept-tags">
                  <span v-for="concept in item.wrongConcepts" :key="concept">{{ concept }}</span>
                </div>
                <RouterLink :to="pointReviewTarget(item)" class="weak-review-link">
                  回看知识颗粒
                  <ArrowRight :size="14" />
                </RouterLink>
              </article>
            </div>

            <div v-else class="perfect-panel">
              <span class="perfect-icon"><CheckCircle2 :size="26" /></span>
              <div>
                <span class="eyebrow">NO KNOWLEDGE GAPS DETECTED</span>
                <h3>这一轮没有明显薄弱颗粒</h3>
                <p>可以尝试扩大检测范围，或在错题本中回看曾经的错误，确认它们已经被真正掌握。</p>
              </div>
              <RouterLink to="/wrong" class="text-link">检查错题本 <ArrowRight :size="13" /></RouterLink>
            </div>
          </section>

          <section class="report-block">
            <div class="section-heading section-heading--compact">
              <div>
                <span class="eyebrow"><Layers3 :size="13" /> GRANULAR BREAKDOWN</span>
                <h2>知识颗粒状态</h2>
                <p>按本次检测命中的原子知识点汇总。同一道题可能同时验证多个颗粒。</p>
              </div>
            </div>

            <div class="diagnosis-groups">
              <section
                v-for="group in groupedPoints"
                :key="group.chapter.id"
                class="diagnosis-group"
              >
                <header class="diagnosis-group-head">
                  <span>{{ padNumber(group.chapter.id) }}</span>
                  <h3>{{ group.chapter.title }}</h3>
                  <RouterLink :to="`/chapter/${group.chapter.id}`">
                    章节目录 <ArrowUpRight :size="12" />
                  </RouterLink>
                </header>
                <div class="diagnosis-rows">
                  <div
                    v-for="row in group.rows"
                    :key="row.result.pointId"
                    class="diagnosis-row"
                  >
                    <span class="diagnosis-section-id">{{ row.sectionId }}</span>
                    <div class="diagnosis-copy">
                      <strong>{{ row.point.title }}</strong>
                      <span>{{ row.sectionTitle }} · {{ row.result.correct }} / {{ row.result.total }} 关联题正确</span>
                    </div>
                    <div class="diagnosis-meter">
                      <MasteryMeter :value="row.result.accuracy" compact />
                      <span>{{ row.result.accuracy }}%</span>
                    </div>
                    <span
                      class="section-status"
                      :class="`section-status--${statusOf(row.result.accuracy).className}`"
                    >
                      <i />{{ statusOf(row.result.accuracy).label }}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section class="report-block">
            <div class="section-heading section-heading--compact">
              <div>
                <span class="eyebrow"><XCircle :size="13" /> ERROR REVIEW</span>
                <h2>错题复盘</h2>
                <p>错误不是结论，而是下一次阅读的入口。展开题目查看正确答案与机制解析。</p>
              </div>
              <span class="section-note">{{ wrongQuestions.length }} 道错题</span>
            </div>

            <div v-if="wrongQuestions.length" class="review-list">
              <details
                v-for="(question, index) in wrongQuestions"
                :key="question.id"
                class="review-card"
                :open="index === 0"
              >
                <summary>
                  <span class="review-index">{{ padNumber(index + 1) }}</span>
                  <span class="review-summary">
                    <small>{{ question.sectionId }} · {{ sectionTitle(question.sectionId) }}</small>
                    <strong>{{ question.stem }}</strong>
                  </span>
                  <span class="review-user-answer">你的答案：{{ userText(question) }}</span>
                  <ChevronDown :size="16" class="review-chevron" />
                </summary>
                <div class="review-body">
                  <div v-if="question.code" class="review-code">
                    <pre><code>{{ question.code }}</code></pre>
                  </div>
                  <div class="answer-compare">
                    <div class="answer-wrong">
                      <span>YOUR ANSWER</span>
                      <strong>{{ userText(question) }}</strong>
                    </div>
                    <div class="answer-right">
                      <span>CORRECT ANSWER</span>
                      <strong>{{ correctText(question) }}</strong>
                    </div>
                  </div>
                  <div class="review-explanation">
                    <span>MECHANISM</span>
                    <p>{{ question.explanation }}</p>
                  </div>
                  <div class="review-footer">
                    <span class="concept-tag">{{ question.concept }}</span>
                    <RouterLink :to="questionReviewTarget(question)" class="text-link">
                      回看知识颗粒
                      <ArrowRight :size="13" />
                    </RouterLink>
                  </div>
                </div>
              </details>
            </div>
            <div v-else class="review-empty">
              <CheckCircle2 :size="22" />
              <p>本次没有错题。保持这个节奏，继续扩大覆盖范围。</p>
            </div>
          </section>
        </main>

        <aside class="report-side">
          <div class="report-side-sticky">
            <article class="report-action-card">
              <span class="eyebrow"><Flag :size="13" /> NEXT MOVE</span>
              <h3>把薄弱点变成已知</h3>
              <p v-if="weakPoints.length">
                最需要回看的是 <strong>{{ weakPoints[0].point.title }}</strong>。先读知识颗粒，再单独重测它。
              </p>
              <p v-else>
                当前检测结果稳定。可以前往下一章，或进行一次全书综合检测检查知识横截面。
              </p>
              <RouterLink v-if="weakPoints.length" :to="pointReviewTarget(weakPoints[0])" class="btn btn-primary btn-block">
                <BookOpen :size="16" />
                回看最弱知识颗粒
              </RouterLink>
              <RouterLink
                v-else
                :to="`/chapter/${nextChapter.id}`"
                class="btn btn-primary btn-block"
              >
                继续第 {{ nextChapter.id }} 章
                <ArrowRight :size="16" />
              </RouterLink>
              <RouterLink :to="retryRoute" class="btn btn-secondary btn-block">
                <RotateCcw :size="15" />
                重新检测本次范围
              </RouterLink>
            </article>

            <article v-if="wrongQuestions.length" class="report-side-card">
              <div class="rail-heading">
                <div>
                  <span class="eyebrow"><XCircle :size="13" /> WRONG BOOK</span>
                  <h3>错题已归档</h3>
                </div>
                <span class="rail-count">{{ wrongQuestions.length }}</span>
              </div>
              <p>本次答错的题目会进入错题本。之后在任意检测中答对同题，才会自动移出。</p>
              <RouterLink to="/wrong" class="text-link">
                打开错题本 <ArrowRight :size="13" />
              </RouterLink>
            </article>

            <article class="report-side-card report-side-note">
              <span class="eyebrow">READING NOTE</span>
              <p>如果连续两次在同一知识颗粒失手，先别刷新题。把颗粒原文和错题解析并排看一遍，再合上书复述机制。</p>
              <span class="note-sign">— 内核手册</span>
            </article>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
