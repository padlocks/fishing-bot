import { Schema, model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';

interface IFishStats {
	[key: string]: number;
}

interface IUser extends Document {
	userId: string;
	xp: number;
	commands: number;
	type: string;
	currentBiome: string;
	stats: {
		fishCaught: number;
		latestFish: Types.ObjectId[];
		soldLatestFish: boolean;
		lastDailyQuest?: number;
		gachaBoxesOpened: number;
		fishStats: IFishStats;
	};
	inventory: {
		money: number;
		equippedRod: Types.ObjectId;
		equippedBait: Types.ObjectId;
		items: Types.ObjectId[];
		baits: Types.ObjectId[];
		fish: Types.ObjectId[];
		rods: Types.ObjectId[];
		quests: Types.ObjectId[];
		buffs: Types.ObjectId[];
		gacha: Types.ObjectId[];
		aquariums: Types.ObjectId[];
		codes: Types.ObjectId[];
	};
	isAdmin: boolean;
}

const UserSchema = new Schema<IUser>({
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
		gachaBoxesOpened: {
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
	},
});

const User = mongoose.models.User || model<IUser>('User', UserSchema, 'users');
export { User };	export type { IUser };