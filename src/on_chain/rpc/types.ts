interface LpTokensAmount {
  token_0: number;
  token_1: number;
}

export interface Farm {
  staked_lp: number;
  pool_address: string;
  token_0_symbol: string;
  token_1_symbol: string;
  lp_tokens_amount: LpTokensAmount; 
  pending_inc: number;
}

export interface Token {
    balance: number;
    symbol: "PLS" | "PLSX" | "HEX" | "INC";
}

export interface LpToken {
    balance: number;
    symbol: "PLS" | "PLSX" | "HEX" | "INC";
    token_0: string;
    token_1: string;
    total_supply: number;
    reserves: number[];
    version: string;
}

export interface Prices {
    PLS: number;
    PLSX: number;
    HEX: number;
    INC: number;
}

export interface Portfolio {
    PLS: number;
    PLSX: number;
    HEX: number;
    INC: number;
    total: number;
}

export interface UserTx {
    blockNumber: string;
    cumulativeGasUsed: string;
    from: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    hash: string;
    isError: string;
    timeStamp: string;
    to: string;
    to_name: string;
}