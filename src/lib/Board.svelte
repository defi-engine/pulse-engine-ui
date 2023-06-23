<script>
    import { formatUnits } from 'ethers';
    import {getOptions} from '../echart_utils/gauge';
    import { Chart } from 'svelte-echarts'
    import { onMount } from 'svelte';

    import { getUIFormat } from '../utils'
    // import { user_portfolio } from '../store';

    export let metric;

    // console.log(metric);
    let options = getOptions(3.7, 2.5);

    // const staked_lp = Number(formatUnits(farm.staked_lp, 18)).toFixed(3)
    // const pending_inc = Number(formatUnits(farm.pending_inc, 18)).toFixed(3);

    // const token0_init_amount = NaN;
    // const token1_init_amount = NaN;

    // const token0_current_amount = Number(formatUnits(farm.lp_tokens_amount.token_0, 18));
    // const token1_current_amount = Number(formatUnits(farm.lp_tokens_amount.token_1, 18));

    // const token0_amount_delta = token0_current_amount - token0_init_amount;
    // const token1_amount_delta = token1_current_amount - token1_init_amount;

    // const value_when_hold = NaN;
    // const value_in_the_pool = NaN;
    // const value_delta = NaN;
    // const token_0_symbol = farm.token_0_symbol;
    // const token_1_symbol = farm.token_1_symbol;

    // const token0_symbol = pool_init_metrics.token0.symbol;
    // const token1_symbol = pool_init_metrics.token1.symbol;
    // const token0_init_amount = pool_init_metrics.token0.amount;
    // const token1_init_amount = pool_init_metrics.token1.amount;

    // const token0_current_amount = undefined;
    // const token1_current_amount = undefined;

    // const token0_amount_delta = token0_current_amount - token0_init_amount;
    // const token1_amount_delta = token1_current_amount - token1_init_amount;

    // const token0_current_price = undefined;
    // const token1_current_price = undefined;

    // const fuel_consumption = undefined;
    // const value_when_hold = (token0_init_amount * token0_current_price) + (token1_init_amount * token1_current_price);
    // const value_in_the_pool = ((token0_current_amount * token0_current_price) + (token1_current_amount * token1_current_price)) - fuel_consumption;
    // const value_delta = value_in_the_pool - value_when_hold;

    // const il_percentage = undefined;

    // const pool_status = pool_init_metrics.status;

    // let days = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60/24);
    // let hours = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60) - days*24;
    // let minuts = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60) - days*24*60 - hours*60
    // let seconds = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)) - days*24*60*60 - hours*60*60 - minuts*60;

    // function updatePoolDuration() {
    //     days = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60/24);
    //     hours = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60) - days*24;
    //     minuts = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60) - days*24*60 - hours*60
    //     seconds = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)) - days*24*60*60 - hours*60*60 - minuts*60;
    // }

    // onMount(() => {
    //     if (pool_status === 'live') {
    //       const interval = setInterval(updatePoolDuration, 1000);
    //       return () => clearInterval(interval);          
    //     }
    // })
</script>

<div class='board'>
      <div class='farm-info'>
        {metric.pool_address}
        {metric.token_A_symbol}-{metric.token_B_symbol}
        🔒 Deposited: {getUIFormat(metric.staked_lp)} LP
        🚜 To harvest: {getUIFormat(metric.pending_inc)} INC
      </div>
      <div class="echart">
        <Chart {options} />
      </div>
          <!-- 🧭 -->
      <div class="metrics">
        <div class="metric">
          ⛽ fuel consumption: {NaN} PLS
        </div>
        <div class="metric">
          <!-- 🕕 pool livetime: {days}d {hours}h {minuts}m {seconds}s -->
        </div>
        <div class="metric">
          💸 current impernament loss: {NaN}%
        </div>
      </div>
      <div class="table">
        <table role="grid">
          <thead>
            <tr>
              <th></th>              
              <th>when hold 🏛️</th>
              <th>in the pool 🏄‍♂️</th>
              <th>delta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" class="cell">$ value</th>
              <td class="cell">value_when_hold</td>
              <td class="cell">value_in_the_pool</td>
              {#if 1 >= 0}
                <td class="cell delta green">value_delta</td>
              {:else}
                <td class="cell delta red">value_delta</td>
              {/if}
            </tr>
            <tr>
              <th scope="row" class="cell">{metric.token_A_symbol} amount</th>
              <td class="cell">token0_init_amount</td>
              <td class="cell">{getUIFormat(metric.lp_tokens_amount.token_A)}</td>
              {#if 1 >= 0}
                <td class="cell delta green">token0_amount_delta</td>
              {:else}
                <td class="cell delta red">token0_amount_delta</td>
              {/if}
            </tr>
            <tr>
              <th scope="row" class="cell">{metric.token_B_symbol} amount</th>
              <td class="cell">token1_init_amount</td>
              <td class="cell">{getUIFormat(metric.lp_tokens_amount.token_B)}</td>
              {#if 1 >= 0}
                <td class="cell delta green">token1_amount_delta</td>
              {:else}
                <td class="cell delta red">token1_amount_delta</td>
              {/if}
            </tr>
          </tbody>
        </table>
      </div>
</div>

<style>
  .board {
    position: relative;
    margin: 50px 10px;
    border: 1px solid #0080ff;
    height: 50vh;
    width: 90vw;
    box-shadow:
    0 0 5px #8000ff,
    0 0 5px #e619e6;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    transition: 0.5s;
  }
  .board:hover {
    box-shadow: 
      0 0 10px #8000ff,
      0 0 10px #e619e6;
  }

  .echart {
    z-index: 6;
    overflow: hidden;
    width: 50vh;
    height: 100%;
    padding: 10px;
  }
  .metrics .metric {
    border: 1px solid black;
    border-radius: 10px;
    padding: 5px;
    margin: 5px;
    font-size: 12px;
    text-align: center;
    color: white;
  }

  .cell {
    text-align: center;
  }
  .cell.delta.green {
    color: #0f5;
  }
  .cell.delta.red {
    color: #f00;
  }
</style>