import type { JSX } from "react";
import "./user-info-modal.css";
import { X } from "lucide-react";
import type { User } from "../../../types/chat";
import defaultAvatar from '../../../assets/default-avatar.svg';

type UserInfoModalProps = {
  user: User;
  onClose: () => void;
}

function UserInfoModal({ user, onClose }: UserInfoModalProps): JSX.Element {
  return (
    <div className="user-info__overlay" onClick={onClose}>
      <div className="user-info__modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-info__close" onClick={onClose}>
          <X size={20} />
        </button>
        <img className="user-info__avatar" src={user.avatar} alt={user.name} onError={(e) => (e.currentTarget.src = defaultAvatar)}  />
        <h2 className="user-info__name">{user.name}</h2>
        <p className="user-info__username">@{user.username}</p>
        <div className="user-info__meta">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email ?? "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
