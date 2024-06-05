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
			description: 'A common wooden rod',
			qualities: ['weak', '1', '1 count', '500 durability'],
			rarity: 'Common',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Bamboo Rod Piece',
			type: 'part_rod',
			description: 'An uncommon bamboo rod',
			qualities: ['weak', '2', '1 count', '1000 durability'],
			rarity: 'Uncommon',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Fiberglass Rod Piece',
			type: 'part_rod',
			description: 'A rare fiberglass rod',
			qualities: ['weak', 'quick', '3', '1 count', '2000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Graphite Rod Piece',
			type: 'part_rod',
			description: 'A rare graphite rod',
			qualities: ['weak', 'quick', '2', '2 count', '3000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Carbon Fiber Rod Piece',
			type: 'part_rod',
			description: 'An ultra carbon fiber rod',
			qualities: ['weak', 'quick', '3', '3 count', '3500 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Composite Rod Piece',
			type: 'part_rod',
			description: 'A legendary composite rod',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '5000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Gold Rod Piece',
			type: 'part_rod',
			description: 'A lucky gold rod',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '10000 durability'],
			rarity: 'Lucky',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Plastic Reel',
			type: 'part_reel',
			description: 'A common plastic reel',
			qualities: ['weak', '800 durability'],
			rarity: 'Common',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Aluminum Reel',
			type: 'part_reel',
			description: 'An uncommon aluminum reel',
			qualities: ['weak', 'strong', '1500 durability'],
			rarity: 'Uncommon',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Titanium Reel',
			type: 'part_reel',
			description: 'An ultra titanium reel',
			qualities: ['weak', 'strong', '5000 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Spinning Reel',
			type: 'part_reel',
			description: 'A common spinning reel',
			qualities: ['weak', '800 durability'],
			rarity: 'Common',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Baitcasting Reel',
			type: 'part_reel',
			description: 'An uncommon baitcasting reel',
			qualities: ['weak', 'strong', '1500 durability'],
			rarity: 'Uncommon',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Trolling Reel',
			type: 'part_reel',
			description: 'An ultra trolling reel',
			qualities: ['weak', 'strong', '1', '5000 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Fly Fishing Reel',
			type: 'part_reel',
			description: 'A ultra fly fishing reel',
			qualities: ['weak', 'strong', 'quick', '5000 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Sage Green Reel',
			type: 'part_reel',
			description: 'A legendary sage green reel',
			qualities: ['weak', 'strong', 'quick', '2', '1 count', '5000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Centerpin Reel',
			type: 'part_reel',
			description: 'A rare centerpin reel',
			qualities: ['weak', 'strong', 'quick', '1', '1 count', '2000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Jigging Reel',
			type: 'part_reel',
			description: 'A rare jigging reel',
			qualities: ['weak', 'strong', 'quick', '2', '1 count', '3000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Lead_Bobber:1244066505755459674',
			},
		},
		{
			name: 'Barbed Hook',
			type: 'part_hook',
			description: 'A common barbed hook',
			qualities: ['weak', '1', '1 count', '500 durability'],
			rarity: 'Common',
			icon: {
				animated: false,
				data: 'Barbed_Hook:1244066488969596949',
			},
		},
		{
			name: 'Circle Hook',
			type: 'part_hook',
			description: 'An uncommon circle hook',
			qualities: ['weak', 'strong', '1', '1 count', '1000 durability'],
			rarity: 'Uncommon',
			icon: {
				animated: false,
				data: 'Barbed_Hook:1244066488969596949',
			},
		},
		{
			name: 'Treble Hook',
			type: 'part_hook',
			description: 'A rare treble hook',
			qualities: ['weak', 'strong', '2', '2 count', '2000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Barbed_Hook:1244066488969596949',
			},
		},
		{
			name: 'Jig Hook',
			type: 'part_hook',
			description: 'An ultra jig hook',
			qualities: ['weak', 'strong', 'quick', '3', '3 count', '3000 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Barbed_Hook:1244066488969596949',
			},
		},
		{
			name: 'Swimbait Hook',
			type: 'part_hook',
			description: 'A legendary swimbait hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '2000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Wild_Bait:1244066803936661540',
			},
		},
		{
			name: 'Octopus Hook',
			type: 'part_hook',
			description: 'A legendary octopus hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '3000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Wild_Bait:1244066803936661540',
			},
		},
		{
			name: 'Worm Hook',
			type: 'part_hook',
			description: 'A legendary worm hook',
			qualities: ['weak', 'strong', 'quick', '5', '3 count', '5000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Wild_Bait:1244066803936661540',
			},
		},
		{
			name: 'Wooden Handle',
			type: 'part_handle',
			description: 'A simple handle',
			qualities: ['weak', '500 durability'],
			rarity: 'Common',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Cork Handle',
			type: 'part_handle',
			description: 'A durable cork handle',
			qualities: ['weak', '1000 durability'],
			rarity: 'Uncommon',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'EVA Handle',
			type: 'part_handle',
			description: 'A high-quality EVA handle',
			qualities: ['weak', 'strong', '2000 durability'],
			rarity: 'Rare',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Carbon Fiber Handle',
			type: 'part_handle',
			description: 'A high-quality carbon fiber handle',
			qualities: ['weak', 'strong', 'quick', '3000 durability'],
			rarity: 'Ultra',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
		},
		{
			name: 'Composite Handle',
			type: 'part_handle',
			description: 'A high-quality composite handle',
			qualities: ['weak', 'strong', 'quick', '5000 durability'],
			rarity: 'Legendary',
			icon: {
				animated: false,
				data: 'Stick:1247950254360363078',
			},
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
