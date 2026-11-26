# 质量报告 · CampusOverflow（v1.1.0 → v1.2.0）

**生成日期**：2026-11-05
**修订日期**：2026-11-12（测试数与 ArchUnit 规则口径对齐 `docs/reports/` 的 CI 采集数据）
**再次修订**：2026-11-19（新增 v1.2.0 发布版的测试运行数据，v1.1.0 历史数据保留不动）
**三次修订**：2026-11-26（把历史基线与当前口径分开标注：第三章加版本标签、第二章注明采集日期、第四章 CI 表注明 images 仅 main 执行、第六章评审数据改为实测统计）
**修订依据**：`docs/reports/test-summary.md`（117 用例）、`docs/reports/coverage.md`（465/602 行）、`backend/co-bootstrap/.../architecture/ArchitectureTest.java`（8 条 `@ArchTest`）、v1.2.0 main CI 日志（122 用例）、develop CI 工件（123 用例）
**对应 Release**：v1.1.0（历史统计）、v1.2.0（当前发布版统计）
**CI 流水线**：GitHub Actions（backend / frontend / images 三 job）

## 版本数据对照

两版数据分别采集自不同提交，**不互相覆盖**：

| 版本 | 提交 | Surefire 用例 | Failsafe 集成用例 | 采集日期 |
| --- | --- | --- | --- | --- |
| v1.1.0 | `3592134`（main） | 117 | 3 | 2026-10-29 |
| v1.2.0 | `211e99d`（main，发布合并） | 122 | 3 | 2026-11-19 |
| develop（待发布） | `ab6374c`（含 #49 自答规则、#50 课程浏览） | 123 | 3 | 2026-11-19 |

