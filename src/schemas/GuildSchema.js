const { model, Schema } = require('mongoose');

const GuildSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	prefix: {
		type: String,
		default: '/',
	},
	ponds: {
		type: [String],
		default: [],
	},
});


const Guild = model('Guild', GuildSchema);
module.exports = { Guild };