# 领域事件目录（Event Catalog）

> 本文档是 V3 指导书 9.4 节 DDD 四件套之一：上下文映射、统一语言、**事件目录**、领域模型。
> 全部事件均为 `IntegrationEvent` 实现，经**事务性发件箱**（ADR-002）异步投递，至少一次语义。

## 通用约定

| 项 | 约定 |
|---|---|
| 命名 | 过去时 + `Event`；`eventId` 全局唯一（UUID） |
| 结构 | `eventId, occurredAt, ...业务字段` 四个时间字段统一 UTC |
| 投递 | 业务事务内写 `outbox_event`，`OutboxRelay` 提交后投递 |
| 幂等 | 消费端 `processed_event` 表 + 业务唯一键（如账本 `(event_id, user_id, reason)`） |
| 契约位置 | 各上下文 `*-api` 模块的 `api/event` 包，禁止跨上下文引 domain |

## 一、Identity 上下文发布

| 事件 | 触发时机 | 关键字段 | 消费方 | 消费动作 |
|---|---|---|---|---|
| `UserRegisteredEvent` | 注册成功 | userId, displayName, role | Reputation | 开立声誉账户，教师发放 1000 悬赏积分 |

## 二、Q&A 上下文发布

| 事件 | 触发时机 | 关键字段 | 消费方 | 消费动作 |
|---|---|---|---|---|
| `QuestionPostedEvent` | 提问成功 | questionId, authorId, courseId, title, plainText, tags | Discovery | 写入搜索索引 |
| `QuestionEditedEvent` | 编辑问题 | questionId, title, plainText, tags | Discovery | 重建索引条目 |
| `AnswerSubmittedEvent` | 提交回答 | answerId, questionId, authorId | Reputation / Discovery | 计数、索引、通知提问者 |
| `AnswerAcceptedEvent` | 采纳回答 | answerId, questionId, askerId, answerAuthorId | Reputation / Discovery | 回答者 +15 声誉（自问自答为 0）、结算悬赏、通知 |
| `AnswerEndorsedEvent` | 教师认证 | answerId, questionId, answerAuthorId | Reputation / Discovery | 授予「名师认可」徽章、通知 |
| `VoteCastEvent` | 投票 / 改票 | targetType, targetId, targetAuthorId, voterId, value, oldValue | Reputation | 按「新效果 − 旧效果」记增量，受每日 200 上限约束 |
| `CommentPostedEvent` | 发表评论 | commentId, questionId, authorId, body | Discovery | 解析 @ 提及，生成通知 |
| `ContentDeletedEvent` | 软删除内容 | targetType, targetId, questionId, actorId | Discovery | 从索引与通知中移除 |

## 三、Reputation 上下文发布

| 事件 | 触发时机 | 关键字段 | 消费方 | 消费动作 |
|---|---|---|---|---|
| `ReputationChangedEvent` | 账本记一笔后 | userId, delta, reputation, reason | Discovery | 通知、排行榜更新 |
| `BadgeAwardedEvent` | 授予徽章 | userId, badgeCode, badgeName | Discovery | 生成「获得徽章」通知 |
| `BountyOpenedEvent` | 发起悬赏 | bountyId, questionId, sponsorId, points, expiresAt | Discovery | 索引里标记「悬赏中」 |
| `BountyAwardedEvent` | 采纳后结算悬赏 | bountyId, questionId, sponsorId, winnerId, points | Discovery | 通知获奖者 |
| `BountyClosedEvent` | 悬赏到期退款 | bountyId, questionId, sponsorId, points | Discovery | 通知发起人 |

## 四、事件流全景

```
Identity ──UserRegistered──────────────┐
                                        ▼
Q&A ──QuestionPosted/Edited──────────► Reputation ──ReputationChanged──┐
    ──AnswerSubmitted/Accepted────────►            ──BadgeAwarded──────┤
    ──VoteCast───────────────────────►            ──Bounty*────────────┤
    ──CommentPosted───────────────────┐                                 ▼
    ──ContentDeleted──────────────────┼──────────────────────────► Discovery
                                        └──────────────────────────►（索引 + 通知）
```

## 五、为什么这样切

1. **投票是高频写，声誉结算要限流**——两者用事件解耦，投票事务不背账本开销。
2. **搜索和通知都是只读投影**——它们只消费事件、不回源写模型，符合 FF-2 跨上下文契约。
3. **事件是契约不是实现**——放在 `*-api` 模块，消费者看得见字段，看不见生产者内部。

## 六、字段级定义

完整字段见各事件类源码：`backend/co-*/co-*-api/src/main/java/com/campusoverflow/*/api/event/`。
本文档只记录**语义与流向**，字段以代码为准，避免两份文档不同步。