const chalk = require('chalk');
const mongoose = require('mongoose');
const { Fish, FishData } = require('../schemas/FishSchema');
const { Quest, QuestData } = require('../schemas/QuestSchema');
const { RodData } = require('../schemas/RodSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { BaitData } = require('../schemas/BaitSchema');
const { User } = require('../schemas/UserSchema');
const { StringSelectMenuOptionBuilder } = require('discord.js');

/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
	const styles = {
		info: { prefix: chalk.blue('[INFO]'), logFunction: console.log },
		err: { prefix: chalk.red('[ERROR]'), logFunction: console.error },
		warn: { prefix: chalk.yellow('[WARNING]'), logFunction: console.warn },
		done: { prefix: chalk.green('[SUCCESS]'), logFunction: console.log },
	};

	const selectedStyle = styles[style] || { logFunction: console.log };
	selectedStyle.logFunction(`${selectedStyle.prefix || ''} ${string}`);
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (t, style) => {
	return `<t:${Math.floor(t / 1000)}${style ? `:${style}` : ''}>`;
};

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id
 * @returns {boolean}
 */
const isSnowflake = (id) => {
	return /^\d+$/.test(id);
};

const generateXP = (min = 10, max = 25) => {
	return Math.floor(Math.random() * (max - min) + min);
};

const generateCash = (min = 10, max = 100) => {
	return Math.floor(Math.random() * (max - min) + min);
};

const getRandomInteger = (max) => {
	return Math.floor(Math.random() * max);
};

const sumArrays = async (arr1, arr2) => {
	if (arr1.length == arr2.length) {
		const sum = [];
		for (let i = 0; i < arr1.length; i++) {
			sum.push(arr1[i] + arr2[i]);
		}
		return sum;
	}
	else if (arr1.length > arr2.length) {
		return arr1;
	}
	else {
		return arr2;
	}
};

const sumCountsInArrays = async (arr1, arr2) => {
	const arrays = arr1.concat(arr2);
	const result = [];

	for (let i = 0; i < arrays.length; i++) {
		const countMatch = arrays[i].match(/\d+ count/);
		const numberMatch = arrays[i].match(/^\d+$/);

		if (countMatch) {
			const matches = countMatch.map(match => parseInt(match));
			const sum = matches.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
			result.push(`${sum} count`);
		}
		else if (numberMatch) {
			const sum = numberMatch.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
			result.push(`${sum}`);
		}
		else {
			result.push(arrays[i]);
		}
	}

	return result;
};

const getWeightedChoice = async (choices, weights) => {
	const sumOfWeights = weights.reduce((acc, x) => acc + x, 0);
	let randomInt = getRandomInteger(sumOfWeights) + 1;
	for (const [index, weight] of weights.entries()) {
		randomInt = randomInt - weight;
		if (randomInt <= 0) {
			return choices[index];
		}
	}
};

const clone = async (object, userId) => {
	try {
		let originalObject;

		switch (object.type) {
		case 'fish': {
			originalObject = await Fish.findById(object.id);
			break;
		}
		case 'item': {
			originalObject = await Item.findById(object.id);
			break;
		}
		case 'rod': {
			originalObject = await Item.findById(object.id);
			break;
		}
		case 'user': {
			originalObject = await User.findById(object.id);
			break;
		}
		case 'quest': {
			originalObject = await Quest.findById(object.id);
			break;
		}
		default: {
			originalObject = await Item.findById(object.id);
			break;
		}
		}

		if (!originalObject) {
			throw new Error('Original object not found');
		}

		let clonedObject;

		switch (object.type) {
		case 'fish': {
			clonedObject = new FishData({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				obtained: Date.now(),
				count: 1,
				__t: 'FishData',
			});
			break;
		}
		case 'item': {
			clonedObject = new ItemData({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				obtained: Date.now(),
				__t: 'ItemData',
			});
			break;
		}
		case 'rod': {
			clonedObject = new RodData({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				obtained: Date.now(),
				fishCaught: 0,
				__t: 'RodData',
			});
			break;
		}
		case 'user': {
			clonedObject = new User({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				__t: 'User',
			});
			break;
		}
		case 'quest': {
			clonedObject = new QuestData({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				startDate: Date.now(),
				__t: 'QuestData',
			});
			break;
		}
		case 'bait': {
			clonedObject = new BaitData({
				...originalObject.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				obtained: Date.now(),
				count: 1,
				__t: 'BaitData',
			});
			break;
		}
		}

		await clonedObject.save();

		return clonedObject;
	}
	catch (error) {
		log('Error cloning object: ' + error, 'err');
		throw error;
	}
};

const selectionOptions = async (type) => {
	const shopItems = await Item.find({ shopItem: true, type: type });
	const uniqueValues = new Set();

	return shopItems.map(async (objectId) => {
		try {
			const item = await Item.findById(objectId.valueOf());
			const name = item.name;
			const value = item._id.toString();

			if (item.state && item.state === 'destroyed') {
				return;
			}

			// Check if the value is unique
			if (!uniqueValues.has(name)) {
				uniqueValues.add(name);

				return new StringSelectMenuOptionBuilder()
					.setLabel(item.name)
					.setDescription(`$${item.price} | ${item.description}`)
					.setEmoji(item.toJSON().icon.data.split(':')[1])
					.setValue(value);
			}
		}
		catch (error) {
			console.error(error);
		}
	});
};

module.exports = {
	log,
	time,
	isSnowflake,
	generateXP,
	generateCash,
	clone,
	getWeightedChoice,
	sumArrays,
	sumCountsInArrays,
	selectionOptions,
};
