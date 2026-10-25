<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CornerDownLeft,
  Flag,
  Keyboard,
  Layers3,
  ListChecks,
  RotateCcw,
  X,
} from 'lucide-vue-next'
import {
  knowledgePointById,
} from '@/data/knowledge'
import { chapters, getSection } from '@/data/book'
import { questions as allQuestions, questionById } from '@/data/questions'
import { useProgressStore } from '@/stores/progress'
import type { AnswerMap, Question, QuizScope } from '@/types'
import {
  createAttempt,
  normalizeAnswers,
  shuffle,
} from '@/utils/quiz'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()

interface LoadedQuiz {
  scope: QuizScope
  questions: Question[]
  backTo: string
  label: string
  error?: string
}

function readQuery(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : ''
}

function buildQuiz(): LoadedQuiz {
  const scopeType = readQuery(route.query.scope) || 'all'
  const rawId = readQuery(route.query.id)

  if (scopeType === 'chapter') {
    const chapterId = Number(rawId)
    const chapter = chapters.find((item) => item.id === chapterId)
    if (!chapter) {
      return {
        scope: { type: 'chapter', id: chapterId, title: '章节检测', subtitle: '' },
        questions: [],
        backTo: '/',
        label: '章节检测',
        error: '没有找到对应的章节，请从学习地图重新进入。',
      }
    }
    const questions = allQuestions.filter((question) => question.chapterId === chapter.id)
    return {
      scope: {
        type: 'chapter',
        id: chapter.id,
        title: `第 ${chapter.id} 章 · ${chapter.title}`,
        subtitle: `${chapter.sections.length} 个正文小节 · ${questions.length} 道题`,
      },
      questions,
      backTo: `/chapter/${chapter.id}`,
      label: '章节检测',
    }
  }

  if (scopeType === 'section') {
    const found = getSection(rawId)
    if (!found) {
      return {
        scope: { type: 'section', id: rawId, title: '小节检测', subtitle: '' },
        questions: [],
        backTo: '/',
        label: '小节检测',
        error: '没有找到对应的小节，请从章节页重新进入。',
      }
    }
    const questions = allQuestions.filter(
      (question) => question.sectionId === found.section.id,
    )
    return {
      scope: {
        type: 'section',
        id: found.section.id,
        title: `${found.section.id} · ${found.section.title}`,
        subtitle: `${found.chapter.title} · 第 ${found.section.page} 页`,
      },
      questions,
      backTo: `/chapter/${found.chapter.id}?section=${encodeURIComponent(found.section.id)}`,
      label: '小节检测',
    }
  }

  if (scopeType === 'point') {
    const point = knowledgePointById.get(rawId)
    if (!point) {
      return {
        scope: { type: 'point', id: rawId, title: '知识颗粒检测', subtitle: '' },
        questions: [],
        backTo: '/',
        label: '知识颗粒检测',
        error: '没有找到对应的知识颗粒，请从章节页重新进入。',
      }
    }
    const questions = point.questionIds
      .map((questionId) => questionById.get(questionId))
      .filter((question): question is Question => Boolean(question))
    if (questions.length === 0) {
      return {
        scope: {
          type: 'point',
          id: point.id,
          title: point.title,
          subtitle: '该知识颗粒暂时没有独立题目',
        },
        questions: [],
        backTo: `/chapter/${point.chapterId}?section=${encodeURIComponent(point.sectionId)}&point=${encodeURIComponent(point.id)}`,
        label: '知识颗粒检测',
        error: '这个知识颗粒目前只用于阅读，暂无独立检测题。可以回到小节做整体自测。',
      }
    }
    return {
      scope: {
        type: 'point',
        id: point.id,
        title: `${point.sectionId} · ${point.title}`,
        subtitle: `知识颗粒自测 · ${questions.length} 道题`,
      },
      questions,
      backTo: `/chapter/${point.chapterId}?section=${encodeURIComponent(point.sectionId)}&point=${encodeURIComponent(point.id)}`,
      label: '知识颗粒检测',
    }
  }

  if (scopeType === 'wrong') {
    const questions = progress.wrongQuestionIds
      .map((questionId) => questionById.get(questionId))
      .filter((question): question is Question => Boolean(question))
    return {
      scope: {
        type: 'wrong',
        title: '错题回炉',
        subtitle: `基于最新作答 · ${questions.length} 道待复习题`,
      },
      questions,
      backTo: '/wrong',
      label: '错题回炉',
    }
  }

  const questions = shuffle(allQuestions).slice(0, 30)
  return {
    scope: {
      type: 'all',
      title: '全书综合检测',
      subtitle: `随机抽取 ${questions.length} 题 · 覆盖 6 篇 18 章`,
    },
    questions,
    backTo: '/',
    label: '综合检测',
  }
}

