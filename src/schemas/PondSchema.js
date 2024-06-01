const { model, Schema } = require('mongoose');

const PondSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	count: {
		type: Number,
		default: 2000,
	},
	maximum: {
		type: Number,
		default: 2000,
	},
	lastFished: {
		type: Number,
		default: 0,
	},
	warning: {
		type: Boolean,
		default: false,
	},
});

const Pond = model('Pond', PondSchema);
module.exports = { Pond };