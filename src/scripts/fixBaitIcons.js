// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Item, ItemData } = require('../schemas/ItemSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('Connected to MongoDB');
		const items = await Item.find({ type: 'bait' });
		const itemDatas = await ItemData.find({ type: 'bait' });
		try {
			for (const bait of items) {
				if (bait._doc.icon.data) bait.icon.data = 'Bait:1244066487489265739';
				await bait.save();
				console.log(`Updated item ${bait.name}`);
			}

			for (const bait of itemDatas) {
				if (bait._doc.icon.data) bait.icon.data = 'Bait:1244066487489265739';
				await bait.save();
				console.log(`Updated item data ${bait.name}`);
			}
		}
		catch (error) {
			console.error(error);
		}
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});
