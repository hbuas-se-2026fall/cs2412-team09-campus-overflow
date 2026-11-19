# CampusOverflow 运维手册 v1.1

> 部署与监控统一入口。所有命令在项目根目录执行。
> 有两份 Compose：`deploy/docker-compose.yml`（本地演示）与 `deploy/docker-compose.public.yml`（公网部署，安全加固）。**不要把前者直接放到公网。**

## 1. 启动（本地演示）

一键启动整套服务（含 Prometheus + Grafana 监控）：

```bash
docker compose -f deploy/docker-compose.yml --profile observability up -d --build
```

- 仅启动应用、不带监控：去掉 `--profile observability` 即可。
- 启动顺序：mysql / redis 先做健康检查，通过后 backend 才拉起，最后 web 与 prometheus / grafana。
- 校验：`docker compose ps` 全部为 running；浏览器访问 `http://localhost:8080/actuator/health` 返回 `UP` 即应用就绪。

## 2. 停止

```bash
docker compose -f deploy/docker-compose.yml --profile observability down
```

- 停止并移除容器，保留数据卷（mysql-data / redis-data / grafana-data）。
- 需要连数据一起清空（重置开发环境）：`down -v`，会删除全部数据卷，谨慎使用。
- 排查时看某服务日志：`docker compose -f deploy/docker-compose.yml logs -f <service>`。

## 3. 回滚

- 代码回滚：切到上一稳定版本 `git checkout <上一tag/commit>`（或 `git revert`），再执行 `up -d --build` 重建镜像。
- 容器回滚：`docker compose down` 后对出问题的服务重新 `up -d --build`；仅重启用 `docker compose restart <service>`。
- 数据回滚：数据卷默认保留，可直接复用；确需重置时才 `down -v`，有备份则先备份再操作。

## 4. 常见故障

- **backend 反复重启 / health 非 UP**：`docker compose logs backend` 查看是否连上 mysql/redis；确认 `DB_HOST=mysql`、`REDIS_HOST=redis`，端口无冲突，等 mysql 健康后再拉起 backend。
- **端口被占用（3306 / 8080 / 3000）**：`docker compose ps` 看是否已有同名容器，或本机其他程序占用端口，释放后 `up -d` 重启。
- **Grafana / Prometheus 无数据**：确认启动时带了 `--profile observability`（缺 profile 监控容器不会启动）；再确认 prometheus 能抓取 backend 的 `/actuator/prometheus` 指标。
- **中文搜索无结果**：确认 mysql 以 `--ngram-token-size=2` 启动（compose 已配置），中文全文索引需要 ngram 解析，重建索引后重试。
- **镜像拉取失败 / 容器起不来**：多为网络问题，配置镜像加速后重试 `up -d --build`；`docker compose ps` 结合 `logs -f` 看具体报错。
- **backend 启动报 `Unsupported character encoding`**：`application.yml` 的 JDBC URL 里 `characterEncoding` 必须写 Java 字符集名 `UTF-8`；写成 MySQL 的 `utf8mb4` 会直接启动失败（Java 不识别该名字），报 `Unsupported character encoding 'utf8mb4'`。

## 5. 公网部署（安全加固）

`deploy/docker-compose.yml` 是**本地演示**配置：数据库、Redis、后端都对宿主机发布端口，口令有开发默认值，带 demo 数据初始化，`COOKIE_SECURE=false`。它不能直接放到公网服务器上。

公网部署改用独立的 `deploy/docker-compose.public.yml`，它做了这些加固：

| 风险 | 公网版的做法 |
|---|---|
| MySQL 3306 暴露 | 不发布宿主机端口，只在 Compose 网络内可达 |
| Redis 6379 暴露且无认证 | 不发布端口 + `--requirepass`，后端用 `REDIS_PASSWORD` 认证 |
| 后端 8080 暴露 | 不发布端口，只允许 `web` 反代 |
| 默认口令 `*_dev_pwd` / Grafana `admin` | 全部改成 `${VAR:?}`，缺失即启动失败 |
| 字段加密密钥有默认值 | `CO_FIELD_KEY` 必填（prod profile 本身也会快速失败） |
| `COOKIE_SECURE=false` | 显式 `"true"`，且只能经 HTTPS 访问 |
| 默认带 demo 数据初始化 | 只启用 `prod` profile |
| Prometheus 9090 / Grafana 3000 暴露 | 只绑 `127.0.0.1`，需要时用 SSH 隧道访问 |

启动步骤：

```bash
cp deploy/.env.public.example deploy/.env.public
# 填入 5 个必填项：MYSQL_ROOT_PASSWORD / DB_PASSWORD / REDIS_PASSWORD / CO_FIELD_KEY / GRAFANA_PASSWORD
chmod 600 deploy/.env.public

python3 deploy/check-public-compose.py          # 静态自检，8 项全部 OK 再继续
docker compose -f deploy/docker-compose.public.yml --env-file deploy/.env.public up -d --build
```

HTTPS 两种做法：

1. **前置反代终止 TLS**（推荐）：Caddy / Nginx / 云负载均衡把 `https://域名` 转发到本机 80；后端已开 `forward-headers-strategy: framework`，能正确识别 `X-Forwarded-Proto`。
2. **让容器内 nginx 直接终止**：需要把证书挂进 `web` 容器并发布 443，`deploy/nginx.conf` 目前只有 80 的 server 块，得另加一段 `listen 443 ssl`。

必须注意：

- `CO_FIELD_KEY` 一旦有数据写入就**不能更换**，否则历史密文字段解不开；上线前生成并妥善保管。
- 只有 `web` 对外暴露，其余服务都在内部网络；排查时用 `docker compose -f deploy/docker-compose.public.yml exec <service> sh`。
- 验证顺序：`docker compose ps` → `curl -I http://<host>/`（应 200）→ 浏览器登录 → `curl http://127.0.0.1:9090/-/healthy`（走 SSH 隧道）。
