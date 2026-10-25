<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowUpRight, BookMarked, Database, Target } from 'lucide-vue-next'
import ClearDataDialog from '@/components/ClearDataDialog.vue'
import { useProgressStore } from '@/stores/progress'

const route = useRoute()
const progress = useProgressStore()
const showClearData = ref(false)

const wrongCount = computed(() => progress.wrongQuestionIds.length)
const coverage = computed(
  () =>
    `${progress.overall.testedKnowledgePoints}/${progress.overall.totalKnowledgePoints}`,
)
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand" aria-label="内核手册首页">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 36 36" fill="none">
            <path d="M6 9.5h6.4L18 20.2l5.6-10.7H30L18 30 6 9.5Z" fill="currentColor" />
            <path d="M12.4 9.5h5.1L18 10.7l.5-1.2h5.1L18 21l-5.6-11.5Z" fill="#10201c" opacity=".76" />
          </svg>
        </span>
        <span class="brand-copy">
          <strong>内核手册</strong>
          <small>Vue.js 设计与实现</small>
        </span>
      </RouterLink>

      <nav class="main-nav" aria-label="主导航">
        <RouterLink
          to="/"
          class="nav-link"
          :class="{ 'is-active': route.name === 'home' }"
        >
          <BookMarked :size="15" :stroke-width="1.8" />
          <span>学习地图</span>
        </RouterLink>
        <RouterLink
          to="/wrong"
          class="nav-link"
          :class="{ 'is-active': route.name === 'wrong-book' }"
        >
          <Target :size="15" :stroke-width="1.8" />
          <span>错题本</span>
          <span v-if="wrongCount" class="nav-badge">{{ wrongCount }}</span>
        </RouterLink>
      </nav>

      <div class="header-actions">
        <span class="header-coverage" :title="`已测知识颗粒 ${coverage}`">
          <span class="pulse-dot" />
          {{ coverage }} 颗粒已测
        </span>
        <button
          type="button"
          class="header-data"
          title="本地学习数据"
          aria-label="本地学习数据与清空"
          @click="showClearData = true"
        >
          <Database :size="15" :stroke-width="1.8" />
          <span>数据</span>
        </button>
        <RouterLink
          :to="{ name: 'practice', query: { scope: 'all' } }"
          class="header-cta"
        >
          全书检测
          <ArrowUpRight :size="15" :stroke-width="2" />
        </RouterLink>
      </div>
    </div>

    <ClearDataDialog :open="showClearData" @close="showClearData = false" />
  </header>
</template>
