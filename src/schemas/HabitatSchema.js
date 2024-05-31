const { model, Schema } = require('mongoose');

const AquariumSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	size: {
		type: Number,
		required: true,
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
	},
	cleanliness: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	owner: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: 'aquarium',
	},
});


const Habitat = model('Habitat', AquariumSchema);
module.exports = { Habitat };