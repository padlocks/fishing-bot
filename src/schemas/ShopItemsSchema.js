const { model, Schema } = require('mongoose');

const shopItemSchema = new Schema({
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
	},
	item: {
		type: Schema.Types.ObjectId,
		ref: 'Item',
	},
});

const ShopItem = model('ShopItem', shopItemSchema);
module.exports = { ShopItem };
