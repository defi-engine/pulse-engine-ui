import type { BigNumberish } from 'ethers';

export const getUIFormat = (value: BigNumberish, prec: number = 4) => Number(value).toFixed(prec);