const config = buildQuiz()
const questions = config.questions
const answers = ref<AnswerMap>({})
const currentIndex = ref(0)
const startedAt = Date.now()
const now = ref(Date.now())
const showConfirm = ref(false)
const submitting = ref(false)
const timer = window.setInterval(() => {
  now.value = Date.now()
}, 1000)

const activeQuestion = computed(() => questions[currentIndex.value])
const activeSection = computed(() => {
  if (!activeQuestion.value) return null
  return getSection(activeQuestion.value.sectionId)?.section ?? null
})
const answeredCount = computed(() =>
  questions.filter((question) => (answers.value[question.id]?.length ?? 0) > 0).length,
)
const unansweredCount = computed(() => questions.length - answeredCount.value)
const progressPercent = computed(() =>
  questions.length === 0 ? 0 : Math.round((answeredCount.value / questions.length) * 100),
)
const elapsed = computed(() => Math.floor((now.value - startedAt) / 1000))
const currentAnswer = computed(() => {
  if (!activeQuestion.value) return []
  return answers.value[activeQuestion.value.id] ?? []
})

const typeLabel = computed(() => {
  if (!activeQuestion.value) return ''
  if (activeQuestion.value.type === 'multiple') return '多选题'
  if (activeQuestion.value.type === 'judge') return '判断题'
  return '单选题'
})

const typeHint = computed(() => {
  if (!activeQuestion.value) return ''
  return activeQuestion.value.type === 'multiple'
    ? '可选择多个答案，答案完全一致才计分'
    : '选择一个最准确的答案'
})

