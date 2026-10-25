import type { BookPart, Chapter } from '@/types'

export const bookParts: BookPart[] = [
  {
    id: 'part-1',
    order: 1,
    title: '框架设计概览',
    kicker: 'WHY',
    description: '先想清楚框架为什么这样设计，再进入实现细节。',
    accent: '#2f8067',
    chapterIds: [1, 2, 3],
  },
  {
    id: 'part-2',
    order: 2,
    title: '响应系统',
    kicker: 'CORE',
    description: '从副作用函数出发，构建数据与视图之间的自动联系。',
    accent: '#b57932',
    chapterIds: [4, 5, 6],
  },
  {
    id: 'part-3',
    order: 3,
    title: '渲染器',
    kicker: 'RENDER',
    description: '把虚拟节点变成真实界面，并用最少的 DOM 操作完成更新。',
    accent: '#b55743',
    chapterIds: [7, 8, 9, 10, 11],
  },
  {
    id: 'part-4',
    order: 4,
    title: '组件化',
    kicker: 'COMPOSE',
    description: '用组件实例、生命周期、插槽和内建组件组织大型应用。',
    accent: '#4c6b8a',
    chapterIds: [12, 13, 14],
  },
  {
    id: 'part-5',
    order: 5,
    title: '编译器',
    kicker: 'COMPILE',
    description: '从模板到渲染函数，理解编译时优化如何反哺运行时。',
    accent: '#7b5f9c',
    chapterIds: [15, 16, 17],
  },
  {
    id: 'part-6',
    order: 6,
    title: '服务端渲染',
    kicker: 'SSR',
    description: '跨越服务端与浏览器，在两端复用同一套组件代码。',
    accent: '#4f6f6d',
    chapterIds: [18],
  },
]

