<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleAlert,
  Layers3,
  ListChecks,
  RotateCcw,
  Target,
} from 'lucide-vue-next'
import MasteryMeter from '@/components/MasteryMeter.vue'
import { chapterById, chapters, partById } from '@/data/book'
import {
  getKnowledgePointsForSection,
  knowledgePointById,
  knowledgePointsByChapter,
} from '@/data/knowledge'
import { questionsByChapter, questionsBySection } from '@/data/questions'
import { useProgressStore } from '@/stores/progress'

const route = useRoute()
const progress = useProgressStore()

const chapterId = computed(() => Number(route.params.chapterId))
const chapter = computed(() => chapterById.get(chapterId.value))
const part = computed(() =>
  chapter.value ? partById.get(chapter.value.partId) : undefined,
)
const chapterQuestions = computed(() =>
  chapter.value ? questionsByChapter.get(chapter.value.id) ?? [] : [],
)
const chapterPoints = computed(() =>
  chapter.value ? knowledgePointsByChapter.get(chapter.value.id) ?? [] : [],
)
const chapterTestedPoints = computed(
  () =>
    chapterPoints.value.filter(
      (point) => progress.pointMastery(point.id).answered > 0,
    ).length,
)
const stats = computed(() =>
  chapter.value
    ? progress.chapterMastery(chapter.value.id)
    : { answered: 0, total: 0, correct: 0, accuracy: null },
)
const chapterWeakPoints = computed(() => {
  if (!chapter.value) return []
  return progress.weakKnowledgePoints.filter(
    (point) => point.chapterId === chapter.value?.id,
  )
})
const chapterIndex = computed(() =>
  chapters.findIndex((item) => item.id === chapter.value?.id),
)
const previousChapter = computed(() =>
  chapterIndex.value > 0 ? chapters[chapterIndex.value - 1] : null,
)
const nextChapter = computed(() =>
  chapterIndex.value >= 0 && chapterIndex.value < chapters.length - 1
    ? chapters[chapterIndex.value + 1]
    : null,
)

const expanded = ref(new Set<string>())

function toggleSection(sectionId: string) {
  const next = new Set(expanded.value)
  if (next.has(sectionId)) next.delete(sectionId)
  else next.add(sectionId)
  expanded.value = next
}

function sectionMastery(sectionId: string) {
  return progress.sectionMastery(sectionId)
}

function questionCount(sectionId: string) {
  return questionsBySection.get(sectionId)?.length ?? 0
}

function pointsForSection(sectionId: string) {
  return getKnowledgePointsForSection(sectionId)
}

function testedPointCount(sectionId: string) {
  return pointsForSection(sectionId).filter(
    (point) => progress.pointMastery(point.id).answered > 0,
  ).length
}

function pointStatus(pointId: string) {
  const stats = progress.pointMastery(pointId)
  if (stats.total === 0) {
    return { label: '阅读型', className: 'untested', tested: false }
  }
  if (stats.accuracy === null) {
    return { label: '未测', className: 'empty', tested: false }
  }
  if (stats.accuracy >= 80) {
    return { label: '稳固', className: 'strong', tested: true }
  }
  if (stats.accuracy >= 60) {
    return { label: '待巩固', className: 'mid', tested: true }
  }
  return { label: '不熟悉', className: 'weak', tested: true }
}

function sectionStatus(sectionId: string) {
  const accuracy = sectionMastery(sectionId).accuracy
  if (accuracy === null) return { label: '未检测', className: 'empty' }
  if (accuracy >= 80) return { label: '稳固', className: 'strong' }
  if (accuracy >= 60) return { label: '待巩固', className: 'mid' }
  return { label: '不熟悉', className: 'weak' }
}

function padNumber(value: number) {
  return String(value).padStart(2, '0')
}

function sectionElementId(sectionId: string) {
  return `section-${sectionId.replaceAll('.', '-')}`
}

function knowledgePointElementId(pointId: string) {
  return `knowledge-point-${pointId.replaceAll('.', '-')}`
}

