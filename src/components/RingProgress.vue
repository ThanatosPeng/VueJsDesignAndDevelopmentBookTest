<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    size?: number
    stroke?: number
    tone?: string
  }>(),
  {
    size: 168,
    stroke: 5,
    tone: 'var(--jade-bright)',
  },
)

const radius = 52
const circumference = 2 * Math.PI * radius
const normalized = computed(() => Math.min(100, Math.max(0, props.value)))
const offset = computed(() => circumference * (1 - normalized.value / 100))
</script>

<template>
  <div
    class="progress-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="`完成度 ${normalized}%`"
  >
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle
        class="ring-track"
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
      />
      <circle
        class="ring-value"
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        :stroke="tone"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        transform="rotate(-90 60 60)"
      />
    </svg>
    <div class="ring-content">
      <slot />
    </div>
  </div>
</template>
