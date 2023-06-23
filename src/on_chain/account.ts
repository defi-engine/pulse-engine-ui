import { ethers, formatUnits } from 'ethers';

import {
    rpc_getPLSBalance,
    rpc_getTokenData,
    rpc_getLPContractData,
    rpc_getUserFarms,
    rpc_getUserPoolReceipts,
    rpc_parseAddRmLiquidityETH,
} from './rpc/handler';
import { token_contracts, lp_token_contracts, protocol_contracts } from './rpc/constants';
import type { Farm, Token, Prices, Portfolio } from './rpc/types'

const status = {
    "whale": "🐋",
    "shark": "🦈",
    "dolphin": "🐬",
    "squid": "🦑",
    "turtle": "🐢",
    "crab": "🦀",
    "shrimp": "🦐",
  }

  export const icons = {
    "PLS": "/pls.png",
    "PLSX": "/pulsex.png",
    "INC": "/inc.png",
    "HEX": "/phex.png",
    "PLP": "",
  }

export async function account_getUserAssetsBalance(user_address: string): Promise<Token[]> {
    const token_list = Object.values(token_contracts);

    const tokens: Token[] = [];
    for (let i = 0; i < token_list.length; i++) {
      const token = await rpc_getTokenData(user_address, token_list[i]);
      if (Number(token?.balance) === 0.0) {
        continue;
      }
      tokens.push(token);
    }
    const balance = await rpc_getPLSBalance(user_address);

    // actually PLS is native coin instead of token, but for simplicity we keep assets in one array
    tokens.push({balance: balance, symbol: 'PLS'})
    return tokens;
}

export async function account_getUserLPData(user_address: string) {
    const lp_list = Object.entries(lp_token_contracts);
    const lp_tokens = [];
    for (let i = 0; i < lp_list.length; i++) {
      let version = "";
      if (lp_list[i][0].includes("V1")) {version = "V1"};
      if (lp_list[i][0].includes("V2")) {version = "V2"};

      const lp = await rpc_getLPContractData(user_address, lp_list[i][1]);
      lp.version = version;

      if (Number(lp?.balance) === 0.0) {
        continue;
      }
      lp_tokens.push(lp);
    }
    return lp_tokens;
}

export async function account_getUserDollarPortfolio(tokens: Token[], prices: Prices): Promise<Portfolio> {
    let total: number = 0;
    const portfolio = {PLS: NaN, PLSX: NaN, HEX: NaN, INC: NaN, total: NaN}

    for (let i = 0; i < tokens.length; i++) {
      const price = prices[tokens[i].symbol];
      const balance = tokens[i].balance
      if (isNaN(price) || isNaN(balance)) {
        continue;
      }
      const dollar_value = price * balance;
      portfolio[tokens[i].symbol] = dollar_value;
      total = total + dollar_value;
    }
    portfolio.total = total;
    return portfolio;
}

export async function account_getUserFarmsMetric(user_address: string): Promise<Farm[]> {
    const farms: Farm[] = await rpc_getUserFarms(user_address, protocol_contracts.PULSE_X_MASTER_CHEF);
    return farms;
}

const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com/');

export async function account_collect_user_txs_metrics(farms_metric, user_tx_data, user_address) {
    // iterate farms
    for (let f = 0; f < farms_metric.length; f++) {
      const receipts = await rpc_getUserPoolReceipts(farms_metric[f].pool_address, user_tx_data);
      if ((farms_metric[f].token_A_symbol + farms_metric[f].token_B_symbol).includes('WPLS')) {
        // iterate recepits for particular farm
        for (let r = 0; r < receipts.length; r++) {

            if (receipts[r].input_data.name === 'addLiquidityETH' || 
                receipts[r].input_data.name === 'removeLiquidityETHWithPermit') {
                const data = await rpc_parseAddRmLiquidityETH(receipts[r], user_address);

                if (data.length === 0) continue;

                const plp_obj = data.find(item => item.symbol === 'PLP');

                farms_metric[f].states.push({
                    signature: receipts[r].input_data.name,
                    block_number: receipts[r].blockNumber,
                    timestamp: receipts[r].timeStamp,
                    ratio: data[0].amount / data[1].amount,
                    token_A: {symbol: data[0].symbol, amount: data[0].amount},
                    token_B: {symbol: data[1].symbol, amount: data[1].amount},
                    token_LP: {symbol: plp_obj.symbol, amount: plp_obj.amount},
                });
            }
        }
      }
    }
}
