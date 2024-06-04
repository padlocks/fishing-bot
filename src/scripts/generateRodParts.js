require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Item } = require('../schemas/ItemSchema');

mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		generateItems();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

function generateItems() {
	const parts = [
		{
			name: 'Wooden Rod Piece',
			type: 'part_rod',
			description: 'A simple wooden rod',
			qualities: ['weak', '1', '1 count', '500 durability'],
			rarity: 'Common',
		},
		{
			name: 'Bamboo Rod Piece',
			type: 'part_rod',
			description: 'A simple bamboo rod',
			qualities: ['weak', '2', '1 count', '1000 durability'],
			rarity: 'Uncommon',
		},
		{
			name: 'Fiberglass Rod Piece',
			type: 'part_rod',
			description: 'A durable fiberglass rod',
			qualities: ['weak', 'quick', '3', '1 count', '2000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Graphite Rod Piece',
			type: 'part_rod',
			description: 'A high-quality graphite rod',
			qualities: ['weak', 'quick', '2', '2 count', '3000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Carbon Fiber Rod Piece',
			type: 'part_rod',
			description: 'A high-quality carbon fiber rod',
			qualities: ['weak', 'quick', '3', '3 count', '3500 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Composite Rod Piece',
			type: 'part_rod',
			description: 'A high-quality composite rod',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '5000 durability'],
			rarity: 'Legendary',
		},
		{
			name: 'Gold Rod Piece',
			type: 'part_rod',
			description: 'A high-quality gold rod',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '10000 durability'],
			rarity: 'Lucky',
		},
		{
			name: 'Plastic Reel',
			type: 'part_reel',
			description: 'A simple plastic reel',
			qualities: ['weak', '800 durability'],
			rarity: 'Common',
		},
		{
			name: 'Aluminum Reel',
			type: 'part_reel',
			description: 'A durable aluminum reel',
			qualities: ['weak', 'strong', '1500 durability'],
			rarity: 'Uncommon',
		},
		{
			name: 'Titanium Reel',
			type: 'part_reel',
			description: 'A high-quality titanium reel',
			qualities: ['weak', 'strong', '5000 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Spinning Reel',
			type: 'part_reel',
			description: 'A simple spinning reel',
			qualities: ['weak', '800 durability'],
			rarity: 'Common',
		},
		{
			name: 'Baitcasting Reel',
			type: 'part_reel',
			description: 'A durable baitcasting reel',
			qualities: ['weak', 'strong', '1500 durability'],
			rarity: 'Uncommon',
		},
		{
			name: 'Trolling Reel',
			type: 'part_reel',
			description: 'A high-quality trolling reel',
			qualities: ['weak', 'strong', '1', '5000 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Fly Fishing Reel',
			type: 'part_reel',
			description: 'A high-quality fly fishing reel',
			qualities: ['weak', 'strong', 'quick', '5000 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Sage Green Reel',
			type: 'part_reel',
			description: 'A high-quality sage green reel',
			qualities: ['weak', 'strong', 'quick', '2', '1 count', '5000 durability'],
			rarity: 'Legendary',
		},
		{
			name: 'Centerpin Reel',
			type: 'part_reel',
			description: 'A high-quality centerpin reel',
			qualities: ['weak', 'strong', 'quick', '1', '1 count', '2000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Jigging Reel',
			type: 'part_reel',
			description: 'A high-quality jigging reel',
			qualities: ['weak', 'strong', 'quick', '2', '1 count', '3000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Barbed Hook',
			type: 'part_hook',
			description: 'A simple barbed hook',
			qualities: ['weak', '1', '1 count', '500 durability'],
			rarity: 'Common',
		},
		{
			name: 'Circle Hook',
			type: 'part_hook',
			description: 'A durable circle hook',
			qualities: ['weak', 'strong', '1', '1 count', '1000 durability'],
			rarity: 'Uncommon',
		},
		{
			name: 'Treble Hook',
			type: 'part_hook',
			description: 'A high-quality treble hook',
			qualities: ['weak', 'strong', '2', '2 count', '2000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Jig Hook',
			type: 'part_hook',
			description: 'A high-quality jig hook',
			qualities: ['weak', 'strong', 'quick', '3', '3 count', '3000 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Swimbait Hook',
			type: 'part_hook',
			description: 'A high-quality swimbait hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '2000 durability'],
			rarity: 'Legendary',
		},
		{
			name: 'Octopus Hook',
			type: 'part_hook',
			description: 'A high-quality octopus hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '3000 durability'],
			rarity: 'Legendary',
		},
		{
			name: 'Worm Hook',
			type: 'part_hook',
			description: 'A high-quality worm hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '5000 durability'],
			rarity: 'Legendary',
		},
		{
			name: 'Wooden Handle',
			type: 'part_handle',
			description: 'A simple handle',
			qualities: ['weak', '500 durability'],
			rarity: 'Common',
		},
		{
			name: 'Cork Handle',
			type: 'part_handle',
			description: 'A durable cork handle',
			qualities: ['weak', '1000 durability'],
			rarity: 'Uncommon',
		},
		{
			name: 'EVA Handle',
			type: 'part_handle',
			description: 'A high-quality EVA handle',
			qualities: ['weak', 'strong', '2000 durability'],
			rarity: 'Rare',
		},
		{
			name: 'Carbon Fiber Handle',
			type: 'part_handle',
			description: 'A high-quality carbon fiber handle',
			qualities: ['weak', 'strong', 'quick', '3000 durability'],
			rarity: 'Ultra',
		},
		{
			name: 'Composite Handle',
			type: 'part_handle',
			description: 'A high-quality composite handle',
			qualities: ['weak', 'strong', 'quick', '5000 durability'],
			rarity: 'Legendary',
		},
	];

	parts.forEach((partData) => {
		const part = new Item(partData);
		part.save()
			.then(() => {
				console.log(`Part "${part.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating part "${part.name}":`, error);
			});
	});
}
