const { model, Schema } = require('mongoose');

const questSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	reward: {
		type: [{
			type: Schema.Types.ObjectId,
		}],
	},
	cash: {
		type: Number,
		required: true,
		default: 0,
	},
	xp: {
		type: Number,
		required: true,
		default: 0,
	},
	requirements: {
		level: {
			type: Number,
			default: 0,
		},
		previous: [{
			type: String,
			default: '',
		}],
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
		specialConditions: {
			type: [String],
			default: [],
		},
	},
	startDate: {
		type: Number,
	},
	endDate: {
		type: Number,
	},
	user: {
		type: String,
	},
	progress: {
		type: Number,
		default: 0,
	},
	progressMax: {
		type: Number,
		default: 1,
	},
	status: {
		type: String,
		enum: ['pending', 'in_progress', 'completed', 'failed'],
		default: 'pending',
	},
	daily: {
		type: Boolean,
		default: false,
	},
	progressType: {
		fish: [{
			type: String,
			default: 'any',
		}],
		rarity: [{
			type: String,
			default: 'any',
		}],
		rod: {
			type: String,
			default: 'any',
		},
		qualities: [{
			type: String,
			default: 'any',
		}],
		size: {
			type: String,
			default: 'any',
		},
		weight: {
			type: String,
			default: 'any',
		},
	},
	questType: {
		type: String,
		enum: ['quest', 'mystery', 'npc_event'],
		default: 'quest',
	},
	hiddenUntilEvent: {
		type: Boolean,
		default: false,
	},
	hiddenTitle: {
		type: String,
	},
	eventTrigger: {
		type: String,
	},
	npcs: {
		type: [{
			type: Schema.Types.ObjectId,
		}]
	},
	repeatable: {
		type: Boolean,
		default: false,
	},
	fishable: {
		type: Boolean,
		default: false,
	},
	continuous: {
		type: Boolean,
		default: false,
	},
	questType: {
		type: String,
		enum: ['quest', 'tutorial'],
		default: 'quest',
	},
	type: {
		type: String,
		default: 'quest',
	},
}, { timestamps: true });

const Quest = model('Quest', questSchema);
const QuestData = model('QuestData', questSchema);
module.exports = { Quest, QuestData };
