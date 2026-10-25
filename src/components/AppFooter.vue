<script setup lang="ts">
import { totalKnowledgePoints } from '@/data/knowledge'
import { totalQuestions } from '@/data/questions'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-quote">
        <span class="footer-mark">“</span>
        <p>框架设计是权衡的艺术。理解为什么，比记住怎么写更重要。</p>
      </div>
      <div class="footer-meta">
        <span>18 CHAPTERS · 104 SECTIONS · {{ totalKnowledgePoints }} GRANULES · {{ totalQuestions }} QUESTIONS</span>
        <span>非官方学习工具 · 内容基于《Vue.js 设计与实现》整理</span>
      </div>
    </div>
  </footer>
</template>
