import { Schema, model, Document, Types } from 'mongoose';

interface IHabitat extends Document {
	name: string;
	size: number;
	fish: Types.ObjectId[];
	waterType: 'Freshwater' | 'Saltwater';
	temperature: number;
	cleanliness: number;
	createdAt: Date;
	owner: string;
	lastCleaned: Date;
	lastAdjusted: Date;
	type: string;
}

const AquariumSchema = new Schema<IHabitat>({
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
	createdAt: {
		type: Date,
		default: Date.now,
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
});

const Habitat = model<IHabitat>('Habitat', AquariumSchema);
export { Habitat };