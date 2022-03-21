const { Client, Environment } = require("square");
const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO);

const payments = new Client({
	environment: Environment[process.env.SQUARE_ENV],
	accessToken: process.env.SQUARE_KEY,
}).paymentsApi;

const twilio = require("twilio")(
	process.env.TWILIO_ID,
	process.env.TWILIO_TOKEN
);

exports.handler = async ({ body }) => {
	const { token, phone, basket, total } = JSON.parse(body);

	return payments
		.createPayment({
			sourceId: token,
			amountMoney: {
				amount: total,
				currency: "GBP",
			},
			idempotencyKey: uuidv4(),
		})
		.then(() =>
			mongo.connect().then(() =>
				mongo
					.db("stores")
					.collection("order")
					.insertOne({
						phone,
						basket,
						total,
						status: "new",
					})
					.then(r => r.insertedId)
			)
		)
		.then(id =>
			twilio.messages
				.create({
					to: phone,
					from: "+14153845417",
					body: `Motive QR Code for collection: {process.env.ADDRESS}/?qr=${id}`,
				})
				.then(() => ({
					statusCode: 201,
					body: JSON.stringify(qr),
					text: qr,
				}))
		)
		.catch(e => ({
			statusCode: 500,
			body: e,
		}));
};
