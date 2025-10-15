import type { JSX } from "react";
import type { UserShortInfo } from "../../../types/chat";
import './user-card.css';
import defaultAvatar from '../../../assets/default-avatar.svg';

type UserCardProps = {
  userInfo: UserShortInfo;
  onSelect: () => void;
}

function UserCard({ userInfo, onSelect }: UserCardProps): JSX.Element{
  const {name, username, avatar} = userInfo;
  return (
  <article className="user-card card" onClick={onSelect}>
    <img className="user-card__image card-image" src={avatar || defaultAvatar} onError={(e) => (e.currentTarget.src = defaultAvatar)} alt={username}/>
    <div className="user-card__info">
      <span className="user-card__info__name card-name">{name}</span>
      <span className="user-card__info__username">@{username}</span>
    </div>
  </article>
)};

export default UserCard;
