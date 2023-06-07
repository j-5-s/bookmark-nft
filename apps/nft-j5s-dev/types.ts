import type { AbiTypeToPrimitiveType } from "abitype";
export type IpfsTokenURI = `ipfs://${string}`;
export type NFTMetadata = {
  name: string;
  image: string;
  description: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
};

export type NFTAttributes = {
  Title: string;
  URL: string;
  Timestamp: string;
  Text: string;
};
export type Address = AbiTypeToPrimitiveType<"address">;

export type AddressString = `0x${string}`;
