const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO);

exports.handler = async ({ body }) =>
	mongo
		.connect()
		.then(() =>
			mongo
				.db("stores")
				.collection("order")
				.findOne({ _id: ObjectId(JSON.parse(body).collect) })
		)
		.then(order => ({
			statusCode: 200,
			body: JSON.stringify(order),
		}));
