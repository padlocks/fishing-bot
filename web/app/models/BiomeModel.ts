import { Schema, model, Document } from 'mongoose';

interface IBiome extends Document {
	name: string;
	requirements?: string[];
	icon: {
		animated: boolean;
		data: string;
	};
	type: string;
}

const biomeSchema = new Schema<IBiome>({
	name: {
		type: String,
		required: true,
	},
	requirements: {
		type: [String],
	},
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
	type: {
		type: String,
		default: 'biome',
	},
});

const Biome = model<IBiome>('Biome', biomeSchema);
export { Biome };
