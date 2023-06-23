<script>
  import { onMount } from 'svelte';
  import { prices, basic_metrics, user } from '../store';
  import { getUIFormat } from '../utils'

  import { graph_getLatestBlock } from '../on_chain/subgraph/blocks'
  import { graph_getTokenPrice } from '../on_chain/subgraph/pulsex'
  import { token_contracts } from '../on_chain/rpc/constants'
  import {
    icons, 
    account_getUserAssetsBalance, 
    account_getUserLPData,
    account_getUserDollarPortfolio,
    account_getUserFarmsMetric,
    account_collect_user_txs_metrics,
  } from '../on_chain/account'

  import Board from '$lib/Board.svelte'

  let metrics = [];
  let user_data_update_timer;

  onMount(async () => {
    const interval_1 = setInterval(async () => {
      const block = await graph_getLatestBlock();
      $basic_metrics.current_block = block.number;
    }, 10000);

    const interval_2 = setInterval(async () => {
      const obj_pulsex = await graph_getTokenPrice(token_contracts.PLSX_TOKEN);
      const obj_phex = await graph_getTokenPrice(token_contracts.HEX_TOKEN);
      const obj_inc = await graph_getTokenPrice(token_contracts.INC_TOKEN);

      $prices['PLSX'] = obj_pulsex.token_dollar_price;
      $prices['PLS'] = (1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price);
      $prices['HEX'] = obj_phex.token_dollar_price;
      $prices['INC'] = obj_inc.token_dollar_price;

    }, 60000);

    const block = await graph_getLatestBlock();
    const obj_pulsex = await graph_getTokenPrice(token_contracts.PLSX_TOKEN);
    const obj_phex = await graph_getTokenPrice(token_contracts.HEX_TOKEN);
    const obj_inc = await graph_getTokenPrice(token_contracts.INC_TOKEN);

    $basic_metrics.current_block = block.number;

    $prices['PLSX'] = obj_pulsex.token_dollar_price;
    $prices['PLS'] = (1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price);
    $prices['HEX'] = obj_phex.token_dollar_price;
    $prices['INC'] = obj_inc.token_dollar_price;

    return () => {
      clearInterval(interval_1);
      clearInterval(interval_2);
    };
  })

  let fields = {address: ""};
  let errors = {address: ""};
  let valid = false;
  let on_chain = false;
  async function onSubmit() {
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

    const user_address = fields.address.trim();
    fields.address = "";

    // 🔗 start collecting on chain data 🔗
    on_chain = true;

    const tokens = await account_getUserAssetsBalance(user_address);
    const lp_tokens = await account_getUserLPData(user_address); // lp balances which is not stored in farms
    const portfolio = await account_getUserDollarPortfolio(tokens, $prices);
    const farms_metric = await account_getUserFarmsMetric(user_address); // farms metrics where user is participated

    const user_tx = await fetch(`api/user_tx?address=${user_address}`);
    const user_tx_json = await user_tx.json();
    const user_tx_data = user_tx_json.user_tx;

    // TODO: farms_metric is mutating inside this method: make review if it is bad or good practice
    await account_collect_user_txs_metrics(farms_metric, user_tx_data, user_address);

    $user.user_address = user_address;
    $user.tokens = tokens;
    $user.lp_tokens = lp_tokens;
    $user.portfolio = portfolio;
    $user.farms_metric = farms_metric;

    user_data_update_timer = setInterval(async () => {
      const farms_metric = await account_getUserFarmsMetric(user_address); // farms metrics where user is participated
      $user.farms_metric = farms_metric;
    }, 10000);

    on_chain = false;
    // 🔗 end collecting on chain data 🔗
  }

  function clear_account() {
    metrics.length = 0;
    $user.user_address = "";
    $user.tokens = [];
    $user.lp_tokens = [];
    // clear timers
    clearInterval(user_data_update_timer);
  }
