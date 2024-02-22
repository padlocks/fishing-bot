const { model, Schema } = require('mongoose');

const FishSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    rarity: {
        type: String,
        default: "Common"
    },
    value: {
        type: Number,
        default: 10
    },
    locked: {
        type: Boolean,
        default: false
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

const Fish = model('Fish', FishSchema, 'fish');
module.exports = { Fish }