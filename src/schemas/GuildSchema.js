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
	channels: {
		type: [String],
		default: [],
	}
}, { timestamps: true });


const Guild = model('Guild', GuildSchema);
module.exports = { Guild };