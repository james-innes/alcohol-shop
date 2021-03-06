<script>
	import { onMount } from "svelte";
	import { catalog } from "./store.js";
	import cats from "./cats.csv";

	let modal = false;
	let page = 0;
	let sentinel;

	$: selected = "all";
	$: searchTerm = "";
	$: reset(selected, searchTerm);

	function reset() {
		products = [];
		page = 0;
	}

	const fuzzy = match =>
		searchTerm
			.toLowerCase()
			.trim()
			.split(" ")
			.some(t =>
				match
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.includes(t)
			);

	$: products = [
		...products,
		...$catalog
			.filter(p =>
				searchTerm
					? fuzzy(p.name) || fuzzy(cats[p.cat][0])
					: selected == "all"
					? true
					: p.cat == selected
			)
			.slice(50 * page, 50 * (page + 1)),
	];

	onMount(() =>
		new IntersectionObserver(
			entries => entries.some(entry => entry.intersectionRatio > 0) && page++
		).observe(sentinel)
	);
</script>

<h3>Filter by Category</h3>
<button
	on:click={() => (selected = "all")}
	class:disabled={searchTerm}
	class="radio active"
>
	ALL
</button>
{#each [].concat.apply([], cats) as label, cat}
	<button
		on:click={() => (selected == cat ? (selected = "all") : (selected = cat))}
		class:active={selected == cat}
		class="radio"
		class:disabled={searchTerm}
	>
		{label}
	</button>
{/each}
<h3 style="margin-bottom: 0.25rem">Or Search</h3>
<input bind:value={searchTerm} type="search" style="max-width: 16rem" />

<div class="grid">
	{#each products as { code, price, name, img }, i}
		<div class={modal == code ? "modal" : "card"} id={code}>
			<img src={img} alt={name} />
			{#if modal == code}
				<h3>{name}</h3>
			{:else}
				<p>{name}</p>
			{/if}
			<b>{price >= 100 ? "£" + price / 100 : price + "p"}</b>
			<select bind:value={$catalog[i].qty}>
				{#each Array(11) as _, i}
					<option value={i}>&#215; {i}</option>
				{/each}
			</select>
			<button
				on:click={() => (modal == code ? (modal = false) : (modal = code))}
				class:close={modal}
			>
				{modal == code ? "Close" : "Info"}
			</button>
			{#if modal == code}
				{#await fetch(`/.netlify/functions/product/?code=${modal}`).then( p => p.json() )}
					<p>Loading...</p>
				{:then info}
					{@html info.info}
				{/await}
			{/if}
		</div>
	{:else}
		<p>No Results for your Search or Filter</p>
	{/each}
	<div bind:this={sentinel} />
</div>

<svelte:head>
	{#if modal}
		<style lang="sass">
			body
				overflow: hidden
		</style>
	{/if}
</svelte:head>

<style lang="sass">
	.grid
		display: grid
		grid-template-columns: repeat(auto-fit, minmax(6.8rem, 1fr))
		grid-column-gap: 0.4rem
		grid-row-gap: 1rem
		margin-top: 2rem

	.card
		position: relative
		max-width: 8rem
		display: flex
		flex-direction: column
		justify-content: space-between
		align-content: center
		text-align: center
		touch-action: manipulation

		p
			line-height: 1rem
			max-height: 3em
			margin: 0
			overflow: hidden

		img
			width: 100%
			margin-bottom: 5px

		select,
		button
			visibility: hidden
			position: absolute
			left: 49%
			z-index: 2
			box-shadow: 0 7px 15px rgba(0, 0, 0, 0.2)

		&:hover
			button,
			select
				visibility: unset
				transition: all 400ms

		button
			top: 20%

		select
			top: 3%
			width: 3.3rem

	.modal
		width: 80%
		height: 80%

		img
			margin: 0 auto
			display: block
			height: 100%
			min-height: 15rem
			max-height: 45vh

		select
			width: min-content
			display: inline
			margin-left: 1rem
</style>
