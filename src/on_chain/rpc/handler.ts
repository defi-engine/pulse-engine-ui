import { ethers, formatEther, formatUnits } from 'ethers';
import {
    abis,
    protocol_contracts_lookup,
    token_contracts_lookup,
    lp_token_contracts_lookup,
    all_contracts_lookup,
} from './constants';
import type {Farm, Token, UserTx} from './types'

const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com/');

export async function rpc_getPLSBalance(address: string): Promise<number> {
    let balance: number = NaN;
    try {
      const raw_balance = await provider.getBalance(address);
      balance = Number(formatEther(raw_balance));
    } catch (err) {
      console.error(err);
    }
    return balance;
}

export async function rpc_getTokenData(account_address: string, contract_address: string): Promise<Token> {
  let token: Token = {balance: NaN, symbol: ""};
  try {
    const contract = new ethers.Contract(contract_address, abis.TOKEN, provider);
    const balance = await contract.balanceOf(account_address);
    const decimals = await contract.decimals();
    const sym = await contract.symbol();
    token = {balance: Number(formatUnits(balance, decimals)), symbol: sym}
  } catch (error) {
    console.error('Error:', error);
  }
  return token;
}

export async function rpc_getLPContractData(account_address: string, contract_address: string) {
  const contract = new ethers.Contract(contract_address, abis.PLSX_WPLS_V1_POOL, provider);
  const balance = await contract.balanceOf(account_address);
  const decimals = await contract.decimals();
  const sym = await contract.symbol();

  const _token0_addr = await contract.token0();
  const _token1_addr = await contract.token1();
  const _con_0 = new ethers.Contract(_token0_addr, abis.TOKEN, provider);
  const _con_1 = new ethers.Contract(_token1_addr, abis.TOKEN, provider);

  const token_A = await _con_0.symbol();
  const token_B = await _con_1.symbol();

  const total_supply = await contract.totalSupply();
  const reserves = await contract.getReserves();

  return {
    balance: Number(formatUnits(balance, decimals)),
    symbol: sym,
    token_A: token_A,
    token_B: token_B,
    total_supply: total_supply,
    reserves: reserves,
    version: '',
  }
}

export async function rpc_getUserFarms(account_address: string, master_chef_address: string): Promise<Farm[]> {
  const master_chef_c = new ethers.Contract(master_chef_address, abis.PULSE_X_MASTER_CHEF, provider);
  const len = await master_chef_c.poolLength();

  const farms: Farm[] = [];

  for (let i = 0; i < len; i++) {
    const pool_info = await master_chef_c.poolInfo(i);
    const user_info = await master_chef_c.userInfo(i, account_address);
    const staked_lp = user_info['0'];
    const pool_address = pool_info['0'];

    if(staked_lp > 0) {
      const lp_obj = await rpc_getLPContractData(account_address, pool_address)

      // based on LP tokens calculate token_A and token_B amount
      const token_A_amount = (staked_lp * lp_obj.reserves[0]) / lp_obj.total_supply;
      const token_B_amount = (staked_lp * lp_obj.reserves[1]) / lp_obj.total_supply;

      // get unclaimed INC tokens
      const pending_inc = await master_chef_c.pendingInc(i, account_address);

      farms.push({
        staked_lp: Number(formatUnits(staked_lp, 18)), 
        pool_address: pool_info['0'], 
        token_A_symbol: lp_obj.token_A,
        token_B_symbol: lp_obj.token_B,
        lp_tokens_amount : {
            token_A: Number(formatUnits(token_A_amount, 18)),
            token_B: Number(formatUnits(token_B_amount, 18)),
        },
        pending_inc: Number(formatUnits(pending_inc, 18)),
        states: [],
    });
    }  

  }
  return farms;
}


