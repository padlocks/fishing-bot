const { model, Schema } = require('mongoose');

const rodSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	rarity: {
		type: String,
		required: true,
	},
	capabilities: {
		type: [String],
	},
	requirements: {
		type: [String],
	},
	obtained: {
		type: Number,
	},
	fishCaught: {
		type: Number,
		default: 0,
	},
	user: {
		type: String,
	},
	state: {
		type: String,
		enum: ['mint', 'repaired', 'broken', 'destroyed'],
		default: 'mint',
	},
	icon: {
		animated: {
			type: Boolean,
			default: false,
		},
		data: {
			type: String,
			default: 'old_rod:1210508306662301706',
		},
	},
});

const Rod = model('Rod', rodSchema);
const RodData = model('RodData', rodSchema);
module.exports = { Rod, RodData };
