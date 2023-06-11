import { PUBLIC_SNAPSHOT_BLOCK_NUMBER } from '$env/static/public';
import { writable } from "svelte/store";

export class BasicMetricsCls {
    current_block = parseInt(PUBLIC_SNAPSHOT_BLOCK_NUMBER);
}

export class PricesCls {
    PLS = '';
    PLSX = '';
    HEX = '';
    INC = '';
}

export class UserPortfolioCls {
    user_address = '';
    user_pls_balance = '';
    user_pls_dollar_val = '';
    total_dollar = '';
    tokens = [];
    lp_tokens = [];
}

export const basic_metrics = writable(new BasicMetricsCls());
export const prices = writable(new PricesCls());
export const user_portfolio = writable(new UserPortfolioCls());
