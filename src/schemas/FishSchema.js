const { model, Schema } = require('mongoose');

const FishSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	rarity: {
		type: String,
		default: 'Common',
	},
	value: {
		type: Number,
		default: 10,
	},
	locked: {
		type: Boolean,
		default: false,
	},
	qualities: [{
		type: String,
		default: 'weak',
	}],
	icon: {
		animated: {
			type: Boolean,
			default: false,
		},
		data: {
			type: String,
			default: 'rawfish:1209352519726276648',
		},
	},
	user: {
		type: String,
	},
	obtained: {
		type: Number,
	},
	count: {
		type: Number,
		default: 1,
	},
	type: {
		type: String,
		default: 'fish',
	},
});

const Fish = model('Fish', FishSchema);
const FishData = model('FishData', FishSchema);
module.exports = { Fish, FishData };