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
	time: {
		type: Number,
	},
	channel: {
		type: String,
	},
	guild: {
		type: String,
	},
	type: {
		type: String,
		default: 'command',
	},
});

const Command = model('Command', commandSchema);
module.exports = { Command };