采集来源：
- v1.1.0 / v1.2.0：`docs/reports/test-summary.md` 与 main 的 `backend-test-reports` 工件
- develop：[run 44435279911](https://github.com/hbuas-se-2026fall/cs2412-team09-campus-overflow/actions/runs/44435279911) 的 `backend-test-reports` 工件（Surefire 123 + Failsafe 3）


v1.2.0 的 122 个含 1 个 ArchUnit 测试入口；与 3 个独立集成用例合计 125 次测试执行，
但**不应表述为“125 个单元测试”**——Surefire 与 Failsafe 是两套独立执行口径。
develop 上再合并 #49、#50 之后是 123 + 3 = 126。
下文第三章为 v1.1.0 历史统计，v1.2.0 与 develop 的增量见第三章末的两段补记。

---

## 一、SonarQube 概览

> **说明**：SonarQube 全项目口径覆盖率为 **32.8%**。课程要求的 70% 覆盖率门禁针对的是**领域层（domain）**，不是全项目。全项目口径包含 infrastructure、interfaces、bootstrap 等薄封装层，拉低了整体数字。

| 指标 | 数值 | 说明 |
|------|------|------|
| 全项目覆盖率（SonarQube） | 32.8% | 含 infrastructure / interfaces / config 等薄封装层 |
| 领域层覆盖率（JaCoCo 门禁） | **77.2%** | CI 强制门禁，低于 70% 直接失败 |
| 代码异味（Code Smells） | 低 | 集中在 config 类和 DTO，domain 层零异味 |
| 安全热点（Security Hotspots） | 0 | 无注入风险，SQL 全部走 JPA 参数绑定 |
| 漏洞（Vulnerabilities） | 0 | 无已知 CVE |
| Bug | 0 | CI 全绿，无失败测试 |

---

## 二、领域层覆盖率明细（JaCoCo）

| 限界上下文 | 覆盖率 | 覆盖行 / 总行 | 门禁要求 | 状态 |
|-----------|--------|--------------|---------|------|
| Q&A 问答核心 | 80.7% | 180 / 223 | ≥ 70% | ✅ 通过 |
| Discovery 发现 | 79.5% | 66 / 83 | ≥ 70% | ✅ 通过 |
| Identity 身份 | 75.7% | 103 / 136 | ≥ 70% | ✅ 通过 |
| Reputation 声誉 | 72.5% | 116 / 160 | ≥ 70% | ✅ 通过 |
| **综合（领域层加权）** | **77.2%** | **465 / 602** | ≥ 70% | ✅ 通过 |

> 数据来源：`docs/reports/coverage.md`，JaCoCo 0.8.12，采集于 2026-10-29（main @ `3592134`）。
> 覆盖率口径：仅统计各上下文的 `-domain` 模块（纯 Java，无 Spring 依赖）。
> 该 77.2% 为 **2026-10-29 采集的精确值**（main @ `3592134`）。v1.2.0 起只验证门禁通过（JaCoCo ≥ 70% 的 Step 成功），未逐行重算，因此引用这个百分比时必须同时注明版本与采集日期；它与"当前发布版覆盖率仍然精确为 77.2%"不是同一件事。
> application / infrastructure / interfaces 层为薄封装，不纳入门禁计算。

---

## 三、测试统计（v1.1.0 历史基线）

> **本表是 v1.1.0 的快照，不是当前版本的数据。** 采集时间 2026-10-29，main @ `3592134`。
> v1.2.0（122 + 3）与 develop（123 + 3）的实测数据见本节末尾两段补记。

| 指标 | 数值 |
|------|------|
| Surefire 用例总数（v1.1.0） | **117 个** |
| 测试类 | 23 个 |
| 失败 / 错误 | 0 / 0 |
| 跳过 | 0 |
| 总耗时 | 9.96 秒 |
| 测试通过率 | **100%** |
| 领域层（纯 Java 单元测试） | 58 个 |
| 应用层（伪仓储编排测试） | 56 个 |
| 共享内核 | 2 个 |
| 架构约束（ArchUnit） | 1 个测试类，含 8 条规则 |
| 集成测试（Testcontainers，Failsafe 单独执行） | 3 个 |

> 数据来源：`docs/reports/test-summary.md`，`mvn -B verify -DskipITs` 的 Surefire `TEST-*.xml` 汇总，
> 采集于 2026-10-29（main @ `3592134`），构建结果 `BUILD SUCCESS`。
> 117 个为 Surefire 口径（不含 IT）；`CampusOverflowFlowIT` 另有 3 个集成用例，
> 由 Failsafe 单独拉起 MySQL + Redis 容器执行，不计入上表总数。

### 测试分布

- **domain 层（58 个）**：每个聚合根都有等价类测试 + 边界测试 + 异常路径测试，纯 Java 不启动容器，毫秒级执行
- **application 层（56 个）**：用例服务的 Happy Path + 权限校验 + 依赖失败场景，用伪仓储替代真实持久化
- **共享内核（2 个）**：脱敏工具等跨上下文通用能力
- **架构层（8 条规则，1 个测试类）**：ArchUnit 强制 DDD 分层与上下文边界
- **集成层（3 个）**：Testcontainers 拉起真实 MySQL + Redis，跑端到端流程

领域层与应用层合计 114 个，占 97.4%——业务规则下沉到领域、用例编排留在应用层，
两层都能脱离 Spring 容器跑，这是模块化单体保持可测性的关键。

### v1.2.0 补记（2026-11-19）

v1.2.0 发布合并到 main 后，后端 job 跑出 **122 个 Surefire 用例，0 失败 0 错误**，
另有 **3 个 Failsafe 集成用例全部通过**。相比 v1.1.0 的 117 个新增 5 个，全部来自两个测试类：
`DiscoveryDomainTest`（US-07 简称搜索）与 `CourseTest`（US-13 课程成员规则）。
`git diff 3592134..211e99d -- "*Test.java"` 显示只有这两个文件有新增，共 +47 行。

- 运行记录：[main run 44429548250](https://github.com/hbuas-se-2026fall/cs2412-team09-campus-overflow/actions/runs/44429548250)（commit `211e99d`，Merge pull request #48），后端、前端、镜像构建三个 job 全部成功
- 覆盖率门禁：JaCoCo 领域层 ≥ 70% 继续通过；第二章列出的 77.2% 仍为 v1.1.0 的精确统计，
  v1.2.0 只证明门禁通过，未重新逐行重算，**引用时请注明版本**

### develop 增量（2026-11-19，尚未发版）

合并 #49（禁止回答自己的问题）与 #50（课程列表页）之后，develop 的 `backend-test-reports` 工件显示：

- Surefire **123 个**（v1.2.0 的 122 + `AnswerTest` 新增的自答拦截用例 1 个）
- Failsafe **3 个**，全部通过
- 合计 126 次测试执行，0 失败 0 错误

按层的分布（采集自同一工件）：

| 层 | 用例数 | 说明 |
|---|---:|---|
| 领域层 | 64 | qa 28 + reputation 15 + identity 13 + discovery 8 |
| 应用层 | 56 | qa 18 + discovery 20 + reputation 18 |
| 共享内核 | 2 | `MaskingTest` |
| 架构约束 | 1 | `ArchitectureTest`（8 条规则） |
| **Surefire 小计** | **123** | |
| 集成测试 | 3 | `CampusOverflowFlowIT` |

运行记录：[develop run 44435279911](https://github.com/hbuas-se-2026fall/cs2412-team09-campus-overflow/actions/runs/44435279911)，后端与前端 job 均 success。
这部分并入 v1.2.1（或下一次发布）后，发布版本的统计才会变成 123。


---

## 四、CI 流水线状态

| Job | 执行范围 | 状态 | 说明 |
|-----|---------|------|------|
| backend | push / PR 均执行 | ✅ 全绿 | 编译 → 单元测试 → ArchUnit → 覆盖率门禁 → 集成测试 |
| frontend | push / PR 均执行 | ✅ 全绿 | npm install → typecheck → build（lint 只在本地 pre-commit 钩子跑，未进 CI） |
| images | **仅 main 执行** | ⚠️ 只在 main 上跑 | 后端镜像 + 前端镜像构建。PR 与 develop 的 run 里该 job 是 `skipped`，**不是失败也不是通过**，引用"三个 Job 全绿"时须限定在 main |

### CI 质量门禁

- **覆盖率门禁**：领域层 JaCoCo ≥ 70%，低于则 CI 失败
- **架构门禁**：ArchUnit 8 条规则，违反则 CI 失败
- **并发控制**：同一 PR 新提交自动取消旧 run，节省 Actions 分钟

---

## 五、架构质量（ArchUnit）

8 条架构适应度函数全部通过（源码：`backend/co-bootstrap/.../architecture/ArchitectureTest.java`）：

| 规则 | 方法名 | 约束内容 |
|------|--------|---------|
| FF-1 | `domain_layer_is_framework_free` | domain 包不得依赖 Spring / JPA / Hibernate / Jackson / Swagger，必须能脱离框架独立编译测试 |
| FF-2 | `contexts_communicate_only_through_published_language` | 四个上下文（identity / qa / reputation / discovery）互不依赖对方的 domain / application / infrastructure / interfaces，只能经由 `api` 包交互 |
| FF-3 | `no_cycles_between_contexts` | 用 ArchUnit `slices` 检测，上下文之间不允许出现循环依赖 |
| FF-4 | `hexagonal_layers` | 六边形分层方向：Interfaces / Application / Domain / Infrastructure / Bootstrap，依赖只能由外向内 |
| FF-5 | `api_packages_are_dependency_free` | `*.api..` 只能依赖 JDK、共享内核、其他上下文的 api，保持发布语言稳定轻量 |
| FF-6 | `tables_use_context_prefix` | 表名前缀按上下文隔离数据所有权：`id_` / `qa_` / `rep_` / `dis_` |
| 分层约束 | `controllers_live_in_interfaces_layer` | `@RestController` 必须位于 `..interfaces..` |
| 分层约束 | `entities_live_in_infrastructure_layer` | `@Entity` 必须位于 `..infrastructure..`（对应 ADR-008 领域与持久化分离） |

> FF 编号沿用 arc42 第 10 章的适应度函数编号；两条分层约束为独立补充规则，不占 FF 编号。
> 8 条规则在 Surefire 中作为一个测试类（`ArchitectureTest`）统计，因此测试类数 23 中它只计 1 个。

---

## 六、与课程要求对照

| 课程要求 | 实际交付 | 状态 |
|---------|---------|------|
| 单元测试覆盖率 ≥ 70% | 领域层 77.2%（465/602 行，2026-10-29 采集，见第二章） | ✅ 达标 |
| CI 持续集成全绿 | backend / frontend 在 push 与 PR 上全绿；images 仅 main 执行 | ✅ 达标 |
| 代码评审 | 5 人全部参与，累计 **36 次评审**（① 8 / ② 12 / ③ 8 / ④ 3 / ⑤ 5），无自批；合并前需 ≥ 1 名非作者 Approve | ✅ 达标 |
| 架构约束可验证 | ArchUnit 8 条规则 CI 强制 | ✅ 达标 |
| SonarQube 质量看板 | 全项目 32.8%（分母含 infrastructure / interfaces 等薄封装层）；课程门禁看领域层 77.2% | ✅ 领域层达标；全项目口径不适用于该门禁 |

> 评审统计口径：以 GitHub 各 PR 的 `reviewed-by` 记录为准，统计时间 2026-11-26。
> 按人计数（① 8 / ② 12 / ③ 8 / ④ 3 / ⑤ 5）合计 36 次，`5 人全部参与` 成立；
> **按 PR 去重统计**：同一 PR 若经历多轮评审（先 COMMIT 后 APPROVE、或多次提交）只计 1 次；
> 若按提交记录计则为 **41 条**（差额 5 条来自同一 PR 内的多轮提交，例如先 COMMENT 再 APPROVE）。两个数不矛盾，引用时须写明口径。
> 但"每人审过其余所有人"并不成立（成员 ⑤ 的两个 PR 只有成员 ① 批过），因此不使用"环形评审"这一说法。
> 机制层面的约束是：合并前必须至少有 1 名非作者的 Approve，且仓库 ruleset 禁止自批。

---

## 七、已知限制

1. **SonarQube 全项目覆盖率偏低（32.8%）**：因为 infrastructure / interfaces / config 层代码量大但测试少。这是模块化单体的常见现象——domain 层是业务核心，测试集中在那里。
2. **前端无单元测试**：前端以类型检查（TypeScript）+ 构建验证为准，未引入前端测试框架（v1.2 计划补 Vitest）。
3. **E2E 测试未自动化**：端到端流程由 Postman Collection + 手工录屏验证，未接入 Cypress / Playwright。
4. **集成测试仅 3 个用例**：Testcontainers 覆盖了主链路（提问→回答→采纳→声誉），异常分支仍依赖应用层伪仓储测试兜底。
