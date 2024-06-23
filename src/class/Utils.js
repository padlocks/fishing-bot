const chalk = require('chalk');
const mongoose = require('mongoose');
const { Fish, FishData } = require('../schemas/FishSchema');
const { Quest, QuestData } = require('../schemas/QuestSchema');
const { RodData } = require('../schemas/RodSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { BaitData } = require('../schemas/BaitSchema');
const { User } = require('../schemas/UserSchema');
const { StringSelectMenuOptionBuilder } = require('discord.js');
const { LicenseData } = require('../schemas/LicenseSchema');

class Utils {
	/**
	 * Logs a message with optional styling.
	 *
	 * @param {string} string - The message to log.
	 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
	 */
	static log(string, style) {
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
	 * Whenever a string is a valid snowflake (for Discord).

	* @param {string} id
	* @returns {boolean}
	*/
	static isSnowflake(id) {
		return /^\d+$/.test(id);
	};

	static generateXP(min = 10, max = 25) {
		return Math.floor(Math.random() * (max - min) + min);
	};

	static generateCash(min = 10, max = 100) {
		return Math.floor(Math.random() * (max - min) + min);
	};

	static getRandomInteger(max) {
		return Math.floor(Math.random() * max);
	};

	static async sumArrays(arr1, arr2) {
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

	static async sumCountsInArrays (arr1, arr2) {
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

	static async getWeightedChoice(choices, weights) {
		const sumOfWeights = weights.reduce((acc, x) => acc + x, 0);
		let randomInt = this.getRandomInteger(sumOfWeights) + 1;
		for (const [index, weight] of weights.entries()) {
			randomInt = randomInt - weight;
			if (randomInt <= 0) {
				return choices[index];
			}
		}
	};

	static async clone(object, userId) {
		if (!object) return;
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
			case 'bait': {
				originalObject = await Item.findById(object.id);
				break;
			}
			case 'gacha': {
				originalObject = await Item.findById(object.id);
				break;
			}
			case 'buff': {
				originalObject = await Item.findById(object.id);
				break;
			}
			case 'license': {
				originalObject = await Item.findById(object.id);
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
			case 'gacha': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'GachaData',
				});
				break;
			}
			case 'buff': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'BuffData',
				});
				break;
			}
			case 'license': {
				clonedObject = new LicenseData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'LicenseData',
				});
				break;
			}
			case 'customrod': {
				clonedObject = new RodData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					fishCaught: 0,
					__t: 'CustomRodData',
				});
				break;
			}
			case 'part_rod': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'PartRodData',
				});
				break;
			}
			case 'part_reel': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'PartReelData',
				});
				break;
			}
			case 'part_hook': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'PartHookData',
				});
				break;
			}
			case 'part_handle': {
				clonedObject = new ItemData({
					...originalObject.toObject(),
					_id: new mongoose.Types.ObjectId(),
					user: userId,
					obtained: Date.now(),
					__t: 'PartHandleData',
				});
				break;
			}
		}

			await clonedObject.save();

			return clonedObject;
		}
		catch (error) {
			this.log('Error cloning object: ' + error, 'err');
			throw error;
		}
	};

	static async selectionOptions(type) {
		const shopItems = await Item.find({ shopItem: true, type: type }).sort({ name: 1 });
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
						.setDescription(`$${item.price.toLocaleString()} | ${item.description}`)
						.setEmoji(item.toJSON().icon.data.split(':')[1])
						.setValue(value);
				}
			}
			catch (error) {
				console.error(error);
			}
		});
	};

	static getCollectionFilter(customIds, user) {
		return i => {
			return customIds.includes(i.customId) && i.user.id === user;
		};
	};

	static capitalizeWords(str) {
		return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
	};
}

module.exports = { Utils };