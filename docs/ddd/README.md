# DDD 设计文档

> 对应 V3 指导书 9.4 节「DDD 设计文档（上下文映射、统一语言、事件目录、领域模型）→ docs/ddd/」。

| 交付物 | 文件 | 内容 |
|---|---|---|
| 上下文映射 | [context-map.md](context-map.md) | 六个限界上下文、事件与查询关系、三条跨上下文硬规矩 |
| 统一语言 | [glossary.md](glossary.md) | 40 条中英对照术语，按上下文分组 |
| 事件目录 | [event-catalog.md](event-catalog.md) | 14 个集成事件的生产者、消费者、触发时机与幂等策略 |
| 领域模型 | [aggregates.md](aggregates.md) | 10 个聚合的根实体、内部对象与关键不变式 |

## 与其他文档的关系

- 架构决策的原因见 [../adr/](../adr/)（ADR-001 模块化单体、ADR-009 包结构）
- 需求侧的用户故事见 [../backlog/](../backlog/)
- 领域代码在 `backend/co-*/co-*-domain/`
