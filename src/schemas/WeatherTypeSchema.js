const { model, Schema } = require('mongoose');

const weatherSchema = new Schema({
	weather: {
		type: String,
		required: true,
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
		default: 'weather',
	},
}, { timestamps: true });

const WeatherType = model('WeatherType', weatherSchema);
module.exports = { WeatherType };
