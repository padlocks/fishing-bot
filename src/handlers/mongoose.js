const { connect } = require('mongoose');
const config = require('../config');
const { log } = require('../class/Utils');

module.exports = async () => {
	Utils.log('Started connecting to MongoDB...', 'warn');

	await connect(process.env.MONGODB_URI || config.handler.mongodb.uri).then(() => {
		Utils.log('MongoDB is connected to the atlas!', 'done');
	});
};