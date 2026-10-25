<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Database,
  FlaskConical,
  Gauge,
  Layers3,
  ScanSearch,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-vue-next'
import RingProgress from '@/components/RingProgress.vue'
import MasteryMeter from '@/components/MasteryMeter.vue'
import ClearDataDialog from '@/components/ClearDataDialog.vue'
import { bookParts, chapters, totalSections } from '@/data/book'
import { totalKnowledgePoints, knowledgePointsByChapter } from '@/data/knowledge'
import { totalQuestions } from '@/data/questions'
import { useProgressStore } from '@/stores/progress'
import { formatDate } from '@/utils/quiz'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()
const showClearData = ref(false)
const clearedNotice = computed(() => route.query.cleared === '1')

const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))

const partsWithChapters = computed(() =>
  bookParts.map((part) => ({
    ...part,
    chapters: part.chapterIds
      .map((id) => chapterMap.get(id))
      .filter((chapter): chapter is NonNullable<typeof chapter> => Boolean(chapter)),
  })),
)

const accuracyLabel = computed(() =>
  progress.overall.accuracy === null ? '—' : `${progress.overall.accuracy}`,
)

const continueChapter = computed(() => {
  if (progress.lastViewedChapterId !== null) {
    const lastChapter = chapterMap.get(progress.lastViewedChapterId)
    if (lastChapter) return lastChapter
  }
  return progress.nextChapter
})

const stateTitle = computed(() => {
  if (progress.overall.attemptCount === 0) return '等待第一次检测'
  if ((progress.overall.accuracy ?? 0) >= 85) return '知识网络稳固'
  if ((progress.overall.accuracy ?? 0) >= 65) return '主干已经清晰'
  return '需要定点补强'
})

const stateDescription = computed(() => {
  if (progress.overall.attemptCount === 0) {
    return '从任意章节开始，先读知识卡，再用一节自测确认理解。'
  }
  if (progress.overall.accuracy !== null && progress.overall.accuracy >= 85) {
    return '继续挑战剩余小节，并留意错题里暴露的边界条件。'
  }
  return '优先回看标红的薄弱节点，把机制之间的因果重新串起来。'
})

const recentAttempts = computed(() => progress.attempts.slice(0, 3))
const weakPreview = computed(() => progress.weakKnowledgePoints.slice(0, 4))

function masteryOf(chapterId: number) {
  return progress.chapterMastery(chapterId)
}

function knowledgePointCount(chapterId: number) {
  return knowledgePointsByChapter.get(chapterId)?.length ?? 0
}

function dismissClearedNotice() {
  router.replace({ name: 'home' })
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}
</script>