export async function rpc_getUserPoolReceipts(pool_address: string, user_tx_data: []) {    
    // create lookup obj which contain provided pool address, all pulseX protocol contracts and token contracts
    let lookup = {}
    // @ts-ignore
    lookup[pool_address.toLowerCase()] = lp_token_contracts_lookup[pool_address.toLowerCase()];
    lookup = {...lookup, ...protocol_contracts_lookup, ...token_contracts_lookup}

    const raw = user_tx_data.filter((obj: any) => {
      // @ts-ignore
      if (lookup[obj.to.toLowerCase()] === undefined) return false;
      return true;
    })

    // sort - index 0 is oldest, last index is latest
    raw.sort((a: any, b: any) => {
      if (a?.blockNumber > b?.blockNumber) { return 1 }
      if (a?.blockNumber < b?.blockNumber) { return -1 }
      return 0;
    });

    // collect only needed fields
    const txs: any[] = raw.map((obj: any) => (({hash, timeStamp, input}) => ({hash, timeStamp, input}))(obj));

    // collect receipts and add additiona data
    const receipts = []
    for (let i = 0; i < txs.length; i++) {
        const receipt = await provider.getTransactionReceipt(txs[i].hash);
        // @ts-ignore
        receipt['to_name'] = lookup[receipt.to.toLowerCase()];
        // @ts-ignore
        receipt['timeStamp'] = txs[i].timeStamp;
        // @ts-ignore
        const iface = new ethers.Interface(abis[receipt.to_name]);
        const inputData = iface.parseTransaction({ data: txs[i].input });
        // @ts-ignore
        receipt['input_data'] = inputData;
        receipts.push(receipt);
    }
    return receipts;
}

function _parseReceiptLog(log) {
    const transsfered_asset = all_contracts_lookup[log.address.toLowerCase()];
    const abi = abis[transsfered_asset]
    const iface = new ethers.Interface(abi);
    const event = iface.parseLog(log)
    return {transsfered_asset, event};
}

function _parseTransfer(transsfered_asset, event, user_address) {
    let symbol = "";
    let amount = 0;
    let source = event.args[0].toLowerCase()
    let destination = event.args[1].toLowerCase()
    let to_name = all_contracts_lookup[event.args[1].toLowerCase()];

    if (transsfered_asset.includes('_POOL')) {
        // you receive LP tokens - (+) sign
        if (user_address.toLowerCase() === destination) {
            symbol = "PLP"
            amount = +Number(event.args['2']);
        }
        // you send LP tokens - (-) sign
        if (user_address.toLowerCase() === source) {
            symbol = "PLP"
            amount = -Number(event.args['2']);
        }
        if (to_name === 'PLSX_BUY_AND_BURN') {
            symbol = "PLP_burned"
            amount = Number(event.args['2']);
        }
    }
    if (transsfered_asset.includes('_TOKEN')) {
        // you receive tokens_A - (+) sign
        if (user_address.toLowerCase() === destination) {
            symbol = transsfered_asset.replace(/_TOKEN/, '');
            amount = +Number(event.args['2']);
        }
        // you send tokens_A - (-) sign
        if (user_address.toLowerCase() === source) {
            symbol = transsfered_asset.replace(/_TOKEN/, '');
            amount = -Number(event.args['2']);
        }
    }

    return [symbol, amount]
}

export async function rpc_parseAddRmLiquidityETH(receipt, user_address) {
    const data = [];
    // iterate logs inside receipt
    for (let l = 0; l < receipt.logs.length; l++) {
        const {transsfered_asset, event} = _parseReceiptLog(receipt.logs[l]);

        if (event.name === 'Transfer') {
            const [symbol, amount] = _parseTransfer(transsfered_asset, event, user_address);
            data.push({symbol, amount})          
        }
        if (event.name === 'Approval') {/* handle Sync */}
        if (event.name === 'Deposit') {/* handle Deposit */}
        if (event.name === 'Mint') {/* handle Mint */}
        if (event.name === 'Sync') {/* handle Sync */}
        if (event.name === 'Withdrawal') {/* handle Withdrawal */}
        if (event.name === 'Burn') {/* handle Burn */}
        if (event.name === 'DelegateVotesChanged') {/* handle DelegateVotesChanged */}
    }
    return data;
}

// export async function rpc_handleTxSignature(signature: 'addLiquidityETH', reception: []]) {

//     const actions = {
//         addLiquidityETH: _handleAddLiquidityETH,
//         Transfer: _handleTransfer,
//     }

//     actions[action](...args);
// }

// function _handleAddLiquidityETH(...args: string[]) {
//     console.log("handle _handleAddLiquidityETH with: ", args);
// }