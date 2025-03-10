const { model, Schema } = require('mongoose');

const commandSchema = new Schema({
	user: {
		type: String,
		required: true,
	},
	command: {
		type: String,
		required: true,
	},
	options: {
		type: Object,
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
	interaction: {
		type: Object,
	},
	chainedTo: {
		type: Schema.Types.ObjectId,
		ref: 'Interaction',
		required: true,
	},
	type: {
		type: String,
		default: 'command',
	},
}, { timestamps: true });

const Command = model('Command', commandSchema);
module.exports = { Command };
