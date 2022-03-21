<script>
	import { catalog } from "./store.js";
</script>

<h3>Basket</h3>
{#if $catalog.filter(p => p.qty != 0).length <= 0}
	<p>Your basket is empty becuase you have not put anything in it.</p>
{:else}
	<table>
		{#each $catalog.filter(p => p.qty != 0) as { code, img, name, price }}
			<tr>
				<td><img src={img} alt style="height: 3rem" /></td>
				<td>
					{name}<br>
					<b>£{(price / 100).toFixed(2)}</b>
				</td>
				<td>
					<select
						bind:value={$catalog[$catalog.findIndex(p => p.code == code)].qty}
					>
						{#each Array(11) as _, i}
							<option value={i}>&#215; {i}</option>
						{/each}
					</select>
				</td>
			</tr>
		{/each}
	</table>
{/if}
