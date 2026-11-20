#!/usr/bin/env python3
"""公网部署 Compose 的安全自检（只用标准库，不需要 PyYAML）。

检查项对应验收意见「问题 4」列出的风险：

1. MySQL / Redis / backend 不得发布宿主机端口
2. Redis 必须开启 --requirepass
3. 不得残留开发默认口令（*_dev_pwd、admin）
4. COOKIE_SECURE 必须为 "true"
5. 不得启用 demo profile
6. 敏感变量必须用 ${VAR:?} 强制注入
7. Prometheus / Grafana 只能绑 127.0.0.1
8. 对外只暴露 web 的 80 / 443

用法：
    python deploy/check-public-compose.py
失败时退出码为 1，并把问题逐条打印出来。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

COMPOSE = Path(__file__).resolve().parent / "docker-compose.public.yml"

# 只允许对外发布的端口：web 的 80/443
PUBLIC_PORTS = {"80", "443"}


def parse_services(text: str) -> dict[str, list[str]]:
    """把文件按 services 下的二级键切成块，返回 {服务名: 该服务的所有行}。"""
    services: dict[str, list[str]] = {}
    in_services = False
    current: str | None = None

    for raw in text.splitlines():
        line = raw.rstrip("\n")
        stripped = line.strip()

        if re.match(r"^services:\s*$", line):
            in_services = True
            continue
        if re.match(r"^[a-zA-Z_-]+:\s*$", line) and not line.startswith(" "):
            # 顶层键（volumes / networks 等）结束 services 段
            in_services = False
            current = None
            continue
        if not in_services:
            continue

        m = re.match(r"^ {2}([A-Za-z0-9_-]+):\s*$", line)
        if m:
            current = m.group(1)
            services[current] = []
            continue
        if current is not None:
            services[current].append(line)

    return services


def block(services: dict[str, list[str]], name: str) -> str:
    return "\n".join(services.get(name, []))


def main() -> int:
    if not COMPOSE.exists():
        print(f"找不到文件：{COMPOSE}")
        return 1

    text = COMPOSE.read_text(encoding="utf-8")
    services = parse_services(text)
    problems: list[str] = []

    for name in ("mysql", "redis", "backend"):
        if name not in services:
            problems.append(f"缺少服务 {name}")
            continue
        if re.search(r"^\s+ports:", block(services, name), re.MULTILINE):
            problems.append(f"{name} 仍然发布了宿主机端口（公网部署应删掉 ports）")

    redis_block = block(services, "redis")
    if "--requirepass" not in redis_block:
        problems.append("redis 没有开启 --requirepass")
    if "${REDIS_PASSWORD:?" not in redis_block:
        problems.append("redis 的密码没有用 ${REDIS_PASSWORD:?} 强制注入")

    for bad, why in (
        ("_dev_pwd", "残留开发默认口令"),
        ("GF_SECURITY_ADMIN_PASSWORD: admin", "Grafana 使用默认口令 admin"),
    ):
        if bad in text:
            problems.append(f"{why}（命中：{bad}）")

    if 'COOKIE_SECURE: "true"' not in text:
        problems.append('COOKIE_SECURE 必须显式设为 "true"')

    profile = re.search(r"SPRING_PROFILES_ACTIVE:\s*(\S+)", text)
    if not profile:
        problems.append("没有设置 SPRING_PROFILES_ACTIVE")
    elif "demo" in profile.group(1):
        problems.append("SPRING_PROFILES_ACTIVE 不能包含 demo")

    for var in ("DB_PASSWORD", "REDIS_PASSWORD", "CO_FIELD_KEY", "MYSQL_ROOT_PASSWORD"):
        if f"${{{var}:?" not in text:
            problems.append(f"{var} 没有用 ${{{var}:?}} 强制注入")

    for name in ("prometheus", "grafana"):
        b = block(services, name)
        for port_line in re.findall(r'ports:\s*\["([^"]+)"\]', b):
            host_part = port_line.split(":")[0]
            if host_part not in ("127.0.0.1", "localhost"):
                problems.append(f"{name} 的端口 {port_line} 没有绑定 127.0.0.1")

    web_block = block(services, "web")
    web_ports = re.findall(r'ports:\s*\["([^"]+)"\]', web_block)
    if not web_ports:
        problems.append("web 没有发布任何端口（外部将无法访问）")
    for mapping in web_ports:
        host_port = mapping.split(":")[0]
        if host_port not in PUBLIC_PORTS:
            problems.append(f"web 对外发布了非 80/443 端口：{mapping}")

    if problems:
        print(f"[FAIL] {COMPOSE.name} 未通过公网安全检查，共 {len(problems)} 项：")
        for i, p in enumerate(problems, 1):
            print(f"  {i}. {p}")
        return 1

    print(f"[OK] {COMPOSE.name} 通过公网安全检查（8 项）：")
    print("  - mysql / redis / backend 均未发布宿主机端口")
    print("  - redis 开启 --requirepass，密码强制注入")
    print("  - 无开发默认口令、无 admin 口令")
    print('  - COOKIE_SECURE = "true"')
    print("  - 仅启用 prod profile（无 demo）")
    print("  - 敏感变量全部使用 ${VAR:?} 强制注入")
    print("  - prometheus / grafana 绑定 127.0.0.1")
    print("  - 对外仅 web 的 80/443")
    return 0


if __name__ == "__main__":
    sys.exit(main())
