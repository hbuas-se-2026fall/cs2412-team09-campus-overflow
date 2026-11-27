package com.campusoverflow.identity.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

/**
 * 登录限流的降级行为：Redis 可用时正常拦截，Redis 故障时放行而不是抛异常。
 *
 * <p>背景：限流原本直接在请求链路上调 Redis，Redis 一挂就抛
 * {@link RedisConnectionFailureException}，被全局异常处理器转成 500，
 * 结果是「一个可选的基础设施故障 = 全员无法登录」。
 */
class RedisLoginThrottleTest {

    private static final int MAX_FAILURES = 5;

    private StringRedisTemplate redis;
    private ValueOperations<String, String> ops;
    private RedisLoginThrottle throttle;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redis = mock(StringRedisTemplate.class);
        ops = mock(ValueOperations.class);
        throttle = new RedisLoginThrottle(redis, MAX_FAILURES);
    }

    @Test
    void blocksWhenFailuresReachThreshold() {
        when(redis.opsForValue()).thenReturn(ops);
        when(ops.get(anyString())).thenReturn(String.valueOf(MAX_FAILURES));

        assertThat(throttle.isBlocked("alice")).isTrue();
    }

    @Test
    void allowsWhenBelowThreshold() {
        when(redis.opsForValue()).thenReturn(ops);
        when(ops.get(anyString())).thenReturn("2");

        assertThat(throttle.isBlocked("alice")).isFalse();
    }

    @Test
    void allowsWhenNoRecordExists() {
        when(redis.opsForValue()).thenReturn(ops);
        when(ops.get(anyString())).thenReturn(null);

        assertThat(throttle.isBlocked("alice")).isFalse();
    }

    @Test
    void failsOpenWhenRedisIsDown() {
        when(redis.opsForValue()).thenThrow(new RedisConnectionFailureException("connection refused"));

        assertThat(throttle.isBlocked("alice")).isFalse();
    }

    @Test
    void recordingFailureDoesNotPropagateRedisError() {
        when(redis.opsForValue()).thenThrow(new RedisConnectionFailureException("connection refused"));

        assertThatCode(() -> throttle.recordFailure("alice")).doesNotThrowAnyException();
    }

    @Test
    void resetDoesNotPropagateRedisError() {
        when(redis.delete(anyString())).thenThrow(new RedisConnectionFailureException("connection refused"));

        assertThatCode(() -> throttle.reset("alice")).doesNotThrowAnyException();
    }
}
