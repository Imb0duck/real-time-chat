import type { JSX } from "react";
import type { Message, User } from "../../types/chat";
import "./message.css";

type MessageProps = {
    user: User;
    message: Message;
}

//Just a chat message
function ChatMessage({user, message}: MessageProps):JSX.Element {
    const {senderId, text, timestamp} = message;
    const {id, username} = user;
    const time = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`chat-message ${senderId === id ? "own" : ""}`}>
            <div className="message-meta">
                <span className="message-sender">{username ?? `User ${senderId}`}</span>
                <span className="message-time">{time}</span>
            </div>
            <p className="chat-text">{text}</p>
        </div>
    );
}

export default ChatMessage;
