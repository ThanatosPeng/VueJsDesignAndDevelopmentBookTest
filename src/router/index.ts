import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ChapterView from '@/views/ChapterView.vue'
import PracticeView from '@/views/PracticeView.vue'
import ResultView from '@/views/ResultView.vue'
import WrongBookView from '@/views/WrongBookView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '学习地图' },
    },
    {
      path: '/chapter/:chapterId',
      name: 'chapter',
      component: ChapterView,
      meta: { title: '章节学习' },
    },
    {
      path: '/practice',
      name: 'practice',
      component: PracticeView,
      meta: { title: '知识检测', focus: true },
    },
    {
      path: '/result/:attemptId',
      name: 'result',
      component: ResultView,
      meta: { title: '检测报告' },
    },
    {
      path: '/wrong',
      name: 'wrong-book',
      component: WrongBookView,
      meta: { title: '错题本' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: '页面不存在' },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 96, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : '学习地图'
  document.title = `${title} · 内核手册`
})

export default router
