import { model, Schema, Document } from 'mongoose';

interface IItem extends Document {
	name: string;
	description: string;
	prerequisites?: string[];
	rarity: string;
	price: number;
	type: string;
	user?: string;
	shopItem: boolean;
	qualities?: string[];
	icon: {
		animated: boolean;
		data: string;
	};
}

const itemSchema = new Schema<IItem>({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	prerequisites: {
		type: [String],
	},
	rarity: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
		default: 0,
	},
	type: {
		type: String,
		default: 'item',
	},
	user: {
		type: String,
	},
	shopItem: {
		type: Boolean,
		default: false,
	},
	qualities: {
		type: [String],
		default: ['weak'],
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
});

const Item = model<IItem>('Item', itemSchema);
const ItemData = model<IItem>('ItemData', itemSchema);
export { Item, ItemData };
