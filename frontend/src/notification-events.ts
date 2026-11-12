/**
 * 通知已读状态变化的最小事件通道。
 *
 * 未读角标在 Header（App.tsx）里，标已读发生在 NotificationsPage，
 * 两者没有父子关系；用一个全局事件通知刷新，避免为此引入 Context。
 */
export const NOTIFICATIONS_READ_EVENT = 'co:notifications-read'

export function notifyRead(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT))
}
