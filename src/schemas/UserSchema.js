const { model, Schema } = require('mongoose');

const UserSchema = new Schema ({
	userId: {
		type: String,
		required: true,
	},
	xp: {
		type: Number,
		default: 0,
	},
	commands: {
		type: Number,
		default: 0,
	},
	type: {
		type: String,
		default: 'user',
	},
	currentBiome: {
		type: String,
		default: 'ocean',
	},
	stats: {
		fishCaught: {
			type: Number,
			default: 0,
		},
		latestFish: [{
			type: Schema.Types.ObjectId,
			ref: 'Fish',
		}],
		soldLatestFish: {
			type: Boolean,
			default: false,
		},
		lastDailyQuest: {
			type: Number,
		},
		fishStats: {
			type: Map,
			of: Number,
			default: {},
		},
	},
	inventory: {
		money: {
			type: Number,
			default: 0,
		},
		equippedRod: {
			type: Schema.Types.ObjectId,
			ref: 'Rod',
		},
		equippedBait: {
			type: Schema.Types.ObjectId,
			ref: 'Bait',
		},
		baits: [{
			type: Schema.Types.ObjectId,
			ref: 'Bait',
		}],
		fish: [{
			type: Schema.Types.ObjectId,
			ref: 'Fish',
		}],
		rods: [{
			type: Schema.Types.ObjectId,
			ref: 'Rod',
		}],
		quests: [{
			type: Schema.Types.ObjectId,
			ref: 'Quest',
		}],
		buffs: [{
			type: Schema.Types.ObjectId,
			ref: 'Buff',
		}],
		gacha: [{
			type: Schema.Types.ObjectId,
			ref: 'Gacha',
		}],
	},
});

const User = model('User', UserSchema, 'users');
module.exports = { User };