# CI 运行记录

> 对应 V3 指导书 9.4 节「测试与覆盖率报告 → docs/reports/」。
> 数据来源：GitHub Actions API，仓库 `hbuas-se-2026fall/cs2412-team09-campus-overflow`
> 采集时间：第二节 2026-10-29（8 次运行，全部 success）；第三节 2026-11-19（v1.2.0 发布期故障与修复）

## 一、工作流构成

`.github/workflows/ci.yml` 定义了三个 job：

| Job | 触发条件 | 内容 |
|---|---|---|
| **后端构建与验证** | push / PR | JDK 21，`mvn -B verify`：编译 → 全部单元测试 → JaCoCo 覆盖率门禁（四模块 ≥70%）→ ArchUnit 8 条规则 → 集成测试（Failsafe） |
| **前端构建** | push / PR | Node 20，`npm install` → `npm run typecheck` → `npm run build`（**lint 目前只在本地 pre-commit 钩子里跑，未进 CI**） |
| **容器镜像构建** | **仅 main** | `docker build` 后端与前端镜像，验证 Dockerfile 可用 |

第三个 job 只在 main 上跑，所以 PR 的检查列表里通常只看到前两个——
这是设计如此，不是漏配。

## 二、运行记录

| # | 分支 | SHA | 结果 | 时间（UTC） | 说明 |
|---:|---|---|---|---|---|
| 8 | `develop` | `3592134` | ✅ success | 2026-10-29 05:34 | develop 分支首次验证 |
| 7 | `docs/v3-scrum-records` | `0b7a8a8` | ✅ success | 2026-10-29 05:16 | PR #4 Scrum 记录 |
| 6 | `docs/v3-ddd-structure` | `5d509b3` | ✅ success | 2026-10-29 05:15 | PR #3 DDD 文档迁移 |
| 5 | `main` | `3592134` | ✅ success | 2026-10-28 00:18 | Lab 6 Sprint 3 回顾合并后 |
| 4 | `main` | `5dd3120` | ✅ success | 2026-10-28 00:13 | 文档批量提交 |
| 3 | `docs/lab6-retro-sprint3` | `ae34fde` | ✅ success | 2026-10-27 13:36 | Lab 6 回顾 |
| 2 | `docs/lab8-runbook` | `b55c1fa` | ✅ success | 2026-10-27 13:30 | Lab 8 运维手册 |
| 1 | `main` | `55d93c1` | ✅ success | 2026-10-27 11:22 | 仓库迁移后首次运行 |

**8 次运行 0 失败**，平均耗时约 3 分钟（后端 2 分钟 + 前端 40 秒）。

> 单元测试数量的版本口径：v1.1.0（`3592134`）117 个 → v1.2.0（`211e99d`）122 个 → develop（`ab6374c`）123 个，
> 明细见 [test-summary.md](test-summary.md)。

## 三、v1.2.0 发布期运行记录（2026-11-17 ~ 11-19）

第二节是 10 月 29 日的快照。此后流水线经历了一轮故障与修复，记录如下：

| 阶段 | 分支 / 提交 | 结果 | 说明 |
| --- | --- | --- | --- |
| Actions 额度耗尽 | 多个提交 | 失败（4 秒退出） | 组织账户额度问题，job 未执行有效步骤，Annotations 写明 `The job was not started because recent account payments have failed…`。**不是代码缺陷** |
| 集成测试真实失败 | `Run 44034431032` | 失败 | Testcontainers 默认 Docker API 1.32 低于 runner 引擎要求的 1.40，属真实环境兼容问题 |
| 修复 1 | PR #30 | 成功 | Failsafe 配置注入 `api.version` |
| 修复 2 | PR #36 | 成功 | 补 `docker-java.properties`（`api.version=1.44`）；环境变量 `DOCKER_API_VERSION` 对 docker-java 无效 |
| 发布合并 | `211e99d`（#48 合入 main） | **成功** | 后端、前端、镜像构建三个 job 全部通过，耗时约 2 分 18 秒（Run 44429548250） |
| P0 修复 | `bbf7601`（#49）、`ab6374c`（#50） | 成功 | 自答规则 + 课程列表页，合并后 develop CI 通过（Run 44435279911） |

**归因上需要区分两类红叉**：额度耗尽导致的失败没有测试日志，不能算代码质量问题；
集成测试失败是真实的配置兼容问题，已由 PR #30、#36 修复。不能笼统地说“历史红叉都是额度问题”。

## 四、门禁实际生效的证据

覆盖率门禁从 0 提到 0.70 是 PR #21（`ca2fb77`）。在此之前，
`domain.coverage.minimum` 的值是 `0`，等于不检查。

改成 0.70 后第一次执行，四个模块的输出：

```
[INFO] All coverage checks have been met.
```

这条不是配置文件的声明，是 `jacoco:check` 实际跑过之后打印的。
如果有人把某个领域模块的重载方法删掉、或者新增了未测试的分支导致掉到 70% 以下，
这一步会打印 `Rule violated for bundle ...` 并让整个 job 失败。

## 五、已知的历史问题与修复

| 问题 | 现象 | 修复 |
|---|---|---|
| 架构检查缺 `-am` | `mvn -pl co-bootstrap test` 找不到依赖模块，CI 恒红 | PR #19 补 `-am` |
| 覆盖率门禁阈值 0 | 门禁形同虚设，覆盖率再低也不失败 | PR #21 提到 0.70 |
| 前端 `npm install` 装不完 | `@eslint/js@^10` 与 `eslint@^9` peer 冲突 | PR #23 降级到 `^9` 并加 lock |

## 六、查看看板

- Actions 全部运行：`https://github.com/hbuas-se-2026fall/cs2412-team09-campus-overflow/actions`
- 单次运行详情可点 SHA 进入，展开三个 job 可看每一步日志。

## 七、本地复现同一套检查

```bash
# 后端（与 CI 的「后端构建与验证」完全一致）
cd backend && mvn -B verify -DskipITs

# 前端（与 CI 的「前端构建」一致）
cd frontend && npm ci && npm run lint && npm run typecheck && npm run build
```
