const { Schema } = require('mongoose');
const { Item, ItemData } = require('./ItemSchema');

const rodSchema = new Schema({
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

const Rod = Item.discriminator('Rod', rodSchema);
const RodData = ItemData.discriminator('RodData', rodSchema);
module.exports = { Rod, RodData };
