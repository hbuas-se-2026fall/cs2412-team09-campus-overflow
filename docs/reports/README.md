# 测试与覆盖率报告

> 对应 V3 指导书 9.4 节「测试与覆盖率报告 → docs/reports/」。
> 本页只是索引，**具体数字以各报告正文为准**；每份报告顶部都标了采集版本与时间，引用时必须一起带上。

| 报告 | 内容 | 关键数字（含口径） |
|---|---|---|
| [test-summary.md](test-summary.md) | 测试分类统计、按模块明细、边界值覆盖对照 | develop @ `ab6374c`（2026-11-19）：**123 单元 + 3 集成 = 126 次执行**，0 失败。v1.1.0 为 117 |
| [coverage.md](coverage.md) | 四个领域模块行覆盖率、只统计领域层的理由、与 Sonar 口径差异 | **77.2%**（465 / 602 行，2026-10-29 采集，main @ `3592134`） |
| [ci-history.md](ci-history.md) | Actions 运行记录、门禁生效证据、11 月故障与修复 | 10-29 基线 8 次全绿；11-17～19 经历额度耗尽与集成测试真实失败，均已修复 |

## 一句话结论

- **测试**：develop 上 123 个 Surefire 用例 + 3 个 Failsafe 集成用例，0 失败；按层 64 领域 / 56 应用 / 2 共享 / 1 架构约束
- **覆盖率**：领域层 77.2%，四模块均 ≥ 72.5%，门禁阈值 `domain.coverage.minimum=0.70` 已生效。该百分比为 2026-10-29 采集，v1.2.0 起只验证门禁通过、未逐行重算
- **CI**：backend（测试 → ArchUnit → 覆盖率门禁 → 集成测试）与 frontend 在 push 与 PR 上执行；images 仅 main 执行，PR 上是 `skipped`

## 版本口径（三个数不可混用）

| 版本 | commit | Surefire 用例 | 采集时间 |
|---|---|---:|---|
| v1.1.0 | `3592134` | 117 | 2026-10-29 |
| v1.2.0 | `211e99d` | 122 | 2026-11-19 |
| develop | `ab6374c` | 123 | 2026-11-19 |

明细见 [test-summary.md](test-summary.md) 顶部说明，以及与 [../final/quality-report.md](../final/quality-report.md) 的「版本数据对照」表。

## 与其他文档的关系

- 覆盖率门槛怎么定的 → [../team/coverage-guide.md](../team/coverage-guide.md)
- 评审时检查哪些项 → [../team/review-checklist.md](../team/review-checklist.md)
- 领域层为什么能脱离容器测试 → [../adr/008-领域与持久化分离.md](../adr/008-领域与持久化分离.md)

## 更新方式

三份报告的数字都可从仓库直接复算：

```bash
cd backend && mvn -B verify -DskipITs     # 产生 surefire 报告与 jacoco 数据
```

测试数取 `**/target/surefire-reports/TEST-*.xml` 的 `tests` 属性之和；
覆盖率取各领域模块 `target/site/jacoco/jacoco.csv` 的 `LINE_COVERED / (LINE_COVERED + LINE_MISSED)`。
