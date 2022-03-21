const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO);

exports.handler = async ({ body }) =>
	mongo
		.connect()
		.then(() =>
			mongo
				.db("stores")
				.collection("order")
				.updateOne(
					{ _id: ObjectId(JSON.parse(body).id) },
					{ $set: { status: JSON.parse(body).status } }
				)
		)
		.then(() => ({
			statusCode: 201,
		}));