async function scrollToSection(sectionId: string, expand = true) {
  if (expand) {
    const next = new Set(expanded.value)
    next.add(sectionId)
    expanded.value = next
  }
  await nextTick()
  document
    .getElementById(sectionElementId(sectionId))
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function scrollToPoint(pointId: string) {
  const point = knowledgePointById.get(pointId)
  if (!point) return
  const next = new Set(expanded.value)
  next.add(point.sectionId)
  expanded.value = next
  await nextTick()
  document
    .getElementById(knowledgePointElementId(pointId))
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(
  chapter,
  (value) => {
    if (value) {
      progress.setLastViewedChapter(value.id)
      document.title = `第 ${value.id} 章 ${value.title} · 内核手册`
    }
  },
  { immediate: true },
)

let focusTimer: number | undefined

onMounted(() => {
  const focusedPoint = route.query.point
  const focusedSection = route.query.section
  if (typeof focusedPoint === 'string' && knowledgePointById.has(focusedPoint)) {
    focusTimer = window.setTimeout(() => {
      void scrollToPoint(focusedPoint)
    }, 420)
    return
  }
  if (
    typeof focusedSection === 'string' &&
    chapter.value?.sections.some((section) => section.id === focusedSection)
  ) {
    focusTimer = window.setTimeout(() => {
      void scrollToSection(focusedSection)
    }, 420)
  }
})

onUnmounted(() => {
  if (focusTimer) window.clearTimeout(focusTimer)
})
</script>

<template>
  <div v-if="!chapter" class="page-container not-found-inline">
    <span class="eyebrow">404 / CHAPTER NOT FOUND</span>
    <h1>这一章不存在</h1>
    <p>学习地图只收录《Vue.js 设计与实现》的第 1 至第 18 章。</p>
    <RouterLink to="/" class="btn btn-primary">
      <ArrowLeft :size="16" /> 返回学习地图
    </RouterLink>
  </div>

  <div v-else class="chapter-view" :style="{ '--chapter-accent': part?.accent }">
    <div class="page-container">
      <nav class="breadcrumbs" aria-label="面包屑">
        <RouterLink to="/">学习地图</RouterLink>
        <span>/</span>
        <span>{{ part?.title }}</span>
        <span>/</span>
        <strong>第 {{ padNumber(chapter.id) }} 章</strong>
      </nav>

      <section class="chapter-hero">
        <div class="chapter-hero-main">
          <div class="eyebrow chapter-eyebrow">
            <span class="eyebrow-line" />
            CHAPTER {{ padNumber(chapter.id) }} · {{ part?.kicker }}
          </div>
          <h1>{{ chapter.title }}</h1>
          <p class="chapter-tagline">{{ chapter.tagline }}</p>
          <p class="chapter-summary">{{ chapter.summary }}</p>

          <div class="chapter-actions">
            <RouterLink
              :to="{ name: 'practice', query: { scope: 'chapter', id: chapter.id } }"
              class="btn btn-primary"
            >
              <ListChecks :size="17" :stroke-width="1.9" />
              开始本章检测
              <span class="btn-divider" />
              {{ chapterQuestions.length }} 题
            </RouterLink>
            <RouterLink
              v-if="stats.answered > 0"
              :to="{ name: 'practice', query: { scope: 'chapter', id: chapter.id } }"
              class="btn btn-secondary"
            >
              <RotateCcw :size="15" />
              再测一次
            </RouterLink>
            <RouterLink v-else to="/wrong" class="btn btn-ghost">
              <BookOpen :size="16" />
              打开错题本
            </RouterLink>
          </div>

          <div class="chapter-meta">
            <span><i />起始页 p.{{ chapter.page }}</span>
            <span>{{ chapter.sections.length }} 个正文小节</span>
            <span>{{ chapterPoints.length }} 个知识颗粒</span>
            <span>{{ chapterQuestions.length }} 道检测题</span>
          </div>
        </div>

        <div class="chapter-hero-aside">
          <span class="chapter-giant-number">{{ padNumber(chapter.id) }}</span>
          <div class="design-question">
            <span class="eyebrow">DESIGN QUESTION</span>
            <p>{{ chapter.designQuestion }}</p>
            <span class="design-question-mark">?</span>
          </div>
        </div>
      </section>

      <section class="chapter-metrics" aria-label="本章学习状态">
        <div class="metric-cell">
          <span>本章掌握度</span>
          <strong>{{ stats.accuracy === null ? '—' : `${stats.accuracy}%` }}</strong>
          <MasteryMeter :value="stats.accuracy" compact />
        </div>
        <div class="metric-cell">
          <span>已测知识颗粒</span>
          <strong>{{ chapterTestedPoints }}<small> / {{ chapterPoints.length }}</small></strong>
          <span class="metric-caption">知识库共 {{ chapterPoints.length }} 个颗粒</span>
        </div>
        <div class="metric-cell">
          <span>薄弱知识颗粒</span>
          <strong>{{ chapterWeakPoints.length }}<small> 个</small></strong>
          <span class="metric-caption">正确率低于 70% 的原子知识点</span>
        </div>
        <div class="metric-cell metric-cell--quote">
          <Target :size="16" />
          <span>先理解问题，再记住实现。</span>
        </div>
      </section>

      <div class="chapter-layout">
        <section class="section-articles">
          <div class="section-heading section-heading--compact">
            <div>
              <span class="eyebrow"><Layers3 :size="13" /> KNOWLEDGE CARDS</span>
              <h2>逐节学习</h2>
              <p>每节拆成 3 个知识颗粒。先阅读颗粒内容，再做整节或单颗自测。</p>
            </div>
            <span class="section-note">点击“核心要点”展开知识颗粒</span>
          </div>

          <article
            v-for="section in chapter.sections"
            :id="sectionElementId(section.id)"
            :key="section.id"
            class="section-card"
            :class="{
              'is-weak': sectionMastery(section.id).accuracy !== null && (sectionMastery(section.id).accuracy ?? 100) < 70,
              'is-focused': route.query.section === section.id,
            }"
          >
            <div class="section-card-head">
              <div class="section-number">
                <span>{{ section.id }}</span>
                <small>p.{{ section.page }}</small>
              </div>
              <div class="section-main">
                <div class="section-title-row">
                  <h3>{{ section.title }}</h3>
                  <span
                    class="section-status"
                    :class="`section-status--${sectionStatus(section.id).className}`"
                  >
                    <i />
                    {{ sectionStatus(section.id).label }}
                  </span>
                </div>
                <p>{{ section.overview }}</p>
                <div class="section-inline-meta">
                  <span>{{ pointsForSection(section.id).length }} 个知识颗粒</span>
                  <span>已测 {{ testedPointCount(section.id) }} 个</span>
                  <span>{{ questionCount(section.id) }} 道题</span>
                </div>
              </div>
              <div class="section-actions">
                <button
                  type="button"
                  class="text-button"
                  :aria-expanded="expanded.has(section.id)"
                  @click="toggleSection(section.id)"
                >
                  核心要点
                  <ChevronDown
                    :size="14"
                    :class="{ 'is-rotated': expanded.has(section.id) }"
                  />
                </button>
                <RouterLink
                  :to="{ name: 'practice', query: { scope: 'section', id: section.id } }"
                  class="mini-test-btn"
                >
                  本节自测
                  <ArrowRight :size="13" />
                </RouterLink>
              </div>
            </div>

            <Transition name="reveal">
              <div v-if="expanded.has(section.id)" class="section-points">
                <div class="points-heading">
                  <span class="eyebrow">ATOMIC KNOWLEDGE</span>
                  <span>已测 {{ testedPointCount(section.id) }} / {{ pointsForSection(section.id).length }} 个知识颗粒</span>
                </div>

                <div class="knowledge-point-list">
                  <article
                    v-for="(point, index) in pointsForSection(section.id)"
                    :id="knowledgePointElementId(point.id)"
                    :key="point.id"
                    class="knowledge-point"
                    :class="{
                      'is-focused-point': route.query.point === point.id,
                      'is-tested': pointStatus(point.id).tested,
                    }"
                  >
                    <div class="knowledge-point-head">
                      <span class="knowledge-point-index">K{{ String(index + 1).padStart(2, '0') }}</span>
                      <div class="knowledge-point-copy">
                        <div class="knowledge-point-title-row">
                          <h4>{{ point.title }}</h4>
                          <span
                            class="point-status"
                            :class="`point-status--${pointStatus(point.id).className}`"
                          >
                            {{ pointStatus(point.id).label }}
                          </span>
                        </div>
                        <p>{{ point.detail }}</p>
                      </div>
                    </div>
                    <div class="knowledge-point-footer">
                      <span>{{ point.questionIds.length }} 道关联题</span>
                      <RouterLink
                        v-if="point.questionIds.length"
                        :to="{ name: 'practice', query: { scope: 'point', id: point.id } }"
                        class="point-test-link"
                      >
                        本点自测
                        <ArrowRight :size="12" />
                      </RouterLink>
                      <span v-else class="point-test-muted">阅读型知识颗粒</span>
                    </div>
                  </article>
                </div>

                <div v-if="section.pitfall" class="pitfall">
                  <CircleAlert :size="15" />
                  <p><strong>易错边界</strong>{{ section.pitfall }}</p>
                </div>
              </div>
            </Transition>
          </article>
        </section>

        <aside class="chapter-rail">
          <div class="chapter-rail-sticky">
            <article class="rail-card chapter-directory">
              <div class="rail-heading">
                <div>
                  <span class="eyebrow"><ListChecks :size="13" /> CONTENTS</span>
                  <h3>本章目录</h3>
                </div>
                <span class="rail-count">{{ chapter.sections.length }}</span>
              </div>
              <div class="directory-list">
                <button
                  v-for="section in chapter.sections"
                  :key="section.id"
                  type="button"
                  class="directory-item"
                  @click="scrollToSection(section.id)"
                >
                  <span>{{ section.id }}</span>
                  <strong>{{ section.title }}</strong>
                  <i
                    class="directory-dot"
                    :class="`directory-dot--${sectionStatus(section.id).className}`"
                  />
                </button>
              </div>
              <RouterLink
                :to="{ name: 'practice', query: { scope: 'chapter', id: chapter.id } }"
                class="directory-test"
              >
                整章检测 · {{ chapterQuestions.length }} 题
                <ArrowRight :size="14" />
              </RouterLink>
            </article>

            <article v-if="chapterWeakPoints.length" class="rail-card chapter-weak">
              <div class="rail-heading">
                <div>
                  <span class="eyebrow"><Target :size="13" /> FOCUS</span>
                  <h3>需要回看</h3>
                </div>
              </div>
              <button
                v-for="weak in chapterWeakPoints"
                :key="weak.pointId"
                type="button"
                class="chapter-weak-item"
                @click="scrollToPoint(weak.pointId)"
              >
                <span>{{ weak.sectionId }} · {{ weak.accuracy }}%</span>
                <strong>{{ weak.title }}</strong>
                <small>{{ weak.detail }}</small>
                <ArrowUpRight :size="13" />
              </button>
            </article>

            <div class="chapter-neighbors">
              <RouterLink
                v-if="previousChapter"
                :to="`/chapter/${previousChapter.id}`"
                class="neighbor-link"
              >
                <ArrowLeft :size="14" />
                <span><small>上一章</small><strong>{{ previousChapter.title }}</strong></span>
              </RouterLink>
              <RouterLink
                v-if="nextChapter"
                :to="`/chapter/${nextChapter.id}`"
                class="neighbor-link neighbor-link--next"
              >
                <span><small>下一章</small><strong>{{ nextChapter.title }}</strong></span>
                <ArrowRight :size="14" />
              </RouterLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
