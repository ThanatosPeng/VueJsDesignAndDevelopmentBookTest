<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowLeft, Compass } from 'lucide-vue-next'
</script>

<template>
  <div class="not-found-page page-container">
    <div class="not-found-art">
      <span>4</span>
      <Compass :size="62" :stroke-width="1.2" />
      <span>4</span>
    </div>
    <span class="eyebrow">LOST IN THE COMPONENT TREE</span>
    <h1>这一页没有对应的 vnode</h1>
    <p>地址可能写错了，或者这个路由从未被挂载。回到学习地图，从第一章继续。</p>
    <RouterLink to="/" class="btn btn-primary">
      <ArrowLeft :size="16" /> 返回学习地图
    </RouterLink>
  </div>
</template>
