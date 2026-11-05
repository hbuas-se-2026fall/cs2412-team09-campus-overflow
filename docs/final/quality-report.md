# 质量报告 · CampusOverflow v1.0.0

**生成日期**：2026-11-05
**对应 Release**：v1.0.0
**CI 流水线**：GitHub Actions（backend / frontend / images 三 job）

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

| 限界上下文 | 覆盖率 | 门禁要求 | 状态 |
|-----------|--------|---------|------|
| Q&A 问答核心 | 80.5% | ≥ 70% | ✅ 通过 |
| Discovery 发现 | 79.5% | ≥ 70% | ✅ 通过 |
| Identity 身份 | 75.7% | ≥ 70% | ✅ 通过 |
| Reputation 声誉 | 72.5% | ≥ 70% | ✅ 通过 |
| **综合（领域层加权）** | **77.2%** | ≥ 70% | ✅ 通过 |

> 覆盖率口径：仅统计各上下文的 `-domain` 模块（纯 Java，无 Spring 依赖）。
> application / infrastructure / interfaces 层为薄封装，不纳入门禁计算。

---

## 三、测试统计

| 指标 | 数值 |
|------|------|
| 自动化测试用例总数 | 112 个 |
| 失败 | 0 |
| 错误 | 0 |
| 跳过 | 0 |
| 测试通过率 | **100%** |
| 单元测试（domain） | 86 个 |
| 架构测试（ArchUnit） | 6 条规则 |
| 集成测试（Testcontainers） | 20 个 |

### 测试分布

- **domain 层**：每个聚合根都有等价类测试 + 边界测试 + 异常路径测试
- **application 层**：用例服务的 Happy Path + 权限校验 + 依赖失败场景
- **架构层**：ArchUnit 六条规则强制 DDD 分层边界
- **集成层**：Testcontainers 拉起真实 MySQL + Redis，跑端到端流程

---

## 四、CI 流水线状态

| Job | 状态 | 说明 |
|-----|------|------|
| backend | ✅ 全绿 | 编译 → 单元测试 → ArchUnit → 覆盖率门禁 → 集成测试 |
| frontend | ✅ 全绿 | npm install → typecheck → build |
| images | ✅ 全绿 | 后端镜像 + 前端镜像构建 |

### CI 质量门禁

- **覆盖率门禁**：领域层 JaCoCo ≥ 70%，低于则 CI 失败
- **架构门禁**：ArchUnit 六条规则，违反则 CI 失败
- **并发控制**：同一 PR 新提交自动取消旧 run，节省 Actions 分钟

---

## 五、架构质量（ArchUnit）

六条架构适应度函数全部通过：

| 规则 | 说明 |
|------|------|
| FF-1 | domain 层不依赖 Spring、不依赖其他上下文 |
| FF-2 | application 层只依赖本上下文 domain + 其他上下文 api |
| FF-3 | infrastructure 层实现 domain 定义的接口，不反向暴露 |
| FF-4 | interfaces 层（controller / scheduler）不被其他层直接调用 |
| FF-5 | 跨上下文只允许依赖 `*-api` 包，禁止直接引用 domain |
| FF-6 | 不允许从 interfaces 直接访问 infrastructure |

---

## 六、与课程要求对照

| 课程要求 | 实际交付 | 状态 |
|---------|---------|------|
| 单元测试覆盖率 ≥ 70% | 领域层 77.2% | ✅ 达标 |
| CI 持续集成全绿 | 三个 Job 全绿 | ✅ 达标 |
| 代码评审（环形） | 5 人环形评审，无自批 | ✅ 达标 |
| 架构约束可验证 | ArchUnit 六条规则 CI 强制 | ✅ 达标 |
| SonarQube 质量看板 | 全项目 32.8%，领域层 77.2% | ✅ 达标（口径已说明） |

---

## 七、已知限制

1. **SonarQube 全项目覆盖率偏低（32.8%）**：因为 infrastructure / interfaces / config 层代码量大但测试少。这是模块化单体的常见现象——domain 层是业务核心，测试集中在那里。
2. **前端无单元测试**：前端以类型检查（TypeScript）+ 构建验证为准，未引入前端测试框架（v1.1 计划补 Vitest）。
3. **E2E 测试未自动化**：端到端流程由 Postman Collection + 手工录屏验证，未接入 Cypress / Playwright。
