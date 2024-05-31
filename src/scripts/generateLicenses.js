require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { License } = require('../schemas/LicenseSchema');

mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		generateLicenses();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

function generateLicenses() {
	const licenses = [
		{
			name: 'Basic Freshwater Aquarium License',
			description: 'A basic license to own a freshwater aquarium.',
			prerequisites: [],
			qualities: ['basic'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 0,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['freshwater'],
				size: 1,
			},
			shopItem: true,
			price: 1_000_000,
			rarity: 'Common',

		},
		{
			name: 'Basic Saltwater Aquarium License',
			description: 'A basic license to own a saltwater aquarium.',
			prerequisites: [],
			qualities: ['basic'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 0,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['saltwater'],
				size: 1,
			},
			shopItem: true,
			price: 1_000_000,
			rarity: 'Common',
		},
		{
			name: 'Advanced Freshwater Aquarium License',
			description: 'An advanced license to own a freshwater aquarium.',
			prerequisites: ['Basic Freshwater Aquarium License'],
			qualities: ['advanced'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 10,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['freshwater'],
				size: 2,
			},
			shopItem: true,
			price: 5_000_000,
			rarity: 'Uncommon',
		},
		{
			name: 'Advanced Saltwater Aquarium License',
			description: 'An advanced license to own a saltwater aquarium.',
			prerequisites: ['Basic Saltwater Aquarium License'],
			qualities: ['advanced'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 10,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['saltwater'],
				size: 2,
			},
			shopItem: true,
			price: 5_000_000,
			rarity: 'Uncommon',
		},
		{
			name: 'Expert Freshwater Aquarium License',
			description: 'An expert license to own a freshwater aquarium.',
			prerequisites: ['Advanced Freshwater Aquarium License'],
			qualities: ['expert'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 20,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['freshwater'],
				size: 3,
			},
			shopItem: true,
			price: 10_000_000,
			rarity: 'Rare',
		},
		{
			name: 'Expert Saltwater Aquarium License',
			description: 'An expert license to own a saltwater aquarium.',
			prerequisites: ['Advanced Saltwater Aquarium License'],
			qualities: ['expert'],
			capabilities: [],
			biomes: [],
			requirements: {
				level: 20,
			},
			icon: {
				animated: false,
				data: 'old_rod:1210508306662301706',
			},
			aquarium: {
				waterType: ['saltwater'],
				size: 3,
			},
			shopItem: true,
			price: 10_000_000,
			rarity: 'Rare',
		},
	];

	licenses.forEach((licenseData) => {
		const license = new License(licenseData);
		license.save()
			.then(() => {
				console.log(`License "${license.name}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating license "${license.name}":`, error);
			});
	});
}
