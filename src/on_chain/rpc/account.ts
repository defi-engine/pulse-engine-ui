import { ethers, formatEther, formatUnits } from 'ethers';

export const icons = {
  "PLS": "/pls.png",
  "PLSX": "/pulsex.png",
  "INC": "/inc.png",
  "HEX": "/phex.png",
  "PLP": "",
}

export const token_contracts = {
  PULSE_X_CONTRACT_ADDRESS: '0x95b303987a60c71504d99aa1b13b4da07b0790ab',
  HEX_CONTRACT_ADDRESS: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  INC_CONTRACT_ADDRESS: '0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d',
}

export const lp_token_contracts = {
  PLSX_WPLS_V1_POOL: '0x1b45b9148791d3a104184cd5dfe5ce57193a3ee9',
  PLSX_WPLS_V2_POOL: '0x149B2C629e652f2E89E11cd57e5d4D77ee166f9F',
}

export const pulseX_contracts = {
  PULSE_X_FACTORY: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
}

// ABI of the ERC20 token contract
const tokenAbi = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function name() external view returns (string)',
];

const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com/');

export async function getPLSBalance(address: string) {
    try {
      const raw_balance = await provider.getBalance(address);
      const balance = formatEther(raw_balance);
      return balance
    } catch (err) {
      console.error(err);
    }
  }

export async function getTokenBalance(account_address: string, contract_address: string) {
  try {
    const contract = new ethers.Contract(contract_address, tokenAbi, provider);
    const balance = await contract.balanceOf(account_address);
    const decimals = await contract.decimals();
    const sym = await contract.symbol();

    const token = {
      balance: Number(formatUnits(balance, decimals)).toFixed(3),
      symbol: sym,
    }
    return token;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getContractData(account_address: string, contract_address: string) {
  const contract = new ethers.Contract(contract_address, tokenAbi, provider);
  const balance = await contract.balanceOf(account_address);
  const decimals = await contract.decimals();
  const sym = await contract.symbol();

  const _token0_addr = await contract.token0();
  const _token1_addr = await contract.token1();
  const _con_0 = new ethers.Contract(_token0_addr, tokenAbi, provider);
  const _con_1 = new ethers.Contract(_token1_addr, tokenAbi, provider);

  const token_0 = await _con_0.symbol();
  const token_1 = await _con_1.symbol();

  const data = {
    balance: Number(formatUnits(balance, decimals)).toFixed(3),
    symbol: sym,
    token_0: token_0,
    token_1: token_1,
    version: '',
  }
  return data;
}
