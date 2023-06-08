export interface Settings {
  pinataApiKey?: string;
  pinataApiSecret?: string;
}

export type Trait = {
  trait_type: string;
  value: string;
};

export interface PageAttributes {
  title: string;
  url: string;
  description: string;
  preview: string;
  contractAddress?: string;
  network?: string;
  metatags: {
    [key: string]: string;
  };
  personalized: {
    title: string;
    description: string;
  };
}
