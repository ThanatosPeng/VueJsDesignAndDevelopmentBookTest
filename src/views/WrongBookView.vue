<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  History,
  Layers3,
  ListChecks,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-vue-next'
import { chapterById, getSection } from '@/data/book'
import { knowledgePointById } from '@/data/knowledge'
import { questionById } from '@/data/questions'
import { useProgressStore } from '@/stores/progress'
import type { Attempt, Question } from '@/types'
import { formatDate, isAnswerCorrect } from '@/utils/quiz'

const progress = useProgressStore()
const activeChapterId = ref<number | null>(null)

const wrongQuestions = computed(() =>
  progress.wrongQuestionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is Question => Boolean(question)),
)

const groupedWrong = computed(() => {
  const groups = new Map<
    number,
    {
      chapter: NonNullable<ReturnType<typeof chapterById.get>>
      questions: Question[]
    }
  >()
  for (const question of wrongQuestions.value) {
    const chapter = chapterById.get(question.chapterId)
    if (!chapter) continue
    const existing = groups.get(chapter.id)
    if (existing) existing.questions.push(question)
    else groups.set(chapter.id, { chapter, questions: [question] })
  }
  return [...groups.values()]
})

const visibleGroups = computed(() => {
  if (activeChapterId.value === null) return groupedWrong.value
  return groupedWrong.value.filter(
    (group) => group.chapter.id === activeChapterId.value,
  )
})

const wrongCountByQuestion = computed(() => {
  const counts = new Map<string, { count: number; lastAttempt: Attempt }>()
  for (const attempt of progress.attempts) {
    for (const questionId of attempt.questionIds) {
      const question = questionById.get(questionId)
      if (!question) continue
      const selected = attempt.answers[questionId]
      if (!selected || selected.length === 0) continue
      if (isAnswerCorrect(question, selected)) continue
      const existing = counts.get(questionId)
      if (existing) existing.count += 1
      else counts.set(questionId, { count: 1, lastAttempt: attempt })
    }
  }
  return counts
})

const involvedSections = computed(
  () => new Set(wrongQuestions.value.map((question) => question.sectionId)).size,
)

function optionText(question: Question, values: string[] | undefined) {
  if (!values || values.length === 0) return '未作答'
  return values
    .map((value) => {
      const option = question.options.find((item) => item.value === value)
      return option ? `${value}. ${option.label}` : value
    })
    .join(' / ')
}

function latestWrongAttempt(questionId: string) {
  return progress.attempts.find((attempt) =>
    attempt.questionIds.includes(questionId),
  )
}

function lastUserAnswer(question: Question) {
  const attempt = latestWrongAttempt(question.id)
  return optionText(question, attempt?.answers[question.id])
}

function correctAnswer(question: Question) {
  return optionText(question, question.answer)
}

function wrongCount(questionId: string) {
  return wrongCountByQuestion.value.get(questionId)?.count ?? 1
}

function lastAttemptLabel(questionId: string) {
  const attempt = latestWrongAttempt(questionId)
  return attempt ? formatDate(attempt.finishedAt) : ''
}

function sectionTitle(sectionId: string) {
  return getSection(sectionId)?.section.title ?? sectionId
}

function pointsForQuestion(question: Question) {
  return question.pointIds
    .map((pointId) => knowledgePointById.get(pointId))
    .filter((point): point is NonNullable<typeof point> => Boolean(point))
}

function pointLink(question: Question, pointId: string) {
  return `/chapter/${question.chapterId}?section=${encodeURIComponent(question.sectionId)}&point=${encodeURIComponent(pointId)}`
}

function selectChapter(chapterId: number | null) {
  activeChapterId.value = chapterId
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}
</script>

