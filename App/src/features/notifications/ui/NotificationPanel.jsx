import { Bell } from "lucide-react";

export function NotificationPanel({ open, onToggle, markAllRead, notifications }) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="top-item">
      <button type="button" className="top-trigger" onClick={onToggle}>
        <Bell size={16} />
        <span>Notifications</span>
        {unreadCount > 0 ? <span className="count-badge">{unreadCount}</span> : null}
      </button>

      {open && (
        <div className="floating-panel floating-panel--notifications" role="dialog" aria-label="Notifications">
          <div className="panel-header-row">
            <div className="panel-title">Notifications</div>
            <button type="button" className="text-btn" onClick={markAllRead}>
              Mark all as read
            </button>
          </div>
          <div className="panel-list">
            {notifications.map((item) => (
              <div key={item.id} className={item.read ? "notification-item" : "notification-item notification-item--unread"}>
                <div>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
