const { model, Schema } = require('mongoose');

const itemSchema = new Schema({
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
	price: {
		type: Number,
		required: true,
		default: 0,
	},
	type: {
		type: String,
	},
	user: {
		type: String,
	},
	shopItem: {
		type: Boolean,
		default: false,
	},
});

const Item = model('Item', itemSchema);
const ItemData = model('ItemData', itemSchema);
module.exports = { Item, ItemData };
