import type { QuestionSeed } from '@/types'

export const part6Questions: QuestionSeed[] = [
  {
    id: 'q18-01',
    chapterId: 18,
    sectionId: '18.1',
    concept: '同构渲染',
    type: 'single',
    difficulty: '基础',
    stem: '在“服务端渲染 + 客户端激活”的同构方案中，hydration 的主要目标是？',
    options: [
      { value: 'A', label: '在客户端重新创建一整套 DOM，覆盖服务端输出' },
      { value: 'B', label: '复用服务端 HTML，挂载事件并恢复组件运行时状态' },
      { value: 'C', label: '完全禁用客户端 JavaScript' },
      { value: 'D', label: '只用于改善 CSS 加载速度' },
    ],
    answer: ['B'],
    explanation:
      '服务端输出首屏 HTML；客户端激活时沿着已有 DOM 与 vnode 对齐，复用节点并建立事件与响应式关系，之后才进入正常更新流程。',
  },
  {
    id: 'q18-02',
    chapterId: 18,
    sectionId: '18.2',
    concept: 'SSR HTML 序列化',
    type: 'single',
    difficulty: '进阶',
    stem: '把 vnode 渲染为 HTML 字符串时，以下哪项处理是必要的？',
    options: [
      { value: 'A', label: '对文本和属性值进行转义，并正确处理 void 元素与布尔属性' },
      { value: 'B', label: '为了保留结构，所有文本都不转义' },
      { value: 'C', label: '所有元素都必须输出结束标签' },
      { value: 'D', label: '不能用任何字符串拼接' },
    ],
    answer: ['A'],
    explanation:
      'SSR 直接生成 HTML 文本，必须防止用户内容注入标签；同时 void 元素、布尔属性、class/style 等都要按 HTML 规则序列化。',
  },
  {
    id: 'q18-03',
    chapterId: 18,
    sectionId: '18.3',
    concept: '服务端生命周期',
    type: 'single',
    difficulty: '基础',
    stem: '同构渲染时，以下哪个生命周期通常不会在服务端执行？',
    options: [
      { value: 'A', label: 'setup' },
      { value: 'B', label: '组件的 render' },
      { value: 'C', label: 'mounted' },
      { value: 'D', label: '计算属性的读取' },
    ],
    answer: ['C'],
    explanation:
      '服务端没有真实 DOM，mounted 等与 DOM 挂载相关的钩子不会执行。setup、render 等生成输出所需的逻辑仍会执行。',
  },
  {
    id: 'q18-04',
    chapterId: 18,
    sectionId: '18.4',
    concept: 'hydration mismatch',
    type: 'single',
    difficulty: '进阶',
    stem: '什么情况可能导致客户端激活出现 hydration mismatch？',
    options: [
      { value: 'A', label: '服务端与客户端首次渲染结果不一致，例如渲染阶段读取了当前时间或随机数' },
      { value: 'B', label: '客户端成功复用了服务端 DOM' },
      { value: 'C', label: '组件使用了 props' },
      { value: 'D', label: '页面中使用了 CSS' },
    ],
    answer: ['A'],
    explanation:
      '激活要求服务端和客户端首次输出结构与内容一致。渲染依赖时间、随机数、window 等非确定或平台特定状态时，容易不一致并导致节点错配。',
  },
  {
    id: 'q18-05',
    chapterId: 18,
    sectionId: '18.5',
    concept: '同构代码约束',
    type: 'multiple',
    difficulty: '进阶',
    stem: '编写同构/SSR 代码时，以下哪些做法是正确的？',
    options: [
      { value: 'A', label: '避免在渲染阶段直接访问 window/document' },
      { value: 'B', label: '每个请求创建独立的应用实例，避免状态串用' },
      { value: 'C', label: '用 ClientOnly 或环境判断隔离只应在浏览器运行的逻辑' },
      { value: 'D', label: '把所有用户状态放到模块级单例中，减少重复创建' },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '服务端无 DOM，浏览器专属 API 应放到客户端生命周期或条件分支；模块级单例会在并发请求间共享，造成交叉污染。',
  },
  {
    id: 'q18-06',
    chapterId: 18,
    sectionId: '18.5',
    concept: '请求状态隔离',
    type: 'single',
    difficulty: '挑战',
    stem: '为什么 SSR 服务端应避免用模块顶层单例保存用户相关响应式状态？',
    options: [
      { value: 'A', label: '不同请求可能共享同一个单例，造成用户数据交叉污染' },
      { value: 'B', label: '模块级变量无法被 JavaScript 读取' },
      { value: 'C', label: '单例会让客户端无法加载 HTML' },
      { value: 'D', label: '服务端不支持 Proxy' },
    ],
    answer: ['A'],
    explanation:
      '服务端进程会长期运行并处理多个请求，模块顶层状态会被所有请求复用。必须为每个请求创建独立应用实例，隔离用户数据。',
  },
]
