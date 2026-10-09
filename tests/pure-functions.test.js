const { test } = require("node:test");
const assert = require("node:assert");
const {
  formatTime,
  calculateEndTime,
  buildCustomSections,
} = require("../js/script.js");
const { validateAndFormatTime } = require("../js/custom-exam.js");

// ==================== T1: buildCustomSections 转换纯函数 ====================

test('T1 fixture(科目一90计入/休息10不计/科目二30计入) 各环节 start/end/realTime', () => {
  const sections = [
    { name: "科目一", duration: 90, description: "科目一", countInTotal: true },
    { name: "休息", duration: 10, description: "休息", countInTotal: false },
    { name: "科目二", duration: 30, description: "科目二", countInTotal: true },
  ];
  const r = buildCustomSections(sections, "09:00");
  assert.strictEqual(r.totalMinutes, 120, "totalMinutes 应为 120");
  const s = r.sections;
  // 科目一: 0/90 09:00-10:30
  assert.deepStrictEqual([s[0].start, s[0].end, s[0].realTime], [0, 90, "09:00-10:30"]);
  assert.strictEqual(s[0].countInTotal, true);
  // 休息(不计入): 90/90 零时长占位 10:30-10:30
  assert.deepStrictEqual([s[1].start, s[1].end, s[1].realTime], [90, 90, "10:30-10:30"]);
  assert.strictEqual(s[1].countInTotal, false, "不计入环节保留 countInTotal=false");
  // 科目二: 90/120 10:30-11:00
  assert.deepStrictEqual([s[2].start, s[2].end, s[2].realTime], [90, 120, "10:30-11:00"]);
  // 考试结束: 120/120 11:00
  assert.deepStrictEqual([s[3].start, s[3].end, s[3].name, s[3].realTime], [120, 120, "考试结束", "11:00"]);
});

test('T1 考试结束位置 = totalMinutes', () => {
  const r = buildCustomSections([{ name: "A", duration: 60, countInTotal: true }], "09:00");
  assert.strictEqual(r.totalMinutes, 60);
  const end = r.sections[r.sections.length - 1];
  assert.strictEqual(end.start, 60);
  assert.strictEqual(end.end, 60);
});

test('T1 全部 countInTotal:false 时不抛错且总时长为 0', () => {
  const r = buildCustomSections([{ name: "A", duration: 30, countInTotal: false }], "09:00");
  assert.strictEqual(r.totalMinutes, 0, "全不计入 totalMinutes=0");
  assert.strictEqual(r.sections[0].start, r.sections[0].end, "零时长占位");
  assert.strictEqual(r.sections[0].countInTotal, false);
  // 考试结束也在 0
  assert.strictEqual(r.sections[1].start, 0);
  assert.strictEqual(r.sections[1].end, 0);
});

// ==================== formatTime ====================

test('formatTime(0) === "00:00:00"', () => assert.strictEqual(formatTime(0), "00:00:00"));
test('formatTime(7325) === "02:02:05"', () => assert.strictEqual(formatTime(7325), "02:02:05"));
test('formatTime 负数钳 0', () => assert.strictEqual(formatTime(-600), "00:00:00"));

// ==================== calculateEndTime ====================

test('calculateEndTime("09:00", 120) === "11:00"', () =>
  assert.strictEqual(calculateEndTime("09:00", 120), "11:00"));
test('calculateEndTime("23:30", 120) === "01:30 (次日)"', () =>
  assert.strictEqual(calculateEndTime("23:30", 120), "01:30 (次日)"));
test('calculateEndTime("00:00", 0) === "00:00"', () =>
  assert.strictEqual(calculateEndTime("00:00", 0), "00:00"));

// ==================== validateAndFormatTime ====================

test('validateAndFormatTime("09:30") === "09:30"', () =>
  assert.strictEqual(validateAndFormatTime("09:30"), "09:30"));
test('validateAndFormatTime("9:30") === "09:30"', () =>
  assert.strictEqual(validateAndFormatTime("9:30"), "09:30"));
test('validateAndFormatTime("0930") === "09:30"', () =>
  assert.strictEqual(validateAndFormatTime("0930"), "09:30"));
test('validateAndFormatTime("25:99") === null', () =>
  assert.strictEqual(validateAndFormatTime("25:99"), null));
test('validateAndFormatTime("abc") === null', () =>
  assert.strictEqual(validateAndFormatTime("abc"), null));
test('validateAndFormatTime("") === null', () =>
  assert.strictEqual(validateAndFormatTime(""), null));
test('validateAndFormatTime(null) === null', () =>
  assert.strictEqual(validateAndFormatTime(null), null));
test('validateAndFormatTime("24:00") === null', () =>
  assert.strictEqual(validateAndFormatTime("24:00"), null));
