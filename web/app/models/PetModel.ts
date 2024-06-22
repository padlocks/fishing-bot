import { Schema, model, Document, Model } from 'mongoose';

interface IPet extends Document {
	fish: Schema.Types.ObjectId;
	aquarium?: Schema.Types.ObjectId;
	adoptTime: Date;
	name: string;
	age: number;
	owner?: string;
	traits?: object;
	health: number;
	mood: number;
	hunger: number;
	stress: number;
	xp: number;
	lastFed: Date;
	lastPlayed: Date;
	lastBred: Date;
	lastUpdated: Date;
	species: string;
	multiplier: number;
	attraction: number;
	type: string;
}

const PetSchema: Schema<IPet> = new Schema<IPet>({
	fish: {
		type: Schema.Types.ObjectId,
		ref: 'Fish',
		required: true,
	},
	aquarium: {
		type: Schema.Types.ObjectId,
		ref: 'Aquarium',
	},
	adoptTime: {
		type: Date,
		default: Date.now,
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
	},
	traits: {
		type: Object,
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
		default: Date.now,
	},
	lastPlayed: {
		type: Date,
		required: true,
		default: Date.now,
	},
	lastBred: {
		type: Date,
		required: true,
		default: Date.now,
	},
	lastUpdated: {
		type: Date,
		required: true,
		default: Date.now,
	},
	species: {
		type: String,
		required: true,
	},
	multiplier: {
		type: Number,
		required: true,
		default: 1.0,
	},
	attraction: {
		type: Number,
		required: true,
		default: 0,
	},
	type: {
		type: String,
		default: 'pet',
	},
});

const PetFish: Model<IPet> = model<IPet>('Pet', PetSchema);
export { PetFish };