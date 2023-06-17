import Dexie, { Table } from "dexie";
export type NetworkName = "Ethereum" | "Sepolia" | "Polygon" | "Polygon Mumbai";
export interface Contract {
  id?: number;
  // The logged in user to wagmi
  user: string;
  address: string;
  txHash: string;
  name: string;
  symbol: string;
  creator: string;
  owner: string;
  network: string;
  networkName: NetworkName;
  description: string;
  createdAt: number;
}

// export const db = new Dexie("j5s");
// db.version(1).stores({
//   contracts: "++id, address, txHash", // Primary key and indexed props
// });
export class J5SClassedDexie extends Dexie {
  contracts!: Table<Contract>;

  constructor() {
    super("j5s");
    this.version(2).stores({
      contracts: "++id, user, createdAt, &[address+user]", // Primary key and indexed props
    });
  }
}

export const db = new J5SClassedDexie();
