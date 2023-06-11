<script>
    import {getOptions} from '../echart_utils/gauge';
    import { Chart } from 'svelte-echarts'
    import { onMount } from 'svelte';

    import { user_portfolio } from '../store';

    export let pool_init_metrics;

    let options = getOptions(pool_init_metrics.ratio, 777);

    const token0_symbol = pool_init_metrics.token0.symbol;
    const token1_symbol = pool_init_metrics.token1.symbol;
    const token0_init_amount = pool_init_metrics.token0.amount;
    const token1_init_amount = pool_init_metrics.token1.amount;

    const token0_current_amount = undefined;
    const token1_current_amount = undefined;

    const token0_amount_delta = token0_current_amount - token0_init_amount;
    const token1_amount_delta = token1_current_amount - token1_init_amount;

    const token0_current_price = undefined;
    const token1_current_price = undefined;

    const fuel_consumption = undefined;
    const value_when_hold = (token0_init_amount * token0_current_price) + (token1_init_amount * token1_current_price);
    const value_in_the_pool = ((token0_current_amount * token0_current_price) + (token1_current_amount * token1_current_price)) - fuel_consumption;
    const value_delta = value_in_the_pool - value_when_hold;

    const il_percentage = undefined;

    const pool_status = pool_init_metrics.status;

    let days = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60/24);
    let hours = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60) - days*24;
    let minuts = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60) - days*24*60 - hours*60
    let seconds = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)) - days*24*60*60 - hours*60*60 - minuts*60;

    function updatePoolDuration() {
        days = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60/24);
        hours = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60/60) - days*24;
        minuts = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)/60) - days*24*60 - hours*60
        seconds = Math.floor(((Date.now() / 1000) - pool_init_metrics.createdDate)) - days*24*60*60 - hours*60*60 - minuts*60;
    }

    onMount(() => {
        if (pool_status === 'live') {
          const interval = setInterval(updatePoolDuration, 1000);
          return () => clearInterval(interval);          
        }
    })
</script>

<div class='board'>
      <div class="echart">
        <Chart {options} />
      </div>
          <!-- 🧭 -->
      <div class="metrics">
        <div class="metric">
          ⛽ fuel consumption: {fuel_consumption} PLS
        </div>
        <div class="metric">
          🕕 pool livetime: 
          {#if pool_status === 'live'}
            {days}d {hours}h {minuts}m {seconds}s
          {:else}
            pool finished 
          {/if}

        </div>
        <div class="metric">
          💸 current impernament loss: {il_percentage}%
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
              <td class="cell">{value_when_hold}</td>
              <td class="cell">{value_in_the_pool}</td>
              {#if value_delta >= 0}
                <td class="cell delta green">{value_delta}</td>
              {:else}
                <td class="cell delta red">{value_delta}</td>
              {/if}
            </tr>
            <tr>
              <th scope="row" class="cell">{token0_symbol} amount</th>
              <td class="cell">{token0_init_amount}</td>
              <td class="cell">{token0_current_amount}</td>
              {#if token0_amount_delta >= 0}
                <td class="cell delta green">{token0_amount_delta}</td>
              {:else}
                <td class="cell delta red">{token0_amount_delta}</td>
              {/if}
            </tr>
            <tr>
              <th scope="row" class="cell">{token1_symbol} amount</th>
              <td class="cell">{token1_init_amount}</td>
              <td class="cell">{token1_current_amount}</td>
              {#if token1_amount_delta >= 0}
                <td class="cell delta green">{token1_amount_delta}</td>
              {:else}
                <td class="cell delta red">{token1_amount_delta}</td>
              {/if}
            </tr>
          </tbody>
        </table>
      </div>
      <div class="status">
        <div class={pool_status}></div><div>pool status: {pool_status}</div>
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

  .board .status {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 5px;
    right: 5px;
    font-size: 12px;
  }
  .board .status .live {
    height: 2vh;
    width: 2vh;
    margin: 0 3px;
    border-radius: 100px;
    background-color: #0f5;
  }
  .board .status .finished {
    height: 2vh;
    width: 2vh;
    margin: 0 3px;
    border-radius: 100px;
    background-color: #f00;
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