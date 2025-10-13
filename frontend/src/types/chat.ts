export type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
};

export type Message = {
  id: string;
  channelId: string;
  senderId: number;
  text: string;
  timestamp: number;
};

export type Channel = {
  id: string;
  name: string;
  creatorId: number;
  participants: Set<number>;
  messages: Message[];
};

export type ChannelShortInfo = Pick<Channel, "id" | "name">;
