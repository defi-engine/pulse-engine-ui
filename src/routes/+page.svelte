<script>
  import { onMount } from 'svelte';
  import { Chart } from 'svelte-echarts'
  import * as echarts from 'echarts';
  import { collector } from '../collector';
  import { basic_metrics } from '../store.js';

  onMount(() => {
    async function getLatestBlock() {
      const res = await fetch("/api/block_number");
      const data = await res.json();
      $basic_metrics.current_block = data.blocknumber;
    }

    const interval = setInterval(getLatestBlock, 8000);
    getLatestBlock();
    return () => clearInterval(interval);
  })

  collector();
</script>
  
  <div class="dashboard">
    <div class="light"></div>
    <form class="address-box">
      <div class="grid">
        <input
          type="text"
          name="address"
          placeholder="Type your address"
          aria-label="Address"
          required
          />
          <button type="submit" class="outline">🔎</button>
      </div>
    </form>
    <div class='board'></div>
  </div>
<!-- <div class="main-chart">
  <Chart {options} />
</div> -->

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
  animation: flash 5s linear forwards infinite;
}
.address-box {
    margin: 5px 10px;
    width: 80vw;
  }
.address-box button {
  width: 10vw;
  font-size: 12px;
}

.board {
    margin: 5px 10px;
    border: 1px solid #0080ff;
    height: 30vh;
    width: 50vw;
    box-shadow: 
    0 0 10px #8000ff,
    0 0 10px #e619e6;
    border-radius: 5px;
    transition: 0.5s;
}
.board:hover {
  box-shadow: 
    0 0 20px #8000ff,
    0 0 20px #e619e6;
    height: 32vh;
    width: 52vw;
}

@keyframes flash {
    0% {
      transform:  translate(-500%, -160%);
    }
    100% {
      transform:  translate(500%, 50%);
    }
}

</style>