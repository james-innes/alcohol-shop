const { MongoClient } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO);

exports.handler = async () => {
	const orders = await mongo.connect().then(() =>
		mongo
			.db("stores")
			.collection("order")
			.find({ status: "new" })
			.toArray()
			.then(r => r)
	);

	const flat = orders.map(order => order.basket).flat();

	const purchase = Array.from(
		flat.reduce(
			(m, { code, qty }) => m.set(code, (m.get(code) || 0) + qty),
			new Map()
		),
		([code, qty]) => ({ code, qty })
	)
		.map(p =>
			`10/01/20,00:00:00,00,${
				
				flat.find(_p => _p.code == p.code).barcode
			}\r\n`.repeat(p.qty)
		)
		.join("");

	return {
		headers: {
			"Content-Disposition": "attachment; filename=purchase.txt",
		},
		statusCode: 200,
		body: purchase,
	};
};