</script>

  <div class="dashboard">
    <div class="light {on_chain === true ? 'one' : ''}"></div>
    <div class="light {on_chain === true ? 'two' : ''}"></div>
    <div class="light {on_chain === true ? 'three' : ''}"></div>
    <div class="light {on_chain === true ? 'four' : ''}"></div>
    <form class="address-box" on:submit|preventDefault={async (e) => await onSubmit(e)}>
      <div class="grid form-box">
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
          <button type="submit" aria-busy={on_chain} class="outline" disabled={on_chain}>look on chain 🔗</button>
      </div>
    </form>

    {#if $user.user_address !== ""}
      <fieldset class="portfolio"><legend>📐 account metrics</legend>
          <div class="address-box">
            <div>{$user.user_address}</div>
            <div class="clear-btn">
              <button class="primary" on:click={clear_account}>X</button>
            </div>
          </div>

          <div class="tokens">
            {#each $user.tokens as token}
              <div>{getUIFormat(token.balance)} <img src={icons[token.symbol]} alt={icons[token.symbol]}/></div>
            {/each}

            {#each $user.lp_tokens as lp}
              <div>{getUIFormat(lp.balance)} {lp.symbol} {lp.version}
                <img src={icons[lp.token_A]} alt={icons[lp.token_A]} />
                <img src={icons[lp.token_B]} alt={icons[lp.token_B]} />
              </div>
            {/each}
          </div>

          <fieldset class="fiat-value">
            <legend>💲</legend>
            <div>
              {#each $user.tokens as token}
                <div>
                  <div class="token-desc">
                    {token.symbol}<img src={icons[token.symbol]} alt={icons[token.symbol]}/>
                  </div>
                  <div class="dollar-value">💲{getUIFormat($user.portfolio[token.symbol])}</div>
                </div>
              {/each}
            </div>
            <div>
              <div>total: 💲{getUIFormat($user.portfolio.total)}</div>
            </div>
          </fieldset>
      </fieldset>
    {/if}

    {#each $user.farms_metric as metric}
      <Board {metric} />
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
  top: 50vh;
  left: 50vw;
  transform:  translate(-50%, -50%);
  width: 5em;
  height: 5em;
  border-radius: 100px;
  filter: blur(15px);
  background: linear-gradient(30deg, #00eaff 0%, #0080ff 25%, #8000ff 50%, #e619e6 75%, #f00 100%);
  z-index: -1;
}

.dashboard .light.one {
  animation: flash_1 1s linear forwards infinite;
}
.dashboard .light.two {
  animation: flash_2 1s linear forwards infinite;
}
.dashboard .light.three {
  animation: flash_3 1s linear forwards infinite;
}
.dashboard .light.four {
  animation: flash_4 1s linear forwards infinite;
}

@keyframes flash_1 {
    0% {transform:  translate(-50%, -50%);}
    50% {transform:  translate(-50%, -250%);}
    100% {transform:  translate(-50%, -450%);}
}
@keyframes flash_2 {
    0% {transform:  translate(-50%, -50%);}
    50% {transform:  translate(-50%, 250%);}
    100% {transform:  translate(-50%, 450%);}
}
@keyframes flash_3 {
    0% {transform:  translate(-50%, -50%);}
    50% {transform:  translate(-450%, -50%);}
    100% {transform:  translate(-850%, -50%);}
}
@keyframes flash_4 {
    0% {transform:  translate(-50%, -50%);}
    50% {transform:  translate(450%, -50%);}
    100% {transform:  translate(850%, -50%);}
}

.address-box {
  margin: 5vw 5vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.form-box {
  width: 100%;
  align-items: center;
  margin: 0 auto;
}
.form-box div {
  width: 100%;
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

.portfolio {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: 1px solid #0080ff;
  border-radius: 10px;
  font-size: 18px;
}
.portfolio .fiat-value {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #0080ff;
  border-radius: 10px;
  font-size: 18px;
  width: 15vw;
}
.portfolio .fiat-value div {
  display: flex;
  padding: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.portfolio .fiat-value div img {
  padding: 0;
  height: 3vh;
  width: 3vh;
  margin: 0;
}
.portfolio .fiat-value div div {
  display: flex;
  flex-direction: column;
}
.portfolio .fiat-value div div div {
  display: flex;
  flex-direction: row;
}

.portfolio legend {
  margin: auto;
  padding: 0 10px;
}
.portfolio .address-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.portfolio .address-box .clear-btn {
  height: 30px;
  margin: 0 10px;
}
.portfolio .address-box div {
  height: 30px;
  margin: 0 10px;
}
.portfolio .address-box button {
  width: 2vw;
  height: 2vw;
  cursor: pointer;
  font-size: 12px;
  padding: 0;  
}

.portfolio .tokens {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}
.portfolio .tokens div {
  margin: 0 10px;
}
.portfolio .tokens img {
  padding: 0;
  height: 3vh;
  width: 3vh;
  margin: 0;
}
</style>