<template>
  <div class="home-view">
    <div class="page-container">
      <Transition name="reveal">
        <div v-if="clearedNotice" class="data-cleared-banner">
          <span class="data-cleared-icon"><CheckCircle2 :size="17" /></span>
          <div>
            <strong>本地学习数据已清空</strong>
            <p>检测报告、错题与知识颗粒进度已重置，题库和知识卡仍可继续使用。</p>
          </div>
          <button type="button" aria-label="关闭提示" @click="dismissClearedNotice">
            <X :size="15" />
          </button>
        </div>
      </Transition>

      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow hero-eyebrow">
            <span class="eyebrow-line" />
            A STUDY SYSTEM FOR VUE INTERNALS
          </div>
          <h1 class="hero-title">
            <span class="hero-title-line">把 Vue 的</span>
            <span class="hero-title-line hero-title-line--accent"><span class="hero-title-accent">设计原理</span><span class="hero-title-tail">真正弄懂。</span></span>
          </h1>
          <p class="hero-lead">
            以霍春阳《Vue.js 设计与实现》的 18 章为知识骨架，逐节阅读、逐节自测。
            每个小节拆成 3 个知识颗粒，每个颗粒都有对应题目，交卷后会指出还不熟悉的原子知识点。
          </p>
          <div class="hero-actions">
            <RouterLink :to="`/chapter/${continueChapter.id}`" class="btn btn-primary">
              <span>继续学习</span>
              <span class="btn-divider" />
              <span>第 {{ padNumber(continueChapter.id) }} 章</span>
              <ArrowRight :size="17" />
            </RouterLink>
            <RouterLink
              :to="{ name: 'practice', query: { scope: 'all' } }"
              class="btn btn-secondary"
            >
              <FlaskConical :size="17" :stroke-width="1.8" />
              全书综合检测
            </RouterLink>
          </div>
          <div class="hero-facts">
            <span><strong>06</strong> 篇</span>
            <span><strong>18</strong> 章</span>
            <span><strong>{{ totalSections }}</strong> 节</span>
            <span><strong>{{ totalKnowledgePoints }}</strong> 知识颗粒</span>
            <span><strong>{{ totalQuestions }}</strong> 道题</span>
            <span class="hero-fact-note">100% 本地记录</span>
          </div>
        </div>

        <div class="hero-visual" aria-label="学习数据概览">
          <div class="hero-sheet hero-sheet--back" />
          <div class="hero-sheet hero-sheet--mid" />
          <article class="diagnostic-card">
            <div class="diag-top">
              <span class="live-label"><i /> STUDY TELEMETRY</span>
              <span class="diag-edition">VOL. 03 / 2026</span>
            </div>

            <div class="diag-body">
              <RingProgress
                :value="progress.overall.accuracy ?? 0"
                :size="154"
                :stroke="4"
              >
                <div class="diag-ring-content">
                  <strong>{{ accuracyLabel }}<small v-if="progress.overall.accuracy !== null">%</small></strong>
                  <span>总正确率</span>
                </div>
              </RingProgress>
              <div class="diag-status">
                <span class="eyebrow">CURRENT STATE</span>
                <h2>{{ stateTitle }}</h2>
                <p>{{ stateDescription }}</p>
              </div>
            </div>

            <div class="diag-stats">
              <div>
                <span>已测知识颗粒</span>
                <strong>{{ progress.overall.testedKnowledgePoints }}<small>/{{ totalKnowledgePoints }}</small></strong>
              </div>
              <div>
                <span>题库命中</span>
                <strong>{{ progress.overall.answeredQuestions }}<small>/{{ totalQuestions }}</small></strong>
              </div>
              <div>
                <span>薄弱颗粒</span>
                <strong>{{ progress.overall.weakPointCount }}<small> 个</small></strong>
              </div>
            </div>

            <RouterLink :to="`/chapter/${continueChapter.id}`" class="diag-next">
              <div>
                <span>{{ progress.lastViewedChapterId ? 'RESUME' : 'NEXT MODULE' }}</span>
                <strong>第 {{ padNumber(continueChapter.id) }} 章 · {{ continueChapter.title }}</strong>
              </div>
              <span class="round-arrow"><ArrowUpRight :size="17" /></span>
            </RouterLink>
          </article>
          <span class="hero-stamp">DESIGN<br />&amp; IMPLEMENTATION</span>
          <span class="hero-annotation">TRACK → TRIGGER → PATCH</span>
        </div>
      </section>

      <section class="stat-strip" aria-label="学习统计">
        <article class="stat-card">
          <span class="stat-icon"><CheckCircle2 :size="18" /></span>
          <div>
            <span class="stat-label">已测知识颗粒</span>
            <strong>{{ progress.overall.testedKnowledgePoints }}<small> / {{ totalKnowledgePoints }}</small></strong>
          </div>
          <span class="stat-note">覆盖 {{ progress.overall.testedSections }} / {{ totalSections }} 小节 · 题库 {{ totalQuestions }} 题</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon--amber"><Gauge :size="18" /></span>
          <div>
            <span class="stat-label">当前正确率</span>
            <strong>{{ progress.overall.accuracy === null ? '—' : progress.overall.accuracy }}<small v-if="progress.overall.accuracy !== null">%</small></strong>
          </div>
          <span class="stat-note">按最新作答统计</span>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon--red"><TriangleAlert :size="18" /></span>
          <div>
            <span class="stat-label">待补强知识颗粒</span>
            <strong>{{ progress.overall.weakPointCount }}<small> 个</small></strong>
          </div>
          <RouterLink to="/wrong" class="stat-link">查看错题 <ArrowUpRight :size="13" /></RouterLink>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon--blue"><Activity :size="18" /></span>
          <div>
            <span class="stat-label">完成检测</span>
            <strong>{{ progress.overall.attemptCount }}<small> 次</small></strong>
          </div>
          <span class="stat-note">记录仅保存在本机</span>
        </article>
      </section>

      <div class="home-layout">
        <section class="book-map">
          <div class="section-heading">
            <div>
              <span class="eyebrow"><Layers3 :size="13" /> THE BOOK, MAPPED</span>
              <h2>六篇 · 十八章</h2>
              <p>从设计权衡到同构渲染，按书的脉络建立一张可检测的知识地图。</p>
            </div>
            <span class="section-note">点击章节进入逐节学习</span>
          </div>

          <div class="part-list">
            <section
              v-for="part in partsWithChapters"
              :key="part.id"
              class="part-block"
              :style="{ '--part-accent': part.accent }"
            >
              <header class="part-header">
                <div class="part-index">
                  <span>{{ padNumber(part.order) }}</span>
                  <i />
                </div>
                <div class="part-copy">
                  <span class="part-kicker">{{ part.kicker }}</span>
                  <h3>{{ part.title }}</h3>
                  <p>{{ part.description }}</p>
                </div>
                <span class="part-count">{{ part.chapters.length }} CHAPTERS</span>
              </header>

              <div class="chapter-list">
                <RouterLink
                  v-for="chapter in part.chapters"
                  :key="chapter.id"
                  :to="`/chapter/${chapter.id}`"
                  class="chapter-row"
                  :class="{
                    'is-weak': (masteryOf(chapter.id).accuracy ?? 100) < 70 &&
                      masteryOf(chapter.id).answered > 0,
                    'is-complete':
                      masteryOf(chapter.id).total > 0 &&
                      masteryOf(chapter.id).answered === masteryOf(chapter.id).total,
                  }"
                >
                  <span class="chapter-index">{{ padNumber(chapter.id) }}</span>
                  <div class="chapter-copy">
                    <div class="chapter-title-line">
                      <h4>{{ chapter.title }}</h4>
                      <span class="chapter-page">p.{{ chapter.page }}</span>
                    </div>
                    <p>{{ chapter.tagline }}</p>
                    <span class="chapter-section-count">{{ chapter.sections.length }} 节 · {{ knowledgePointCount(chapter.id) }} 个知识颗粒</span>
                  </div>
                  <div class="chapter-mastery">
                    <div class="chapter-mastery-label">
                      <span>掌握度</span>
                      <strong>
                        {{ masteryOf(chapter.id).accuracy === null ? '未测' : `${masteryOf(chapter.id).accuracy}%` }}
                      </strong>
                    </div>
                    <MasteryMeter :value="masteryOf(chapter.id).accuracy" compact />
                    <span class="chapter-answered">
                      {{ masteryOf(chapter.id).answered }} / {{ masteryOf(chapter.id).total }} 题
                    </span>
                  </div>
                  <span class="chapter-arrow"><ArrowUpRight :size="17" /></span>
                </RouterLink>
              </div>
            </section>
          </div>
        </section>

        <aside class="home-rail">
          <article class="rail-card diagnostic-panel">
            <div class="rail-heading">
              <div>
                <span class="eyebrow"><ScanSearch :size="13" /> DIAGNOSTICS</span>
                <h3>薄弱知识颗粒</h3>
              </div>
              <span class="rail-count">{{ progress.overall.weakPointCount }}</span>
            </div>

            <div v-if="progress.weakKnowledgePoints.length" class="weak-preview-list">
              <RouterLink
                v-for="weak in weakPreview"
                :key="weak.pointId"
                :to="{ path: `/chapter/${weak.chapterId}`, query: { section: weak.sectionId, point: weak.pointId } }"
                class="weak-preview"
              >
                <div class="weak-preview-top">
                  <span>{{ weak.sectionId }}</span>
                  <strong>{{ weak.accuracy }}%</strong>
                </div>
                <h4>{{ weak.title }}</h4>
                <p>{{ weak.detail }}</p>
                <span class="weak-preview-link">回看知识颗粒 <ArrowRight :size="12" /></span>
              </RouterLink>
            </div>

            <div v-else-if="progress.overall.attemptCount" class="rail-empty rail-empty--success">
              <span class="empty-icon"><CheckCircle2 :size="22" /></span>
              <h4>暂无明显薄弱颗粒</h4>
              <p>继续完成更多知识颗粒，诊断会随着数据积累而变得更准确。</p>
            </div>

            <div v-else class="rail-empty">
              <span class="empty-icon"><Target :size="22" /></span>
              <h4>还没有诊断数据</h4>
              <p>完成一次小节、知识颗粒或章节检测后，这里会列出掌握最弱的原子知识点。</p>
              <RouterLink :to="`/chapter/${continueChapter.id}`" class="text-link">
                从第 {{ continueChapter.id }} 章开始 <ArrowRight :size="13" />
              </RouterLink>
            </div>
          </article>

          <article class="rail-card method-panel">
            <div class="rail-heading">
              <div>
                <span class="eyebrow"><Sparkles :size="13" /> METHOD</span>
                <h3>这样使用</h3>
              </div>
            </div>
            <ol class="method-list">
              <li>
                <span>01</span>
                <div><strong>读知识卡</strong><p>先看本节的结论与关键机制，不急着做题。</p></div>
              </li>
              <li>
                <span>02</span>
                <div><strong>完成自测</strong><p>按节或按章作答，交卷前不显示答案。</p></div>
              </li>
              <li>
                <span>03</span>
                <div><strong>回看薄弱点</strong><p>根据报告定位到具体知识颗粒，再重测一次。</p></div>
              </li>
            </ol>
          </article>

          <article v-if="recentAttempts.length" class="rail-card attempts-panel">
            <div class="rail-heading">
              <div>
                <span class="eyebrow"><BookOpen :size="13" /> LOG</span>
                <h3>最近检测</h3>
              </div>
              <RouterLink to="/wrong" class="rail-more">错题本</RouterLink>
            </div>
            <div class="attempt-list">
              <RouterLink
                v-for="attempt in recentAttempts"
                :key="attempt.id"
                :to="`/result/${attempt.id}`"
                class="attempt-row"
              >
                <span
                  class="attempt-score"
                  :class="{
                    'is-good': attempt.score >= 80,
                    'is-low': attempt.score < 60,
                  }"
                >{{ attempt.score }}</span>
                <span class="attempt-copy">
                  <strong>{{ attempt.scope.title }}</strong>
                  <small>{{ formatDate(attempt.finishedAt) }} · {{ attempt.correctCount }}/{{ attempt.total }} 正确</small>
                </span>
                <ArrowUpRight :size="14" />
              </RouterLink>
            </div>
          </article>

          <article class="rail-card callout-panel">
            <span class="eyebrow">READING TIP</span>
            <p>先理解“为什么需要它”，再看实现。每个机制都是被某个具体问题逼出来的。</p>
            <span class="callout-sign">— 内核手册</span>
          </article>

          <article class="rail-card data-panel">
            <div class="rail-heading">
              <div>
                <span class="eyebrow"><Database :size="13" /> LOCAL DATA</span>
                <h3>本地学习数据</h3>
              </div>
              <span class="rail-count">{{ progress.overall.attemptCount }}</span>
            </div>
            <p class="data-panel-copy">
              进度、错题与检测报告仅保存在当前浏览器。换浏览器或清除站点数据后不会自动恢复。
            </p>
            <div class="data-panel-meta">
              <span>知识颗粒 <strong>{{ totalKnowledgePoints }}</strong></span>
              <span>题库 <strong>{{ totalQuestions }}</strong></span>
              <span>错题 <strong>{{ progress.wrongQuestionIds.length }}</strong></span>
            </div>
            <button type="button" class="clear-data-link" @click="showClearData = true">
              <Trash2 :size="14" />
              清空本地学习数据
            </button>
          </article>
        </aside>
      </div>
    </div>

    <ClearDataDialog :open="showClearData" @close="showClearData = false" />
  </div>
</template>
