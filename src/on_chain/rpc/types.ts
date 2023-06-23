interface LpTokensAmount {
  token_A: number;
  token_B: number;
}

export interface Farm {
  staked_lp: number;
  pool_address: string;
  token_A_symbol: string;
  token_B_symbol: string;
  lp_tokens_amount: LpTokensAmount; 
  pending_inc: number;
  states: State[];
}

interface State {
    action: "addLiquidityETH" | "Approve";
    block_number: string;
    timestamp: string;
    token_A: {
        symbol: "WPLS";
        value: string;
    };
    token_B: {
        symbol: string;
        value: string;
    };
    minted_lp: {
        symbol: string;
        value: string;
    };
}

export interface Token {
    balance: number;
    symbol: "PLS" | "PLSX" | "HEX" | "INC";
}

export interface LpToken {
    balance: number;
    symbol: "PLS" | "PLSX" | "HEX" | "INC";
    token_A: string;
    token_B: string;
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