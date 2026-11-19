# 测试统计报告

> 对应 V3 指导书 9.4 节「测试与覆盖率报告 → docs/reports/」。
> 数据来源：CI 的 `backend-test-reports` 工件（`mvn verify` 生成的 Surefire / Failsafe `TEST-*.xml`）。
> 采集版本：`develop` @ `ab6374c`（含 PR #49 #50）｜采集时间：2026-11-19
> 运行记录：[develop run 44435279911](https://github.com/hbuas-se-2026fall/cs2412-team09-campus-overflow/actions/runs/44435279911)

## 一、总览

| 指标 | 数值 |
|---|---|
| 单元测试（Surefire） | **123** |
| 集成测试（Failsafe） | **3** |
| 合计执行次数 | **126** |
| 测试类（Surefire 报告文件） | 23 |
| 失败 / 错误 | **0 / 0** |
| 跳过 | 0 |
| 单元测试耗时 | 4.14 秒 |
| 集成测试耗时 | 33.5 秒（含容器启动） |
| 构建结果 | `BUILD SUCCESS` |

> 版本口径：v1.1.0 是 117 个，v1.2.0 发布点是 122 个，develop 现在 123 个（PR #49 增加 `AnswerTest` 的自答拦截用例）。
> 引用数字时必须带版本，不要把三个数混用。

## 二、按层分布

| 层 | 用例数 | 占比 | 说明 |
|---|---:|---:|---|
| **领域层** | **64** | 52.0% | 纯 Java 单元测试，不启动容器 |
| **应用层** | **56** | 45.5% | 用例编排、事务边界、事件发布（伪仓储） |
| **共享内核** | 2 | 1.6% | 脱敏工具 |
| **架构约束** | 1 | 0.8% | ArchUnit 8 条规则，作为 1 个测试类执行 |
| **单元测试小计** | **123** | 100% | |

领域层与应用层合计 120 个，占 97.6%——业务规则下沉到领域、用例编排留在应用层，两层都能脱离 Spring 容器跑。

## 三、按模块分布

| 模块 | 用例 | 测试类 |
|---|---:|---:|
| `co-qa/co-qa-domain` | 28 | 9 |
| `co-discovery/co-discovery-application` | 20 | 3 |
| `co-qa/co-qa-application` | 18 | 4 |
| `co-reputation/co-reputation-application` | 18 | 1 |
| `co-reputation/co-reputation-domain` | 15 | 2 |
| `co-identity/co-identity-domain` | 13 | 2 |
| `co-discovery/co-discovery-domain` | 8 | 1 |
| `co-shared-kernel` | 2 | 1 |
| `co-bootstrap`（ArchUnit） | 1 | 1 |
| **单元测试合计** | **123** | **23** |
| `co-bootstrap`（集成测试） | 3 | 1 |

## 四、测试类清单

### 领域层（64）

| 模块 | 测试类 | 用例 |
|---|---|---:|
| qa-domain | `QuestionTest$Posting` | 4 |
| qa-domain | `QuestionTest$Accepting` | 5 |
| qa-domain | `QuestionTest$EditingAndDeleting` | 3 |
| qa-domain | `AnswerTest` | 4 |
| qa-domain | `MarkdownBodyTest` | 4 |
| qa-domain | `TagsTest` | 5 |
| qa-domain | `VoteAndCommentTest` | 3 |
| reputation-domain | `ReputationRulebookTest` | 9 |
| reputation-domain | `BountyAndAccountTest` | 6 |
| identity-domain | `UserTest` | 6 |
| identity-domain | `CourseTest` | 7 |
| discovery-domain | `DiscoveryDomainTest` | 8 |

### 应用层（56）

| 模块 | 测试类 | 用例 |
|---|---|---:|
| qa-application | `VoteServiceTest` | 6 |
| qa-application | `CommentServiceTest` | 5 |
| qa-application | `AnswerAndVoteServiceTest` | 4 |
| qa-application | `QaQueryApiImplTest` | 3 |
| reputation-application | `ReputationApplicationServiceTest` | 18 |
| discovery-application | `SearchIndexProjectorTest` | 8 |
| discovery-application | `NotificationProjectorTest` | 7 |
| discovery-application | `DiscoveryQueryServiceTest` | 5 |

### 其他（3）

- `co-shared-kernel`：`MaskingTest` 2 个
- `co-bootstrap`：`ArchitectureTest` 1 个（内部执行 8 条 ArchUnit 规则）

### 集成测试（3）

- `co-bootstrap`：`CampusOverflowFlowIT` 3 个，Testcontainers 拉起 MySQL 8 + Redis 7

## 五、边界值覆盖

| 边界 | 用例所在 | 断言 |
|---|---|---|
| 标题 10 / 150 字符 | `QuestionTest$Posting` | 9 字符拒、151 字符拒 |
| 标签 5 / 6 个 | `TagsTest`、`QuestionTest$Posting` | 5 个通过、6 个抛 `QA-1005`、0 个拒 |
| 悬赏积分 10 / 500 | `BountyAndAccountTest` | 9 拒、501 拒 |
| 悬赏期限 1 / 14 天 | `BountyAndAccountTest` | 0 天拒、15 天拒 |
| 声誉赞改踩 -12 | `ReputationRulebookTest` | `UPVOTE → DOWNVOTE` 增量为 -12 |
| 每日投票上限 200 | `ReputationRulebookTest` | 超限截断 |
| 不能回答自己的问题 | `AnswerTest` | 抛 `QA-1017`（PR #49） |

## 六、复现

```bash
cd backend
mvn -B verify -DskipITs -Djacoco.skip=false   # 单元测试 + 架构约束 + 覆盖率门禁
mvn -B verify -Dsurefire.skip=true            # 集成测试（需 Docker）
```

单模块：

```bash
mvn -B -pl co-qa/co-qa-domain -am test
```

CI 上每次 push 都会执行同一套（见 [ci-history.md](ci-history.md)）。
