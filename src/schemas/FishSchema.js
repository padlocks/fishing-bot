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
    }
});

const Fish = model('Fish', FishSchema, 'fish');
module.exports = { Fish }