function clockLabel(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

const timerLabel = computed(() => clockLabel(elapsed.value))

function isChosen(value: string) {
  return currentAnswer.value.includes(value)
}

function choose(value: string) {
  if (!activeQuestion.value) return
  const question = activeQuestion.value
  const current = answers.value[question.id] ?? []
  let next: string[]

  if (question.type === 'multiple') {
    next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
  } else {
    next = [value]
  }

  answers.value = {
    ...answers.value,
    [question.id]: normalizeAnswers(next),
  }
}

function goTo(index: number) {
  if (index < 0 || index >= questions.length) return
  currentIndex.value = index
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function nextQuestion() {
  if (currentIndex.value < questions.length - 1) {
    goTo(currentIndex.value + 1)
  } else {
    requestSubmit()
  }
}

function previousQuestion() {
  goTo(currentIndex.value - 1)
}

function requestSubmit() {
  if (questions.length === 0) return
  showConfirm.value = true
}

function closeConfirm() {
  showConfirm.value = false
}

function finishQuiz() {
  if (submitting.value) return
  submitting.value = true
  showConfirm.value = false
  const attempt = createAttempt({
    scope: config.scope,
    questions,
    answers: answers.value,
    startedAt,
  })
  progress.addAttempt(attempt)
  router.replace(`/result/${attempt.id}`)
}

function exitQuiz() {
  const hasAnswers = answeredCount.value > 0
  if (hasAnswers && !window.confirm('当前作答不会保存，确定退出这次检测吗？')) {
    return
  }
  router.push(config.backTo)
}

function isAnswered(question: Question) {
  return (answers.value[question.id]?.length ?? 0) > 0
}

function handleKeydown(event: KeyboardEvent) {
  if (showConfirm.value) {
    if (event.key === 'Escape') closeConfirm()
    return
  }
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextQuestion()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousQuestion()
    return
  }
  if (/^[1-9]$/.test(event.key) && activeQuestion.value) {
    const optionIndex = Number(event.key) - 1
    const option = activeQuestion.value.options[optionIndex]
    if (option) {
      event.preventDefault()
      choose(option.value)
    }
  }
}

watch(showConfirm, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="practice-view">
    <header class="quiz-topbar">
      <div class="quiz-topbar-inner">
        <RouterLink to="/" class="quiz-brand" aria-label="返回内核手册首页">
          <span class="brand-mark brand-mark--small" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M6 9.5h6.4L18 20.2l5.6-10.7H30L18 30 6 9.5Z" fill="currentColor" />
              <path d="M12.4 9.5h5.1L18 10.7l.5-1.2h5.1L18 21l-5.6-11.5Z" fill="#10201c" opacity=".76" />
            </svg>
          </span>
          <span>内核手册 <small>DETECTION MODE</small></span>
        </RouterLink>

        <div class="quiz-top-context">
          <span>{{ config.label }}</span>
          <i />
          <strong>{{ config.scope.title }}</strong>
        </div>

        <div class="quiz-top-actions">
          <span class="quiz-timer"><Clock3 :size="15" />{{ timerLabel }}</span>
          <button type="button" class="quiz-exit" @click="exitQuiz">
            <X :size="15" /> 退出
          </button>
        </div>
      </div>
    </header>

    <div v-if="config.error" class="quiz-state page-container">
      <span class="quiz-state-icon"><Flag :size="24" /></span>
      <h1>检测入口无效</h1>
      <p>{{ config.error }}</p>
      <RouterLink to="/" class="btn btn-primary"><ArrowLeft :size="16" /> 返回学习地图</RouterLink>
    </div>

    <div v-else-if="questions.length === 0" class="quiz-state page-container">
      <span class="quiz-state-icon quiz-state-icon--good"><CheckCircle2 :size="27" /></span>
      <span class="eyebrow">ALL CLEAR</span>
      <h1>没有待复习的错题</h1>
      <p>当前最新的作答记录里没有错误题目。可以继续学习新的章节，或做一次全书综合检测。</p>
      <div class="quiz-state-actions">
        <RouterLink
          :to="{ name: 'practice', query: { scope: 'all' } }"
          class="btn btn-primary"
        >
          <Layers3 :size="16" /> 开始综合检测
        </RouterLink>
        <RouterLink to="/" class="btn btn-secondary">返回学习地图</RouterLink>
      </div>
    </div>

    <div v-else-if="activeQuestion" class="quiz-shell page-container">
      <div class="quiz-progress-row">
        <div class="quiz-scope-copy">
          <span class="eyebrow">{{ config.label }}</span>
          <h1>{{ config.scope.title }}</h1>
          <p>{{ config.scope.subtitle }}</p>
        </div>
        <div class="quiz-scoreboard">
          <div class="scoreboard-number">
            <strong>{{ answeredCount }}</strong>
            <span>/ {{ questions.length }} 已作答</span>
          </div>
          <div class="scoreboard-track">
            <span :style="{ width: `${progressPercent}%` }" />
          </div>
        </div>
      </div>

      <div class="quiz-layout">
        <main class="question-main">
          <section class="question-card">
            <header class="question-header">
              <div class="question-tags">
                <span class="question-number">Q{{ String(currentIndex + 1).padStart(2, '0') }}</span>
                <span class="difficulty-tag" :data-difficulty="activeQuestion.difficulty">
                  {{ activeQuestion.difficulty }}
                </span>
                <span class="type-tag">{{ typeLabel }}</span>
              </div>
              <span class="question-position">
                {{ currentIndex + 1 }} / {{ questions.length }}
              </span>
            </header>

            <div class="question-context">
              <span>{{ activeQuestion.sectionId }}</span>
              <strong>{{ activeSection?.title }}</strong>
              <span class="context-concept">{{ activeQuestion.concept }}</span>
            </div>

            <h2 class="question-stem">{{ activeQuestion.stem }}</h2>
            <pre v-if="activeQuestion.code" class="question-code"><code>{{ activeQuestion.code }}</code></pre>

            <div class="answer-options" :class="{ 'is-multiple': activeQuestion.type === 'multiple' }">
              <button
                v-for="(option, optionIndex) in activeQuestion.options"
                :key="option.value"
                type="button"
                class="answer-option"
                :class="{ 'is-selected': isChosen(option.value) }"
                :aria-pressed="isChosen(option.value)"
                @click="choose(option.value)"
              >
                <span class="option-letter">
                  <Check v-if="isChosen(option.value)" :size="14" :stroke-width="2.5" />
                  <template v-else>{{ option.value }}</template>
                </span>
                <span class="option-text">{{ option.label }}</span>
                <kbd>{{ optionIndex + 1 }}</kbd>
              </button>
            </div>

            <div class="answer-hint">
              <span class="hint-icon"><Keyboard :size="14" /></span>
              <span>{{ typeHint }}</span>
              <span class="hint-separator">·</span>
              <span>按 1–{{ activeQuestion.options.length }} 选择，← → 切题</span>
            </div>

            <footer class="question-footer">
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="currentIndex === 0"
                @click="previousQuestion"
              >
                <ChevronLeft :size="16" /> 上一题
              </button>
              <div class="question-footer-center">
                <span><CornerDownLeft :size="13" /> 交卷后统一显示答案</span>
              </div>
              <button type="button" class="btn btn-primary" @click="nextQuestion">
                {{ currentIndex === questions.length - 1 ? '完成并交卷' : '下一题' }}
                <ChevronRight v-if="currentIndex < questions.length - 1" :size="16" />
                <CheckCircle2 v-else :size="16" />
              </button>
            </footer>
          </section>
        </main>

        <aside class="quiz-side">
          <div class="quiz-side-sticky">
            <section class="palette-card">
              <div class="palette-heading">
                <div>
                  <span class="eyebrow"><ListChecks :size="13" /> ANSWER SHEET</span>
                  <h3>答题卡</h3>
                </div>
                <span class="palette-count">{{ answeredCount }} / {{ questions.length }}</span>
              </div>
              <div class="palette-grid">
                <button
                  v-for="(question, index) in questions"
                  :key="question.id"
                  type="button"
                  class="palette-button"
                  :class="{
                    'is-current': index === currentIndex,
                    'is-answered': isAnswered(question),
                  }"
                  :aria-label="`第 ${index + 1} 题${isAnswered(question) ? '，已作答' : '，未作答'}`"
                  @click="goTo(index)"
                >
                  {{ index + 1 }}
                </button>
              </div>
              <div class="palette-legend">
                <span><i class="legend-active" />当前</span>
                <span><i class="legend-answered" />已答</span>
                <span><i class="legend-empty" />未答</span>
              </div>
              <button type="button" class="submit-button" @click="requestSubmit">
                <Flag :size="16" />
                提交检测
                <span v-if="unansweredCount">（剩 {{ unansweredCount }} 题）</span>
              </button>
            </section>

            <section class="quiz-note-card">
              <span class="eyebrow">CHECKPOINT</span>
              <p>先凭理解作答。交卷后会看到每个知识颗粒的最新掌握度，以及需要回看的知识点。</p>
            </section>

            <button type="button" class="quiz-abandon" @click="exitQuiz">
              <RotateCcw :size="14" />
              放弃本次检测
            </button>
          </div>
        </aside>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showConfirm"
          class="modal-backdrop"
          role="presentation"
          @click.self="closeConfirm"
        >
          <div
            class="submit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-modal-title"
          >
            <button
              type="button"
              class="modal-close"
              aria-label="关闭"
              @click="closeConfirm"
            >
              <X :size="17" />
            </button>
            <span class="modal-mark"><Flag :size="22" /></span>
            <span class="eyebrow">SUBMIT CHECK</span>
            <h2 id="submit-modal-title">
              {{ unansweredCount ? '还有题目没有作答' : '确认提交这次检测？' }}
            </h2>
            <p v-if="unansweredCount">
              还有 <strong>{{ unansweredCount }}</strong> 道题未作答。未作答的题目会按错误计入本次报告，但仍可先返回补答。
            </p>
            <p v-else>
              共 {{ questions.length }} 道题已全部作答。提交后将生成掌握度与薄弱知识点诊断。
            </p>
            <div class="modal-stats">
              <span><small>已作答</small><strong>{{ answeredCount }} / {{ questions.length }}</strong></span>
              <span><small>用时</small><strong>{{ timerLabel }}</strong></span>
              <span><small>范围</small><strong>{{ config.label }}</strong></span>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeConfirm">
                {{ unansweredCount ? '返回补答' : '再检查一下' }}
              </button>
              <button type="button" class="btn btn-primary" :disabled="submitting" @click="finishQuiz">
                {{ unansweredCount ? '仍然交卷' : '确认交卷' }}
                <ArrowRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
