const chalk = require('chalk');
const mongoose = require('mongoose');
const { Fish, FishData } = require('./schemas/FishSchema');
const { User } = require('./schemas/UserSchema');
const { Rod, RodData } = require('./schemas/RodSchema');


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

function getRandomInteger(max) {
	return Math.floor(Math.random() * max);
}
function getWeightedChoice(choices, weights) {
	const sumOfWeights = weights.reduce((acc, x) => acc + x, 0);
	let randomInt = getRandomInteger(sumOfWeights) + 1;
	for (const [index, weight] of weights.entries()) {
		randomInt = randomInt - weight;
		if (randomInt <= 0) {
			return choices[index];
		}
	}
}

const fish = async (rod, user) => {
	let generation;
	const rodObject = await RodData.findOne({ name: rod, user: user });
	const capabilities = rodObject.capabilities;
	switch (rod) {
	case 'Old Rod': {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 250, 50, 20, 10, 2, 1]];
		break;
	}
	case 'Lucky Rod': {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 50, 250, 20, 10, 2, 1]];
		break;
	}
	default: {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 250, 50, 10, 5, 2, 1]];
	}
	}
	return await generateFish(...generation, user);
};

const generateFish = async (capabilities, choices, weights, user) => {
	const draw = getWeightedChoice(choices, weights);

	if (draw === 'Lucky') {
		const luckyRod = await Rod.findOne({ name: 'Lucky Rod' });
		const clonedLuckyRod = await cloneRod(luckyRod._id, user);
		return clonedLuckyRod;
	}

	const f = await Fish.find({ rarity: { $in: draw } });

	const filteredChoices = f.filter(fishObj => {
		// Check if all capabilities match the fish's qualities
		return capabilities.some(capability => fishObj.qualities.includes(capability));
	});

	if (filteredChoices.length === 0) {
		return await generateFish(capabilities, choices, weights);
	}

	const random = Math.floor(Math.random() * filteredChoices.length);
	const choice = filteredChoices[random];
	const clonedChoice = await cloneFish(choice.name, user);

	// Check for locked status and update the cloned fish as necessary.
	const userData = await User.findOne({ userId: user });

	if (userData) {
		const fishIds = userData.inventory.fish;
		const lockedFishToUpdate = await FishData.find({ _id: { $in: fishIds }, name: clonedChoice.name, locked: true });

		if (lockedFishToUpdate.length > 0) {
			const updateOperations = lockedFishToUpdate.map(fishToUpdate => ({
				updateOne: {
					filter: { _id: fishToUpdate._id },
					update: { locked: true },
				},
			}));

			await FishData.bulkWrite(updateOperations);
		}
	}

	return clonedChoice;
};

const sellFishByRarity = async (userId, targetRarity) => {
	let totalValue = 0;
	let newFish = [];
	const user = await User.findOne({ userId: userId });

	// Use map to asynchronously process each fish
	const updatedFish = await Promise.all(user.inventory.fish.map(async (f) => {
		const fishToSell = await FishData.findById(f.valueOf());
		if (!fishToSell.locked && targetRarity.toLowerCase() === 'all' || fishToSell.rarity.toLowerCase() === targetRarity.toLowerCase()) {
			totalValue += fishToSell.value;
			return null;
		}
		return f;
	}));

	// Remove null values from the updatedFish array
	newFish = updatedFish.filter(f => f !== null);

	const newMoney = user.inventory.money + totalValue;

	try {
		const updatedUser = await User.findOneAndUpdate(
			{ userId: user.userId },
			{ $set: { 'inventory.fish': newFish, 'inventory.money': newMoney } },
			{ new: true },
		);

		if (!updatedUser) {
			return 0;
		}

		return totalValue;
	}
	catch (err) {
		return 0;
	}
};

const getEquippedRod = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const rodId = user.inventory.equippedRod.valueOf();
	const rod = await RodData.findById(rodId);
	return rod;
};

const setEquippedRod = async (userId, rodId) => {
	const user = await User.findOne({ userId: userId });
	// Find the rod in user's inventory by name
	const rod = user.inventory.rods.find((r) => r.valueOf() === rodId);

	if (!rod) {
		throw new Error('Rod not found in inventory');
	}

	// Set the equippedRod field to the ObjectId of the found rod
	user.inventory.equippedRod = rod;

	const rodObject = await RodData.findById(rod.valueOf());

	// Save the updated user document
	await user.save();
	return rodObject;
};

async function cloneRod(originalRodId, userId) {
	try {
	// Find the original rod by ID
		const originalRod = await Rod.findById(originalRodId);

		if (!originalRod) {
			throw new Error('Original rod not found');
		}

		// Create a new rod with the same properties as the original
		const clonedRod = new RodData({
			...originalRod.toObject(),
			_id: new mongoose.Types.ObjectId(),
			user: userId,
		});

		// Save the cloned rod
		await clonedRod.save();

		return clonedRod;
	}
	catch (error) {
		console.error('Error cloning rod:', error.message);
		throw error;
	}
}

async function cloneFish(fishName, userId) {
	try {
		const originalFish = await Fish.findOne({ name: fishName });

		if (!originalFish) {
			throw new Error('Original fish not found');
		}

		// Create a new fish with the same properties as the original
		const clonedFish = new FishData({
			...originalFish.toObject(),
			_id: new mongoose.Types.ObjectId(),
			user: userId,
		});

		// Save the cloned fish
		clonedFish.obtained = Date.now();
		await clonedFish.save();

		return clonedFish;
	}
	catch (error) {
		console.error('Error cloning rod:', error.message);
		throw error;
	}
}


module.exports = {
	log,
	time,
	isSnowflake,
	generateXP,
	generateCash,
	generateFish,
	fish,
	sellFishByRarity,
	getEquippedRod,
	setEquippedRod,
	cloneRod,
	cloneFish,
};
