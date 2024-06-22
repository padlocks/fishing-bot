import { Schema, model, Document } from 'mongoose';

interface IPond extends Document {
	id: string;
	count: number;
	maximum: number;
	lastFished: number;
	warning: boolean;
}

const PondSchema = new Schema<IPond>({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	count: {
		type: Number,
		default: 2000,
	},
	maximum: {
		type: Number,
		default: 2000,
	},
	lastFished: {
		type: Number,
		default: 0,
	},
	warning: {
		type: Boolean,
		default: false,
	},
});

const Pond = model<IPond>('Pond', PondSchema);
export { Pond };