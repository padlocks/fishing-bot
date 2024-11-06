const { model, Schema } = require('mongoose');

const UserSchema = new Schema ({
	userId: {
		type: String,
		required: true,
	},
	level: {
		type: Number,
		default: 1,
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
		gachaBoxesOpened: {
			type: Number,
			default: 0,
		},
		lastVoted: {
			type: Date,
		},
		totalVotes: {
			type: Number,
			default: 0,
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
		items: [{
			type: Schema.Types.ObjectId,
			ref: 'Item',
		}],
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
		aquariums: [{
			type: Schema.Types.ObjectId,
			ref: 'Aquarium',
		}],
		codes: [{
			type: Schema.Types.ObjectId,
			ref: 'Code',
		}],
	},
	isAdmin: {
		type: Boolean,
		default: false,
	}
}, { timestamps: true });

const User = model('User', UserSchema, 'users');
module.exports = { User };