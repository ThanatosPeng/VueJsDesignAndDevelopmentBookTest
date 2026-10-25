<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Database, ShieldAlert, Trash2, X } from 'lucide-vue-next'
import { useProgressStore } from '@/stores/progress'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const progress = useProgressStore()
const cancelButton = ref<HTMLButtonElement | null>(null)

const summary = computed(() => ({
  attempts: progress.overall.attemptCount,
  points: progress.overall.testedKnowledgePoints,
  wrong: progress.wrongQuestionIds.length,
}))

function close() {
  emit('close')
}

function confirmClear() {
  progress.clearAllData()
  close()
  router.push({ name: 'home', query: { cleared: '1' } })
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') close()
}

watch(
  () => props.open,
  async (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      await nextTick()
      cancelButton.value?.focus()
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="modal-backdrop"
        role="presentation"
        @click.self="close"
      >
        <div
          class="submit-modal clear-data-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-data-title"
        >
          <button
            type="button"
            class="modal-close"
            aria-label="关闭"
            @click="close"
          >
            <X :size="17" />
          </button>

          <span class="modal-mark modal-mark--danger">
            <ShieldAlert :size="23" />
          </span>
          <span class="eyebrow">LOCAL DATA / DANGER ZONE</span>
          <h2 id="clear-data-title">清空所有本地学习数据？</h2>
          <p>
            这会移除当前浏览器中保存的检测报告、错题记录、知识颗粒掌握度和「继续学习」位置。
            知识卡与题库不会删除，你可以从零重新开始。
          </p>

          <div class="clear-data-summary">
            <span>
              <Database :size="14" />
              <small>检测记录</small>
              <strong>{{ summary.attempts }}</strong>
            </span>
            <span>
              <small>已测知识颗粒</small>
              <strong>{{ summary.points }}</strong>
            </span>
            <span>
              <small>待复习错题</small>
              <strong>{{ summary.wrong }}</strong>
            </span>
          </div>

          <p class="clear-data-warning">
            操作不可撤销，且不会影响其他网站的数据。
          </p>

          <div class="modal-actions">
            <button
              ref="cancelButton"
              type="button"
              class="btn btn-secondary"
              @click="close"
            >
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="confirmClear">
              <Trash2 :size="15" />
              确认清空
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
