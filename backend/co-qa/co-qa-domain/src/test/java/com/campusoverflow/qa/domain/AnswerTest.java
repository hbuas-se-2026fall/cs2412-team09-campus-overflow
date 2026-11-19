package com.campusoverflow.qa.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.campusoverflow.shared.domain.BusinessRuleException;
import com.campusoverflow.shared.domain.ConflictException;
import com.campusoverflow.shared.domain.ForbiddenException;
import com.campusoverflow.shared.security.Actor;
import com.campusoverflow.shared.security.Role;
import org.junit.jupiter.api.Test;

class AnswerTest {

    private final Actor answerer = new Actor(3, "回答者", Role.STUDENT);
    private final Actor teacher = new Actor(9, "王老师", Role.TEACHER);

    @Test
    void authorCannotAnswerOwnQuestion() {
        Question q = QuestionTest.persistedQuestion();
        // US-03：自己的问题不需要自己回答
        assertThatThrownBy(() -> Answer.submit(q, QuestionTest.ASKER.userId(),
                MarkdownBody.ofAnswer("自己补充一下细节，避免被误解。"), QuestionTest.NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("不能回答自己的问题");

        // 换个用户就能答
        Answer a = Answer.submit(q, QuestionTest.OTHER.userId(),
                MarkdownBody.ofAnswer("看一下叔叔节点的颜色和插入位置。"), QuestionTest.NOW);
        assertThat(a.authorId()).isEqualTo(QuestionTest.OTHER.userId());
    }

    @Test
    void onlyCourseManagerCanEndorseAndOnlyOnce() {
        Question q = QuestionTest.persistedQuestion();
        Answer a = QuestionTest.persistedAnswer(q, answerer.userId(), 50);
        assertThatThrownBy(() -> a.endorse(answerer, false)).isInstanceOf(ForbiddenException.class);
        a.endorse(teacher, true);
        assertThat(a.endorsedBy()).isEqualTo(9L);
        assertThatThrownBy(() -> a.endorse(teacher, true)).isInstanceOf(ConflictException.class);
    }

    @Test
    void acceptedAnswerCannotBeDeletedByItsAuthor() {
        Question q = QuestionTest.persistedQuestion();
        Answer a = QuestionTest.persistedAnswer(q, answerer.userId(), 50);
        assertThatThrownBy(() -> a.softDelete(answerer, false, true, QuestionTest.NOW))
                .isInstanceOf(BusinessRuleException.class);
        a.softDelete(teacher, true, true, QuestionTest.NOW);
        assertThat(a.isDeleted()).isTrue();
    }

    @Test
    void strangersCannotEditOrDelete() {
        Question q = QuestionTest.persistedQuestion();
        Answer a = QuestionTest.persistedAnswer(q, answerer.userId(), 50);
        Actor stranger = new Actor(77, "路人", Role.STUDENT);
        assertThatThrownBy(() -> a.edit(stranger, false, MarkdownBody.ofAnswer("这是被路人篡改后的回答内容"), QuestionTest.NOW))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> a.softDelete(stranger, false, false, QuestionTest.NOW))
                .isInstanceOf(ForbiddenException.class);
    }
}
