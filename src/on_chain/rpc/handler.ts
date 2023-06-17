import { ethers, formatEther, formatUnits } from 'ethers';
import {abis, pulseX_contracts, lp_token_contracts, contracts_lookup } from './constants';
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
    const contract = new ethers.Contract(contract_address, abis.TOKEN_ABI, provider);
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
  const contract = new ethers.Contract(contract_address, abis.PLSX_WPLS_V1_POOL_ABI, provider);
  const balance = await contract.balanceOf(account_address);
  const decimals = await contract.decimals();
  const sym = await contract.symbol();

  const _token0_addr = await contract.token0();
  const _token1_addr = await contract.token1();
  const _con_0 = new ethers.Contract(_token0_addr, abis.TOKEN_ABI, provider);
  const _con_1 = new ethers.Contract(_token1_addr, abis.TOKEN_ABI, provider);

  const token_0 = await _con_0.symbol();
  const token_1 = await _con_1.symbol();

  const total_supply = await contract.totalSupply();
  const reserves = await contract.getReserves();

  return {
    balance: Number(formatUnits(balance, decimals)),
    symbol: sym,
    token_0: token_0,
    token_1: token_1,
    total_supply: total_supply,
    reserves: reserves,
    version: '',
  }
}

export async function rpc_getUserFarms(account_address: string, master_chef_address: string): Promise<Farm[]> {
  const master_chef_c = new ethers.Contract(master_chef_address, abis.PULSE_X_MASTER_CHEF_ABI, provider);
  const len = await master_chef_c.poolLength();

  const farms: Farm[] = [];

  for (let i = 0; i < len; i++) {
    const pool_info = await master_chef_c.poolInfo(i);
    const user_info = await master_chef_c.userInfo(i, account_address);
    const staked_lp = user_info['0'];
    const pool_address = pool_info['0'];

    if(staked_lp > 0) {
      const lp_obj = await rpc_getLPContractData(account_address, pool_address)

      // based on LP tokens calculate token_0 and token_1 amount
      const token_0_amount = (staked_lp * lp_obj.reserves[0]) / lp_obj.total_supply;
      const token_1_amount = (staked_lp * lp_obj.reserves[1]) / lp_obj.total_supply;

      // get unclaimed INC tokens
      const pending_inc = await master_chef_c.pendingInc(i, account_address);

      farms.push({
        staked_lp: Number(formatUnits(staked_lp, 18)), 
        pool_address: pool_info['0'], 
        token_0_symbol: lp_obj.token_0, 
        token_1_symbol: lp_obj.token_1,
        lp_tokens_amount : {
            token_0: Number(formatUnits(token_0_amount, 18)),
            token_1: Number(formatUnits(token_1_amount, 18)),
        },
        pending_inc: Number(formatUnits(pending_inc, 18)),
    });
    }  

  }
  return farms;
}
