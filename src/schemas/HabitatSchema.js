const { model, Schema } = require('mongoose');

const AquariumSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	size: {
		type: Number,
		required: true,
		default: 1,
	},
	fish: [{
		type: Schema.Types.ObjectId,
		ref: 'Pet',
	}],
	waterType: {
		type: String,
		enum: ['Freshwater', 'Saltwater'],
		required: true,
	},
	temperature: {
		type: Number,
		required: true,
		default: 0,
	},
	cleanliness: {
		type: Number,
		required: true,
		default: 100,
	},
	owner: {
		type: String,
		required: true,
	},
	lastCleaned: {
		type: Date,
		default: Date.now,
	},
	lastAdjusted: {
		type: Date,
		default: Date.now,
	},
	type: {
		type: String,
		default: 'aquarium',
	},
}, { timestamps: true });


const Habitat = model('Habitat', AquariumSchema);
module.exports = { Habitat };