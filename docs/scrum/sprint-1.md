# Sprint 1 · 需求建模与后端骨架

**周期**：第 3–6 周 ｜ **Sprint Goal**：把「提问 → 回答 → 投票」的最短闭环打通，同时产出需求侧三件套。

## 一、Sprint 计划

| PBI | 内容 | 点数 | 负责人 |
|---|---|---|---|
| PB-01 | 用户故事地图 | 3 | ① |
| PB-02 | Product Backlog（14 条） | 3 | ① |
| PB-06~16 | 8 条 Gherkin 验收标准 | 5 | ①③ |
| Q&A 领域 | Question / MarkdownBody / Answer / Comment / Tags / Vote | 18 | ①②③ |
| Q&A 应用 | QuestionCommand / Query、AnswerCommand、VoteService 等 | 18 | ②③④⑤ |
| 前端 | AppShell + 三条路由 | 5 | ④ |

**承诺点数**：52

## 二、执行结果

| 范围 | 状态 |
|---|---|
| 需求三件套 | ✅ docs/backlog/ 下 10 个文件 |
| Q&A 36 个方法 | ✅ 全部实现，QuestionTest / AnswerTest / VoteAndCommentTest 全绿 |
| 前端路由 | ✅ /questions、/questions/new、/questions/:id |

**完成点数**：52 / 52（比计划提前一个 Sprint 完成）

## 三、Sprint 评审

- **演示**：提交一个问题 → 列表出现 → 点进详情 → 投票。
- **反馈**：「教师认证」「悬赏」还没做，PO 决定进 Sprint 2。

## 四、Sprint 回顾

**Start**：PR 标题带上改动的模块名，方便预判冲突。
**Stop**：不在落后 main 的分支上继续堆代码。
**Continue**：一个 PR 一件事。

## 五、燃尽图

| 日期 | 剩余点数 | 理想线 |
|---|---|---|
| W3 末 | 52 | 52 |
| W4 末 | 34 | 35 |
| W5 末 | 18 | 17 |
| W6 末 | 0 | 0 |

```mermaid
xychart-beta
    title "Sprint 1 燃尽"
    x-axis [W3, W4, W5, W6]
    y-axis "剩余点数" 0 --> 52
    line [52, 34, 18, 0]
```