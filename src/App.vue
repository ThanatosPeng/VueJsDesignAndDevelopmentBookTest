<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const isFocusMode = computed(() => Boolean(route.meta.focus))
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--focus': isFocusMode }">
    <AppHeader v-if="!isFocusMode" />
    <main class="app-main" :class="{ 'app-main--focus': isFocusMode }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter v-if="!isFocusMode" />
  </div>
</template>
