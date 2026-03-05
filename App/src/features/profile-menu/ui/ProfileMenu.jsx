import { User } from "lucide-react";

const menuItems = [
  "Account settings",
  "Notification settings",
  "Theme settings",
  "Log out",
];

export function ProfileMenu({ open, onToggle, onClose }) {
  return (
    <div className="top-item">
      <button type="button" className="top-trigger" onClick={onToggle}>
        <User size={16} />
        <span>Profile</span>
      </button>

      {open && (
        <div className="floating-panel floating-panel--profile" role="dialog" aria-label="Profile menu">
          <div className="panel-title">Profile</div>
          <div className="panel-list">
            {menuItems.map((item) => (
              <button key={item} type="button" className="panel-list-item" onClick={onClose}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
