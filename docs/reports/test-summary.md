# 测试统计报告

> 对应 V3 指导书 9.4 节「测试与覆盖率报告 → docs/reports/」。
> 数据来源：`mvn -B verify -DskipITs`，Surefire 的 `TEST-*.xml` 汇总。
> 采集时间：2026-10-29 ｜ 代码版本：`main` @ `3592134`

## 一、总览

| 指标 | 数值 |
|---|---|
| 测试用例 | **117** |
| 测试类 | 23 |
| 失败 / 错误 | **0 / 0** |
| 跳过 | 0 |
| 总耗时 | **9.96 秒** |
| 构建结果 | `BUILD SUCCESS` |

> 117 而不是早期文档里写的 112：`TagsTest` 新增 5 个用例（PR #23 合入），
> `Tags.reconstitute` 这条新路径原来零覆盖。

## 二、按层分布

| 层 | 用例数 | 占比 | 说明 |
|---|---|---|---|
| **领域层** | **58** | 49.6% | 纯 Java 单元测试，不启动容器，毫秒级 |
| **应用层** | **56** | 47.9% | 用例编排、事务边界、事件发布（伪仓储） |
| **共享内核** | 2 | 1.7% | 脱敏工具 |
| **架构约束** | 1 | 0.9% | ArchUnit 8 条规则，作为 1 个测试类执行 |

领域层与应用层合计 **114 个**，占 97.4%——这是我们刻意维持的比例：
业务规则下沉到领域、用例编排留在应用层，两层都能脱离 Spring 容器跑。

## 三、按模块分布

| 模块 | 用例 | 测试类 | 耗时(s) |
|---|---:|---:|---:|
| `co-qa/co-qa-domain` | 27 | 8 | 0.92 |
| `co-discovery/co-discovery-application` | 20 | 3 | 0.67 |
| `co-qa/co-qa-application` | 18 | 4 | 0.63 |
| `co-reputation/co-reputation-application` | 18 | 1 | 0.62 |
| `co-reputation/co-reputation-domain` | 15 | 2 | 0.66 |
| `co-identity/co-identity-domain` | 9 | 2 | 0.49 |
| `co-discovery/co-discovery-domain` | 7 | 1 | 0.48 |
| `co-shared-kernel` | 2 | 1 | 0.33 |
| `co-bootstrap`（ArchUnit） | 1 | 1 | 5.15 |
| **合计** | **117** | **23** | **9.96** |

## 四、测试类清单

### 领域层（58）

| 模块 | 测试类 | 用例 |
|---|---|---:|
| qa-domain | `QuestionTest$Posting` | 4 |
| qa-domain | `QuestionTest$Accepting` | 5 |
| qa-domain | `QuestionTest$EditingAndDeleting` | 3 |
| qa-domain | `AnswerTest` | 3 |
| qa-domain | `MarkdownBodyTest` | 4 |
| qa-domain | `TagsTest` | 5 |
| qa-domain | `VoteAndCommentTest` | 3 |
| reputation-domain | `ReputationRulebookTest` | 9 |
| reputation-domain | `BountyAndAccountTest` | 6 |
| identity-domain | `UserTest` | 6 |
| identity-domain | `CourseTest` | 3 |
| discovery-domain | `DiscoveryDomainTest` | 7 |

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

## 五、边界值覆盖

V3 评审清单要求覆盖关键边界值，我们的对应关系：

| 边界 | 用例所在 | 断言 |
|---|---|---|
| 标题 10 / 150 字符 | `QuestionTest$Posting` | 9 字符拒、151 字符拒 |
| 标签 5 / 6 个 | `TagsTest`、`QuestionTest$Posting` | 5 个通过、6 个抛 `QA-1005`、0 个拒 |
| 悬赏积分 10 / 500 | `BountyAndAccountTest` | 9 拒、501 拒 |
| 悬赏期限 1 / 14 天 | `BountyAndAccountTest` | 0 天拒、15 天拒 |
| 声誉赞改踩 -12 | `ReputationRulebookTest` | `UPVOTE → DOWNVOTE` 增量为 -12 |
| 每日投票上限 200 | `ReputationRulebookTest` | 超限截断 |

## 六、复现

```bash
cd backend
mvn -B verify -DskipITs              # 跑全部测试 + 覆盖率门禁
```

单模块：

```bash
mvn -B -pl co-qa/co-qa-domain -am test
```

CI 上每次 push 都会执行同一套（见 [ci-history.md](ci-history.md)）。
