# CampusOverflow · 课程问答社区

面向高校师生的课程问答平台：学生按课程浏览与提问、回答、采纳，教师认证优质回答，声誉与徽章异步结算。

当前版本 **v1.2.0**（2026-11-19 发布）。四个限界上下文的业务已全部实现，单元测试、集成测试、架构约束、覆盖率门禁与容器镜像构建均在 CI 中通过。

## 1. 五分钟跑起来

```bash
# 1) 起中间件（需要 Docker）
docker compose -f deploy/docker-compose.yml up -d mysql redis

# 2) 编译并跑测试
cd backend && mvn clean test

# 3) 启动后端（dev profile）
mvn spring-boot:run -pl co-bootstrap -Dspring-boot.run.profiles=dev

# 4) 启动前端
cd ../frontend && npm install && npm run dev      # http://localhost:5173
```

接口文档：http://localhost:8080/swagger-ui.html

全量验证（含集成测试，需要 Docker）：

```bash
cd backend && mvn verify
```

## 2. 架构

模块化单体，Maven 多模块，共 27 个模块，按四个限界上下文切分：

| 限界上下文 | 职责 |
| --- | --- |
| Identity | 注册登录、课程、成员与角色 |
| Q&A | 问题、回答、评论、投票、采纳、教师认证、悬赏 |
| Reputation | 声誉账本、徽章、排行榜 |
| Discovery | 搜索、通知、@ 提及 |

每个上下文内部再分五层：`api`（发布语言与事件契约）、`domain`（聚合、值对象、业务规则，零框架依赖）、`application`（用例编排、事务边界、事件发布）、`infrastructure`（JPA / Redis / JDBC 适配器）、`interfaces`（REST 控制器）。

跨上下文只允许通过 `*-api` 包调用，由 ArchUnit 在 CI 中强制。

## 3. 质量与测试

| 项目 | 数据 | 来源 |
| --- | --- | --- |
| Surefire 单元测试 | 122 个，0 失败 | v1.2.0 main CI 日志 |
| Failsafe 集成测试 | 3 个，0 失败 | 同上 |
| 领域层覆盖率 | 77.2%（四模块 80.7 / 79.5 / 75.7 / 72.5；2026-10-29 采集，main @ `3592134`） | `docs/final/quality-report.md` |
| 覆盖率门禁 | 各模块 ≥ 70%，低于即构建失败 | `backend/pom.xml` |
| ArchUnit 架构规则 | 8 条（分层依赖、跨上下文、无环、实体表名前缀等） | `ArchitectureTest.java` |
| CI | 后端门禁（测试 / ArchUnit / 覆盖率 / 集成测试）+ 前端 typecheck / build + 仅 main 构建镜像 | `.github/workflows/ci.yml` |

质量数据的历史版本（v1.1.0 的 117 个测试）保留在 `docs/final/quality-report.md` 中，未被覆盖。

## 4. 目录结构

```
backend/          Maven 多模块后端（4 个上下文 × 5 层 + shared-kernel + bootstrap）
frontend/         React + TypeScript（Vite）
deploy/           docker-compose、Dockerfile、监控配置（Prometheus / Grafana）
docs/             架构、Scrum、Backlog、报告、最终交付物
.github/workflows CI
```

## 5. 文档索引

| 文档 | 说明 |
| --- | --- |
| `docs/README.md` | 文档索引与两个仓库的 PR 编号规则 |
| `docs/adr/` | 10 份架构决策记录（ADR-001 ~ 010） |
| `docs/ddd/` | 上下文映射、统一语言、事件目录、聚合清单 |
| `docs/backlog/product-backlog.md` | 14 条用户故事与交付状态 |
| `docs/scrum/` | Sprint 0–4 记录、燃尽图、站会汇总 |
| `docs/reports/` | 测试摘要、覆盖率、CI 历史 |
| `docs/final/` | 质量报告、范围声明、五份个人总结 |
| `deploy/runbook.md` | 启停、健康检查、故障排查、回滚 |

## 6. 团队

| 编号 | 成员 | 负责 |
| --- | --- | --- |
| ① | huangjiasheng567 | US-01 浏览、US-02 提问、US-03 的领域规则；PO |
| ② | H-Canopy | US-04 采纳、US-05 投票；Q&A 领域开发、Scrum Master |
| ③ | xing-ding | US-06 教师认证、US-08 @ 提及、US-13 课程成员 |
| ④ | Twh743 | US-07 搜索、US-11 通知、US-14 移动端 |
| ⑤ | 1311948 | US-09 悬赏、US-10 排行榜 |

评审采用环形制：①→②→③→④→⑤→①，不自批自，批完即合。

## 7. 已知范围缩减

见 `docs/final/scope-and-deferrals.md`：US-12 管理员封禁未实现；US-13 的角色修改权限受限（仅教师/管理员可改成员角色，助教可退课与移除成员），其余各项逐条说明原因。
