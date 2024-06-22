import { Schema, Document, model, Model } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface ILicense extends Document {
	capabilities: string[];
	biomes: string[];
	requirements: {
		level: number;
	};
	obtained: Date;
	icon: {
		animated: boolean;
		data: string;
	};
	aquarium: {
		waterType: string[];
		size: number;
	};
	type: string;
}

const LicenseSchema: Schema<ILicense> = new Schema<ILicense>({
	capabilities: {
		type: [String],
	},
	biomes: {
		type: [String],
	},
	requirements: {
		level: {
			type: Number,
			default: 0,
		},
	},
	obtained: {
		type: Date,
		default: Date.now,
	},
	icon: {
		animated: {
			type: Boolean,
			default: false,
		},
		data: {
			type: String,
			default: 'old_rod:1210508306662301706',
		},
	},
	aquarium: {
		waterType: {
			type: [String],
			default: ['freshwater'],
		},
		size: {
			type: Number,
			default: 1,
		},
	},
	type: {
		type: String,
		default: 'license',
	},
});

const License: Model<ILicense> = Item.discriminator<ILicense>('License', LicenseSchema);
const LicenseData: Model<ILicense> = ItemData.discriminator<ILicense>('LicenseData', LicenseSchema);

export { License, LicenseData };
