import { PUBLIC_SNAPSHOT_BLOCK_NUMBER } from '$env/static/public';
import { writable } from "svelte/store";
import type { Farm, Token, LpToken, Portfolio} from './on_chain/rpc/types'

export class BasicMetricsCls {
    current_block = parseInt(PUBLIC_SNAPSHOT_BLOCK_NUMBER);
}

export class PricesCls {
    PLS = NaN;
    PLSX = NaN;
    HEX = NaN;
    INC = NaN;
}

export class UserCls {
    user_address: string = '';
    tokens: Token[] = [];
    lp_tokens: LpToken[] = [];
    portfolio: Portfolio = {PLS: NaN, PLSX: NaN, HEX: NaN, INC: NaN, total: NaN};
    farms_metric: Farm[] = [];
}

export const basic_metrics = writable(new BasicMetricsCls());
export const prices = writable(new PricesCls());
export const user = writable(new UserCls());