<template>
  <div class="wrong-view">
    <div class="page-container">
      <nav class="breadcrumbs" aria-label="面包屑">
        <RouterLink to="/">学习地图</RouterLink>
        <span>/</span>
        <strong>错题本</strong>
      </nav>

      <section class="wrong-hero">
        <div class="wrong-hero-copy">
          <span class="eyebrow"><Target :size="13" /> ERROR LOG / REVIEW QUEUE</span>
          <h1>错题本<span v-if="wrongQuestions.length">，{{ wrongQuestions.length }}</span></h1>
          <p>
            只保留每个知识点最新一次作答的结果。答对同一道题后，它会自动移出这里；
            所以这里不追求题目数量，而是记录你还没真正讲清楚的机制。
          </p>
          <div class="wrong-hero-actions">
            <RouterLink
              v-if="wrongQuestions.length"
              :to="{ name: 'practice', query: { scope: 'wrong' } }"
              class="btn btn-primary"
            >
              <RotateCcw :size="16" />
              开始错题重练
              <span class="btn-divider" />
              {{ wrongQuestions.length }} 题
            </RouterLink>
            <RouterLink to="/" class="btn btn-secondary">
              <BookOpen :size="16" /> 继续学习
            </RouterLink>
          </div>
        </div>
        <div class="wrong-hero-art" aria-hidden="true">
          <span class="wrong-art-label">REVIEW<br />QUEUE</span>
          <strong>{{ String(wrongQuestions.length).padStart(2, '0') }}</strong>
          <span class="wrong-art-line" />
          <small>{{ involvedSections }} sections involved</small>
        </div>
      </section>

      <div v-if="!progress.overall.attemptCount" class="wrong-empty">
        <span class="wrong-empty-icon"><History :size="30" /></span>
        <span class="eyebrow">NO DATA YET</span>
        <h2>错题本还没有开始记录</h2>
        <p>完成第一次章节或小节检测后，答错的题目会自动出现在这里。</p>
        <div class="wrong-empty-actions">
          <RouterLink :to="`/chapter/${progress.nextChapter.id}`" class="btn btn-primary">
            学习第 {{ progress.nextChapter.id }} 章 <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink
            :to="{ name: 'practice', query: { scope: 'all' } }"
            class="btn btn-secondary"
          >
            先做全书检测
          </RouterLink>
        </div>
      </div>

      <div v-else-if="wrongQuestions.length === 0" class="wrong-empty wrong-empty--good">
        <span class="wrong-empty-icon"><CheckCircle2 :size="30" /></span>
        <span class="eyebrow">QUEUE CLEAR</span>
        <h2>当前没有待复习错题</h2>
        <p>最新作答里没有错误。继续保持，也可以做一次综合检测检查知识横截面。</p>
        <div class="wrong-empty-actions">
          <RouterLink
            :to="{ name: 'practice', query: { scope: 'all' } }"
            class="btn btn-primary"
          >
            <Layers3 :size="16" /> 开始综合检测
          </RouterLink>
          <RouterLink to="/" class="btn btn-secondary">返回学习地图</RouterLink>
        </div>
      </div>

      <template v-else>
        <div class="wrong-summary">
          <div class="wrong-summary-item">
            <span class="wrong-summary-icon"><XCircle :size="17" /></span>
            <div><small>待复习题目</small><strong>{{ wrongQuestions.length }}</strong></div>
          </div>
          <div class="wrong-summary-item">
            <span class="wrong-summary-icon"><Layers3 :size="17" /></span>
            <div><small>涉及章节</small><strong>{{ groupedWrong.length }}</strong></div>
          </div>
          <div class="wrong-summary-item">
            <span class="wrong-summary-icon"><ListChecks :size="17" /></span>
            <div><small>涉及小节</small><strong>{{ involvedSections }}</strong></div>
          </div>
          <div class="wrong-summary-note">
            <span>规则</span>
            <p>重练答对后自动移出；再次答错则保留最新错误状态。</p>
          </div>
        </div>

        <div class="wrong-toolbar">
          <div class="chapter-filters" role="group" aria-label="按章节筛选错题">
            <button
              type="button"
              class="filter-button"
              :class="{ 'is-active': activeChapterId === null }"
              @click="selectChapter(null)"
            >
              全部 <span>{{ wrongQuestions.length }}</span>
            </button>
            <button
              v-for="group in groupedWrong"
              :key="group.chapter.id"
              type="button"
              class="filter-button"
              :class="{ 'is-active': activeChapterId === group.chapter.id }"
              @click="selectChapter(group.chapter.id)"
            >
              第 {{ group.chapter.id }} 章
              <span>{{ group.questions.length }}</span>
            </button>
          </div>
          <RouterLink
            :to="{ name: 'practice', query: { scope: 'wrong' } }"
            class="toolbar-cta"
          >
            <RotateCcw :size="15" />
            全部重练
          </RouterLink>
        </div>

        <div class="wrong-layout">
          <main class="wrong-groups">
            <section
              v-for="group in visibleGroups"
              :key="group.chapter.id"
              class="wrong-group"
            >
              <header class="wrong-group-head">
                <div class="wrong-group-index">{{ padNumber(group.chapter.id) }}</div>
                <div>
                  <span class="eyebrow">CHAPTER {{ padNumber(group.chapter.id) }}</span>
                  <h2>{{ group.chapter.title }}</h2>
                </div>
                <span class="wrong-group-count">{{ group.questions.length }} 道待复习</span>
              </header>

              <article
                v-for="question in group.questions"
                :key="question.id"
                class="wrong-card"
              >
                <div class="wrong-card-top">
                  <div class="wrong-card-tags">
                    <span class="wrong-section-tag">{{ question.sectionId }} · {{ sectionTitle(question.sectionId) }}</span>
                    <span class="difficulty-tag" :data-difficulty="question.difficulty">{{ question.difficulty }}</span>
                  </div>
                  <span class="wrong-times">历史答错 {{ wrongCount(question.id) }} 次</span>
                </div>

                <span class="concept-tag">{{ question.concept }}</span>
                <div v-if="pointsForQuestion(question).length" class="wrong-point-tags">
                  <RouterLink
                    v-for="point in pointsForQuestion(question)"
                    :key="point.id"
                    :to="pointLink(question, point.id)"
                    class="wrong-point-tag"
                  >
                    K{{ String(point.index).padStart(2, '0') }} {{ point.title }}
                  </RouterLink>
                </div>
                <h3>{{ question.stem }}</h3>

                <div class="wrong-answer-line">
                  <span>上次作答</span>
                  <strong>{{ lastUserAnswer(question) }}</strong>
                  <small>{{ lastAttemptLabel(question.id) }}</small>
                </div>

                <details class="wrong-detail">
                  <summary>
                    查看正确答案与机制解析
                    <ChevronDown :size="15" />
                  </summary>
                  <div class="wrong-detail-body">
                    <div v-if="question.code" class="wrong-code">
                      <pre><code>{{ question.code }}</code></pre>
                    </div>
                    <div class="wrong-correct-answer">
                      <span>CORRECT ANSWER</span>
                      <strong>{{ correctAnswer(question) }}</strong>
                    </div>
                    <p>{{ question.explanation }}</p>
                    <RouterLink
                      :to="`/chapter/${question.chapterId}?section=${encodeURIComponent(question.sectionId)}&point=${encodeURIComponent(question.pointIds[0] ?? '')}`"
                      class="text-link"
                    >
                      回看 {{ question.sectionId }} 知识卡
                      <ArrowRight :size="13" />
                    </RouterLink>
                  </div>
                </details>

                <footer class="wrong-card-footer">
                  <span>来自第 {{ question.chapterId }} 章</span>
                  <div>
                    <RouterLink
                      :to="question.pointIds[0] ? pointLink(question, question.pointIds[0]) : `/chapter/${question.chapterId}?section=${encodeURIComponent(question.sectionId)}`"
                      class="text-button"
                    >
                      复习颗粒
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'practice', query: { scope: 'wrong' } }"
                      class="mini-test-btn"
                    >
                      重练错题 <ArrowLeft :size="12" class="rotate-180" />
                    </RouterLink>
                  </div>
                </footer>
              </article>
            </section>
          </main>

          <aside class="wrong-side">
            <div class="wrong-side-sticky">
              <article class="rail-card">
                <div class="rail-heading">
                  <div>
                    <span class="eyebrow"><Target :size="13" /> HOW IT WORKS</span>
                    <h3>错题如何移出</h3>
                  </div>
                </div>
                <ol class="method-list method-list--compact">
                  <li>
                    <span>01</span>
                    <div><strong>重练全部错题</strong><p>系统按当前错题集生成检测。</p></div>
                  </li>
                  <li>
                    <span>02</span>
                    <div><strong>答对同题</strong><p>最新作答变为正确后，题目自动移出。</p></div>
                  </li>
                  <li>
                    <span>03</span>
                    <div><strong>再次答错</strong><p>仍保留在错题本，并更新错误次数。</p></div>
                  </li>
                </ol>
              </article>

              <article class="rail-card wrong-side-callout">
                <span class="eyebrow">BEFORE RETRY</span>
                <p>先读完每道题的解析，再开始重练。否则只是在测试记忆，而不是在修复理解。</p>
                <RouterLink :to="`/chapter/${visibleGroups[0]?.chapter.id ?? progress.nextChapter.id}`" class="text-link">
                  去读知识卡 <ArrowRight :size="13" />
                </RouterLink>
              </article>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
