require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Code } = require('../schemas/CodeSchema');

mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		generateCodes();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

function generateCodes() {
	const codes = [
		{
			code: 'BETATEST',
			uses: 50,
			usesLeft: 50,
			type: 'code',
			money: 100_000_000_000,
			items: ['65ea116fd90978048b01e514', '65d7a4f0720ff503dd5b43d8'],
			expiresAt: new Date('2024-06-30'),
		},
	];

	codes.forEach((codeData) => {
		const code = new Code(codeData);
		code.save()
			.then(() => {
				console.log(`Code "${code.code}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating code "${code.code}":`, error);
			});
	});
}