export const chapters: Chapter[] = [
  {
    id: 1,
    partId: 'part-1',
    title: '权衡的艺术',
    page: 2,
    tagline: '框架设计没有银弹，只有成本被放在哪里。',
    summary:
      '命令式与声明式、性能与可维护性、运行时与编译时，构成了框架设计的第一组坐标。Vue 选择声明式的开发体验，并通过虚拟 DOM 与编译时优化把性能成本控制在可接受范围内。',
    designQuestion: '为什么 Vue 不追求“绝对最快”，而是选择声明式与可维护性？',
    sections: [
      {
        id: '1.1',
        title: '命令式和声明式',
        page: 2,
        overview:
          '命令式关注“怎么做”，由开发者逐步操作 DOM；声明式只描述“要什么”，把具体操作交给框架。',
        points: [
          '命令式代码控制精确，但状态与 DOM 操作容易不同步，心智负担高。',
          'Vue 模板是声明式的，框架内部再把声明转换为命令式的 DOM 操作。',
          '声明式不是零成本，它把复杂度从业务代码转移到了框架运行时。',
        ],
        pitfall: '不要误以为声明式代码一定比手写 DOM 更快，它换来的是可维护性。',
      },
      {
        id: '1.2',
        title: '性能与可维护性的权衡',
        page: 3,
        overview:
          '声明式框架必须找出“状态变化后哪一部分 UI 要更新”，这份额外工作是性能代价的来源。',
        points: [
          '性能的理论下限是直接执行必要的 DOM 操作；声明式还需要承担寻找差异的成本。',
          '框架的目标不是每项指标都第一，而是在可维护、可扩展的前提下提供足够好的性能。',
          '虚拟 DOM 是 Vue 实现声明式更新、并控制更新成本的关键中间层。',
        ],
      },
      {
        id: '1.3',
        title: '虚拟 DOM 的性能到底如何',
        page: 4,
        overview:
          '虚拟 DOM 不是“任何场景都更快”的银弹，它的优势来自把大规模、频繁更新时的 DOM 操作收敛为差异更新。',
        points: [
          '首次渲染时，模板字符串配合 innerHTML 往往可以直接生成 DOM，虚拟 DOM 反而多了创建与 diff 开销。',
          '更新阶段，虚拟 DOM 能定位差异，只修改必要的节点与属性，尤其适合视图规模较大、更新频繁的场景。',
          '虚拟 DOM 的真正价值是性能、可维护性与跨平台能力的平衡，而不是单项性能第一。',
        ],
        pitfall: '“虚拟 DOM 比原生 DOM 快”是一个过于粗糙的判断，必须说明场景。',
      },
      {
        id: '1.4',
        title: '运行时和编译时',
        page: 8,
        overview:
          '运行时负责执行，编译时负责把用户输入转换为更高效的代码。Vue 3 同时拥抱两端。',
        points: [
          '纯运行时更灵活，可以接收任意 render 函数，但无法提前分析模板结构。',
          '纯编译时可以把模板直接编译成命令式代码，运行时更轻，但灵活性和动态能力受限。',
          'Vue 3 是运行时 + 编译时框架：编译阶段分析模板并收集优化信息，运行时执行优化后的渲染代码。',
        ],
        pitfall: '运行时 + 编译时不是简单叠加，而是编译产物与运行时约定共同协作。',
      },
    ],
  },
  {
    id: 2,
    partId: 'part-1',
    title: '框架设计的核心要素',
    page: 12,
    tagline: '成熟框架的功夫，往往藏在开发者看不见的边缘。',
    summary:
      '开发体验、产物体积、Tree-Shaking、构建格式、特性开关、错误处理和类型支持，共同决定了一个框架能否在真实工程中稳定落地。',
    designQuestion: '一个“好用”的框架，除了 API，还需要为工程化做哪些准备？',
    sections: [
      {
        id: '2.1',
        title: '提升用户的开发体验',
        page: 12,
        overview:
          '框架的警告不只是“报个错”，而应告诉开发者发生了什么、在哪发生、如何处理。',
        points: [
          '开发环境警告应包含组件调用栈、源码位置和可执行的修复建议。',
          'Vue 为 ref、reactive 等响应式数据提供自定义控制台格式化，降低调试成本。',
          '所有开发辅助都应在生产构建中被剔除，避免运行时与包体积的额外开销。',
        ],
      },
      {
        id: '2.2',
        title: '控制框架代码的体积',
        page: 14,
        overview:
          '开发环境需要完整警告，生产环境需要尽可能小的代码，两者通过编译期常量分道扬镳。',
        points: [
          '用 `__DEV__` 包裹开发警告和调试逻辑，生产构建时替换为 `false`。',
          '常量折叠与 Dead Code Elimination 会删除永远不执行的分支。',
          '注释、调试标记与未使用特性也会在构建阶段被移除。',
        ],
      },
      {
        id: '2.3',
        title: '框架要做到良好的 Tree-Shaking',
        page: 15,
        overview:
          'Tree-Shaking 依赖 ESM 的静态结构：没有被使用的导出应当可以安全移除。',
        points: [
          '副作用会阻止摇树优化，因此模块顶层应避免无意义的副作用代码。',
          '使用 `/*#__PURE__*/` 标记纯函数调用，帮助打包器判断返回值未被使用时可删除。',
          '特性开关配合 Tree-Shaking，可以让未启用的功能真正离开产物。',
        ],
        pitfall: '只写 ESM 并不自动等于可 Tree-Shaking，副作用和导出方式同样重要。',
      },
      {
        id: '2.4',
        title: '框架应该输出怎样的构建产物',
        page: 17,
        overview:
          '不同使用场景需要不同模块格式与构建版本，Vue 因此提供多套产物。',
        points: [
          'IIFE 版本适合通过 `<script>` 直接使用；ESM browser 版本面向现代浏览器。',
          'ESM bundler 版本保留静态结构，便于打包器 Tree-Shaking 和替换特性开关；CJS 版本供 Node 环境使用。',
          'runtime-only 构建不含模板编译器，体积更小；完整构建包含编译器，适合运行时编译模板。',
        ],
      },
      {
        id: '2.5',
        title: '特性开关',
        page: 19,
        overview:
          '特性开关是编译期常量，用分支包裹功能，让打包器能够按需删除未启用的代码。',
        points: [
          '`__VUE_OPTIONS_API__` 控制 Options API 相关代码，可帮助只使用组合式 API 的项目减重。',
          '`__VUE_PROD_DEVTOOLS__` 控制生产环境是否保留 devtools 支持。',
          '打包器未定义这些常量时会保留运行时代码并给出提示，因此需要显式配置。',
        ],
      },
      {
        id: '2.6',
        title: '错误处理',
        page: 21,
        overview:
          '框架会调用大量用户代码，必须统一捕获错误，避免一个回调异常拖垮整个应用。',
        points: [
          '生命周期、事件处理、watch 回调等用户代码应通过统一的错误处理函数调用。',
          '错误应交给 `app.config.errorHandler` 等全局钩子处理，并提供组件上下文。',
          '异步任务中的错误同样需要被捕获和上报，不能只处理同步调用。',
        ],
      },
      {
        id: '2.7',
        title: '良好的 TypeScript 类型支持',
        page: 23,
        overview:
          '类型支持不是额外装饰，而是框架开发体验的一部分，需要与运行时 API 保持同步。',
        points: [
          '`defineComponent` 能帮助 TypeScript 正确推导组件选项、props 和上下文类型。',
          '`PropType` 用于显式声明复杂 prop 类型，弥补运行时类型声明的不足。',
          '良好的泛型与类型导出，能让组合式函数和组件在大型项目中保持可维护。',
        ],
      },
    ],
  },
  {
    id: 3,
    partId: 'part-1',
    title: 'Vue.js 3 的设计思路',
    page: 27,
    tagline: '声明式描述、渲染器、组件与编译器，拼成 Vue 的骨架。',
    summary:
      'Vue 用 vnode 声明 UI，用渲染器把 vnode 变成宿主环境中的真实节点，用组件组织可复用逻辑，再用编译器把模板转换为渲染函数。各模块最终在一次响应式更新中协同工作。',
    designQuestion: 'Vue 的各个模块是如何通过 vnode 串成一条完整链路的？',
    sections: [
      {
        id: '3.1',
        title: '声明式地描述 UI',
        page: 27,
        overview:
          '模板、render 函数和 JSX 都是在声明 UI，而 vnode 是这种声明的统一运行时载体。',
        points: [
          'vnode 是普通 JavaScript 对象，用 `type`、`props`、`children` 等字段描述 UI。',
          '模板更贴近 HTML，render 函数更灵活，但最终都会得到 vnode。',
          '模板需要编译器转换为 render 函数，运行时才能真正执行。',
        ],
      },
      {
        id: '3.2',
        title: '初识渲染器',
        page: 29,
        overview:
          '渲染器的职责是把 vnode 递归渲染为真实 DOM：首次挂载用 mount，后续更新用 patch。',
        points: [
          '挂载阶段创建 DOM、设置属性并递归挂载子节点，最后插入容器。',
          '更新阶段比较新旧 vnode，只执行必要的 DOM 修改。',
          '渲染器的核心是 patch，但可以替换宿主环境 API 以支持多个平台。',
        ],
      },
      {
        id: '3.3',
        title: '组件的本质',
        page: 32,
        overview:
          '组件本质上是一个返回 vnode 的函数，或一个带有 render 方法的对象。',
        points: [
          '组件 vnode 的 `type` 指向组件定义，渲染器识别后会创建组件实例。',
          '组件实例执行 render，得到子树 vnode，再交给 patch 继续渲染。',
          '组件树最终会被展开成由元素、文本等宿主节点组成的 vnode 树。',
        ],
      },
      {
        id: '3.4',
        title: '模板的工作原理',
        page: 34,
        overview:
          '模板先由编译器解析为模板 AST，再转换为 JavaScript AST，最终生成渲染函数代码。',
        points: [
          '编译器负责解析、语义转换与代码生成，运行时只执行编译结果。',
          '模板中的插值、指令等会转换为可执行的 JavaScript 表达式和渲染调用。',
          '编译时能够看到模板结构，因此可以提前收集动态节点、静态节点等优化信息。',
        ],
      },
      {
        id: '3.5',
        title: 'Vue.js 是各个模块组成的有机整体',
        page: 36,
        overview:
          '响应系统、渲染器、组件系统与编译器并非孤立模块，它们通过 vnode 和调度器连成一条数据驱动链路。',
        points: [
          '响应式数据被读取时收集渲染副作用，被修改时触发调度。',
          '调度后的渲染副作用执行 render 得到新 vnode，再由渲染器 patch 到真实 DOM。',
          '组件化负责拆分与复用，编译器负责把模板转换成高效渲染代码。',
        ],
      },
    ],
  },
  {
    id: 4,
    partId: 'part-2',
    title: '响应系统的作用与实现',
    page: 40,
    tagline: '读取时记住谁依赖我，修改时通知他们重新执行。',
    summary:
      '从一个极简的 Proxy + effect 出发，逐步补齐依赖清理、嵌套 effect、无限递归、调度、computed、watch 和异步竞态处理，最终得到一个可用的响应系统。',
    designQuestion: '一个“能自动更新”的响应系统，必须跨过哪些坑？',
    sections: [
      {
        id: '4.1',
        title: '响应式数据与副作用函数',
        page: 40,
        overview:
          '副作用函数是执行后会对外部状态产生影响的函数；响应系统的目标，是让数据变化自动重新执行依赖它的副作用。',
        points: [
          '修改 DOM、修改其他变量、发起请求，都可能构成副作用。',
          '响应式实现需要记录“谁读取了哪个属性”，并在属性变化时通知这些副作用。',
          '“读取时收集，设置时触发”是后续所有实现的主线。',
        ],
      },
      {
        id: '4.2',
        title: '响应式数据的基本实现',
        page: 41,
        overview:
          '用 Proxy 拦截对象的 get 与 set：get 时收集 activeEffect，set 时取出依赖并执行。',
        points: [
          'Proxy 能拦截属性读取和修改，是实现响应式的基础能力。',
          'get 拦截器把正在执行的副作用收集到依赖桶中，set 拦截器触发桶内副作用。',
          '最小实现只需一个 Set，但真实场景还需要考虑多个对象、多个键和嵌套。',
        ],
      },
      {
        id: '4.3',
        title: '设计一个完善的响应系统',
        page: 43,
        overview:
          '依赖桶需要从单一 Set 升级为 WeakMap → Map → Set 的三层结构，才能正确描述“对象 + 键 + 副作用”的关系。',
        points: [
          '`WeakMap<target, Map<key, Set<effect>>>` 既支持多个对象和属性，又能在对象被回收时释放依赖。',
          '使用 `Reflect.get(target, key, receiver)` 可以让访问器属性中的 this 指向代理对象。',
          '依赖集合使用 Set 去重，避免同一副作用被重复执行。',
        ],
        pitfall: '直接用 `target[key]` 读取会丢失 receiver 语义，在继承和访问器场景下产生错误。',
      },
      {
        id: '4.4',
        title: '分支切换与 cleanup',
        page: 50,
        overview:
          '条件分支切换后，旧分支的依赖不会再被读取，但如果不清理，它们仍会在无关数据变化时错误触发副作用。',
        points: [
          '每个副作用函数需要记录自己收集过哪些依赖集合（deps）。',
          '每次重新执行前先清理旧依赖，再在执行过程中重新收集当前依赖。',
          '清理后当前分支的新依赖会被重新建立，保证依赖关系随执行路径更新。',
        ],
      },
      {
        id: '4.5',
        title: '嵌套的 effect 与 effect 栈',
        page: 55,
        overview:
          '嵌套 effect 会覆盖全局 activeEffect，导致内层副作用执行完后，外层后续读取无法被正确收集。',
        points: [
          '使用 effectStack 保存执行中的副作用函数。',
          '进入内层 effect 时压栈，内层结束后出栈，并把 activeEffect 恢复为外层 effect。',
          '这样能保证任意读取都归属于当前正在执行的最内层 effect。',
        ],
      },
      {
        id: '4.6',
        title: '避免无限递归循环',
        page: 59,
        overview:
          '如果副作用函数既读取又修改同一个属性，set 触发自身重新执行，就可能形成无限递归。',
        points: [
          'trigger 阶段跳过当前正在执行的 activeEffect，避免自己触发自己。',
          '依赖收集与触发是两件事，跳过自身不会影响其他副作用对属性的依赖。',
          '这类保护需要在响应系统内部实现，不能依赖用户书写顺序。',
        ],
      },
      {
        id: '4.7',
        title: '调度执行',
        page: 60,
        overview:
          '调度器决定副作用在什么时候、以什么顺序执行，是批量更新和异步渲染的基础。',
        points: [
          'effect 的 `options.scheduler` 可以接管副作用执行时机；不调用 runner 就不会立即执行。',
          '任务队列配合微任务刷新，可以合并同一轮中的多次修改。',
          '调度任务需要去重，避免同一副作用在一个刷新周期内反复入队。',
        ],
      },
      {
        id: '4.8',
        title: '计算属性 computed 与 lazy',
        page: 64,
        overview:
          'computed 是带缓存的惰性求值：只有被读取时才计算，依赖变化时通过 dirty 标记失效。',
        points: [
          'lazy effect 不立即执行，访问 computed.value 时才调用 runner 求值。',
          'dirty 为 false 时直接返回缓存；依赖变化时由 scheduler 将 dirty 设为 true。',
          '读取 computed.value 也要 track，否则使用它的副作用无法被通知。',
        ],
        pitfall: 'computed 的缓存不是“永远不重算”，而是依赖未变化时不重算。',
      },
      {
        id: '4.9',
        title: 'watch 的实现原理',
        page: 71,
        overview:
          'watch 本质上是 lazy effect + getter + scheduler 的组合，在依赖变化后把新旧值交给回调。',
        points: [
          'getter 中读取响应式数据，从而建立依赖；scheduler 在变化后安排回调执行。',
          '旧值必须在执行新一次求值前保存，否则回调拿到的新旧值会相同。',
          'deep 通过递归访问对象属性建立依赖，适合侦听深层变化。',
        ],
      },
      {
        id: '4.10',
        title: '立即执行的 watch 与回调执行时机',
        page: 75,
        overview:
          'immediate 与 flush 决定了 watch 回调何时运行，影响它看到的是更新前还是更新后的状态。',
        points: [
          '`immediate` 会在建立监听时立刻执行一次回调。',
          '`flush: "pre"` 在组件更新前执行，`post` 在组件更新后执行，`sync` 则同步执行。',
          '默认调度通常将回调与组件更新排入同一刷新队列，因此需要理解执行顺序。',
        ],
      },
      {
        id: '4.11',
        title: '过期的副作用',
        page: 77,
        overview:
          '异步 watch 回调可能乱序返回，旧请求晚到就会覆盖新结果；需要让过期副作用可以取消。',
        points: [
          '每次执行新回调前先调用上一次注册的 cleanup 函数。',
          '回调可以接收 `onCleanup`，在其中取消请求、清除定时器或解绑监听。',
          '通过“新一轮执行使上一轮失效”的机制，避免竞态导致错误状态。',
        ],
      },
    ],
  },
  {
    id: 5,
    partId: 'part-2',
    title: '非原始值的响应式方案',
    page: 84,
    tagline: 'Proxy 让对象与数组的每个操作都成为可观测入口。',
    summary:
      '基于 Proxy 与 Reflect，Vue 为普通对象、数组、Set、Map 分别设计了拦截策略。为了正确地追踪、触发并保持语言语义，需要处理读写语义、身份、迭代、浅/深响应和只读等边界。',
    designQuestion: '为什么对象响应式不能只拦截 get 和 set？',
    sections: [
      {
        id: '5.1',
        title: '理解 Proxy 和 Reflect',
        page: 84,
        overview:
          'Proxy 拦截对象操作，Reflect 提供与 JavaScript 内部方法一致的默认行为；两者结合才能既拦截又保持语义。',
        points: [
          'Proxy 的 get/set 等 trap 可以替代目标对象的默认行为。',
          'Reflect.get 接收 receiver，能确保访问器属性中的 this 指向正确的代理对象。',
          '使用 Reflect 执行默认行为，可以让代理保持原型链与访问器语义。',
        ],
      },
      {
        id: '5.2',
        title: 'JavaScript 对象及 Proxy 的工作原理',
        page: 88,
        overview:
          '对象操作背后对应一组内部方法，如 [[Get]]、[[Set]]、[[HasProperty]]；Proxy trap 与它们一一对应，并受不变量约束。',
        points: [
          '读取、赋值、`in`、`delete`、`Object.keys` 等行为都有对应的内部方法与 trap。',
          '某些 trap 的返回值必须与目标对象一致，否则会抛出 TypeError。',
          '代理不是复制对象，操作仍然作用在原始目标上。',
        ],
      },
      {
        id: '5.3',
        title: '如何代理 Object',
        page: 92,
        overview:
          '普通对象代理需要在 get 时 track、在 set/delete 等修改操作时 trigger，并缓存代理避免重复包装。',
        points: [
          '`get` 收集依赖，`set`、`deleteProperty`、`has`、`ownKeys` 等按语义触发依赖。',
          '用 WeakMap 缓存原始对象和代理的映射，保证同一个对象始终得到同一个代理。',
          '在 `set` 中需要区分新增属性与修改已有属性，并使用 Reflect 完成默认赋值。',
        ],
      },
      {
        id: '5.4',
        title: '合理地触发响应',
        page: 102,
        overview:
          '触发更新的原则是“值真的变了，且变化对读取者有意义”；相同值、原型链赋值等场景都需要额外判断。',
        points: [
          '使用 `Object.is` 判断新旧值；NaN 与 NaN 应视为相等，0 与 -0 应视为不同。',
          '新增属性触发 ADD，修改已有属性触发 SET，删除属性触发 DELETE。',
          '通过 receiver 判断本次 set 是否真的落在代理目标上，避免原型链上的重复触发。',
        ],
      },
      {
        id: '5.5',
        title: '浅响应与深响应',
        page: 108,
        overview:
          '深响应会递归代理嵌套对象，浅响应只观察第一层；二者是在可观测范围与代理开销之间的选择。',
        points: [
          '深响应在 get 拦截器中把嵌套对象包装成 reactive，访问时逐层建立代理。',
          '浅响应的嵌套对象保持原始引用，修改嵌套属性不会触发外层依赖。',
          'Vue 通过 `reactive` 与 `shallowReactive` 暴露两种能力。',
        ],
      },
      {
        id: '5.6',
        title: '只读和浅只读',
        page: 110,
        overview:
          '只读代理禁止修改并给出开发警告；由于数据不可变，只读代理通常无需收集依赖。',
        points: [
          '`readonly` 的 set/deleteProperty 应拒绝写入，开发环境提示原因。',
          '`shallowReadonly` 只限制第一层，嵌套对象仍可能被修改。',
          '只读代理读取嵌套对象时也要保持只读语义，不能返回可写的普通对象。',
        ],
      },
      {
        id: '5.7',
        title: '代理数组',
        page: 113,
        overview:
          '数组既有索引与 length 的联动，又有遍历与查找方法的身份问题；代理时必须覆盖这些特殊路径。',
        points: [
          '修改索引可能要触发 length 依赖，修改 length 也可能影响索引依赖。',
          '`for...of` 需要追踪迭代键；`includes`、`indexOf` 要处理代理值与原始值的身份差异。',
          'push/pop 等原型方法会隐式读写 length，需要暂停依赖收集以避免重复触发和递归。',
        ],
        pitfall: '直接复用普通对象的 get/set 拦截，通常会漏掉 length、迭代器和查找方法。',
      },
      {
        id: '5.8',
        title: '代理 Set 和 Map',
        page: 132,
        overview:
          '集合的方法依赖正确的 this 与内部槽，响应式代理需要绑定原始集合、包装返回值并追踪迭代与 size。',
        points: [
          '调用 Map/Set 方法时应把 this 绑定到原始集合，否则代理对象缺少内部槽会报错。',
          '`size`、`get`、`add`、`delete`、`forEach` 与迭代器都需要各自建立正确的依赖和触发。',
          '读取集合值时按需包装为响应式对象，但不要把代理对象写回原始集合，避免污染原始数据。',
        ],
      },
    ],
  },
  {
    id: 6,
    partId: 'part-2',
    title: '原始值的响应式方案',
    page: 158,
    tagline: '原始值不能被代理，就用一个盒子把它装起来。',
    summary:
      'ref 用 value 访问器包裹原始值，解决了 Proxy 无法直接代理原始值的问题；toRef/toRefs 处理响应丢失，proxyRefs 与模板解包则改善使用体验。',
    designQuestion: 'ref 为什么必须存在？为什么又需要自动脱 ref？',
    sections: [
      {
        id: '6.1',
        title: '引入 ref 的概念',
        page: 158,
        overview:
          'Proxy 只能代理对象，原始值需要包装成带 getter/setter 的对象，这就是 ref 的基本思想。',
        points: [
          'ref 内部保存原始值，通过 `value` 的 getter 收集依赖、setter 触发更新。',
          '当 ref 包装对象时，内部通常复用 reactive；`shallowRef` 则只观察 `.value` 本身。',
          '访问与修改都必须经过 `.value`，这是原始值可观察的代价。',
        ],
      },
      {
        id: '6.2',
        title: '响应丢失问题',
        page: 160,
        overview:
          '解构 reactive 对象得到的是普通值，后续修改不再与源对象联动，这就是响应丢失。',
        points: [
          '解构会执行一次属性读取，拿到的是值而不是持续绑定。',
          '`toRef` 返回与源对象属性联动的 ref，修改 ref 会写回源对象。',
          '`toRefs` 批量转换对象属性，常用于组合式函数返回可解构的响应式状态。',
        ],
      },
      {
        id: '6.3',
        title: '自动脱 ref',
        page: 164,
        overview:
          '为了在模板和渲染上下文中少写 `.value`，Vue 会在特定位置自动解包 ref。',
        points: [
          '`proxyRefs` 读取属性时若发现是 ref 就返回 `.value`，写入时也能区分 ref 与普通值。',
          '模板中的顶层 ref 会自动解包，因此可以直接写 `count` 而不是 `count.value`。',
          '数组、Map 等集合中的 ref 不会自动解包，访问时仍需显式使用 `.value`。',
        ],
        pitfall: '自动解包只发生在约定好的上下文，不要把它当成所有嵌套位置都自动生效。',
      },
    ],
  },
  {
    id: 7,
    partId: 'part-3',
    title: '渲染器的设计',
    page: 170,
    tagline: '渲染器是响应系统的执行者，也是跨平台的分界线。',
    summary:
      '渲染器把 vnode 映射为宿主环境中的节点，通过 mount 和 patch 完成首次渲染与更新。把宿主 API 抽离后，同一套渲染逻辑可以适配浏览器、Canvas 或原生平台。',
    designQuestion: '如何让同一套渲染逻辑，运行在不同的宿主环境中？',
    sections: [
      {
        id: '7.1',
        title: '渲染器与响应系统的结合',
        page: 170,
        overview:
          '渲染逻辑被包装进副作用函数：首次执行完成挂载，依赖变化后再次执行并 patch。',
        points: [
          'render effect 读取响应式数据，从而建立组件与状态的依赖。',
          '首次执行时容器为空，执行 mount；后续执行时用旧 vnode 与新 vnode 做 patch。',
          '响应系统负责“何时更新”，渲染器负责“更新什么、怎么更新”。',
        ],
      },
      {
        id: '7.2',
        title: '渲染器的基本概念',
        page: 172,
        overview:
          '渲染器围绕 vnode、容器与挂载锚点工作；`patch` 根据 vnode 类型分发到元素、组件、文本等处理逻辑。',
        points: [
          '容器上保存 `_vnode`，用于记录上一次渲染结果。',
          '`mountElement` 负责创建真实节点、设置 props、挂载 children 并插入容器。',
          '`patch` 先判断类型是否相同：相同则更新，不同则卸载旧节点并挂载新节点。',
        ],
      },
      {
        id: '7.3',
        title: '自定义渲染器',
        page: 175,
        overview:
          '通过 `createRenderer` 注入平台相关的节点创建、插入和文本设置 API，就可以复用到非 DOM 环境。',
        points: [
          '宿主环境 API 被抽成配置项，渲染器核心不直接依赖 `document`。',
          '只要实现 createElement、insert、setElementText 等接口，就能渲染到 Canvas 或原生端。',
          '运行时核心因此与具体平台解耦，这是 Vue 跨平台能力的基础。',
        ],
      },
    ],
  },
  {
    id: 8,
    partId: 'part-3',
    title: '挂载与更新',
    page: 180,
    tagline: '渲染器的真正难点，是把“差异”准确落到 DOM 上。',
    summary:
      '从元素属性、class、事件，到子节点、文本、注释和 Fragment，渲染器必须处理大量特殊语义。属性该用 attribute 还是 property、事件如何避免重复绑定，都是正确性的关键。',
    designQuestion: '同一个 vnode 字段，为什么落到 DOM 上会有这么多分支？',
    sections: [
      {
        id: '8.1',
        title: '挂载子节点和元素的属性',
        page: 180,
        overview:
          '挂载元素时，需要创建 DOM、设置属性、挂载子节点，并按正确顺序插入容器。',
        points: [
          'children 为数组时递归 mount 每个子节点，为文本时设置 textContent。',
          'props 需要逐个处理，属性设置与子节点挂载的顺序会影响表单等行为。',
          '挂载时必须有正确锚点，才能把节点插入到指定位置。',
        ],
      },
      {
        id: '8.2',
        title: 'HTML Attributes 与 DOM Properties',
        page: 182,
        overview:
          'HTML attribute 是标记中的字符串，DOM property 是浏览器对象上的属性；同名不代表同义。',
        points: [
          '`input.value` 等 property 反映当前状态，`getAttribute("value")` 读取的是初始值。',
          '`checked`、`disabled` 等布尔语义需要按 property 或 attribute 的正确方式处理。',
          '属性设置必须考虑平台与元素类型，不能机械地一律 setAttribute。',
        ],
      },
      {
        id: '8.3',
        title: '正确地设置元素属性',
        page: 184,
        overview:
          'Vue 会优先判断能否设置 DOM property，并对只读属性、布尔属性、自定义元素等情况做特殊处理。',
        points: [
          '存在 DOM property 且可写时，通常直接设置 property 更符合用户预期。',
          '只读 property（如 `<input form>`）应退回 attribute 设置。',
          '新值为 null 或 false 时要正确移除属性或重置 property，避免残留。',
        ],
      },
      {
        id: '8.4',
        title: 'class 的处理',
        page: 189,
        overview:
          'class 支持字符串、数组和对象形式，渲染器需要先归一化，再整体写入或更新。',
        points: [
          '`normalizeClass` 会展开数组、收集对象中值为真的键。',
          '设置 class 可以用 `className`，也可用 `setAttribute("class", value)`。',
          '空值必须清空 class，更新时直接覆盖整体值即可。',
        ],
      },
      {
        id: '8.5',
        title: '卸载操作',
        page: 192,
        overview:
          '卸载不是简单删除 DOM，而是递归清理子树、触发组件生命周期并移除真实节点。',
        points: [
          '需要递归卸载 children，处理组件 beforeUnmount/unmounted 等钩子。',
          '直接 `container.innerHTML = ""` 会绕过组件生命周期与事件清理。',
          '卸载后应清空容器记录的 `_vnode`，避免后续误用。',
        ],
      },
      {
        id: '8.6',
        title: '区分 vnode 的类型',
        page: 195,
        overview:
          'patch 的第一步是比较新旧 vnode 类型；类型不同必须卸载旧节点并重新挂载。',
        points: [
          '类型比较不仅看标签名，也涉及 key、组件对象等身份信息。',
          '文本节点、注释节点、Fragment、组件各有独立的挂载与更新逻辑。',
          '类型不同时直接替换，可以避免在无意义节点上做属性 diff。',
        ],
      },
      {
        id: '8.7',
        title: '事件的处理',
        page: 196,
        overview:
          '以 `on` 开头的 props 被视为事件。Vue 用 invoker 包装真实处理函数，使更新时无需反复解绑和绑定。',
        points: [
          'invoker 保存在 `el._vei` 上，更新时只替换 `invoker.value`。',
          '同名事件支持多个处理函数，invoker 内部可按数组依次调用。',
          '新值为空时应移除监听并清理缓存，避免事件泄漏。',
        ],
      },
      {
        id: '8.8',
        title: '事件冒泡与更新时机问题',
        page: 201,
        overview:
          '子元素事件处理器触发更新后，父元素可能在同一次冒泡中收到“新绑定”的旧事件，需要通过时间戳保护。',
        points: [
          'invoker 记录自己被绑定的时间（attached），事件发生时比较事件时间戳。',
          '如果事件发生时间晚于绑定时间才执行；否则说明这是一次仍在冒泡的旧事件。',
          '该机制避免事件传播与异步更新交错时，触发不该响应的新监听器。',
        ],
        pitfall: '事件对象的时间戳与绑定时间戳比较是边界保护，不是用来做业务节流的。',
      },
      {
        id: '8.9',
        title: '更新子节点',
        page: 204,
        overview:
          '更新 children 需要根据新旧 children 是文本还是数组，选择不同路径；数组之间则需要 Diff 算法。',
        points: [
          '从文本变数组、数组变文本、空值等情况都要分别处理。',
          '数组 children 的更新要考虑复用、移动、新增与删除，并由 key 辅助身份判断。',
          '更新 children 是渲染器中最复杂的部分，也是 Diff 算法的入口。',
        ],
      },
      {
        id: '8.10',
        title: '文本节点和注释节点',
        page: 209,
        overview:
          '文本节点用 nodeValue 更新，注释节点用于占位或标记，它们同样参与 vnode 的挂载与更新。',
        points: [
          '文本 vnode 的 children 是字符串，更新时只修改文本内容。',
          '注释节点没有可见内容，但在 Fragment、v-if 等场景中可作为占位锚点。',
          '渲染器必须区分元素、文本、注释，不能把所有 vnode 都按元素处理。',
        ],
      },
      {
        id: '8.11',
        title: 'Fragment',
        page: 212,
        overview:
          'Fragment 用于表达多个根节点，它本身不产生真实容器元素，需要借助锚点维护子节点的位置。',
        points: [
          'Fragment 的子节点会被逐个插入到同一容器中的正确锚点。',
          '更新时对 Fragment 的 children 执行 patch，保持原有顺序。',
          'Fragment 的锚点与空节点处理是避免节点错位的关键。',
        ],
      },
    ],
  },
  {
    id: 9,
    partId: 'part-3',
    title: '简单 Diff 算法',
    page: 218,
    tagline: '用 key 找到同一批节点，再决定谁该移动。',
    summary:
      '简单 Diff 以新列表为外层循环，在旧列表中按 key 查找可复用节点，并用 lastIndex 判断是否发生位置交叉。它建立了“复用、移动、挂载、卸载”的完整更新模型。',
    designQuestion: '为什么只比较位置不够，key 和 lastIndex 分别解决了什么？',
    sections: [
      {
        id: '9.1',
        title: '减少 DOM 操作的性能开销',
        page: 218,
        overview:
          '子节点更新不能每次全部卸载重建，否则会造成大量 DOM 操作和状态丢失；Diff 的目标是尽量复用。',
        points: [
          '复用真实 DOM 比重新创建更便宜，也能保留输入框焦点等宿主状态。',
          'Diff 需要在复用与移动之间找到平衡，而不是盲目重建。',
          '子节点的位置、类型和 key 共同决定能否复用。',
        ],
      },
      {
        id: '9.2',
        title: 'DOM 复用与 key 的作用',
        page: 221,
        overview:
          'key 是 vnode 的身份标识，帮助渲染器在旧列表中找回同一个逻辑节点，避免按位置错误复用。',
        points: [
          '插入、删除或排序时，用索引作 key 可能导致状态与 DOM 错配。',
          '稳定唯一的 key 能让节点在列表中移动后仍保留自身状态。',
          '无 key 时按位置比较，适合内容稳定或纯静态列表。',
        ],
        pitfall: 'key 不应使用随机值或每次渲染都变化的值，否则会失去复用意义。',
      },
      {
        id: '9.3',
        title: '找到需要移动的元素',
        page: 225,
        overview:
          '遍历新 children 时，以旧列表中的索引为依据维护 lastIndex；当旧索引小于 lastIndex，说明节点需要移动。',
        points: [
          '在旧 children 中按 key 或位置查找到当前新节点对应的旧索引。',
          '记录已处理节点的最大旧索引 lastIndex。',
          '旧索引小于 lastIndex 说明顺序被打破，节点需要移动；否则可原地复用。',
        ],
      },
      {
        id: '9.4',
        title: '如何移动元素',
        page: 228,
        overview:
          '确定需要移动后，要把旧节点插入到新列表中下一个节点的前面，并为后续插入维护正确的锚点。',
        points: [
          '移动本质是 `insert` 到某个锚点之前，而不是先删除再创建。',
          '锚点通常取新列表中下一个节点的 `el`，没有下一个节点时插入到容器末尾。',
          '节点更新与位置移动要分离，先 patch 内容再调整顺序。',
        ],
      },
      {
        id: '9.5',
        title: '添加新元素',
        page: 233,
        overview:
          '新节点在旧列表中找不到可复用项时，需要创建并挂载到正确位置，而不是一律追加到末尾。',
        points: [
          '新增节点的插入位置由新列表中的后续节点或容器末尾决定。',
          '挂载时同时处理 props、children、事件等完整初始化。',
          '新增与移动可能交替发生，锚点必须随新列表位置计算。',
        ],
      },
      {
        id: '9.6',
        title: '移除不存在的元素',
        page: 238,
        overview:
          '完成新列表遍历后，还要检查旧列表中哪些节点没有出现在新列表里，并卸载它们。',
        points: [
          '以旧 children 为基准，按 key 判断是否仍被新列表复用。',
          '未被复用的节点要执行完整卸载流程，递归清理子树。',
          '移除与新增、移动配合，才能完成一次完整的列表更新。',
        ],
      },
    ],
  },
  {
    id: 10,
    partId: 'part-3',
    title: '双端 Diff 算法',
    page: 242,
    tagline: '从两端同时逼近，优先复用最容易命中的节点。',
    summary:
      '双端 Diff 维护新旧列表的四个指针，依次进行四组首尾比较；非理想情况下通过 key 查找移动节点，最后统一处理剩余新增或删除项。',
    designQuestion: '四组首尾比较为什么能减少常见的 DOM 移动？',
    sections: [
      {
        id: '10.1',
        title: '双端比较的原理',
        page: 242,
        overview:
          '用 oldStart、oldEnd、newStart、newEnd 四个索引，每轮最多进行四组首尾比较，命中后更新指针。',
        points: [
          '四组比较依次为：旧首-新首、旧尾-新尾、旧首-新尾、旧尾-新首。',
          '命中后 patch 对应节点并移动相应指针。',
          '每轮至少推进一个节点，直到一端区间耗尽。',
        ],
      },
      {
        id: '10.2',
        title: '双端比较的优势',
        page: 252,
        overview:
          '双端算法能更早识别头尾移动，在常见列表操作中减少真实的 DOM 移动次数。',
        points: [
          '对头部插入、尾部移动、整体反转等场景，首尾比较可以直接命中。',
          '相比简单 Diff 的单向扫描，双端比较能在两端同时复用节点。',
          '优势是相对的：中间区域频繁乱序时仍需要 key 查找与额外移动。',
        ],
      },
      {
        id: '10.3',
        title: '非理想状况的处理方式',
        page: 255,
        overview:
          '四组比较都不命中时，以新首节点为基准，在旧列表中间查找同 key 节点，找到就移动，找不到就新增。',
        points: [
          '使用 key 在旧列表剩余区间中查找 newStart 对应的节点。',
          '找到后把该旧节点移动到 oldStart 对应的位置之前，并标记旧位置已使用。',
          '找不到则说明是新节点，直接挂载到当前正确位置。',
        ],
      },
      {
        id: '10.4',
        title: '添加新元素',
        page: 263,
        overview:
          '当旧列表先耗尽而新列表仍有剩余时，需要把剩余新节点按顺序挂载到正确锚点。',
        points: [
          '旧列表耗尽说明剩余新节点都没有旧节点可复用。',
          '插入锚点通常是 oldEnd 后面的节点，或容器末尾。',
          '连续插入时必须保持新列表的顺序，不能简单 append。',
        ],
      },
      {
        id: '10.5',
        title: '移除不存在的元素',
        page: 268,
        overview:
          '当新列表先耗尽而旧列表仍有剩余时，剩余旧节点都不再需要，需要执行卸载。',
        points: [
          '遍历 oldStart 到 oldEnd 的剩余区间。',
          '跳过已被移动或标记为空的旧节点，避免重复操作。',
          '对所有未复用节点执行完整卸载流程。',
        ],
      },
    ],
  },
  {
    id: 11,
    partId: 'part-3',
    title: '快速 Diff 算法',
    page: 271,
    tagline: '先跳过稳定前缀与后缀，再用 LIS 求最少移动。',
    summary:
      'Vue 3 的快速 Diff 先处理相同的前后缀，再为剩余节点建立 key 映射，通过最长递增子序列找出可以保持不动的节点，只移动其余节点。',
    designQuestion: '最长递增子序列如何帮助 Diff 算法少移动 DOM？',
    sections: [
      {
        id: '11.1',
        title: '相同的前置元素和后置元素',
        page: 271,
        overview:
          '先从头同步相同节点，再从尾部同步相同节点，快速缩小真正需要复杂处理的区间。',
        points: [
          '前置比较从头部开始，类型与 key 相同时直接 patch 并推进。',
          '后置比较从尾部开始，用双指针同步相同节点。',
          '处理完前后缀后，只剩中间区间需要进一步判断移动与增删。',
        ],
      },
      {
        id: '11.2',
        title: '判断是否需要进行 DOM 移动操作',
        page: 279,
        overview:
          '为剩余新节点建立 key 到新索引的映射，再遍历剩余旧节点填充 oldIndex 数组，同时判断新索引是否持续递增。',
        points: [
          '`keyToNewIndexMap` 用于快速定位旧节点在新列表中的位置。',
          '`newIndexToOldIndexMap` 记录新节点对应的旧索引（索引加一，0 表示新增）。',
          '如果新索引不是持续递增，说明发生了交叉移动；此时求最长递增子序列以减少移动。',
        ],
      },
      {
        id: '11.3',
        title: '如何移动元素',
        page: 288,
        overview:
          '从后向前遍历新列表，利用最长递增子序列判断哪些节点可以不动，其余节点移动到正确锚点前。',
        points: [
          '倒序遍历保证每次处理时右侧锚点已经是最终节点。',
          'LIS 中的节点保持相对顺序不变，不需要移动；其余节点移动到锚点之前。',
          '映射值为 0 的节点是新增节点，需要先挂载；旧列表中未复用的节点最后卸载。',
        ],
        pitfall: 'LIS 求的是“可保持不动的节点集合”，不是需要移动的节点集合。',
      },
    ],
  },
  {
    id: 12,
    partId: 'part-4',
    title: '组件的实现原理',
    page: 298,
    tagline: '组件是带状态的子树工厂，也是生命周期与通信的容器。',
    summary:
      '组件 vnode 驱动实例创建，render effect 驱动组件自更新，props 与 slots 构成父子通信，setup、emit 和生命周期钩子则定义了组合式 API 的运行基础。',
    designQuestion: '一个组件实例在挂载、更新、卸载的完整生命周期中发生了什么？',
    sections: [
      {
        id: '12.1',
        title: '渲染组件',
        page: 298,
        overview:
          '组件 vnode 的 type 是组件定义；渲染器识别后创建实例，执行 render 得到子树 vnode。',
        points: [
          '组件 vnode 最终会生成实例，实例的 `subTree` 指向渲染出的子树。',
          '组件 vnode 的 `el` 通常指向子树根节点，便于父级插入和移动。',
          '组件可以是有状态对象，也可以是返回 vnode 的函数。',
        ],
      },
      {
        id: '12.2',
        title: '组件状态与自更新',
        page: 301,
        overview:
          '组件把自己的 render 包装成响应式副作用，状态变化后调度实例更新，重新渲染并 patch 子树。',
        points: [
          '实例的 update 函数负责重新执行 render，并 patch 新旧子树。',
          '渲染副作用使用调度器进入队列，避免同步重复渲染。',
          '组件自更新只重新渲染当前组件，再通过 patch 将变化传递到子树。',
        ],
      },
      {
        id: '12.3',
        title: '组件实例与组件的生命周期',
        page: 304,
        overview:
          '实例集中保存 props、状态、插槽、子树和生命周期钩子，并维护父子关系与更新状态。',
        points: [
          '挂载流程包括创建实例、初始化 props/slots/setup、渲染子树和触发生命周期。',
          '组件实例是生命周期钩子、事件和渲染上下文共享的载体。',
          '卸载时要递归卸载子树并触发卸载钩子，避免资源泄漏。',
        ],
      },
      {
        id: '12.4',
        title: 'props 与组件的被动更新',
        page: 306,
        overview:
          'props 由父组件传入并只读；父组件更新时可能触发子组件被动更新，需要判断是否真的需要重新渲染。',
        points: [
          '子实例以浅响应式形式保存 props，修改 props 应当是只读行为。',
          '父组件更新时先更新子组件 props，再根据变化决定是否触发子组件更新。',
          '未声明为 props 的属性进入 attrs，可透传到根元素。',
        ],
      },
      {
        id: '12.5',
        title: 'setup 函数的作用和实现',
        page: 311,
        overview:
          'setup 是组合式 API 的入口，在组件初始化阶段执行，返回状态对象或渲染函数。',
        points: [
          'setup 接收 props 和 context（attrs、slots、emit、expose），执行时没有组件 `this`。',
          '返回对象会被代理为渲染上下文，返回函数则直接作为 render。',
          'setup 的执行早于模板渲染，为组合式函数提供了统一的组合入口。',
        ],
      },
      {
        id: '12.6',
        title: '组件事件与 emit 的实现',
        page: 314,
        overview:
          '组件事件不是 DOM 事件，而是 props 中以 `on` 开头的回调；emit 负责查找并调用它们。',
        points: [
          '模板中的 `@change` 会编译成 `onChange` prop，由子组件通过 emit 触发。',
          'emit 支持字符串事件名、数组形式的多个处理函数和开发期参数校验。',
          '没有监听器时开发环境应提示，生产环境则安静忽略。',
        ],
      },
      {
        id: '12.7',
        title: '插槽的工作原理与实现',
        page: 316,
        overview:
          '插槽内容以函数形式保存，子组件渲染时再调用，从而支持作用域插槽和延迟求值。',
        points: [
          '父组件传入的 children 会被整理为 slots 对象。',
          '子组件通过 `slots.name(props)` 调用插槽函数，获得父作用域生成的 vnode。',
          '插槽不是提前渲染好的节点，而是按渲染时机执行的内容工厂。',
        ],
      },
      {
        id: '12.8',
        title: '注册生命周期',
        page: 318,
        overview:
          '组合式 API 通过当前组件实例注册钩子；实例在正确阶段统一调用这些钩子。',
        points: [
          '`onMounted` 等函数从 currentInstance 取出实例并注册回调。',
          '生命周期钩子按注册顺序执行，分别在挂载、更新、卸载等阶段触发。',
          '卸载阶段要执行清理，避免事件监听和异步任务继续持有组件引用。',
        ],
      },
    ],
  },
  {
    id: 13,
    partId: 'part-4',
    title: '异步组件与函数式组件',
    page: 322,
    tagline: '把加载状态也当成组件，把无状态组件做到最轻。',
    summary:
      '异步组件解决按需加载与加载过程的状态管理，支持 loading、error、超时与重试；函数式组件则用函数直接返回 vnode，适合无自身状态的纯展示场景。',
    designQuestion: '异步加载期间，应该渲染什么？失败后如何恢复？',
    sections: [
      {
        id: '13.1',
        title: '异步组件要解决的问题',
        page: 322,
        overview:
          '异步组件需要把代码分割、加载等待、失败重试和用户反馈统一到一个组件抽象中。',
        points: [
          '按需加载可以减小首屏包体积，但会引入加载等待与失败风险。',
          '渲染过程需要能在占位、加载中、错误、完成之间切换。',
          '还要考虑超时、延迟显示 loading、重试等真实网络场景。',
        ],
      },
      {
        id: '13.2',
        title: '异步组件的实现原理',
        page: 324,
        overview:
          'defineAsyncComponent 维护加载状态，加载成功后把组件挂载到占位位置，失败则渲染错误组件或提示。',
        points: [
          'loader 返回 Promise，解析成功后缓存真实组件，避免重复加载。',
          '加载期间可渲染占位 vnode 或 loading 组件；超时后切换到错误组件。',
          '支持 retry 与 delay，重试要清理旧 Promise 状态，防止竞态覆盖。',
        ],
      },
      {
        id: '13.3',
        title: '函数式组件',
        page: 333,
        overview:
          '函数式组件是没有自身状态和生命周期的纯函数，通过 props 与 context 返回 vnode。',
        points: [
          '函数式组件不需要创建组件实例，开销更小。',
          '适合纯展示、无状态、依赖 props 的组件。',
          '没有自身响应式状态，父组件更新时会重新执行函数并生成新 vnode。',
        ],
      },
    ],
  },
  {
    id: 14,
    partId: 'part-4',
    title: '内建组件和模块',
    page: 337,
    tagline: '缓存、传送、过渡：三个组件补上真实应用的常见需求。',
    summary:
      'KeepAlive 用缓存和激活/失活替代重复挂载，Teleport 把 DOM 传送到其他位置但保留组件关系，Transition 通过 CSS 类名和帧调度实现进出场动画。',
    designQuestion: '如何在不破坏组件树语义的前提下，改变组件的生命周期与渲染位置？',
    sections: [
      {
        id: '14.1',
        title: 'KeepAlive 组件的实现原理',
        page: 337,
        overview:
          'KeepAlive 缓存被切换组件的实例与子树，用 activate/deactivate 代替重新挂载和卸载，并支持过滤与 LRU 淘汰。',
        points: [
          '缓存命中时移入容器并触发 activated，切走时移出容器并触发 deactivated。',
          'include/exclude 按组件名过滤；max 通过最近最少使用策略控制缓存数量。',
          '缓存销毁或组件卸载时，要清理缓存并正确卸载内部组件。',
        ],
      },
      {
        id: '14.2',
        title: 'Teleport 组件的实现原理',
        page: 346,
        overview:
          'Teleport 把子树的真实 DOM 渲染到指定容器，但组件逻辑上仍属于原组件树。',
        points: [
          '挂载和更新时操作目标容器，而不是父组件的真实 DOM 容器。',
          '逻辑父子关系与真实 DOM 父子关系分离，事件冒泡跟随真实 DOM。',
          '卸载时要移除 Teleport 子树并清理目标容器中的节点。',
        ],
      },
      {
        id: '14.3',
        title: 'Transition 组件的实现原理',
        page: 350,
        overview:
          'Transition 在进入/离开阶段添加不同 CSS 类名，等待过渡结束后再执行 DOM 插入或移除。',
        points: [
          '进入和离开分别经过 before、active、to 类名阶段。',
          '下一帧再添加目标类名，确保浏览器能观察到样式变化并触发过渡。',
          '监听 transitionend/animationend，或使用显式 duration 决定何时完成。',
        ],
      },
    ],
  },
  {
    id: 15,
    partId: 'part-5',
    title: '编译器核心技术概览',
    page: 364,
    tagline: '模板不是字符串拼接，而是一段被认真编译的 DSL。',
    summary:
      'Vue 编译器采用 parse → transform → generate 三段式流水线：模板解析为 AST，转换阶段执行语义改写与优化信息收集，代码生成阶段产出可执行的渲染函数。',
    designQuestion: '一段模板字符串，如何变成可执行的 JavaScript？',
    sections: [
      {
        id: '15.1',
        title: '模板 DSL 的编译器',
        page: 364,
        overview:
          'Vue 模板是一种领域特定语言，编译器负责把它转换为 JavaScript 渲染函数。',
        points: [
          '核心流程是 parse（解析）、transform（转换）、generate（生成）。',
          'parse 产出模板 AST，transform 修改 AST 并收集优化信息，generate 生成代码。',
          '编译时能提前理解模板结构，这是运行时优化的重要前提。',
        ],
      },
      {
        id: '15.2',
        title: 'parser 的实现原理与状态机',
        page: 368,
        overview:
          '解析器按字符推进输入，通过状态机判断当前应识别文本、标签还是插值。',
        points: [
          '状态机根据当前状态消费字符，并在遇到边界时切换状态。',
          'advanceBy、current 与 lookahead 共同维护源码位置和前瞻。',
          '不同内容上下文需要不同解析状态，避免把标签文本误当元素。',
        ],
      },
      {
        id: '15.3',
        title: '构造 AST',
        page: 374,
        overview:
          '解析器递归下降构造元素、文本、插值与注释节点，并用栈维护父子嵌套关系。',
        points: [
          '元素节点包含 tag、props、children，文本/插值节点包含 content 等字段。',
          '开始标签入栈，结束标签与栈顶匹配后出栈，形成树形结构。',
          '标签未闭合或不匹配会产生编译错误，而不是生成错误 AST。',
        ],
      },
      {
        id: '15.4',
        title: 'AST 的转换与插件化架构',
        page: 383,
        overview:
          'transform 使用插件化 visitor 遍历模板 AST，在进入和退出节点时执行自定义转换。',
        points: [
          'context 暴露 currentNode、parent、replaceNode、removeNode 和 helper 注册能力。',
          '插件可以在进入节点时初始化状态，在退出时完成依赖收集与代码生成相关标记。',
          '转换阶段的职责是语义改写与优化信息收集，而不是直接输出最终字符串。',
        ],
      },
      {
        id: '15.5',
        title: '将模板 AST 转为 JavaScript AST',
        page: 396,
        overview:
          '模板 AST 会被转换为 JavaScript AST：元素变成渲染函数调用，指令和插值变成表达式。',
        points: [
          '转换后节点对应 `h()`、`createElementVNode()` 等运行时调用。',
          '静态属性、动态绑定、事件等会被编码成不同的参数和标志。',
          '模板 AST 描述“模板结构”，JS AST 描述“如何生成渲染代码”。',
        ],
      },
      {
        id: '15.6',
        title: '代码生成',
        page: 402,
        overview:
          'generator 深度遍历 JavaScript AST，使用代码缓冲区拼接出最终的渲染函数源码。',
        points: [
          '通过 push、indent 等辅助函数管理缩进、换行和片段拼接。',
          '生成结果包含 helper 导入、渲染函数体和返回表达式。',
          '把字符串拼接集中到代码生成器，避免转换阶段耦合输出细节。',
        ],
      },
    ],
  },
  {
    id: 16,
    partId: 'part-5',
    title: '解析器',
    page: 409,
    tagline: '正确的解析，始于正确理解 HTML 的文本模式。',
    summary:
      'Vue 解析器需要同时处理 HTML 标签、属性、文本实体和 Vue 插值。文本模式决定标签是否被识别，递归下降负责结构，状态机负责细粒度的字符消费。',
    designQuestion: '为什么 `<textarea>` 里的标签不能被当成普通元素解析？',
    sections: [
      {
        id: '16.1',
        title: '文本模式及其对解析器的影响',
        page: 409,
        overview:
          'HTML 解析有不同的文本模式：RCDATA、RAWTEXT 等会改变标签与实体的解析规则。',
        points: [
          '`textarea`、`title` 属于 RCDATA：解析字符引用，但不解析内部标签。',
          '`script`、`style` 属于 RAWTEXT：内容原样读取，不解析标签与实体。',
          '解析器必须识别元素对应的文本模式，并在进入/离开内容时切换状态。',
        ],
      },
      {
        id: '16.2',
        title: '递归下降算法构造模板 AST',
        page: 413,
        overview:
          '解析器把语法拆成 parseChildren、parseElement、parseTag 等函数，通过递归处理嵌套结构。',
        points: [
          '递归下降让每个函数只负责一层语法，结构清晰且易于扩展。',
          'parseChildren 根据当前字符决定解析元素、文本、插值还是注释。',
          '解析位置单向推进，直到父元素闭合或输入结束。',
        ],
      },
      {
        id: '16.3',
        title: '状态机的开启与停止',
        page: 419,
        overview:
          '状态机控制解析器在普通文本、标签、插值等状态间切换，决定何时识别新结构。',
        points: [
          '遇到 `<` 进入标签解析状态，遇到 `{{` 进入插值状态。',
          'RCDATA/RAWTEXT 会暂停普通标签解析，直到对应的结束标签出现。',
          '状态的开启与停止必须配合源码位置推进，否则会死循环或漏字符。',
        ],
      },
      {
        id: '16.4',
        title: '解析标签节点',
        page: 426,
        overview:
          '标签解析需要读取标签名、属性、结束方式，并用栈判断闭合是否正确。',
        points: [
          '开始标签可能自闭合，自闭合元素不应压入栈。',
          '结束标签必须与栈顶元素匹配，否则产生结构错误。',
          '解析标签时要保留位置信息，为后续转换和报错提供依据。',
        ],
      },
      {
        id: '16.5',
        title: '解析属性',
        page: 430,
        overview:
          '属性由名称、可选的等号和值组成；值可能使用单引号、双引号或无引号。',
        points: [
          '属性名与值都要保留原始位置，便于编译期定位问题。',
          '指令和普通属性在解析阶段都只是属性，语义由 transform 阶段解释。',
          '解析器需要处理空白、无值属性和非法字符等边界情况。',
        ],
      },
      {
        id: '16.6',
        title: '解析文本与解码 HTML 实体',
        page: 436,
        overview:
          '文本解析要识别边界并解码 HTML 字符引用，同时避免把普通文本中的 `&` 误判为实体。',
        points: [
          '文本读取到 `<`、`{{` 或当前文本模式结束条件为止。',
          '命名字符引用需要最长匹配；无法识别的引用应保留原文。',
          '数字字符引用要校验码点，非法值替换为 U+FFFD（替换字符）。',
        ],
      },
      {
        id: '16.7',
        title: '解析插值与注释',
        page: 449,
        overview:
          '插值使用 `{{ }}` 包裹 JavaScript 表达式，注释使用 `<!-- -->`；两者都需要严格的边界识别。',
        points: [
          '插值解析需要找到闭合分隔符，并把表达式内容交给后续转换。',
          '注释节点通常不参与运行时渲染，但解析阶段需要正确跳过其内容。',
          '未闭合的插值或注释要产生有意义的编译错误。',
        ],
      },
    ],
  },
  {
    id: 17,
    partId: 'part-5',
    title: '编译优化',
    page: 453,
    tagline: '编译器多知道一点，运行时就能少做一点。',
    summary:
      '通过 Block 与 PatchFlags，Vue 让渲染器知道哪些节点是动态的、哪些部分需要更新；静态提升、预字符串化、事件缓存与 v-once 则进一步减少重复工作和运行时代码。',
    designQuestion: '编译时分析如何把运行时的“全量 diff”变成“定点更新”？',
    sections: [
      {
        id: '17.1',
        title: '动态节点收集与补丁标志',
        page: 453,
        overview:
          '编译器为动态节点打上 PatchFlags，并把它们收集到 Block 的 dynamicChildren 中，渲染器据此跳过静态子树。',
        points: [
          '传统 diff 需要遍历整棵组件树寻找变化，静态节点也会消耗遍历成本。',
          'PatchFlags 用位掩码描述动态内容类型，例如文本、class、style、props。',
          '动态节点被收集到 Block 的 dynamicChildren，更新时只处理这些节点。',
        ],
      },
      {
        id: '17.2',
        title: 'Block 树',
        page: 461,
        overview:
          'Block 是带 dynamicChildren 的 vnode；v-if、v-for、Fragment 等结构会形成新的 Block，从而保持动态节点集合的稳定性。',
        points: [
          'v-if 的每个分支会创建独立 Block，分支切换时整体替换，避免旧动态节点残留。',
          'v-for 会生成 Fragment，其稳定性取决于是否带 key；渲染器需要根据 fragment 标志做专门处理。',
          'Block 树让动态节点收集具备结构边界，而不是简单平铺整棵树。',
        ],
      },
      {
        id: '17.3',
        title: '静态提升',
        page: 466,
        overview:
          '静态 vnode 被提升到 render 函数外，只在模块初始化时创建一次，后续渲染直接复用。',
        points: [
          '静态提升减少每次渲染反复创建相同 vnode 的开销。',
          '深层静态子树可以整体提升，保证内部节点也不被重复创建。',
          '只有真正与动态数据无关的节点才能被提升。',
        ],
      },
      {
        id: '17.4',
        title: '预字符串化',
        page: 468,
        overview:
          '大量连续的静态节点可以被编译为一个 HTML 字符串，由渲染器一次性内联，减少 vnode 数量。',
        points: [
          '预字符串化适合长期不变的大段静态内容。',
          '它牺牲细粒度更新能力，以更少的 vnode 和更快的初始化换取体积与灵活性。',
          '编译器会根据静态连续性和阈值决定是否启用该优化。',
        ],
      },
      {
        id: '17.5',
        title: '缓存内联事件处理函数',
        page: 469,
        overview:
          '内联箭头函数在每次渲染时都是新引用，会造成无意义 patch；编译器通过 `_cache` 缓存处理函数。',
        points: [
          '事件处理函数引用稳定后，patch 可以跳过重复的事件绑定更新。',
          '缓存通常以模板中的位置作为 key，复用同一处理函数。',
          '缓存函数可能捕获旧值，因此只适用于安全的场景。',
        ],
      },
      {
        id: '17.6',
        title: 'v-once',
        page: 470,
        overview:
          'v-once 让节点在首次渲染后被整体缓存，后续更新直接复用旧 vnode，跳过更新。',
        points: [
          'v-once 作用于元素或组件子树，适合完全静态的内容。',
          '它与静态提升不同：v-once 节点仍参与首次渲染，但之后不再更新。',
          '对会变化的节点使用 v-once 会导致界面停留在旧状态。',
        ],
      },
    ],
  },
  {
    id: 18,
    partId: 'part-6',
    title: '同构渲染',
    page: 474,
    tagline: '服务端给出第一屏，客户端接管后续交互。',
    summary:
      '同构渲染将同一套组件代码在服务端渲染成 HTML 字符串，再由客户端激活复用。理解服务端无 DOM、生命周期差异、请求隔离和 hydration 机制，是编写同构应用的前提。',
    designQuestion: '为什么“服务端渲染出的 HTML”不能直接替代客户端渲染？',
    sections: [
      {
        id: '18.1',
        title: 'CSR、SSR 以及同构渲染',
        page: 474,
        overview:
          'CSR 由浏览器生成本地视图，SSR 由服务端输出首屏 HTML，同构渲染则结合 SSR 与客户端 hydration。',
        points: [
          'CSR 的首屏依赖 JavaScript 下载与执行，SEO 与首屏体验可能受限。',
          'SSR 输出完整 HTML，首屏更快，但服务器成本更高，且仍需客户端 JS 才能交互。',
          'hydrate 在已有 DOM 上恢复组件状态和事件，而不是重新创建整棵 DOM。',
        ],
      },
      {
        id: '18.2',
        title: '将虚拟 DOM 渲染为 HTML 字符串',
        page: 478,
        overview:
          '服务端渲染器递归把 vnode 拼接为 HTML 字符串，并处理转义、void 元素、属性序列化等规则。',
        points: [
          '文本与属性值必须转义，防止输出被注入成 HTML。',
          'void 元素不需要结束标签，布尔属性和 class/style 需要正确序列化。',
          'SSR 渲染器复用 vnode 数据结构，但宿主接口从 DOM API 变成了字符串拼接。',
        ],
      },
      {
        id: '18.3',
        title: '将组件渲染为 HTML 字符串',
        page: 484,
        overview:
          '组件在服务端同样要执行 setup 和 render，但只输出字符串；异步 setup 与插槽需要额外处理。',
        points: [
          '服务端会执行组件初始化逻辑与 render，但不会执行 mounted 等 DOM 相关钩子。',
          '异步 setup 需要等待结果，避免输出不完整的占位 HTML。',
          '插槽在服务端渲染时也要调用，确保输出与客户端预期一致。',
        ],
      },
      {
        id: '18.4',
        title: '客户端激活的原理',
        page: 489,
        overview:
          'hydration 让客户端 vnode 与已有服务端 DOM 节点对齐，接管事件与状态，而不是重新挂载。',
        points: [
          '激活过程沿着 DOM 树匹配 vnode，复用已有节点并绑定事件。',
          '服务端与客户端首次渲染结果必须一致，否则会出现 hydration mismatch。',
          '激活后组件进入正常的响应式更新流程，后续更新仍通过 patch 完成。',
        ],
      },
      {
        id: '18.5',
        title: '编写同构的代码',
        page: 494,
        overview:
          '同构代码必须同时考虑服务端无 DOM 与客户端有 DOM 的差异，并保证每次请求之间状态隔离。',
        points: [
          '避免在渲染阶段访问 window/document；通过环境判断把客户端逻辑放入 mounted 等钩子。',
          '每个请求创建独立应用实例，避免模块级全局状态在请求间串数据。',
          '可用 ClientOnly 或环境判断隔离仅客户端组件，并谨慎处理第三方库的导入。',
        ],
      },
    ],
  },
]

export const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]))

export const partById = new Map(bookParts.map((part) => [part.id, part]))

export const sectionIndex = new Map(
  chapters.flatMap((chapter) =>
    chapter.sections.map((section) => [
      section.id,
      { chapter, section },
    ] as const),
  ),
)

export const allSections = chapters.flatMap((chapter) =>
  chapter.sections.map((section) => ({
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    ...section,
  })),
)

export function getSection(sectionId: string) {
  return sectionIndex.get(sectionId)
}

export function getChapterSections(chapterId: number) {
  return chapterById.get(chapterId)?.sections ?? []
}

export const totalSections = allSections.length
