const { model, Schema } = require('mongoose');

const biomeSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	requirements: {
		type: [String],
	},
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
	type: {
		type: String,
		default: 'biome',
	},
});

const Biome = model('Biome', biomeSchema);
module.exports = { Biome };
