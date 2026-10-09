# 实现说明（SUBMISSION）

## T1 缺陷修复（40%）
抽离纯函数 `buildCustomSections(sections, startTime)`（无 DOM 依赖，供 T3 单测）：不计入总时间的环节（`countInTotal===false`）在环节链中为零时长占位（`start===end`），位置等于其之前所有计入环节时长之和；计入环节依次拼接，`currentTime` 只在计入时推进；"考试结束"环节 `start=end=totalMinutes`。`applyCustomExamConfig` 改为调用该纯函数，标题区时间段、时间线末端、"总时间"三者统一用 `totalMinutes` 保证三方一致。`updateSectionList` 对 `countInTotal===false` 的环节标题显示"不计时"而非"0min"。三入口（`handleSectionChange`/`skipToSelectedSection`/`nextSection`）钳制 `timeLeft∈[0,totalTime]`；`formatTime` 增加防御性钳负。官方预设无 `countInTotal` 字段（`!== false` 视为计入），环节链与回归不变。

## T2 功能实现（35%）
Web Audio API（`OscillatorNode`+`GainNode`，250ms 包络）合成提示音，无外部音频资源。三种触发入口：`updateTimer` 检测 `currentSectionIndex` 自然跨入、`nextSection` 按钮、`handleSectionChange`/`skipToSelectedSection` 下拉；手动跳转后同步 `lastNotifiedSectionIndex`，避免下一 tick 重复响（每次切换仅响一次）。复用现有 displaySettings 全套，新增 `showSectionSwitchSound` 默认勾选（全局变量 + `initialize/apply/toggle/reset/updateDisplaySettings` + `index.html` 复选框），持久化到 `localStorage.displaySettings`，刷新/切预设/从 custom-exam 返回均保持。`AudioContext` 在首次用户手势（`startExam`）中创建或 `resume()`，首次交互前无声且无未捕获错误。视觉提示（`#currentSection` 闪烁 `.section-flash`）与提示音受同一开关控制。PWA 无新增静态资源，记为不适用。

## T3 自动化测试（20%）
`package.json` 配置 `scripts.test = "node --test"`，零依赖（Node ≥ 18 内置 `node:test` + `node:assert`），离线、退出码 0。`tests/pure-functions.test.js` 覆盖 `buildCustomSections`（fixture 各环节 `start/end/realTime`、考试结束=120、全部 `countInTotal:false` 总时长 0）、`formatTime`、`calculateEndTime`、`validateAndFormatTime` 全部最低用例集。可测性改造：`script.js`/`custom-exam.js` 末尾加 `module.exports` 守卫；包裹顶层 `document.addEventListener` 与 `loadCustomExams()` 调用（`typeof document !== "undefined"`），Node 环境跳过、浏览器行为不变；不把断言写进产品代码。17 用例全通过。
