import { type JSX } from "react";
import type { ChannelShortInfo } from "../../../types/chat";
import channelIcon from "../../../assets/chat.svg"
import "./channel-card.css";

type ChannelCardProps = {
    channel: ChannelShortInfo;
    onSelect: () => void;
}

function ChannelCard({ channel, onSelect }: ChannelCardProps): JSX.Element {
    const { name } = channel;
    
    return (
        <article className="channel-card card" onClick={onSelect}>
            <img className="channel-card__image card-image" src={channelIcon} alt="channel"/>
            <span className="channel-card__info__name card-name">{name}</span>
        </article>
    );
}

export default ChannelCard;
