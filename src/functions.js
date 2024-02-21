const chalk = require('chalk');
const {Fish} = require('./schemas/FishSchema');
const {User} = require('./schemas/UserSchema');

/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
	const styles = {
		info: {prefix: chalk.blue('[INFO]'), logFunction: console.log},
		err: {prefix: chalk.red('[ERROR]'), logFunction: console.error},
		warn: {prefix: chalk.yellow('[WARNING]'), logFunction: console.warn},
		done: {prefix: chalk.green('[SUCCESS]'), logFunction: console.log},
	};

	const selectedStyle = styles[style] || {logFunction: console.log};
	selectedStyle.logFunction(`${selectedStyle.prefix || ''} ${string}`);
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ''}>`;

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id
 * @returns {boolean}
 */
const isSnowflake = id => /^\d+$/.test(id);

const generateXP = (min = 10, max = 25) => Math.floor(Math.random() * (max - min) + min);

const generateCash = (min = 10, max = 100) => Math.floor(Math.random() * (max - min) + min);

function getRandomInteger(max) {
	return Math.floor(Math.random() * max);
}

function getWeightedChoice(choices, weights) {
	const sumOfWeights = weights.reduce((acc, x) => acc + x, 0);
	let randomInt = getRandomInteger(sumOfWeights) + 1;
	for (const [index, weight] of weights.entries()) {
		randomInt -= weight;
		if (randomInt <= 0) {
			return choices[index];
		}
	}

	throw new Error('This shouldn’t happen');
}

const fish = async rod => generateFish(['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary'], [500, 250, 50, 10, 5, 1]);

const generateFish = async (choices, weights) => {
	const draw = getWeightedChoice(choices, weights);
	const count = await Fish.find().count({rarity: draw});
	const random = Math.floor(Math.random() * count);
	const choice = await Fish.findOne({rarity: draw}).skip(random);
	return choice;
};

const sellFishByRarity = async (userId, targetRarity) => {
	let totalValue = 0;
	let newFish = [];
	const user = await User.findOne({userId});

	// Use map to asynchronously process each fish
	const updatedFish = await Promise.all(user.inventory.fish.map(async f => {
		const fish = await Fish.findById(f.valueOf());
		if (targetRarity.toLowerCase() === 'all' || fish.rarity.toLowerCase() === targetRarity.toLowerCase()) {
			totalValue += fish.value;
			return null; // Filter out the fish with the target rarity
		}

		return f; // Keep the fish with other rarities
	}));

	// Remove null values from the updatedFish array
	newFish = updatedFish.filter(f => f !== null);

	const newMoney = user.inventory.money + totalValue; // Calculate updated money

	try {
		const updatedUser = await User.findOneAndUpdate(
			{userId: user.userId},
			{$set: {'inventory.fish': newFish, 'inventory.money': newMoney}},
			{new: true},
		);

		if (!updatedUser) {
			return 0; // Return 0 if the user is not found
		}

		return totalValue; // Return the total value of sold fish
	} catch (err) {
		return console.error(err); // Return 0 in case of an error
	}
};

module.exports = {
	log,
	time,
	isSnowflake,
	generateXP,
	generateCash,
	generateFish,
	fish,
	sellFishByRarity,
};
