# 个人总结 · 黄嘉胜（Product Owner + Q&A 后端开发）

**项目**：CampusOverflow 校园问答平台
**角色**：Product Owner + Q&A 上下文后端开发
**团队**：Team 09（5 人，环形评审 ①→②→③→④→⑤→①）
**周期**：8 周 / 4 个 Sprint
**本人在环形评审中的编号**：①　**负责用户故事**：US-01 浏览、US-02 提问、US-03 回答与采纳

---

## 一、我做了什么

### 产品侧（PO）

- 把课程要求拆成 14 个用户故事，每条带 Given/When/Then 验收标准，挂到对应 Sprint 的 Milestone
- 按 6 个上下文（Discovery / Q&A / Reputation / Identity / Mobile / Admin）打 `ctx:*` 标签，让看板能按领域筛选
- 每个 Sprint 末做 Review，逐条走验收标准，而不是看"代码写了多少行"
- 决定砍掉 P2 需求——最难的不是加需求，是说清楚"这次不做"

### 开发侧（Q&A 上下文）

| 交付物 | 位置 | 规模 |
|---|---|---|
| `Question` 聚合根 | `co-qa-domain/.../domain/Question.java` | 137 行，9 个公开方法 |
| `MarkdownBody` 值对象 | `co-qa-domain/.../domain/MarkdownBody.java` | 13 行，两套工厂方法 |
| `QuestionCommandService` | `co-qa-application/.../command/QuestionCommandService.java` | 99 行，3 个写用例 |
| `QuestionQueryService` | `co-qa-application/.../query/QuestionQueryService.java` | 145 行，3 个读用例 |
| 领域测试 | `QuestionTest` 123 行 / `MarkdownBodyTest` 32 行 | 共 155 行 |

`Question` 聚合根守住的不变式（每条都能在 `Question.java` 里找到对应的 `throw`）：

- `post(...)` —— 标题长度（10–150 字符，QA-1001）由 `Title` 值对象在构造时就校验，聚合根不重复校验；值对象自校验 + 聚合根守跨字段规则，两层分工
- `edit(...)` —— `actor.userId() != authorId && !actorManagesCourse` 时抛 QA-3002，只有提问者或课程管理者能改
- `accept(answer, actor, ...)` —— 只有提问者或课程教师/助教能采纳（QA-3001）；重复采纳抛 QA-2002；回答不属于本问题抛 QA-1010；已删除的回答不能被采纳（QA-1011）
- `softDelete(...)` —— 软删除而非物理删除；已有回答的问题，提问者本人不能再删（QA-1020），只能由课程管理者处理
- `ensureOpenForAnswers()` —— 已删除的问题不能再被回答（QA-1030）；这条不变式放在聚合内，任何入口都绕不过

Command 与 Query 在应用层就分开：写侧 `QuestionCommandService` 提供 `post` / `edit` / `delete` 三个用例，读侧 `QuestionQueryService` 提供 `list` / `detail` / `popularTags` 三个用例，读侧输出 `QuestionSummaryView` / `QuestionDetailView` / `TagView` 视图对象，读模型不反序列化回聚合根。

### 交付侧

- `docs/final/quality-report.md` —— 整篇重写，补齐覆盖率分子分母、测试构成、8 条 ArchUnit 规则逐条对应
- 飞书答辩 PPT 10 页，其中第 5 页 DDD 五层、第 7 页质量数据两页由我维护，导出 pptx 一并交付
- v1.1.0 Release 说明的数字口径修正
- 环形评审（①→②→③→④→⑤→①）中担任 ① 号评审人，评审队友的功能 PR 并点合并

---

## 二、三个真实的坑

### 1. 质量数字三处不一致，谁都没回头核对

答辩 PPT 写"112 个测试、六条 ArchUnit 规则、80.5% 覆盖率"，`quality-report.md` 也是同一套数字，v1.1.0 Release 说明还是。看起来互相印证，其实三处都抄的是 10-29 之前的旧口径。

真值在 `docs/reports/` 的 CI 产物里：**117 个用例**（TagsTest 新增 5 个）、**8 条 `@ArchTest`**、`co-qa-domain` **80.7%（180/223）**。而且旧报告里 FF-2 到 FF-6 的规则描述和 `ArchitectureTest.java` 的实际方法完全对不上——只有 FF-1、FF-5 大体相符。

**教训**：数字必须有一个唯一事实源。写文档时引用 CI 产物，不引用另一份文档；"几处说法一致"不等于"说法正确"，可能只是同源错误。

### 2. CI 全红两天，真因不在代码

