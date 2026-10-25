import type { Question } from '@/types'

export const part2ExtraQuestions: Question[] = [
  {
    id: 'dq-4.1-p2',
    chapterId: 4,
    sectionId: '4.1',
    pointIds: ['4.1-p2'],
    concept: '读取依赖的记录',
    type: 'single',
    difficulty: '进阶',
    stem: '下面的响应式实现只拦截了 set。执行代码后，`observed` 是多少？',
    code: `const state = new Proxy({ count: 0 }, {
  set(target, key, value) {
    target[key] = value
    trigger(target, key)
    return true
  },
})

let observed = 0
effect(() => {
  observed = state.count
})

state.count = 1
console.log(observed)`,
    options: [
      { value: 'A', label: '1，因为 set 已经调用了 trigger' },
      { value: 'B', label: '0，因为没有 get 拦截器，effect 读取时没有被记录为依赖' },
      { value: 'C', label: '1，因为 Proxy 会自动追踪所有读取' },
      { value: 'D', label: '0，因为 effect 不能读取 Proxy' },
    ],
    answer: ['B'],
    explanation:
      'effect 执行 `state.count` 时确实经过了 Proxy，但这里只定义了 set，get 没有被拦截，track 没有机会把当前 effect 记录到依赖桶中。后来 set 调用 trigger 时找不到任何依赖，effect 不会重新执行，observed 仍然是 0。响应式必须同时记录“谁读了哪个对象、哪个键”，只拦截写入无法建立数据与副作用之间的联系。',
  },
  {
    id: 'dq-4.1-p3',
    chapterId: 4,
    sectionId: '4.1',
    pointIds: ['4.1-p3'],
    concept: '读取收集与设置触发',
    type: 'multiple',
    difficulty: '进阶',
    stem: '关于响应式系统“读取时收集，设置时触发”的工作方式，下列说法正确的有？',
    options: [
      { value: 'A', label: '只有在副作用函数执行期间发生的属性读取，才会把该副作用记录为依赖' },
      { value: 'B', label: '在副作用函数之外读取响应式属性，不会建立有效的依赖关系' },
      { value: 'C', label: '设置一个已被收集依赖的属性时，读取过它的副作用会被通知重新执行' },
      { value: 'D', label: '只要对象是响应式的，设置任意属性都会让所有副作用重新执行' },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '依赖收集依赖全局的 activeEffect：只有在 effect 执行期间发生的读取，才会把该 effect 记录到对应对象与键的依赖集合中；effect 之外的读取没有活动副作用，通常直接跳过。设置属性时，trigger 会按 target 和 key 找到依赖集合并只通知真正读过该键的 effect，而不是向所有 effect 广播。D 忽略了键级粒度，会把响应式错误地理解为全局刷新。',
  },
  {
    id: 'dq-4.2-p1',
    chapterId: 4,
    sectionId: '4.2',
    pointIds: ['4.2-p1'],
    concept: 'set trap 的返回值',
    type: 'single',
    difficulty: '进阶',
    stem: '在 ESM 严格模式下执行下面代码，结果是什么？',
    code: `const data = { count: 0 }
const proxy = new Proxy(data, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    target[key] = value
    return false
  },
})

proxy.count = 1
console.log(proxy.count)`,
    options: [
      { value: 'A', label: '输出 1，因为 set 已经修改了 target' },
      { value: 'B', label: '抛出 TypeError，因为 set trap 返回 false，赋值被视为失败' },
      { value: 'C', label: '输出 0，set trap 被完全忽略' },
      { value: 'D', label: '输出 undefined，因为 get trap 失效' },
    ],
    answer: ['B'],
    explanation:
      'set trap 返回 false 表示这次赋值失败；严格模式下对代理属性赋值会因此抛出 TypeError，即使 target 已经被手动改成了 1。正确的 trap 应返回 true，或直接返回 `Reflect.set(target, key, value, receiver)` 的结果，让返回值与默认写入行为保持一致。理解这一点，才能解释为什么响应式代理的 set 不能随意省略返回值。',
  },
  {
    id: 'dq-4.2-p3',
    chapterId: 4,
    sectionId: '4.2',
    pointIds: ['4.2-p3'],
    concept: '单 Set 依赖桶的局限',
    type: 'single',
    difficulty: '进阶',
    stem: '假设 reactive 的依赖桶只有一个全局 Set，不区分对象和键。执行 `state.a = 1` 后，控制台会额外输出什么？',
    code: `let activeEffect
const bucket = new Set()

const state = reactive({ a: 0, b: 0 })

effect(() => console.log('A', state.a))
effect(() => console.log('B', state.b))

state.a = 1`,
    options: [
      { value: 'A', label: '只输出 A 1' },
      { value: 'B', label: '只输出 B 0' },
      { value: 'C', label: '依次输出 A 1 和 B 0' },
      { value: 'D', label: '不输出任何内容' },
    ],
    answer: ['C'],
    explanation:
      '两个 effect 都被放进了同一个 Set，trigger 无法知道谁读过 a、谁只读过 b，于是会把集合里的 effect 全部执行，因此 A 和 B 都会再次打印。单 Set 无法表达“哪个对象、哪个键、哪些副作用”的对应关系，需要升级为 WeakMap → Map → Set 的分层结构，才能避免无关属性变化造成误触发。',
  },
  {
    id: 'dq-4.4-p3',
    chapterId: 4,
    sectionId: '4.4',
    pointIds: ['4.4-p3'],
    concept: '分支切换后的依赖重建',
    type: 'single',
    difficulty: '进阶',
    stem: '执行下面代码，最后打印的 `runs` 是多少？',
    code: `const state = reactive({ flag: true, x: 1, y: 10 })
let runs = 0

effect(() => {
  runs++
  console.log(state.flag ? state.x : state.y)
})

state.flag = false
state.x = 2
state.y = 20
console.log(runs)`,
    options: [
      { value: 'A', label: '2' },
      { value: 'B', label: '3' },
      { value: 'C', label: '4' },
      { value: 'D', label: '1' },
    ],
    answer: ['B'],
    explanation:
      '首次执行时 effect 收集了 flag 和 x；flag 变化后先清理旧依赖，再执行新分支，只重新收集 flag 和 y。因此 state.x 的变化不会再触发它，而 state.y 的变化会触发一次。总共执行 3 次，runs 为 3。如果只清理旧依赖却不重新收集，新分支的 y 变化就无法响应，所以清理与重建必须在同一次执行中完成。',
  },
  {
    id: 'dq-4.6-p3',
    chapterId: 4,
    sectionId: '4.6',
    pointIds: ['4.6-p3'],
    concept: '递归保护的职责归属',
    type: 'single',
    difficulty: '进阶',
    stem: '有同学在副作用里写了 `if (state.count < 3) state.count++`，认为这样就不需要响应系统自身做递归保护。下列评价最准确的是？',
    options: [
      { value: 'A', label: '可行，只要业务代码加了条件，任何递归都能避免' },
      { value: 'B', label: '不可靠，读写循环可能通过其他函数或分支间接发生，响应系统应在 trigger 内部跳过当前 activeEffect' },
      { value: 'C', label: '只要把 effect 改成 computed 就一定不会递归' },
      { value: 'D', label: '应在每次 get 时清空所有依赖，递归自然消失' },
    ],
    answer: ['B'],
    explanation:
      '用户写的 if 只覆盖了当前这一种路径；只要 effect 内存在“读取—修改—再触发自身”的链路，就可能递归，而且可能藏在被调用的函数或条件分支里。框架不能依赖用户的书写顺序或业务条件，应在 trigger 阶段识别当前正在执行的 activeEffect 并跳过，同时保留其他 effect 对该属性的依赖。这是响应系统自身的正确性保证。',
  },
  {
    id: 'dq-4.8-p3',
    chapterId: 4,
    sectionId: '4.8',
    pointIds: ['4.8-p3'],
    concept: 'computed 对读取者的追踪',
    type: 'single',
    difficulty: '挑战',
    stem: '如果 computed 的 value getter 只返回计算结果、不调用 track，执行下面代码后 `rendered` 是多少？',
    code: `const state = reactive({ n: 1 })
const double = computed(() => state.n * 2)
let rendered = 0

effect(() => {
  rendered = double.value
})

state.n = 2
console.log(rendered)`,
    options: [
      { value: 'A', label: '4，因为 computed 内部依赖 state.n' },
      { value: 'B', label: '2，外层 effect 没有依赖 computed，state.n 变化后不会重新读取' },
      { value: 'C', label: '4，但需要额外调用两次 trigger' },
      { value: 'D', label: '抛出错误，computed 不能在 effect 中使用' },
    ],
    answer: ['B'],
    explanation:
      'computed 内部 effect 能感知 state.n 变化并把 dirty 设为 true，但外层渲染 effect 若没有在读取 `double.value` 时被收集，就不会收到 computed 的通知，rendered 仍停留在首次的 2。computed 的 getter 必须同时 track 外层读取者，才能把内部失效传导出去；内部懒计算与外部依赖追踪是两层不同的事情。',
  },
  {
    id: 'dq-4.9-p3',
    chapterId: 4,
    sectionId: '4.9',
    pointIds: ['4.9-p3'],
    concept: 'deep 递归建立依赖',
    type: 'single',
    difficulty: '进阶',
    stem: '下面 watch 的回调能够响应 `state.profile.meta.active` 的变化，最关键的原因是？',
    code: `const state = reactive({
  profile: { name: 'Ada', meta: { active: true } },
})

watch(
  state.profile,
  () => console.log('changed'),
  { deep: true },
)

state.profile.meta.active = false`,
    options: [
      { value: 'A', label: 'deep 会递归读取嵌套属性，使 meta.active 进入依赖集合' },
      { value: 'B', label: 'watch 对任何对象默认都会递归监听，deep 只是语法糖' },
      { value: 'C', label: '修改属性会触发全局 effect，与 deep 无关' },
      { value: 'D', label: 'deep 会把 profile 深拷贝成普通对象后再比较' },
    ],
    answer: ['A'],
    explanation:
      '只传对象引用时，getter 通常只读取 profile 这一层；deep 会递归遍历对象的属性，逐层读取 name、meta、active，从而把深层变化也纳入依赖。这样 meta.active 被修改时，watch 的 effect 才能被通知并安排回调。deep 的代价是遍历开销，如果只关心某个叶子属性，用 `() => state.profile.meta.active` 会更精确。',
  },
  {
    id: 'dq-4.10-p1',
    chapterId: 4,
    sectionId: '4.10',
    pointIds: ['4.10-p1'],
    concept: 'immediate 的执行时机',
    type: 'single',
    difficulty: '基础',
    stem: '执行下面代码，控制台的输出顺序是？',
    code: `const state = reactive({ n: 0 })

console.log('before')
watch(
  () => state.n,
  () => console.log('callback'),
  { immediate: true },
)
console.log('after')`,
    options: [
      { value: 'A', label: 'before → callback → after' },
      { value: 'B', label: 'before → after → callback' },
      { value: 'C', label: 'callback → before → after' },
      { value: 'D', label: 'before → after，callback 不执行' },
    ],
    answer: ['A'],
    explanation:
      'immediate 为 true 时，watch 在建立监听的过程中就会同步执行一次回调，而不是等到下一次依赖变化或下一个微任务，因此 after 还没打印，callback 已经执行。需要注意，immediate 只决定首次执行时机，不代表后续每次变化都同步执行；后续回调仍然受 flush 调度策略影响。',
  },
  {
    id: 'dq-5.1-p1',
    chapterId: 5,
    sectionId: '5.1',
    pointIds: ['5.1-p1'],
    concept: 'get trap 替代默认读取',
    type: 'single',
    difficulty: '基础',
    stem: '执行下面代码，控制台输出是什么？',
    code: `const target = { n: 1 }
const proxy = new Proxy(target, {
  get() {
    return 42
  },
})

console.log(proxy.n, target.n)`,
    options: [
      { value: 'A', label: '42 1' },
      { value: 'B', label: '1 1' },
      { value: 'C', label: '42 42' },
      { value: 'D', label: '抛出 TypeError' },
    ],
    answer: ['A'],
    explanation:
      '一旦定义了 get trap，读取 `proxy.n` 就会执行 trap 并返回 42，不再执行目标对象的默认读取行为；target 本身没有被修改，所以 `target.n` 仍是 1。trap 可以选择转发 `Reflect.get`，也可以完全替代默认行为，但仍需遵守代理不变量，例如不可配置且不可写的属性不能返回不同的值。',
  },
  {
    id: 'dq-5.2-p3',
    chapterId: 5,
    sectionId: '5.2',
    pointIds: ['5.2-p3'],
    concept: '多个代理共享同一目标',
    type: 'single',
    difficulty: '进阶',
    stem: '执行下面代码，`target.n` 与 `p2.n` 分别是多少？',
    code: `const target = { n: 0 }
const p1 = new Proxy(target, {})
const p2 = new Proxy(target, {})

p1.n = 5
p2.n += 1

console.log(target.n, p2.n)`,
    options: [
      { value: 'A', label: '6 6' },
      { value: 'B', label: '5 6' },
      { value: 'C', label: '0 6' },
      { value: 'D', label: '6 5' },
    ],
    answer: ['A'],
    explanation:
      'Proxy 不会复制对象，p1 和 p2 只是同一个 target 的两个观察入口，所有读写最终都作用在 target 上。p1 的赋值先把 target.n 改成 5，p2 再读取并自增得到 6，因此 target.n 和 p2.n 都是 6。响应式系统缓存原始对象到代理的映射，是为了保证同一对象对应稳定代理身份，而不是因为代理会复制数据。',
  },
  {
    id: 'dq-5.3-p1',
    chapterId: 5,
    sectionId: '5.3',
    pointIds: ['5.3-p1'],
    concept: '多 trap 的依赖收集与触发',
    type: 'multiple',
    difficulty: '进阶',
    stem: '要让下面的副作用在“属性是否存在”和“可枚举键集合”变化时都能正确更新，代理对象至少需要处理哪些 trap？',
    code: `effect(() => {
  console.log('hasA', 'a' in state)
  console.log('keys', Object.keys(state).join(','))
})`,
    options: [
      { value: 'A', label: '`has`，拦截 `in` 并收集依赖' },
      { value: 'B', label: '`ownKeys`，拦截 `Object.keys` 等枚举操作并收集依赖' },
      { value: 'C', label: '`deleteProperty`，删除属性时按语义触发相关依赖' },
      { value: 'D', label: '`construct`，因为对象需要被 new 调用' },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '`in` 操作走 `has`，`Object.keys` 走 `ownKeys`，删除属性走 `deleteProperty`；只实现 get/set 无法观察这些语义。它们建立的依赖还需要在新增、删除属性时被正确触发，通常结合 ADD/DELETE 或 ITERATE_KEY 处理，否则“某个键是否还存在”和“枚举结果”不会更新。`construct` 只与 new 调用有关，和这里的属性存在性无关。',
  },
  {
    id: 'dq-5.3-p3',
    chapterId: 5,
    sectionId: '5.3',
    pointIds: ['5.3-p3'],
    concept: 'set 区分新增与修改',
    type: 'single',
    difficulty: '进阶',
    stem: '在代理普通对象的 set 拦截器里，先判断 `Object.prototype.hasOwnProperty.call(target, key)`，主要目的是什么？',
    options: [
      { value: 'A', label: '区分 SET 与 ADD 语义，新增属性时还要触发枚举或迭代相关的副作用' },
      { value: 'B', label: '判断新值是否为原始值，原始值不能写入对象' },
      { value: 'C', label: '决定是否调用 get 拦截器，以便重复收集依赖' },
      { value: 'D', label: '把属性自动转换为 getter/setter，替代 Proxy' },
    ],
    answer: ['A'],
    explanation:
      '修改已有属性通常只影响该键的依赖；新增属性还会改变 `Object.keys`、`for...in` 等枚举结果，因此需要额外触发 ITERATE_KEY 或 ADD 相关依赖。判断之后仍应使用 `Reflect.set(target, key, value, receiver)` 完成默认赋值，以保留 receiver、原型链和访问器语义。只判断不转发，或一律按修改处理，都会让依赖触发不准确。',
  },
  {
    id: 'dq-5.5-p1',
    chapterId: 5,
    sectionId: '5.5',
    pointIds: ['5.5-p1'],
    concept: '深响应的惰性包装',
    type: 'single',
    difficulty: '进阶',
    stem: '调用 `reactive({ nested: { n: 0 } })` 时，深响应实现通常在什么时候把 `nested` 包装成响应式代理？',
    options: [
      { value: 'A', label: '在 reactive() 返回前递归遍历并代理所有嵌套对象' },
      { value: 'B', label: '在读取 nested 的 get 拦截器中，发现值是对象再按需包装并缓存' },
      { value: 'C', label: '只在第一次修改 nested.n 时由 set 拦截器包装' },
      { value: 'D', label: '永远不包装，嵌套对象必须手动调用 reactive' },
    ],
    answer: ['B'],
    explanation:
      '深响应采用惰性代理：只有访问某个属性并拿到对象值时，get 拦截器才把它交给 reactive 包装，这样可以避免初始化时遍历整个对象树。包装结果会通过 WeakMap 缓存，保证同一原始对象身份稳定。浅响应则在 get 中直接返回原始嵌套对象，不进行这层包装，这也是两者可观测范围不同的根本原因。',
  },
  {
    id: 'dq-5.5-p3',
    chapterId: 5,
    sectionId: '5.5',
    pointIds: ['5.5-p3'],
    concept: '深浅响应 API 的选择',
    type: 'single',
    difficulty: '进阶',
    stem: '需要把第三方图表实例放进响应式状态，只希望 `visible` 这类顶层字段驱动更新，而不代理实例内部属性。应优先选择哪种 API？',
    options: [
      { value: 'A', label: 'reactive，因为只有深响应才能读取属性' },
      { value: 'B', label: 'shallowReactive，它只观察第一层，嵌套的图表实例保持原始引用' },
      { value: 'C', label: 'readonly，它会把所有嵌套属性变成响应式' },
      { value: 'D', label: 'ref，它一定会深度代理对象值' },
    ],
    answer: ['B'],
    explanation:
      'shallowReactive 只在第一层建立响应式，顶层 visible 变化仍能触发依赖，而 chart 实例不会被递归代理，可避免第三方对象因代理身份、内部槽或大量内部属性带来的问题。若确实需要观察实例内部字段，再使用 reactive；readonly 解决的是只读约束，不是浅层观察，而且它不会把嵌套属性变成响应式。',
  },
  {
    id: 'dq-5.6-p2',
    chapterId: 5,
    sectionId: '5.6',
    pointIds: ['5.6-p2'],
    concept: '浅只读的层级边界',
    type: 'judge',
    difficulty: '进阶',
    stem: '`shallowReadonly` 会递归冻结嵌套对象，因此修改 `state.profile.name` 和给 `state.profile` 整体赋值都会一样被拒绝。',
    code: `const state = shallowReadonly({ profile: { name: 'Ada' } })

state.profile.name = 'Grace'
state.profile = { name: 'Lin' }`,
    options: [
      { value: 'A', label: '正确' },
      { value: 'B', label: '错误' },
    ],
    answer: ['B'],
    explanation:
      'shallowReadonly 只对第一层做只读代理。`state.profile` 返回的是原始对象，没有经过 readonly 包装，因此修改 `name` 会直接改到原始数据，既不会被阻止，也不会触发响应式更新。给 `state.profile` 整体赋值属于第一层写入，会被 set 拦截并给出警告。需要深层保护应使用 readonly，而不是浅只读。',
  },
  {
    id: 'dq-5.7-p2',
    chapterId: 5,
    sectionId: '5.7',
    pointIds: ['5.7-p2'],
    concept: '数组迭代的依赖追踪',
    type: 'single',
    difficulty: '挑战',
    stem: '下面代码中，`list.push(3)` 后 `sum` 会由 3 变成 6。代理数组要正确响应这次更新，迭代过程必须建立哪类依赖？',
    code: `const list = reactive([1, 2])
let sum = 0

effect(() => {
  sum = 0
  for (const n of list) sum += n
})

list.push(3)
console.log(sum)`,
    options: [
      { value: 'A', label: '只需要追踪 `push` 方法本身' },
      { value: 'B', label: '需要追踪迭代过程中对迭代器、长度和索引的读取，push 后才能重新执行' },
      { value: 'C', label: '只需要在数组创建时记录一次快照，之后无需依赖' },
      { value: 'D', label: '`for...of` 不经过 get，所以任何依赖都收集不到' },
    ],
    answer: ['B'],
    explanation:
      '`for...of` 会调用数组的迭代器，迭代过程会读取长度和各个索引；代理需要让这些读取进入依赖收集，push 修改长度并新增索引时才能触发副作用，使 sum 重新计算为 6。`includes`、`indexOf` 还要额外处理代理值与原始值的身份差异，这是同一节中的另一类特殊路径，不能用同一种查找策略简单套用。',
  },
  {
    id: 'dq-6.1-p2',
    chapterId: 6,
    sectionId: '6.1',
    pointIds: ['6.1-p2'],
    concept: 'ref 对对象值的处理',
    type: 'single',
    difficulty: '进阶',
    stem: '执行下面代码，最后打印的 `runs` 是多少？',
    code: `const state = ref({ count: 0 })
let runs = 0

effect(() => {
  runs++
  console.log(state.value.count)
})

state.value.count++
console.log(runs)`,
    options: [
      { value: 'A', label: '1' },
      { value: 'B', label: '2' },
      { value: 'C', label: '3' },
      { value: 'D', label: '0' },
    ],
    answer: ['B'],
    explanation:
      '当 ref 的 value 是对象时，ref 内部通常会用 reactive 包装它，因此读取 `state.value.count` 会经过嵌套代理并建立依赖；修改 count 后 effect 重新执行，runs 变为 2。这里的边界是 shallowRef：它只观察 `.value` 的整体替换，不会把对象内部属性变成响应式，所以嵌套修改不会触发。',
  },
  {
    id: 'dq-6.1-p3',
    chapterId: 6,
    sectionId: '6.1',
    pointIds: ['6.1-p3'],
    concept: 'ref 必须通过 value 访问',
    type: 'single',
    difficulty: '进阶',
    stem: '执行下面代码，输出是什么？这说明了什么？',
    code: `const state = ref({ n: 0 })

state.n = 1
state.value.n = 2

console.log(state.n, state.value.n)`,
    options: [
      { value: 'A', label: '1 2；直接给 ref 对象加属性绕过了 value 的 getter/setter，不会驱动更新' },
      { value: 'B', label: '2 2；ref 会自动把属性转发到 value' },
      { value: 'C', label: '1 1；两次写入互相覆盖' },
      { value: 'D', label: '抛出 TypeError；ref 对象不可扩展' },
    ],
    answer: ['A'],
    explanation:
      'ref 的响应式入口是 `.value` 的 getter/setter；`state.n = 1` 只是在 ref 这个普通对象上新增了一个与内部响应式值无关的属性，既不会写入内部 value，也不会触发依赖。要修改被包裹的对象必须走 `state.value.n`。模板里的顶层自动解包只是渲染上下文的语法便利，在普通 JavaScript 中仍然需要显式使用 `.value`。',
  },
  {
    id: 'dq-6.2-p1',
    chapterId: 6,
    sectionId: '6.2',
    pointIds: ['6.2-p1'],
    concept: '解构导致响应丢失',
    type: 'multiple',
    difficulty: '进阶',
    stem: '执行下面代码后，关于局部变量 `count` 的说法正确的有？',
    code: `const state = reactive({ count: 0 })
const { count } = state

effect(() => {
  console.log(count)
})

state.count++`,
    options: [
      { value: 'A', label: 'count 是解构那一刻读取到的普通值，不是持续绑定' },
      { value: 'B', label: '修改 count 不会写回 state.count' },
      { value: 'C', label: '后续 state.count 变化不会让 effect 重新执行' },
      { value: 'D', label: 'count 仍然持有源属性的 getter，因此能自动同步' },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '解构本质上执行了一次 get，把当时的值复制给局部变量；得到的不是访问器，也没有与源对象保持引用。effect 读取的是局部 count，不会读取 state.count，因此没有建立依赖，源对象变化也不会更新它。需要保留联动应使用 toRef/toRefs，或让 effect 直接读取源属性；把复制出来的值再包成 ref 也不会自动与源对象同步。',
  },
]
