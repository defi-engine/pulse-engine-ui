<script>
  import { onMount } from 'svelte';
  import { prices, basic_metrics, user_portfolio } from '../store.js';

  import { getLatestBlock } from '../on_chain/subgraph/blocks'
  import { getTokenData } from '../on_chain/subgraph/pulsex'
  import { 
    token_contracts,
    lp_token_contracts,
    getPLSBalance, 
    getTokenBalance,
    getContractData,
    icons
  } from '../on_chain/rpc/account'

  import Board from '$lib/Board.svelte'

  let user_pools = [];

  onMount(async () => {
    const interval_1 = setInterval(async () => {
      const block = await getLatestBlock();
      $basic_metrics.current_block = block.number;
    }, 10000);

    const interval_2 = setInterval(async () => {
      const obj_pulsex = await getTokenData(token_contracts.PULSE_X_CONTRACT_ADDRESS);
      const obj_phex = await getTokenData(token_contracts.HEX_CONTRACT_ADDRESS);
      const obj_inc = await getTokenData(token_contracts.INC_CONTRACT_ADDRESS);

      $prices['PLSX'] = obj_pulsex.token_dollar_price.toFixed(8);
      $prices['PLS'] = ((1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price)).toFixed(8);
      $prices['HEX'] = obj_phex.token_dollar_price.toFixed(8);
      $prices['INC'] = obj_inc.token_dollar_price.toFixed(8);

    }, 60000);

    const block = await getLatestBlock();
    const obj_pulsex = await getTokenData(token_contracts.PULSE_X_CONTRACT_ADDRESS);
    const obj_phex = await getTokenData(token_contracts.HEX_CONTRACT_ADDRESS);
    const obj_inc = await getTokenData(token_contracts.INC_CONTRACT_ADDRESS);

    $basic_metrics.current_block = block.number;

    $prices['PLSX'] = obj_pulsex.token_dollar_price.toFixed(8);
    $prices['PLS'] = ((1/Number(obj_pulsex.token_pls_price)) * Number(obj_pulsex.token_dollar_price)).toFixed(8);
    $prices['HEX'] = obj_phex.token_dollar_price.toFixed(8);
    $prices['INC'] = obj_inc.token_dollar_price.toFixed(8);

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

    // 🔗 start collecting on chain data 🔗
    on_chain = true;

    // get user portfolio data
    $user_portfolio.user_address = fields.address.trim();
    fields.address = "";

    const pls_balance = await getPLSBalance($user_portfolio.user_address);

    // TOKENS
    const token_list = Object.values(token_contracts);
    const tokens = [];
    for (let i = 0; i < token_list.length; i++) {
      const token = await getTokenBalance($user_portfolio.user_address, token_list[i]);
      if (Number(token?.balance) === 0.0) {
        continue;
      }
      tokens.push(token);
    }

    // LP CONTRACTS
    const lp_list = Object.entries(lp_token_contracts);
    const lp_tokens = [];
    for (let i = 0; i < lp_list.length; i++) {
      let version = "";
      if (lp_list[i][0].includes("V1")) {version = "V1"};
      if (lp_list[i][0].includes("V2")) {version = "V2"};

      const lp = await getContractData($user_portfolio.user_address, lp_list[i][1]);
      lp.version = version;

      if (Number(lp?.balance) === 0.0) {
        continue;
      }
      lp_tokens.push(lp);
    }

    $user_portfolio.user_pls_balance = Number(pls_balance).toFixed(3);
    $user_portfolio.tokens = tokens;
    $user_portfolio.lp_tokens = lp_tokens;

    // collect dollar values
    let total_dollar = 0;
    $user_portfolio.user_pls_dollar_val = (Number($user_portfolio.user_pls_balance) * Number($prices['PLS'])).toFixed(3)
    total_dollar = Number($user_portfolio.user_pls_balance) * Number($prices['PLS']);
    for (let i = 0; i < $user_portfolio.tokens.length; i++) {
      const price = $prices[$user_portfolio.tokens[i].symbol];
      const balance = $user_portfolio.tokens[i].balance
      if (isNaN(price) || isNaN(balance)) {
        continue;
      }

      const dollar_value = Number(price) * Number(balance);
      total_dollar = total_dollar + dollar_value;
      $user_portfolio.tokens[i].dollar_value = dollar_value.toFixed(3);
    }
    $user_portfolio.total_dollar = total_dollar.toFixed(3);

    const res = await fetch("/api/mock_data");
    const data = await res.json();

    user_pools = data.positions.my_pools.filter(pool => pool.pool.status === 'live');

    on_chain = false;
    // 🔗 end collecting on chain data 🔗
  }

  function clear_account() {
    user_pools.length = 0;
    $user_portfolio.tokens = [];
    $user_portfolio.user_address = "";
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

    {#if $user_portfolio.user_address !== ""}
      <fieldset class="portfolio"><legend>📐 account metrics</legend>
          <div class="address-box">
            <div>{$user_portfolio.user_address}</div>
            <div class="clear-btn">
              <button class="primary" on:click={clear_account}>X</button>
            </div>
          </div>

          <div class="tokens">
            <div>{$user_portfolio.user_pls_balance} <img src="/pls.png" alt="/pls.png"/> </div>
            {#each $user_portfolio.tokens as token}
              <div>{token.balance} <img src={icons[token.symbol]} alt={icons[token.symbol]}/></div>
            {/each}

            {#each $user_portfolio.lp_tokens as lp}
              <div>{lp.balance} {lp.symbol} {lp.version}
                <img src={icons[lp.token_0]} alt={icons[lp.token_0]} />
                <img src={icons[lp.token_1]} alt={icons[lp.token_1]} />
              </div>
            {/each}
          </div>

          <fieldset class="fiat-value">
            <legend>💲</legend>
            <div>
              {#each $user_portfolio.tokens as token}
                <div>
                  <div class="token-desc">
                    {token.symbol}<img src={icons[token.symbol]} alt={icons[token.symbol]}/>
                  </div>
                  <div class="dollar-value">💲{token.dollar_value}</div>
                </div>
              {/each}
              <div>
                <div class="token-desc">
                  PLS<img src="/pls.png" alt="/pls.png"/>
                </div>
                <div class="dollar-value">
                  💲{$user_portfolio.user_pls_dollar_val}
                </div>
              </div>
            </div>
            <div>
              <div>total: 💲{$user_portfolio.total_dollar}</div>
            </div>
          </fieldset>
      </fieldset>
    {/if}

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