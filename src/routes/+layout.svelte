<script>
  import '@picocss/pico'
  import '../app.css'
  import { BasicMetricsCls, basic_metrics } from '../store.js';
  import { onDestroy } from 'svelte';

  let basicMetrics = new BasicMetricsCls();

  const unsubscribe = basic_metrics.subscribe((obj) => basicMetrics = obj);
  onDestroy(unsubscribe);
</script>

<style>
  .banner {
    margin: 3vh;
  }
  .gradient {
    background-image: linear-gradient(30deg, #00eaff 0%, #0080ff 25%, #8000ff 50%, #e619e6 75%, #f00 100%);
    background-size: 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -moz-background-clip: text;
    -webkit-text-fill-color: transparent; 
    -moz-text-fill-color: transparent;
    text-shadow: 
    0 0 21px #8000ff,
    0 0 42px #e619e6;
}

/* pulse animation */
.pulse-box {
  padding: 0;
  width: 7vh;
  height: 7vh;
}
.pulse-box svg {
	position: relative;
	transition: all 0.5s ease-in-out;
  border-radius: 50px;
}

.pulse-box svg .pulse {
	fill: none;
	stroke: #0080ff;
  filter: drop-shadow(0px 0px 5px #e619e6);
	stroke-width: 5;
	stroke-linecap: round;
	stroke-linejoin: miter;
	opacity: 0;
	stroke-dashoffset: 3000;
	stroke-dasharray: 1000;
	animation: pulse 2s linear forwards infinite;
}
  
@keyframes pulse {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    50% {
      stroke-dashoffset: 2000;
    }
    99% {
      opacity: 0;
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 3000;
    }
}


div div {
  max-height: 20vh;
  text-align: center;
  margin: 5px;
}

img {
  padding: 0;
  height: 3vh;
  width: 3vh;
  margin: 0;
}

.text-item {
  font-size: 12px;
  margin: 0;
  padding: 0;
  color: #0080ff;
}

.pulse-component {
  display: flex;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
}

.internal {
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #0080ff;
}

.price-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.price-box p {
  margin: 3px;
}

</style>
<div class="grid internal">
  <div class="banner"><strong class="gradient">Pulse Engine</strong></div>
  <div>
    <div class="pulse-component">
      <div class="pulse-box">            
        <svg version="1.1"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 200 200" style="enable-background:new 0 0 200 200;" xml:space="preserve">
            <g>
              <polyline class="pulse" points="
              0,100 50,100 
              60,140 
              70,100 80,60 90,20 
              100,60 110,100 120,140 130,180
              140,140 150,100 160,60 
              170,100 210,100 	"/>
            </g>
        </svg>
      </div>
    <div><p class="text-item">block number: {basicMetrics.current_block}</p></div>
  </div>
 </div>
 <div>
    <div class="price-box">
      <p class="text-item"><img src="/PulseX_X.svg" alt="PulseX_X.svg" /></p>
      <p class="text-item">{basicMetrics.pulsex_price}$</p>
   </div>
 </div>
 <div>
   <div class="price-box">
     <p class="text-item"><img src="/PulseChain_logo_vector.svg" alt="PulseChain_logo_vector.svg" /></p>
     <p class="text-item">{basicMetrics.pls_price}$</p>
   </div>
 </div>
</div>

<slot />
