const { model, Schema } = require('mongoose');

const PondSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	count: {
		type: Number,
		default: 1000,
	},
	lastFished: {
		type: Number,
		default: 0,
	},
});

const Pond = model('Pond', PondSchema);
module.exports = { Pond };