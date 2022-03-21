import { writable } from "svelte/store";
import data from "./catalog.csv";

export const catalog = writable(
	data.map(row => {
		let [code, barcode, price, name, img, qty, cat] = row;
		return {
			code,
			barcode,
			price,
			name,
			img: "https://media.booker.co.uk/bbimages" + img,
			qty,
			cat,
		};
	})
);