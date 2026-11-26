# Sprint 4 · 打磨与交付

**周期**：第 14–15 周 ｜ **Sprint Goal**：把系统交付出去——部署、监控、文档、答辩材料齐备。

## 一、Sprint 计划

| PBI | 内容 | 点数 | 负责人 |
|---|---|---|---|
| — | 容器化部署（compose 全栈） | 5 | ⑤ |
| — | Prometheus + Grafana 监控 | 3 | ⑤ |
| — | 答辩 PPT 与演示视频 | 5 | ① |
| — | 前端体验打磨（lint/typecheck/端到端） | 3 | ④ |
| — | 最终交付物核对 | 2 | ② |

**承诺点数**：18

## 二、执行结果

| 项 | 状态 | 证据 |
|---|---|---|
| 部署 | ✅ | deploy/docker-compose.yml，`up -d --build` 一键启动；公网加固配置见 `deploy/docker-compose.public.yml` |
| 监控 | ✅ | Grafana JVM 内存曲线、Prometheus Target UP |
| 前端 | ✅ | lint/typecheck 零报错，pre-commit 可拦截 |
| 文档 | ✅ | docs/ddd、docs/adr、docs/ops、docs/scrum |
| 答辩 PPT | ✅ | 飞书幻灯片 10 页，导出件 `docs/final/export/CampusOverflow 答辩.pptx`（**尚未提交仓库**） |
| 演示视频 | ❌ 未产出 | 形态未定（曾讨论「无声 + 屏幕字幕」，未落地） |
| 最终交付物核对 | 🟡 进行中 | 逐项状态见 `docs/final/scope-and-deferrals.md` |

## 三、Sprint 评审

- **演示**：从零启动整套服务 → 提问 → 采纳 → 声誉变化 → 监控面板有数据。
- **反馈**：无外网域名，用本地容器环境演示；部署步骤已写入运维手册。

## 四、Sprint 回顾

**Start**：交付前逐项核对 V3 第 9.4 节的八项清单。
**Stop**：不再新增功能，只修缺陷。
**Continue**：文档与代码同一次 PR 落地。

## 五、燃尽图

| 日期 | 剩余点数 | 理想线 |
|---|---|---|
| W14 初 | 18 | 18 |
| W14 末 | 9 | 9 |
| W15 末 | 7 | 0 |

> 说明：W15 末仍有 2 项未完成 —— 演示视频（对应「答辩 PPT 与演示视频」5 点中的视频部分，PPT 已完成）与最终交付物核对（2 点）。
> 因此实际剩余按整项计 7 点，不画到 0。此前版本把曲线画到 0，与结果表不一致，2026-11-26 修正。

```mermaid
xychart-beta
    title "Sprint 4 燃尽"
    x-axis [W14初, W14末, W15末]
    y-axis "剩余点数" 0 --> 18
    line [18, 9, 7]
```