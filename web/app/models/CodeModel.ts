import { Schema, model, Document, Types } from 'mongoose';

interface ICode extends Document {
	code: string;
	uses: number;
	usesLeft: number;
	type: string;
	money?: number;
	items?: Types.ObjectId[];
	createdAt: Date;
	expiresAt: Date;
}

const CodeSchema = new Schema<ICode>({
	code: {
		type: String,
		required: true,
	},
	uses: {
		type: Number,
		required: true,
		default: 1,
	},
	usesLeft: {
		type: Number,
		required: true,
		default: 1,
	},
	type: {
		type: String,
		required: true,
		default: 'code',
	},
	money: {
		type: Number,
		default: 0,
	},
	items: [{
		type: Schema.Types.ObjectId,
	}],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expiresAt: {
		type: Date,
		default: Date.now,
	},
});

const Code = model<ICode>('Code', CodeSchema);
export { Code };
