<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number | null
    compact?: boolean
    showLabel?: boolean
  }>(),
  {
    compact: false,
    showLabel: false,
  },
)

const tone = computed(() => {
  if (props.value === null) return 'empty'
  if (props.value >= 80) return 'strong'
  if (props.value >= 60) return 'mid'
  return 'weak'
})

const width = computed(() => `${Math.min(100, Math.max(0, props.value ?? 0))}%`)
</script>

<template>
  <div
    class="mastery-meter"
    :class="[`mastery-meter--${tone}`, { 'is-compact': compact }]"
  >
    <div class="mastery-track">
      <span class="mastery-fill" :style="{ width }" />
    </div>
    <span v-if="showLabel" class="mastery-label">
      {{ value === null ? '未检测' : `${value}%` }}
    </span>
  </div>
</template>
