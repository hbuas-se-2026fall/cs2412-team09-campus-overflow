package com.campusoverflow.identity.infrastructure.security;

import com.campusoverflow.identity.application.LoginThrottle;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * 基于 Redis 固定窗口计数的登录限流：同一账号 1 分钟内失败 N 次即锁定到窗口结束。
 *
 * <p><b>Redis 不可用时放行（fail-open）。</b>限流是保护措施，不是业务前置条件——
 * 若 Redis 故障就让所有人登录失败，等于把一个可选组件变成了单点故障。
 * 代价是故障期间没有限流保护，但这比"整个系统登不进去"轻得多。
 * 降级只打一条告警，避免刷日志。
 */
@Component
public class RedisLoginThrottle implements LoginThrottle {

    private static final Logger log = LoggerFactory.getLogger(RedisLoginThrottle.class);
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final StringRedisTemplate redis;
    private final int maxFailures;
    private volatile boolean degraded;

    public RedisLoginThrottle(StringRedisTemplate redis, @Value("${co.security.login-max-failures:5}") int maxFailures) {
        this.redis = redis;
        this.maxFailures = maxFailures;
    }

    @Override
    public boolean isBlocked(String username) {
        try {
            String v = redis.opsForValue().get(key(username));
            return v != null && Integer.parseInt(v) >= maxFailures;
        } catch (RuntimeException e) {
            degrade("isBlocked", e);
            return false;
        }
    }

    @Override
    public void recordFailure(String username) {
        try {
            Long count = redis.opsForValue().increment(key(username));
            if (count != null && count == 1L) {
                redis.expire(key(username), WINDOW);
            }
        } catch (RuntimeException e) {
            degrade("recordFailure", e);
        }
    }

    @Override
    public void reset(String username) {
        try {
            redis.delete(key(username));
        } catch (RuntimeException e) {
            degrade("reset", e);
        }
    }

    private void degrade(String op, RuntimeException e) {
        if (!degraded) {
            degraded = true;
            log.warn("登录限流降级：Redis 不可用（{}），本次及后续请求将放行。原因：{}", op, e.getMessage());
        }
    }

    private static String key(String username) {
        return "id:login-fail:" + username;
    }
}
