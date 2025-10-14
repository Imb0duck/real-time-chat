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

export type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  email: string;
  adress: Adress;
  phone: string;
  website: string;
  company: Company;
  posts: Post[];
  accountHistory: Transaction[];
  favorite: boolean;
};

type Adress = {
  streetA: string;
  streetB: string;
  streetC: string;
  streetD: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  geo: Geo;
};

type Geo = {
  lat: number;
  lng: number;
};

type Company = {
  name: string;
  catchPhrase: string;
  bs: string;
};

type Post = {
  words: string[];
  sentence: string;
  sentences: string;
  paragraph: string;
};

type Transaction = {
  amount: number;
  date: Date;
  business: string;
  name: string;
  type: string;
  account: number;
};
