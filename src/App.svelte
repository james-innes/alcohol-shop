<script>
	import { onMount } from "svelte";
	import QRious from "qrious";

	import Collect from "./Collect.svelte";
	import Products from "./Products.svelte";
	import Basket from "./Basket.svelte";
	import Checkout from "./Checkout.svelte";

	let params = new URLSearchParams(window.location.search);
	let collect = params.get("collect");
	let qr = params.get("qr");
	let canvas;

	qr &&
		onMount(
			() =>
				new QRious({
					element: canvas,
					value: `ADDRESS/?collect=${qr}`,
					foreground: "red",
					size: 250,
				})
		);
</script>

<h1 id="logo">motive</h1>

{#if qr}
	<div style="display: flex; justify-content: center">
		<canvas bind:this={canvas} />
	</div>
{:else if collect}
	<Collect {collect} />
{:else}
	<img id="banner" src="chabuddy.png" alt />
	<Basket />
	<hr />
	<Checkout />
	<hr />
	<Products />
{/if}

<style lang="sass" global>
	@import "styles"

	@font-face
		font-family: 'Bernoru'
		src: url('/Bernoru.woff2') format('woff2')

	#logo
		font-family: 'Bernoru'
		text-align: center
		display: block
		transform: perspective(400px) rotateX(45deg)
		overflow: hidden
		color: red

	#banner
		max-height: 14rem
		max-width: 80%
		object-fit: cover
		margin: 0 auto
		border-radius: 0
		background: red
		animation: blink 800ms step-end infinite
		display: flex
		
	@keyframes blink
		50%
			background: yellow
</style>
