<script>
  import { onMount } from 'svelte';
  import { basic_metrics } from '../store.js';
  import { getLatestBlock } from '../subgraph/blocks'
  import { getTokenData } from '../subgraph/pulsex'
  import Board from '$lib/Board.svelte'

  const PULSE_X_CONTRACT_ADDRESS = '0x95b303987a60c71504d99aa1b13b4da07b0790ab';
  const HEX_CONTRACT_ADDRESS = '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39';
  const INC_CONTRACT_ADDRESS = '0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d';

  let user_pools = [];

  onMount(async () => {
    const interval_1 = setInterval(async () => {
      const block = await getLatestBlock();
      $basic_metrics.current_block = block.number;
    }, 10000);

    const interval_2 = setInterval(async () => {
      const obj_pulsex = await getTokenData(PULSE_X_CONTRACT_ADDRESS);
      const obj_phex = await getTokenData(HEX_CONTRACT_ADDRESS);
      const obj_inc = await getTokenData(INC_CONTRACT_ADDRESS);

      $basic_metrics.pulsex_price = obj_pulsex.token_dollar_price.toFixed(8);
      $basic_metrics.pls_price = ((1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price)).toFixed(8);

      $basic_metrics.phex_price = obj_phex.token_dollar_price.toFixed(8);
      $basic_metrics.inc_price = obj_inc.token_dollar_price.toFixed(8);

    }, 60000);

    const block = await getLatestBlock();
    const obj_pulsex = await getTokenData(PULSE_X_CONTRACT_ADDRESS);
    const obj_phex = await getTokenData(HEX_CONTRACT_ADDRESS);
    const obj_inc = await getTokenData(INC_CONTRACT_ADDRESS);

    $basic_metrics.current_block = block.number;
    $basic_metrics.pulsex_price = obj_pulsex.token_dollar_price.toFixed(8);
    $basic_metrics.pls_price = ((1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price)).toFixed(8);

    $basic_metrics.phex_price = obj_phex.token_dollar_price.toFixed(8);
    $basic_metrics.inc_price = obj_inc.token_dollar_price.toFixed(8);

    return () => {
      clearInterval(interval_1);
      clearInterval(interval_2);
    };
  })

  let fields = {address: ""};
  let errors = {address: ""};
  let valid = false;
  async function onSubmit(e) {
    valid = true;

    if (fields.address.trim().length !== 42) {
      valid = false;
      errors.address = "Address must be at least 42 characters long";
    } else {
      errors.address = "";
    }

    if (fields.address.trim().slice(0, 2) !== "0x") {
      valid = false;
      errors.address = "Address must start with 0x";
    } else {
      errors.address = "";
    }

    if (!valid) {
      setTimeout(() => {
        errors.address = "";
      }, 5000);
      return;
    }

    const res = await fetch("/api/mock_data");
    const data = await res.json();

    // for now only active pool are supported
    user_pools = data.positions.my_pools.filter(pool => pool.pool.status === 'live');
  }
</script>

  <div class="dashboard">
    <div class="light"></div>
    <form class="address-box" on:submit|preventDefault={async (e) => await onSubmit(e)}>
      <div class="grid">
        <div>
          <input
          type="text"
          id="address"
          bind:value={fields.address}
          placeholder="Type your address"
          aria-label="Address"
          required
          />
          <div class="error">{ errors.address }</div>
        </div>
          <button type="submit" class="outline">look on chain 🔗</button>
      </div>
    </form>
    {#each user_pools as pool, i}
      <Board pool_init_metrics={pool.pool} />
    {/each}
  </div>

<style>
  /* hex grid */
.dashboard {
  min-height: 150vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #2b2b2b;
  position: relative;
  background: url("/grid.svg");
  background-repeat: repeat;
  background-size: 500px;
}
.dashboard .light {
  position: absolute;
  top: 30%;
  left: 50%;
  transform:  translate(-300%, -150%);
  width: 15em;
  height: 15em;
  border-radius: 100px;
  filter: blur(15px);
  background: linear-gradient(30deg, #00eaff 0%, #0080ff 25%, #8000ff 50%, #e619e6 75%, #f00 100%);
  z-index: -1;
  animation: flash 5s linear forwards normal;
}
@keyframes flash {
    0% {
      transform:  translate(-500%, -160%);
    }
    100% {
      transform:  translate(500%, 50%);
    }
}

.address-box {
    margin: 5px 10px;
    width: 80vw;
  }
.address-box button {
  font-size: 12px;
}
.error {
  text-align: center;
  padding: 0;
  margin: 0;
  font-size: 10px;
  color: #f00;
}
</style>