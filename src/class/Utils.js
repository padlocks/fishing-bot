const chalk = require('chalk');
const mongoose = require('mongoose');
const { Fish, FishData } = require('../schemas/FishSchema');
const { Quest, QuestData } = require('../schemas/QuestSchema');
const { RodData } = require('../schemas/RodSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { BaitData } = require('../schemas/BaitSchema');
const { User } = require('../schemas/UserSchema');
const { StringSelectMenuOptionBuilder, BaseInteraction } = require('discord.js');
const { LicenseData } = require('../schemas/LicenseSchema');
const { WeatherType } = require('../schemas/WeatherTypeSchema');
const { Season } = require('../schemas/SeasonSchema');

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

	static async clone(object, userId = null) {
		try {
			const obj = typeof object.toObject === 'function' ? object.toObject() : object;
			
			if (object._id) delete obj._id;
			if (object.id) obj.id = new mongoose.Types.ObjectId();
			
			obj._id = new mongoose.Types.ObjectId(); 
			obj.clonedFrom = object._id ? object._id.toString() : null;
			if (userId) obj.user = userId;
			
			if (!obj.obtained) obj.obtained = Date.now();
			
			let newObj;
			
			switch (obj.type) {
				case 'fish': {
					newObj = new FishData(obj);
					break;
				}
				case 'item': {
					newObj = new ItemData(obj);
					break;
				}
				case 'rod': {
					newObj = new RodData(obj);
					break;
				}
				case 'user': {
					newObj = new User(obj);
					break;
				}
				case 'quest': {
					newObj = new QuestData(obj);
					break;
				}
				case 'bait': {
					newObj = new BaitData(obj);
					break;
				}
				case 'gacha': {
					newObj = new ItemData(obj);
					break;
				}
				case 'buff': {
					newObj = new ItemData(obj);
					break;
				}
				case 'license': {
					newObj = new LicenseData(obj);
					break;
				}
				case 'customrod': {
					newObj = new RodData(obj);
					break;
				}
				case 'part_rod': {
					newObj = new ItemData(obj);
					break;
				}
				case 'part_reel': {
					newObj = new ItemData(obj);
					break;
				}
				case 'part_hook': {
					newObj = new ItemData(obj);
					break;
				}
				case 'part_handle': {
					newObj = new ItemData(obj);
					break;
				}
			}
	
			await newObj.save();
	
			return newObj;
		} catch (error) {
			console.error('Error in Utils.clone:', error);
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

	static async binomialRandomInRange(n, p, min, max) {
		if (n <= 0) {
			throw new Error('n must be greater than 0');
		}
	
		if (min >= max) {
			throw new Error('max must be greater than min');
		}
	
		let successes = 0;
		for (let i = 0; i < n; i++) {
			if (Math.random() < p) {
				successes++;
			}
		}
	
		// Ensure range is positive
		const range = max - min;
		
		// Scale the result to fit within the min and max range
		const scaled = (successes / n) * range;
		const jitter = (Math.random() - 0.5) * (range * 0.1); // Add some jitter for variety
		return min + scaled + jitter;
	};
}

module.exports = { Utils };