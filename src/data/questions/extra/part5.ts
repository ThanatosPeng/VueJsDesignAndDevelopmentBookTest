import type { Question } from '@/types'

export const part5ExtraQuestions: Question[] = [
  {
    id: 'dq-15.1-p3',
    chapterId: 15,
    sectionId: '15.1',
    pointIds: ['15.1-p3'],
    concept: '编译期模板结构分析',
    type: 'single',
    difficulty: '进阶',
    stem: '模板 `<div><p>标题</p><p>{{ count }}</p></div>` 与一段等价的渲染函数相比，编译器在构建阶段就能确定节点层级和绑定位置。下列哪项最能说明这种“编译期理解模板结构”的价值？',
    options: [
      {
        value: 'A',
        label:
          '它能提前判断哪些子树不依赖响应式数据、哪些文本是动态的，从而为静态提升、Block 收集和 PatchFlags 提供依据',
      },
      {
        value: 'B',
        label: '它会把 `count` 在构建时求值，把结果直接写死到生成的 HTML 中',
      },
      {
        value: 'C',
        label: '模板只是普通字符串，编译器只能做正则替换，因此无法获得可靠的层级信息',
      },
      {
        value: 'D',
        label: '它必须在浏览器里先创建一遍真实 DOM，之后才能知道哪些节点会变化',
      },
    ],
    answer: ['A'],
    explanation:
      '模板语法在编译期暴露了元素嵌套、指令和插值位置，编译器因此可以区分静态与动态部分，并生成更精确的更新信息。但它不会执行组件状态：`count` 的实际值和更新仍发生在运行时；模板 AST 也不等同于真实 DOM。',
  },
  {
    id: 'dq-15.2-p2',
    chapterId: 15,
    sectionId: '15.2',
    pointIds: ['15.2-p2'],
    concept: 'advanceBy 与源码索引',
    type: 'single',
    difficulty: '进阶',
    stem: '模板为 `<p>hi</p>`，解析器的 `currentIndex` 初始为 0。若连续执行两次 `advanceBy(3)`，此时 `current()` 返回哪个字符？',
    options: [
      { value: 'A', label: '`h`' },
      { value: 'B', label: '`/`' },
      { value: 'C', label: '`>`' },
      { value: 'D', label: '`i`' },
    ],
    answer: ['B'],
    explanation:
      '`advanceBy(3)` 只把索引向后移动 3 个字符，不解析也不回退。第一次从 0 移到 3，指向 `h`；第二次移到 6，指向结束标签中的 `/`。前瞻判断应读取索引而不推进，否则容易与 `advanceBy` 叠加造成跳字符或漏字符。',
  },
  {
    id: 'dq-15.3-p1',
    chapterId: 15,
    sectionId: '15.3',
    pointIds: ['15.3-p1'],
    concept: '元素与文本节点字段',
    type: 'single',
    difficulty: '基础',
    stem: '解析 `<div id="app">hello {{ name }}</div>` 后，关于模板 AST 节点结构的描述，哪项最准确？',
    options: [
      {
        value: 'A',
        label:
          '`div` 元素节点保存 `tag`、`props` 和 `children`；`hello ` 是文本节点，`{{ name }}` 是插值节点，插值节点保存表达式而不是求值结果',
      },
      {
        value: 'B',
        label: '元素节点的 `children` 直接保存原始字符串 `hello {{ name }}`，插值要等运行时才拆分',
      },
      {
        value: 'C',
        label: '文本节点用 `tag` 字段保存文本内容，元素节点用 `content` 保存子节点',
      },
      {
        value: 'D',
        label: '`props` 在解析阶段就是已经求值的 JavaScript 对象，因此动态绑定也会立刻得到最终值',
      },
    ],
    answer: ['A'],
    explanation:
      '元素节点以 `tag`、`props`、`children` 等字段描述标签、属性和子结构；文本节点用 `content` 保存文本，插值节点则保存待后续处理的表达式和位置。解析阶段不执行表达式，`name` 的实际值要到运行时才确定，所以不能把 props 当成已求值对象。',
  },
  {
    id: 'dq-15.3-p3',
    chapterId: 15,
    sectionId: '15.3',
    pointIds: ['15.3-p3'],
    concept: '未闭合标签的编译错误',
    type: 'single',
    difficulty: '进阶',
    stem: '解析 `<div><span>hi</div>` 时，遇到结束标签 `</div>`，此时元素栈顶仍是 `span`。按照编译器应有的行为，下列哪项最合理？',
    options: [
      {
        value: 'A',
        label:
          '报告 `span` 缺少结束标签或结束标签不匹配的编译错误，不能静默补上 `</span>` 后把结果当成合法 AST',
      },
      {
        value: 'B',
        label: '自动用 `</div>` 同时关闭 `span` 和 `div`，这属于正常的容错，不应报错',
      },
      {
        value: 'C',
        label: '把 `div` 改成 `span` 的子节点，然后继续解析后面的内容',
      },
      {
        value: 'D',
        label: '编译阶段总能生成 AST，标签闭合问题只会在浏览器渲染时暴露',
      },
    ],
    answer: ['A'],
    explanation:
      '开始标签入栈、结束标签必须与栈顶匹配，这是构造正确树结构的前提。`</div>` 遇到栈顶 `span` 说明模板存在未闭合或不匹配，应在编译期给出错误；即使解析器为继续收集后续错误而做恢复，也不能把该模板视为合法并悄悄改变嵌套关系。',
  },
  {
    id: 'dq-15.4-p3',
    chapterId: 15,
    sectionId: '15.4',
    pointIds: ['15.4-p3'],
    concept: 'transform 的语义改写职责',
    type: 'single',
    difficulty: '进阶',
    stem: '模板 `<p v-if="ok">A</p><p v-else>B</p><span>{{ msg }}</span>` 需要变成条件渲染并标记动态文本。关于 parse、transform、generate 的职责，哪项最准确？',
    options: [
      {
        value: 'A',
        label:
          'transform 识别 `v-if`/`v-else` 的语义，把节点改写为条件分支结构并记录动态信息；generate 只负责把得到的 JavaScript AST 序列化为代码',
      },
      {
        value: 'B',
        label: 'parse 阶段就应求出 `ok` 的布尔值，只保留一个 `p`，否则后续阶段无法处理',
      },
      {
        value: 'C',
        label: 'generate 阶段重新读取模板字符串，根据 `v-if` 决定输出哪个分支',
      },
      {
        value: 'D',
        label: 'transform 应该直接执行渲染函数并创建 DOM，代码生成只做格式化',
      },
    ],
    answer: ['A'],
    explanation:
      'parse 只负责识别结构并生成带指令信息的模板 AST，`ok` 的值在运行时才知道；transform 通过插件访问节点，完成条件分支、静态分析等语义改写；generate 面对的是已经确定的 JavaScript AST，不再解释模板指令。把求值或 DOM 操作塞进 parse/generate 都会破坏阶段边界。',
  },
  {
    id: 'dq-15.5-p2',
    chapterId: 15,
    sectionId: '15.5',
    pointIds: ['15.5-p2'],
    concept: '动态属性编码为 vnode 参数',
    type: 'multiple',
    difficulty: '挑战',
    stem: '编译 `<button :disabled="busy" class="primary" @click="submit">提交</button>` 时，关于属性与事件如何进入渲染代码，下列说法正确的有？',
    options: [
      {
        value: 'A',
        label: '`disabled` 的值仍以表达式 `busy` 的形式保存在 vnode 的 props 参数中，不会在编译期被求值',
      },
      {
        value: 'B',
        label: '编译器可以记录动态属性名并配合 PatchFlag，使更新时只检查相关 props，而不是全量比较',
      },
      {
        value: 'C',
        label: '静态 `class` 与动态绑定可以合并到同一个 props 对象中，事件处理函数也会作为 props 的一项参与创建 vnode',
      },
      {
        value: 'D',
        label: '解析器会立刻把 `busy` 转成布尔字面量，并把 `@click` 拼接到标签名字符串上',
      },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '模板 AST 中的普通属性和指令最终要编码为 vnode 创建调用的 props 参数：动态绑定保留表达式，静态属性保留字面量，事件变成 `onClick` 一类的处理函数。编译器还会依据动态属性名与类型生成补丁标志，减少运行时比较。解析阶段不执行 `busy`，更不会把指令拼进标签名。',
  },
  {
    id: 'dq-15.6-p2',
    chapterId: 15,
    sectionId: '15.6',
    pointIds: ['15.6-p2'],
    concept: 'helper 导入与 render 函数体',
    type: 'single',
    difficulty: '进阶',
    stem: '某模板生成的代码以 `import { toDisplayString as _toDisplayString, createElementBlock as _createElementBlock } from "vue"` 开头，并包含 `export function render(_ctx, _cache) { ... }`。下列理解哪项正确？',
    options: [
      {
        value: 'A',
        label:
          '代码生成器按实际使用情况收集运行时 helper、生成导入，并把表达式放进接收 `_ctx` 与 `_cache` 的渲染函数体',
      },
      {
        value: 'B',
        label: '这些 helper 的实现会被完整复制进每个模板文件，因此运行时不再依赖 Vue',
      },
      {
        value: 'C',
        label: '`render` 函数会在编译阶段立即执行，执行结果就是最终 HTML',
      },
      {
        value: 'D',
        label: '导入语句只是为了调试，删除后渲染函数中的 helper 调用仍能正常工作',
      },
    ],
    answer: ['A'],
    explanation:
      'generate 阶段不仅拼接表达式，还要知道用到了哪些运行时能力，并通过 context.helper 注册后统一生成导入。helper 来自 Vue 运行时，未使用的不会导入，便于 Tree-Shaking；render 函数在运行时由渲染器调用，编译阶段不会执行它，删除导入则会导致引用错误。',
  },
  {
    id: 'dq-15.6-p3',
    chapterId: 15,
    sectionId: '15.6',
    pointIds: ['15.6-p3'],
    concept: '代码拼接集中在 generator',
    type: 'single',
    difficulty: '进阶',
    stem: '一位插件作者在 transform 阶段直接把 `_ctx.foo`、括号和换行追加到全局字符串，结果生成的缩进混乱，节点顺序也难以维护。更符合编译器设计的做法是？',
    options: [
      {
        value: 'A',
        label:
          'transform 只改写 AST 或设置 codegenNode、注册所需 helper，由 generator 用 push、indent 等集中管理片段、缩进和最终拼接',
      },
      {
        value: 'B',
        label: 'transform 继续拼接字符串，但把换行改成空格，即可消除所有格式问题',
      },
      {
        value: 'C',
        label: '让 parse 阶段提前生成最终代码，transform 和 generate 只做校验',
      },
      {
        value: 'D',
        label: '每个插件各自返回一段完整函数源码，最后直接按插件注册顺序首尾相接',
      },
    ],
    answer: ['A'],
    explanation:
      'transform 的职责是语义改写和优化信息收集，输出细节应留给 generator。generator 遍历 JavaScript AST，通过代码缓冲区统一处理缩进、换行和片段顺序，既能避免插件之间格式耦合，也便于后续调整生成格式。把最终字符串生成提前到 parse 或多个插件各自拼接，会破坏阶段边界并放大顺序问题。',
  },
  {
    id: 'dq-16.1-p3',
    chapterId: 16,
    sectionId: '16.1',
    pointIds: ['16.1-p3'],
    concept: '按元素切换文本模式',
    type: 'single',
    difficulty: '挑战',
    stem: '解析 `<textarea><b>hi</b></textarea><p>{{ msg }}</p>` 时，下列结果哪项正确？',
    options: [
      {
        value: 'A',
        label:
          '`<textarea>` 内进入 RCDATA 模式，`<b>` 和 `</b>` 作为文本内容而非元素；遇到 `</textarea>` 退出该模式后，后面的 `p` 和插值恢复正常解析',
      },
      {
        value: 'B',
        label: '`<b>` 会被解析成 `textarea` 的子元素，因为 Vue 模板允许在任意元素内嵌套标签',
      },
      {
        value: 'C',
        label: '进入 `textarea` 后解析器会一直停留在文本模式，后面的 `<p>` 也会被当成 textarea 的文本',
      },
      {
        value: 'D',
        label: '`textarea` 的内容会被整体丢弃，只保留结束标签之后的部分',
      },
    ],
    answer: ['A'],
    explanation:
      '`textarea`/`title` 属于 RCDATA：内部不解析标签，但会处理字符引用；`script`/`style` 的 RAWTEXT 则连实体也原样保留。文本模式必须与元素绑定，在读取到对应的结束标签后恢复普通模式，否则会把后续真实元素误判为文本，或把内部标签错误地构造成子树。',
  },
  {
    id: 'dq-16.2-p3',
    chapterId: 16,
    sectionId: '16.2',
    pointIds: ['16.2-p3'],
    concept: '解析位置单向推进',
    type: 'single',
    difficulty: '进阶',
    stem: '解析 `<div><span>A</span><span>B</span></div>` 时，第一个 `span` 解析完成后，`parseChildren` 从什么位置继续？若实现把 `currentIndex` 回退到第一个 `span` 之前重新尝试规则，最可能的后果是？',
    options: [
      {
        value: 'A',
        label: '应从第一个 `</span>` 之后继续；回退会重复解析同一个 `span`，造成子节点重复甚至无法推进到第二个 `span`',
      },
      {
        value: 'B',
        label: '应回退到父元素开头；这样可以让每次循环都重新确认父节点，属于递归下降的必要步骤',
      },
      {
        value: 'C',
        label: '位置无关紧要，只要 AST 节点的 `loc` 正确，重复解析会被自动去重',
      },
      {
        value: 'D',
        label: '应回到模板起点重新扫描，直到遇到 `</div>` 才停止',
      },
    ],
    answer: ['A'],
    explanation:
      '递归下降的每个解析函数消费自己负责的那段输入，父级循环从子节点结束处继续，位置只能单向推进到父元素闭合或输入结束。回退全局索引会让同一个片段被反复消费，轻则生成重复节点，重则死循环；需要前瞻时应使用局部读取，而不是移动并重置解析主位置。',
  },
  {
    id: 'dq-16.3-p3',
    chapterId: 16,
    sectionId: '16.3',
    pointIds: ['16.3-p3'],
    concept: '状态与位置同步推进',
    type: 'single',
    difficulty: '挑战',
    stem: '实现插值解析时，状态机在 `{{` 处进入插值状态，但代码没有把 `currentIndex` 推过这两个字符；`parseInterpolation` 找到 `}}` 后返回，外层循环又看到了同一个 `{`。最可能发生什么？',
    options: [
      {
        value: 'A',
        label: '解析位置没有前进，外层可能反复进入同一段插值，生成重复节点或陷入死循环',
      },
      {
        value: 'B',
        label: '状态机会自动把索引推进到 `}}` 之后，因此不会产生任何影响',
      },
      {
        value: 'C',
        label: '编译器会立即报“插值未闭合”，因为再次看到 `{` 就等同于缺少 `}}`',
      },
      {
        value: 'D',
        label: '只会少生成一个文本节点，后续解析仍能正常完成',
      },
    ],
    answer: ['A'],
    explanation:
      '状态切换和源码位置推进必须同步：进入插值状态时消费 `{{`，解析完表达式和 `}}` 后也要把位置移到闭合分隔符之后。只改状态不移动索引，外层循环会再次识别同一个起始标记，导致重复解析或死循环；这与“确实没有闭合分隔符”是两类不同问题。',
  },
  {
    id: 'dq-16.4-p1',
    chapterId: 16,
    sectionId: '16.4',
    pointIds: ['16.4-p1'],
    concept: '自闭合标签不压栈',
    type: 'single',
    difficulty: '进阶',
    stem: '模板 `<div><img src="a.png" /><span>x</span></div>` 中，`img` 是自闭合标签。如果解析器错误地把它压入元素栈，最可能得到什么结果？',
    options: [
      {
        value: 'A',
        label: '后面的 `span` 会被挂到 `img` 下，解析 `</div>` 时栈顶不匹配，产生错误的嵌套结构或编译错误',
      },
      {
        value: 'B',
        label: '`span` 仍会成为 `div` 的兄弟节点，因为自闭合标记会自动抵消压栈操作',
      },
      {
        value: 'C',
        label: '`img` 会被当作父元素，但 `</div>` 会自动把 `img` 和 `span` 一起关闭且不报错',
      },
      {
        value: 'D',
        label: '只会影响 `img` 的属性解析，不会影响后续元素的父子关系',
      },
    ],
    answer: ['A'],
    explanation:
      '自闭合标签没有子节点，也不等待结束标签，因此解析完成后不应入栈。错误入栈会让后续 `span` 成为它的子节点；当 `</div>` 到来时栈顶不是 `div`，就会触发结束标签不匹配或未闭合错误。自闭合标记不是“稍后自动抵消”的占位符。',
  },
  {
    id: 'dq-16.4-p3',
    chapterId: 16,
    sectionId: '16.4',
    pointIds: ['16.4-p3'],
    concept: '标签位置信息的用途',
    type: 'single',
    difficulty: '基础',
    stem: '编译 `<MyCard><span>{{ user.name }}</span></MyCard>` 时，解析器为每个标签保留 `loc`（起止偏移、行、列）。这项信息最重要的作用是？',
    options: [
      {
        value: 'A',
        label: '让后续转换错误和 source map 能定位到模板中的准确位置，而不是只报“模板某处有问题”',
      },
      {
        value: 'B',
        label: '用于在生成代码时按字母顺序排列标签属性，保证输出稳定',
      },
      {
        value: 'C',
        label: '保存真实 DOM 节点的引用，便于运行时直接修改对应元素',
      },
      {
        value: 'D',
        label: '让解析器可以跳过对标签名的匹配，因为位置已经唯一确定节点',
      },
    ],
    answer: ['A'],
    explanation:
      '标签、属性和文本的位置信息把 AST 节点与源码区间关联起来，转换阶段发现非法表达式、标签不匹配等问题时才能给出精确行列，source map 也需要它把生成代码映射回模板。`loc` 是编译期元数据，不是 DOM 引用，也不能替代栈匹配或属性排序。',
  },
  {
    id: 'dq-16.5-p2',
    chapterId: 16,
    sectionId: '16.5',
    pointIds: ['16.5-p2'],
    concept: '指令语义留待 transform',
    type: 'single',
    difficulty: '进阶',
    stem: '解析 `<div v-if="visible" :title="tip">A</div>` 后、transform 尚未运行时，模板 AST 最可能是什么状态？',
    options: [
      {
        value: 'A',
        label:
          '元素节点仍保留 `v-if` 指令和 `:title` 绑定，记录名称、表达式与位置；此时既不判断 `visible`，也不决定节点是否保留',
      },
      {
        value: 'B',
        label: '解析器已经求出 `visible` 的值，只把需要显示的分支写入 AST',
      },
      {
        value: 'C',
        label: '`v-if` 已被改写成 JavaScript 三元表达式，`:title` 已变成静态字符串',
      },
      {
        value: 'D',
        label: '解析器会删除 `v-if`，把元素当成普通 `div`，等运行时再根据属性名恢复条件逻辑',
      },
    ],
    answer: ['A'],
    explanation:
      '解析阶段的职责是识别模板语法并记录结构。指令和普通属性在 AST 中都先表现为带名称、表达式和位置的属性节点，`v-if` 的条件语义、`:title` 的绑定语义要由 transform 插件解释。解析器不执行组件状态，因此不可能在这里求出 `visible` 或完成 JavaScript 改写。',
  },
  {
    id: 'dq-16.5-p3',
    chapterId: 16,
    sectionId: '16.5',
    pointIds: ['16.5-p3'],
    concept: '空白与无值属性边界',
    type: 'multiple',
    difficulty: '挑战',
    stem: '解析 `<button disabled data-mode = "dark" title="">Go</button>` 时，下列说法正确的有？',
    options: [
      {
        value: 'A',
        label: '`disabled` 是没有等号的无值属性，不会被错误地把后面的 `data-mode` 当成它的值',
      },
      {
        value: 'B',
        label: '`data-mode = "dark"` 中等号两侧的空白可以跳过，解析出的属性值不包含外层引号',
      },
      {
        value: 'C',
        label: '`title=""` 是显式空字符串值，应与完全无值的 `disabled` 区分开',
      },
      {
        value: 'D',
        label: '解析器遇到无值属性后应停止解析当前标签，把剩余内容全部当作文本',
      },
    ],
    answer: ['A', 'B', 'C'],
    explanation:
      '属性解析要先读名称，再允许空白、可选的等号和空白，最后按引号或无引号规则读取值。无等号属性与 `name=""` 都合法但含义不同：前者没有值，后者是空字符串；引号只用于界定值。无值属性不会终止标签解析，否则后面的属性会全部丢失。',
  },
  {
    id: 'dq-16.6-p1',
    chapterId: 16,
    sectionId: '16.6',
    pointIds: ['16.6-p1'],
    concept: '文本读取的边界条件',
    type: 'single',
    difficulty: '进阶',
    stem: '解析 `<p>Hello, {{ name }}!</p>` 时，`p` 的子节点应当是什么？',
    options: [
      {
        value: 'A',
        label:
          '文本 `Hello, `、插值节点 `name`、文本 `!` 三个兄弟节点，文本读取在 `{{` 处暂停并在 `}}` 后继续',
      },
      {
        value: 'B',
        label: '一个完整文本节点 `Hello, {{ name }}!`，插值只在运行时由字符串替换完成',
      },
      {
        value: 'C',
        label: '只有插值节点，前后的普通文本会被当作分隔空白丢弃',
      },
      {
        value: 'D',
        label: '三个文本节点，因为 `{{` 和 `}}` 都会切断文本，但表达式内容也保留为文本',
      },
    ],
    answer: ['A'],
    explanation:
      '普通文本模式读取到 `<`、`{{` 或当前文本模式的结束条件就停止；识别并消费插值后，再继续读取后续文本。因此示例会形成文本、插值、文本三个兄弟节点，而不是把整个内容交给运行时做字符串替换。边界判断要基于解析位置和合法起始标记，不能简单按字符数量切分。',
  },
  {
    id: 'dq-16.7-p1',
    chapterId: 16,
    sectionId: '16.7',
    pointIds: ['16.7-p1'],
    concept: '插值表达式的提取',
    type: 'single',
    difficulty: '进阶',
    stem: '模板 `<p>{{ user.name || "匿名" }}</p>` 中，插值节点在解析完成后最可能保存什么？',
    options: [
      {
        value: 'A',
        label:
          '保存表达式字符串 `user.name || "匿名"`（去掉首尾空白），而不是在解析阶段求值；具体如何生成代码交给后续转换',
      },
      {
        value: 'B',
        label: '直接保存 `user.name` 的当前值，因为解析器需要先求值才能确定插值内容',
      },
      {
        value: 'C',
        label: '保存包含 `{{`、`}}` 的完整原文，运行时再删除分隔符',
      },
      {
        value: 'D',
        label: '只保存 `user`，其余成员访问和逻辑或运算由浏览器按文本解析',
      },
    ],
    answer: ['A'],
    explanation:
      '插值解析的关键是找到匹配的 `}}`，取出两个分隔符之间的表达式并记录位置；表达式本身保持为待处理内容，由 transform 决定如何嵌入渲染代码。解析阶段不访问组件实例，也不会求值 `user.name`。分隔符不属于表达式，若把它们留在 content 中，后续代码生成会得到非法 JavaScript。',
  },
  {
    id: 'dq-16.7-p3',
    chapterId: 16,
    sectionId: '16.7',
    pointIds: ['16.7-p3'],
    concept: '未闭合插值的错误处理',
    type: 'judge',
    difficulty: '基础',
    stem: '解析 `<div>{{ msg</div>` 时，为提高容错性，解析器可以自动在模板末尾补一个 `}}`，把 `<div>` 也当作表达式的一部分继续编译，而不必报错。',
    options: [
      { value: 'A', label: '正确' },
      { value: 'B', label: '错误' },
    ],
    answer: ['B'],
    explanation:
      '插值必须以匹配的 `}}` 闭合，找不到闭合分隔符时应产生带源码位置的编译错误。自动补分隔符会改变表达式边界，把后续标签内容吞进表达式，既掩盖模板错误，也可能生成无法执行的代码；容错恢复不等于静默改写语义。',
  },
  {
    id: 'dq-17.1-p1',
    chapterId: 17,
    sectionId: '17.1',
    pointIds: ['17.1-p1'],
    concept: '全量 diff 的遍历成本',
    type: 'single',
    difficulty: '进阶',
    stem: '一个页面有上千个几乎不变的静态节点，只有一处 `{{ count }}` 会更新。若没有 Block 的 `dynamicChildren` 优化，每次更新最需要担心哪项成本？',
    options: [
      {
        value: 'A',
        label: '渲染器仍要遍历整棵 vnode 树并逐节点比较，即使多数静态节点的 DOM 最终不需要改动',
      },
      {
        value: 'B',
        label: '浏览器会重新下载并解析模板字符串，因为模板没有缓存',
      },
      {
        value: 'C',
        label: '所有静态 DOM 节点都会被销毁重建，导致页面闪烁',
      },
      {
        value: 'D',
        label: '编译器会在每次更新时重新执行 parse 和 generate',
      },
    ],
    answer: ['A'],
    explanation:
      '全量 diff 的主要浪费是遍历与比较本身：静态节点虽然可能被跳过 DOM 写入，但仍要进入 patch 流程、检查类型和 props。Block 把动态后代收集到 `dynamicChildren`，更新时只处理这些节点。模板编译通常发生在构建阶段，运行时不会因一次响应式更新重新编译模板。',
  },
  {
    id: 'dq-17.3-p2',
    chapterId: 17,
    sectionId: '17.3',
    pointIds: ['17.3-p2'],
    concept: '深层静态子树整体提升',
    type: 'single',
    difficulty: '挑战',
    stem: '对 `<div class="wrap"><section><h2>标题</h2><p>说明</p></section><p>{{ count }}</p></div>` 做静态提升时，下列哪项最符合“深层静态子树整体提升”？',
    options: [
      {
        value: 'A',
        label:
          '整个 `section` 子树连同 `h2`、`p` 一起在 render 外创建一次并复用；只提升 `section` 根节点、却仍在 render 内创建后代，仍会重复创建后代 vnode',
      },
      {
        value: 'B',
        label: '只提升 `section` 的根 vnode，因为子孙节点必须每次渲染重新创建才能保持响应式',
      },
      {
        value: 'C',
        label: '静态提升只对单个元素有效，`section` 含多个子元素时只能把 `h2` 和 `p` 分别提升，不能整体处理',
      },
      {
        value: 'D',
        label: '父节点含有动态的 `count`，因此 `section` 不能提升，整棵树都必须每次重建',
      },
    ],
    answer: ['A'],
    explanation:
      '静态分析会判断一个子树是否与动态数据无关；确认后，整个子树可以作为一个 hoisted vnode 在模块初始化时创建，后代也一并复用。只提升根而让子节点在 render 内重新创建，收益有限。父节点含有动态分支并不妨碍其中某个独立子树被提升；预字符串化又是另一项优化，不能与提升混为一谈。',
  },
  {
    id: 'dq-17.4-p3',
    chapterId: 17,
    sectionId: '17.4',
    pointIds: ['17.4-p3'],
    concept: '预字符串化的启用条件',
    type: 'single',
    difficulty: '挑战',
    stem: '某 `<ul>` 中有 30 个连续且完全静态的 `<li>`；另一个列表只有 3 个静态 `<li>`，中间还夹着 `{{ item }}`。为什么通常只有前者更可能触发预字符串化？',
    options: [
      {
        value: 'A',
        label:
          '预字符串化要求一段连续静态内容，并会参考数量阈值；短片段或被动态节点打断的片段收益不足，通常保留普通 vnode',
      },
      {
        value: 'B',
        label: '只要节点是静态的，无论数量和位置如何都一定预字符串化，后者没有触发只是因为编译器随机选择',
      },
      {
        value: 'C',
        label: '预字符串化只处理动态节点，静态节点越多反而越不可能启用',
      },
      {
        value: 'D',
        label: '预字符串化只在 SSR 中启用，客户端编译不会考虑这种优化',
      },
    ],
    answer: ['A'],
    explanation:
      '预字符串化把连续的静态兄弟节点合并成 HTML 字符串，用一次 innerHTML 插入减少 vnode 创建与后续遍历；因此需要足够的连续长度来抵消字符串生成与失去细粒度更新能力的代价。动态插值会打断连续块，短静态片段通常不值得这样做，编译器会按阈值和上下文决定。',
  },
  {
    id: 'dq-17.5-p3',
    chapterId: 17,
    sectionId: '17.5',
    pointIds: ['17.5-p3'],
    concept: '缓存函数捕获旧值',
    type: 'single',
    difficulty: '挑战',
    stem: '模板为 `<button v-for="item in items" :key="item.id" @click="() => select(item)">{{ item.name }}</button>`。编译器为什么通常不把该内联处理函数按模板位置缓存成一个复用函数？',
    options: [
      {
        value: 'A',
        label:
          '处理函数闭包引用了 `v-for` 的 `item`，若所有迭代复用首次创建的函数，可能一直选中第一个 item；应避免缓存带循环作用域引用的函数',
      },
      {
        value: 'B',
        label: '缓存只影响事件名字符串，和闭包变量无关，因此不缓存只是为了减小代码体积',
      },
      {
        value: 'C',
        label: '`v-for` 会生成 Fragment，所以任何事件处理函数都无法被调用',
      },
      {
        value: 'D',
        label: 'JavaScript 闭包会自动读取循环变量的最新值，缓存不会造成旧值问题，编译器只是没有实现该优化',
      },
    ],
    answer: ['A'],
    explanation:
      '事件缓存通过 `_cache` 按模板位置复用同一个函数，前提是函数行为不能依赖每次创建时捕获的可变作用域。`v-for` 中的 `item` 属于每轮迭代的绑定，若复用同一个闭包，可能捕获首轮值，导致所有按钮都选中同一个条目。编译器检测到循环作用域引用时会放弃缓存或让处理函数按迭代重新创建；而访问响应式对象属性的闭包通常仍能在调用时读到最新值。',
  },
  {
    id: 'dq-17.6-p2',
    chapterId: 17,
    sectionId: '17.6',
    pointIds: ['17.6-p2'],
    concept: 'v-once 与静态提升的差异',
    type: 'single',
    difficulty: '进阶',
    stem: '对比 `<div class="static"><p>说明</p></div>` 与 `<div v-once>{{ message }}</div>`。下列关于两者优化差异的说法，哪项正确？',
    options: [
      {
        value: 'A',
        label:
          '前者完全静态，可整体提升到 render 外只创建一次；后者含动态表达式，不能按静态节点提升，但首次渲染后会缓存 vnode 并跳过后续更新',
      },
      {
        value: 'B',
        label: '两者完全等价，`v-once` 只是静态提升的语法别名，编译结果没有任何区别',
      },
      {
        value: 'C',
        label: '前者每次渲染都会重新创建 vnode，后者因为 `v-once` 会在构建时求值 `message`',
      },
      {
        value: 'D',
        label: '后者每次渲染都重新创建并 patch，只是把事件监听移除，所以与静态提升没有差异',
      },
    ],
    answer: ['A'],
    explanation:
      '静态提升针对编译期可确认与动态数据无关的节点，vnode 在 render 外创建并长期复用。`v-once` 的节点可能包含动态表达式，只是首次渲染后把结果缓存下来，之后不再更新；因此它仍参与首次渲染，并且对会变化的数据使用会停留在旧值。二者都能减少后续创建/更新，但适用条件和语义不同。',
  },
]
