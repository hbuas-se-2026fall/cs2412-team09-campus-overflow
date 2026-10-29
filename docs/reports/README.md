# 测试与覆盖率报告

> 对应 V3 指导书 9.4 节「测试与覆盖率报告 → docs/reports/」。
> 全部数据为本地实测，代码版本 `main` @ `3592134`，采集于 2026-10-29。

| 报告 | 内容 | 关键数字 |
|---|---|---|
| [test-summary.md](test-summary.md) | 测试分类统计、按模块明细、边界值覆盖对照 | **117 个用例 / 23 个类 / 0 失败 / 9.96 秒** |
| [coverage.md](coverage.md) | 四个领域模块行覆盖率、只统计领域层的理由、与 Sonar 口径差异 | **合计 77.2%**（72.5%–80.7%） |
| [ci-history.md](ci-history.md) | Actions 运行记录、门禁生效证据、历史问题修复 | **8 次运行 0 失败** |

## 一句话结论

- **测试**：117 个用例全部通过，其中领域层 58 个、应用层 56 个，两层合计占 97.4%
- **覆盖率**：领域层 77.2%，四个模块均 ≥72.5%，门禁阈值 0.70 已生效
- **CI**：8 次运行全绿，`mvn verify` 会同时跑测试、覆盖率门禁与 ArchUnit 架构约束

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
