package com.campusoverflow.discovery.domain.search;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 校园常用的课程简称到全称的映射。
 *
 * <p>MySQL ngram 分词粒度为 2，索引里只有连续 2 字切片（「软件工程」切成 软件/件工/工程），
 * 因此用户输入简称（如「软工」）时任何词法匹配都命中不了——「软工」既不是 bigram token，
 * 也不是「软件工程」的连续子串。检索前把简称替换成全称，是最小成本的解法。</p>
 *
 * <p>替换（而不是追加）是为了保持检索语义不变：全文适配器把每个词项都加 "+" 要求必须出现，
 * 若简称与全称同时入词，反而会互相排斥。</p>
 */
public final class AbbreviationDictionary {

    private static final Map<String, String> DICTIONARY = Map.of(
            "软工", "软件工程",
            "计组", "计算机组成原理",
            "计网", "计算机网络",
            "数构", "数据结构",
            "操统", "操作系统");

    private AbbreviationDictionary() {
    }

    /** 简称替换为全称；不是简称则原样返回。 */
    public static String expand(String term) {
        if (term == null) {
            return null;
        }
        String normalized = term.strip().toLowerCase(Locale.ROOT);
        return DICTIONARY.getOrDefault(normalized, term);
    }

    /** 当前收录的简称（供文档与测试核对）。 */
    public static List<String> abbreviations() {
        return List.copyOf(DICTIONARY.keySet());
    }
}
