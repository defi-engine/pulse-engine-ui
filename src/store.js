import { PUBLIC_SNAPSHOT_BLOCK_NUMBER } from '$env/static/public';
import { writable } from "svelte/store";

export class BasicMetricsCls {
    current_block = parseInt(PUBLIC_SNAPSHOT_BLOCK_NUMBER);
    pls_price = '';
    pulsex_price = '';
    phex_price = '';
    inc_price = '';
}

export const basic_metrics = writable(new BasicMetricsCls());
