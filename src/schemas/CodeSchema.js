const { model, Schema } = require('mongoose');

const CodeSchema = new Schema({
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
	expiresAt: {
		type: Date,
		default: Date.now,
	},
}, { timestamps: true });

const Code = model('Code', CodeSchema);
module.exports = { Code };
