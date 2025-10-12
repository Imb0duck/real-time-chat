export type User = {
    name: string;
    username: string;
    email: string;
    address: Adress;
    phone: string;
    website: string;
    company: Company;
    posts: Post[];
    accountHistory: Transaction[];
    favorite: boolean;
    avatar: string;
    id: number;
  }

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
}

type Geo = {
    lat: number;
    lng: number;
}

type Company = {
    name: string;
    catchPhrase: string;
    bs: string;
}

type Post = {
        words: string[];
        sentence: string;
        sentences: string;
        paragraph: string;
      }

type Transaction = {
    amount: number;
    date: Date;
    business: string;
    name: string;
    type: string;
    account: number;
}
