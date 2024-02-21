const {model, Schema} = require('mongoose');

const questSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	rewards: {
		type: [String],
	},
	level: {
		type: Number,
		required: true,
	},
	requirements: {
		type: String,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	progress: {
		type: Number,
		default: 0,
	},
	status: {
		type: String,
		enum: ['pending', 'in_progress', 'completed', 'failed'],
		default: 'pending',
	},
});

const Quest = model('Quest', questSchema);
module.exports = Quest;
