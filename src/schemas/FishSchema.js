const { model, Schema } = require('mongoose');

const FishSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: 'A fish',
	},
	rarity: {
		type: String,
		default: 'Common',
	},
	value: {
		type: Number,
		default: 10,
	},
	baseValue: {
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
	biome: {
		type: String,
		default: 'ocean',
	},
	guild: {
		type: String,
		default: '0',
	},
	size : {
		type: Number,
		default: 0.0,
	},
	weight : {
		type: Number,
		default: 0.0,
	},
	minSize : {
		type: Number,
		default: 0.1,
		required: true,
	},
	minWeight : {
		type: Number,
		default: 0.1,
		required: true,
	},
	maxSize : {
		type: Number,
		default: 10.0,
		required: true,
	},
	maxWeight : {
		type: Number,
		default: 5.0,
		required: true,
	},
	catchId : {
		type: String,
		default: '0',
	},
}, { timestamps: true });

const Fish = model('Fish', FishSchema);
const FishData = model('FishData', FishSchema);
module.exports = { Fish, FishData };