<script>
	export let collect;

	async function find() {
		let order = await fetch("/.netlify/functions/collect", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				collect,
			}),
		}).then(r => r.json());

		return order;
	}

	function status(status) {
		fetch("/.netlify/functions/status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: collect,
				status,
			}),
		});
	}
</script>

{#await find()}
	<p>Loading...</p>
{:then order}
	<h1>Order Info 📦</h1>
	<hr />
	<table>
		<tr><th>ID</th><td>{order?._id}</td></tr>
		<tr><th>Phone</th><td>{order?.phone}</td></tr>
		<tr><th>Total</th><td>£{(order?.total / 100).toFixed(2)}</td></tr>
		<tr
			><th>Status</th><td>
				<select on:blur={e => status(e.target.value)}>
					{#each ["new", "stocked", "collected"] as option}
						<option value={option} selected={option == order?.status}
							>{option}</option
						>
					{/each}
				</select></td
			></tr
		>
	</table>

	<hr />
	<table>
		{#each order?.basket as { code, img, name, qty }}
			<tr>
				<td><img src={img} alt style="height: 6rem" /></td>
				<td>
					{name} <br />
					<b>
						&#215; {qty}
					</b>
				</td>
			</tr>
		{/each}
	</table>
{/await}
