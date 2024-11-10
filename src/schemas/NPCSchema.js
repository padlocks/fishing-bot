const { model, Schema } = require('mongoose');

const npcSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	biome: {
		type: String,
		required: true,
	},
	availableTimes: {
		type: [{
			weather: {
				type: String,
				enum: ['sunny', 'rainy', 'snowy', 'windy', 'cloudy', 'any'],
				default: 'any',
			},
			timeOfDay: {
				type: String,
				enum: ['morning', 'afternoon', 'evening', 'night', 'any'],
				default: 'any',
			},
			season: {
				type: String,
				enum: ['spring', 'summer', 'fall', 'winter', 'any'],
				default: 'any',
			},
		}],
		default: [{ weather: 'any', timeOfDay: 'any', season: 'any' }],
	},
	eventTrigger: {
		type: String,
	},
	dialogue: {
		initial: {
			type: String,
		},
		repeatable: {
			type: [String],
		},
		completion: {
			type: String,
		},
	},
	questTitlesAvailable: [{
		type: String,
	}],
}, { timestamps: true });

const NPC = model('NPC', npcSchema);
module.exports = { NPC };
