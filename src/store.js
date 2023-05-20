import { PUBLIC_SNAPSHOT_BLOCK_NUMBER } from '$env/static/public';
import { writable } from "svelte/store";

export class BasicMetricsCls {
    current_block = parseInt(PUBLIC_SNAPSHOT_BLOCK_NUMBER);
    pls_price = 0.003;
    pulsex_price = 0.0002;
}

export const basic_metrics = writable(new BasicMetricsCls());
