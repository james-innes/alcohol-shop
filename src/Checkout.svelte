<script>
	import { onMount } from "svelte";
	import { payments } from "@square/web-sdk";
	import { catalog } from "./store.js";

	$: total = $catalog.reduce((sum, { price, qty }) => sum + price * qty, 0);
	let card, apple, google, sucess, process, phone, qr;

	onMount(async () => {
		let square = await payments("SQUARE_APP", "SQUARE_LOCATION");
		let request = square.paymentRequest({
			countryCode: "GB",
			currencyCode: "GBP",
			requestBillingContact: true,
			total: {
				amount: String((total / 100).toFixed(2)),
				label: "Total",
			},
		});

		window.ApplePaySession && (apple = await square.applePay(request));
		card = await square.card({
			style: {
				".input-container": {
					borderColor: "red",
					borderRadius: "9.6px",
					borderWidth: "2px",
				},
				".input-container.is-focus": {
					borderColor: "blue",
				},
				".input-container.is-error": {
					borderColor: "orange",
				},
				input: {
					color: "blue",
					fontFamily: "Helvetica, sans-serif",
					fontWeight: 500,
					fontSize: "16px",
				},
				"input::placeholder": {
					color: "black",
				},
				"input.is-error": {
					color: "orange",
				},
				"input.is-focus": {
					color: "blue",
				},
				".message-text": {
					color: "black",
				},
				".message-icon": {
					color: "blue",
				},
				".message-text.is-error": {
					color: "orange",
				},
				".message-icon.is-error": {
					color: "orange",
				},
			},
		});
		await card.attach("#card");
		google = await square.googlePay(request);
		await google.attach("#google-pay");
	});

	async function pay(e, method) {
		e.preventDefault();
		process = true;
		let payment = await method.tokenize();

		console.log(payment);

		let r = await fetch("/.netlify/functions/checkout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token: payment.token,
				phone:
					"+44" +
					(phone
						? phone
						: payment.details?.card?.billing?.phone ||
						  payment.details?.shipping?.contact?.phone
					)
						.replace(/\s+/g, "")
						.slice(-10),
				basket: $catalog.filter(p => p.qty != 0),
				total,
			}),
		});

		if (r.status == 201) {
			sucess = true;
			qr = await r.json();
			$catalog = $catalog.map(_p => ({ ..._p, qty: 0 }));
		} else {
			process = false;
			alert("Failed to process order.");
		}
	}
</script>

<h3>Total: £{(total / 100).toFixed(2)}</h3>
{#if sucess}
	<div class="box">
		<p>
			Great that worked! 🥳 Show the <a href="ADDRESS/?qr={qr}">QR Code</a>
			we just sent to you by text when you go to collect your order.
		</p>
	</div>
{:else if total < 100}
	<p class="box">
		We can't afford to process a payment of less than £1.<br />
		Add another item to your basket.
	</p>
{:else if window.ApplePaySession}
	<apple-pay-button on:click={e => pay(e, apple)} />
{:else}
	<div
		id="google-pay"
		on:click={e => pay(e, google)}
		style="width: min-content"
	/>
	<details>
		<summary>Pay by Card</summary>
		<form on:submit={e => pay(e, card)} style="max-width: 20rem">
			<div id="card" />
			<label style="margin-top: 1rem">
				Mobile Number
				<input
					bind:value={phone}
					type="tel"
					pattern="[0-9 ]+"
					autocomplete="tel"
					placeholder="07000 000 000"
					required
				/>
				<small />
			</label>
			<button type="submit">
				{process ? "Processing ..." : "Pay Now"}
			</button>
		</form>
	</details>
{/if}

<style lang="sass">
	apple-pay-button
		-webkit-appearance: -apple-pay-button
		cursor: pointer
		height: 2.5rem
		width: 10rem

	form
		max-width: 20rem
</style>
