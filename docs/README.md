# 项目文档索引

CampusOverflow · Team 09。本页说明每个目录放什么，以及在读文档前需要知道的一件编号规则。

## ⚠️ 先读：PR 编号有两个仓库

项目在第 2 周迁过一次仓库：

| 阶段 | 仓库 | PR 编号范围 |
|---|---|---|
| 迁移前（10-22 ~ 10-30） | `H-Canopy/campus-overflow` | #1 – #24（无 #13） |
| 迁移后（10-30 至今） | `hbuas-se-2026fall/cs2412-team09-campus-overflow` | #1 – #10，然后 #25 – |

**两个仓库各自从 #1 开始，同一个数字指的不是同一件事。** 常见冲突：

| 编号 | 迁移前 | 迁移后 |
|---|---|---|
| #1 | hello 自我介绍 | 运维手册 v1.0 |
| #2 | 投票/评论应用层 | Sprint 3 回顾纪要 |
| #3 | AnswerCommandService + 投影器 | docs/ddd 迁移 + 事件目录 |
| #4 | 提问命令/查询服务 | Scrum 记录 sprint-0~4 |
| #7 | QuestionCommandService | ADR-009 事实修正 |
| #8 | ReputationAccount | runbook 补字符编码条目 |
| #9 | Answer / Comment / Tags | 同步 main 到 develop |
| #10 | 投影器 15 个测试修复 | 同步 main 到 develop |

**#11 – #24 只存在于迁移前的仓库，#25 及以后只存在于当前仓库**，这两段不会歧义。

因此：

- 引用 #1 – #10 时，**写明「迁移前」或「迁移后」**
- 引用 #11 – #24 时，指向的是迁移前的仓库
- 引用 #25 及以后时，指向的是当前仓库

## 目录说明

| 目录 | 内容 | V3 对应 |
|---|---|---|
| [`adr/`](adr/) | 10 份架构决策记录（模块化单体、发件箱、包结构、渐进门禁取舍等） | 9.4 ADR |
| [`ddd/`](ddd/) | 上下文映射、统一语言、事件目录、领域模型四件套 | 9.4 DDD 文档 |
| [`backlog/`](backlog/) | 用户故事地图、14 条 PBI、8 份 Gherkin 规格（共 30 个场景） | 第 5 章 |
| [`scrum/`](scrum/) | Sprint 0–4 的计划、评审、回顾、燃尽图，以及站会记录 | 9.4 Scrum 记录 |
| [`reports/`](reports/) | 测试统计、覆盖率、CI 运行记录 | 9.4 测试与覆盖率报告 |
| [`ops/`](ops/) | 运维手册：启动、停止、回滚、常见故障 | 8.4 持续交付 |
| [`final/`](final/) | 个人总结、质量报告、范围声明 | 9.4 个人总结 |
| [`team/`](team/) | 团队章程、代码评审清单、覆盖率指南 | 第 4 章 |
| [`retro/`](retro/) | 早期回顾纪要（Sprint 2、3），与 `scrum/` 对应节内容一致 | 第 9 章 |
| [`postman/`](postman/) | 接口调通用的 Postman Collection | Lab 4 |

## 从哪开始读

如果是第一次看这个项目：

1. [`ddd/context-map.md`](ddd/context-map.md) —— 系统被切成哪几块，块之间怎么说话
2. [`adr/001-模块化单体.md`](adr/001-模块化单体.md) —— 为什么这么切
3. [`adr/009-package-structure.md`](adr/009-package-structure.md) —— 代码为什么长成这样
4. [`scrum/sprint-0.md`](scrum/sprint-0.md) 往后读 —— 每个 Sprint 承诺了什么、做成了什么
5. [`final/scope-and-deferrals.md`](final/scope-and-deferrals.md) —— 哪些没做，为什么

## 一个提醒

文档里的数字（测试数、覆盖率、PR 数）会随版本变化。**以 `docs/reports/` 和 Release Notes 为准**，那两处标注了采集时间和对应的 commit。