const {model, Schema} = require('mongoose');

const rodSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	rarity: {
		type: String,
		required: true,
	},
	capabilities: {
		type: [String],
	},
	requirements: {
		type: [String],
	},
	obtained: {
		type: Date,
	},
	fishCaught: {
		type: Number,
		default: 0,
	},
	state: {
		type: String,
		enum: ['mint', 'repaired', 'broken', 'destroyed'],
		default: 'mint',
	},
	icon: {
        animated: {
            type: Boolean,
            default: false
        },
        data: {
            type: String,
            default: "rawfish:1209352519726276648"
        }
    }
});

const Rod = model('Rod', rodSchema);
module.exports = { Rod };
