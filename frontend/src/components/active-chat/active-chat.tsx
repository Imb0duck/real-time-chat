import { useEffect, useState, type JSX } from "react";
import { useActiveChannel, useIsActiveChannelLoading, sendMessage, clearChannel } from "../../store/use-active-channel-store";
import { useUser } from "../../store/use-user-store";
import Spinner from "../spinner/spinner";
import ChatMessage from "../message/message";
import { MessageSquare } from "lucide-react";
import "./active-chat.css";
import ChannelModal from "../modals/channel-modal/channel-modal";

function ActiveChat(): JSX.Element {
  const user = useUser();
  const activeChannel = useActiveChannel();
  const isLoading = useIsActiveChannelLoading();
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  //Delete listeners for closed channel
  useEffect(() => clearChannel, []);

  if (isLoading)
    return (
        <Spinner />
    );

  if (!activeChannel) return <></>;

  const handleSend = () => {
    if (!message.trim() || !user) return;
    const { id, username } = user;
    sendMessage(message.trim(), id, username);
    setMessage('');
  };

  const { name, participants, messages} = activeChannel;

  //Opened chat
  return (
    <section className="active-chat">
      {/* Pseudo header */}
      <div className="chat-header" onClick={() => setShowModal(true)}>
        <MessageSquare size={26} />
        <div className="chat-header__info">
          <h2 className="chat-header__name">{name}</h2>
          <span className="chat-header__participants">{participants.length} users</span>
        </div>
      </div>

      {/* List of messages */}
      <ul className="chat-body list">
        {messages.length === 0 ? (<p className="chat-empty">No messages</p>) : (
          messages.map((msg) => <ChatMessage key={msg.id} user={user!} message={msg}/>))}
      </ul>

      {/* Input window */}
      <div className="chat-input">
        <input className="chat-input__input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />
        <button className="chat-input__input active-button" onClick={handleSend} disabled={!message.trim()}>Send</button>
      </div>

      {showModal && <ChannelModal onClose={() => setShowModal(false)} />}
    </section>
  );
}

export default ActiveChat;
