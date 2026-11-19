# CampusOverflow 运维手册 v1.0

> 部署与监控统一入口。所有命令在项目根目录执行，使用 `deploy/docker-compose.yml`。

## 1. 启动

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

## 5. 公网 / 校园网部署

主文件 `deploy/docker-compose.yml` 是**本机开发与演示**配置：依赖服务端口已全部绑定 `127.0.0.1`，但密钥有开发默认值、profile 带 demo 数据，不能直接用于对外提供访问。对外部署必须叠加生产覆盖文件：

```bash
cp deploy/.env.example deploy/.env     # 填写四个密钥，.env 已被 .gitignore 忽略
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.prod.yml \
               --env-file deploy/.env up -d --build
```

生产覆盖文件带来的三处变化：

| 项 | 主文件（本地） | 叠加 prod 覆盖后 |
| --- | --- | --- |
| 密钥 | 有开发默认值，可直接起 | `MYSQL_ROOT_PASSWORD` / `DB_PASSWORD` / `CO_FIELD_KEY` / `GRAFANA_PASSWORD` 四者缺一，compose 直接报错退出 |
| Profile | `prod,demo`，会写入演示数据 | 只 `prod`，不写演示数据 |
| Swagger | 打开 | prod profile 自动关闭 |

### 部署前检查清单

1. **端口**：`ss -lntp`（Linux）或 `Get-NetTCPConnection -State Listen`（Windows）确认 3306 / 6379 / 8080 / 9090 / 3000 只监听 `127.0.0.1`；从另一台机器 `nc -zv <host> 3306` 应无响应。
2. **密钥**：`docker compose ... config | grep -i password` 不应再出现 `root_dev_pwd` / `campus_dev_pwd` / `admin`。
3. **HTTPS**：prod profile 已把会话 Cookie 设为 `secure: true`，**纯 HTTP 访问会导致登录态无法保存**。对外必须在前面加一层反向代理（Nginx）终止 TLS，并把 `X-Forwarded-Proto` 传给后端（`server.forward-headers-strategy=framework` 已就绪）。
4. **demo 数据**：确认环境变量里没有 `demo`，启动日志中不应出现演示数据初始化。
5. **健康**：`curl -fsS https://<域名>/actuator/health` 返回 `{"status":"UP"}`。

### 已知未覆盖项

- **Redis 未启用密码认证**：当前后端配置不含 Redis 密码项，强行加 `requirepass` 会导致后端连不上。风险已通过"端口仅绑定 127.0.0.1"收敛，**禁止把 6379 绑到 0.0.0.0 或做端口映射转发**；确需跨机访问 Redis 时，须先给 `application.yml` 增加 `spring.data.redis.password` 并同步改 compose。
- **未提供自动备份与证书签发**：数据库备份脚本、Let's Encrypt 自动续期需按实际环境单独配置。

