const { model, Schema } = require('mongoose');

const PetSchema = new Schema({
	fish: {
		type: Schema.Types.ObjectId,
		ref: 'Fish',
		required: true,
	},
	aquarium: {
		type: Schema.Types.ObjectId,
		ref: 'Aquarium',
		required: true,
	},
	adoptTime: {
		type: Date,
		default: Date.now(),
	},
	name: {
		type: String,
		required: true,
	},
	age: {
		type: Number,
		required: true,
	},
	owner: {
		type: String,
		required: true,
	},
	traits: {
		type: [String],
		required: true,
	},
	health: {
		type: Number,
		required: true,
	},
	mood: {
		type: Number,
		required: true,
	},
	hunger: {
		type: Number,
		required: true,
	},
	stress: {
		type: Number,
		required: true,
	},
	xp: {
		type: Number,
		required: true,
	},
	lastFed: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	lastPlayed: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	lastBred: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	type: {
		type: String,
		default: 'pet',
	},
});


const PetFish = model('Pet', PetSchema);
module.exports = { PetFish };