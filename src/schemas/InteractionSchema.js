const { model, Schema } = require('mongoose');

const interactionSchema = new Schema({
	command: {
		type: Schema.Types.ObjectId,
		ref: 'Command',
	},
	user: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		default: Date.now,
	},
	channel: {
		type: String,
	},
	guild: {
		type: String,
	},
	interactions: {
		type: [Object],
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'failed'],
		default: 'pending',
	},
	statusMessage: {
		type: String,
		default: '',
	},
	type: {
		type: String,
		default: 'interaction',
	},
}, { timestamps: true });

const Interaction = model('Interaction', interactionSchema);
module.exports = { Interaction };
