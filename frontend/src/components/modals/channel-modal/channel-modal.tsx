import { useState, type JSX } from "react";
import "./channel-modal.css";
import { useActiveChannel, kickUser, clearChannel, deleteChannel } from "../../../store/use-active-channel-store";
import { useUser } from "../../../store/use-user-store";
import type { UserShortInfo } from "../../../types/chat";
import { Trash2, LogOut } from "lucide-react";
import UserCard from "../../cards/user-card/user-card";
import defaultAvatar from '../../../assets/default-avatar.svg';

type ChannelModalProps = {
  onClose: () => void;
}

function ChannelModal({ onClose }: ChannelModalProps): JSX.Element {
  const channel = useActiveChannel();
  const user = useUser();
  const [selectedUser, setSelectedUser] = useState<UserShortInfo | null>(null);

  if (!channel || !user) return <></>;

  const { id } = user;
  const isCreator = (id === channel.creatorId);

  const handleKick = (targetId: number) => {
    kickUser(targetId, id);
  };

  const handleLeave = () => {
    clearChannel();
    onClose();
  };

  //Modal window to check users in channel & to manage channel
  return (
    <div className="channel-modal__overlay" onClick={onClose}>
      <div className="channel-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{channel.name}</h2>

        <div className="modal-actions">
          {isCreator && (<button className="modal-btn danger" onClick={() => deleteChannel(id)}>
              <Trash2 size={16} /> Delete Channel</button>
          )}
          <button className="modal-btn" onClick={handleLeave}><LogOut size={16} /> Leave Channel</button>
        </div>

        <h3 className="modal-subtitle">Participants</h3>
        <ul className="modal-user-list">
          {channel.participants.map((u) => (
            <UserCard key={u.id} userInfo={u} onSelect={() => setSelectedUser(u)}/>
          ))}
        </ul>

        {selectedUser && (
          <div className="modal-user-detail">
            <h4>{selectedUser.name}</h4>
            <img src={selectedUser.avatar} onError={(e) => (e.currentTarget.src = defaultAvatar)} alt={selectedUser.username} />
            <p><strong>Username:</strong> @{selectedUser.username}</p>
            {isCreator && id !== selectedUser.id && (
                <button className="kick-btn" onClick={(e) => { e.stopPropagation(); handleKick(selectedUser.id); setSelectedUser(null)}}>Kick</button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelModal;