PR 提交后后端 job 挂在集成测试，报 `client version 1.32 is too old. Minimum supported API version is 1.40`。我先按直觉改了两处：

| 尝试 | 改动 | 结果 |
|---|---|---|
| 1 | 固定 `DOCKER_HOST` + 关 Ryuk | 换了连接策略，版本错误不变 |
| 2 | `DOCKER_API_VERSION: "1.43"` | 报的还是 1.32 |

最后反编译 `docker-java-core:3.4.1` 的 `DefaultDockerClientConfig` 才看清：常量池里**根本没有 `DOCKER_API_VERSION` 这个字符串**，`overrideDockerPropertiesWithEnv()` 只处理 `DOCKER_HOST`、`DOCKER_CONTEXT` 等固定键，不做 `DOCKER_*` 通配。真正的配置项是 `api.version`，来源是系统属性或 classpath 的 `docker-java.properties`。

环境变量名看着完全对，库压根不认。后来补了 `docker-java.properties` 作为 classpath 路径的保险。

**教训**：报错信息只是现象，配置有没有被读取得看客户端库的实际实现。名字像对的配置，不等于被识别。

### 3. 看板建在私人账号下，卡片还没指派

一开始把 Projects 板建在自己账号下，老师和队友根本打不开；迁到组织后又被"用户级 Projects 默认私有"拦了一次，折腾两天才把可见性、assignee、WIP 限制理顺。而且早期卡片上只写了标题前缀 `[②]`，没有真正填 Assignees，导出表格里全是 `No Assignees`——"任务分配到人"这条要求其实没满足。

**教训**：协作工具第一天就要确认"谁能看到""字段是否真的填了"。截图交上去之前，先按验收标准的字面意思逐条核对。

---

## 三、学到了什么

**关于数字**
报告里的每个数字都该能追到一条命令、一个文件、一次 CI 采集。写"117 个用例"要能说出是 Surefire 口径、不含 Failsafe 跑的 3 个 IT。写不出依据的数字，答辩时第一个被问倒。

**关于架构**
DDD 五层的价值不在分层本身，在于"改一个上下文不用动别人的代码"。`Question` 的权限判断、采纳规则全部收在聚合内部，controller 只做参数解析和响应包装——这条守住了，多个上下文并行开发才不会互相踩。

**关于排障**
先确认"这件事到底有没有发生"，再分析内容。CI 红了两天，后半段所有 run 都只有 2–4 秒，那是 job 根本没启动（组织 Actions 额度耗尽），跟测试内容无关。把"没启动"当成"测试失败"去改，方向从一开始就错了。

**关于 PR 边界**
一个 PR 只做一件事。我最初把 CI 修复和文档修正塞在同一个 PR 里，CI 反复红、评审也没法聚焦，最后整体回退 CI 改动，只留文档修正，PR 才干净。单一职责不是理想主义，是让 review 和回滚都变得可能。

---

## 四、如果重做一次

1. **Sprint 0 做完环境与 CI**：Docker、Actions 额度、runner 镜像版本这些基础设施问题，不要等到 Sprint 3 才撞上
2. **数字先采集再写**：任何报告先跑一次 CI 拿到产物，再动笔，而不是先写文档后找依据
3. **验收标准逐字核对**：`No Assignees 15` 这种，看一眼截图就能发现，别等老师指出来
4. **配置先验证生效路径**：改 CI 配置时先确认客户端库读哪个键，比反复试环境变量快得多

---

## 五、量化数据

| 指标 | 数值 | 依据 |
|---|---|---|
| 代码提交数 | 26 次 | `git shortlog -sn --all` |
| 负责用户故事 | 3 个（US-01 / 02 / 03） | 环形评审分工表 |
| PO 负责的故事总数 | 14 个 | Backlog / Milestone |
| `Question` 聚合根 | 137 行，9 个公开方法 | 文件实测 |
| `MarkdownBody` 值对象 | 13 行 | 文件实测 |
| Command + Query Service | 99 + 145 行 | 文件实测 |
| 领域层测试 | 155 行（QuestionTest 123 + MarkdownBodyTest 32） | 文件实测 |
| 环形评审角色 | ① 号评审人（4 轮 Sprint 评审） | 团队环形评审分工表 |
| 答辩材料 | 10 页 deck、质量报告、Release 说明 | `docs/final/`、Releases |

---

## 六、一句话总结

这个项目让我明白：**把想法变成可交付的产品，靠的不是写得多，而是每一处说法都能被追溯**——数字能追到 CI 产物，代码能追到领域规则，配置能追到库的实际实现。PO 的取舍、DDD 的边界、CI 的纪律，这三样比任何一门具体技术都更难学，也更值钱。
