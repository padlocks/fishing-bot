const chalk = require('chalk');
const mongoose = require('mongoose');
const { Fish, FishData } = require('./schemas/FishSchema');
const { Quest, QuestData } = require('./schemas/QuestSchema');
const { RodData } = require('./schemas/RodSchema');
const { Item, ItemData } = require('./schemas/ItemSchema');
const { User } = require('./schemas/UserSchema');

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
	const rodObject = await ItemData.findOne({ name: rod, user: user });
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
	case 'Hefty Rod': {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 250, 50, 20, 10, 2, 1]];
		break;
	}
	case 'Triple Rod': {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 250, 50, 20, 10, 2, 1]];
		break;
	}
	default: {
		generation = [capabilities, ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'], [700, 250, 50, 10, 5, 2, 1]];
	}
	}
	return await sendFishToUser(...generation, user);
	// generateFish(...generation, user);
};

const generateFish = async (capabilities, choices, weights, user) => {
	const draw = getWeightedChoice(choices, weights);

	let f;
	if (draw === 'Lucky') {
		f = await Item.find({ rarity: { $in: draw } });
	}
	else {
		f = await Fish.find({ rarity: { $in: draw } });
	}

	const filteredChoices = f.filter(fishObj => {
		// Check if all capabilities match the fish's qualities
		return capabilities.some(capability => fishObj.qualities.includes(capability));
	});

	if (filteredChoices.length === 0) {
		return await generateFish(capabilities, choices, weights);
	}

	const random = Math.floor(Math.random() * filteredChoices.length);
	const choice = filteredChoices[random];

	const clonedChoice = await clone(choice, user);

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

const sendFishToUser = async (capabilities, choices, weights, user) => {
	const fishArray = [];
	const numberCapability = capabilities.find(capability => !isNaN(capability));
	if (numberCapability !== undefined) {
		// clonedChoice.count = Number(numberCapability);
		// clonedChoice.save();
		// fishArray.push(clonedChoice);

		for (let i = 0; i < numberCapability; i++) {
			const nextChoice = await generateFish(capabilities, choices, weights, user);
			fishArray.push(nextChoice);
		}
	}
	else {
		const nextChoice = await generateFish(capabilities, choices, weights, user);
		fishArray.push(nextChoice);
	}

	// remove duplicates, increase count
	const uniqueFishArray = [];
	fishArray.forEach(oneFish => {
		const countCapability = capabilities.find(capability => capability.toLowerCase().includes('count'));
		if (countCapability !== undefined) {
			const count = Number(countCapability.split(' ')[0]);
			oneFish.count = count;
		}

		const existingFish = uniqueFishArray.find(f => f.name === oneFish.name);
		if (existingFish) {
			existingFish.count++;
		}
		else {
			uniqueFishArray.push(oneFish);
		}

		oneFish.save();
	});

	return await uniqueFishArray;
};


const sellFishByRarity = async (userId, targetRarity) => {
	let totalValue = 0;
	let newFish = [];
	const user = await User.findOne({ userId: userId });

	// Use map to asynchronously process each fish
	const updatedFish = await Promise.all(user.inventory.fish.map(async (f) => {
		const fishToSell = await FishData.findById(f.valueOf());
		if (!fishToSell.locked && (targetRarity.toLowerCase() === 'all' || fishToSell.rarity.toLowerCase() === targetRarity.toLowerCase())) {
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
		log('Error updating user:' + err, 'err');
		return 0;
	}
};

const getEquippedRod = async (userId) => {
	let user = await User.findOne({ userId: userId });
	if (!user) user = await createUser(userId);
	const rodId = user.inventory.equippedRod.valueOf();
	const rod = await ItemData.findById(rodId);
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

	const rodObject = await ItemData.findById(rod.valueOf());

	// Save the updated user document
	await user.save();
	return rodObject;
};

async function clone(object, userId) {
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
		}

		await clonedObject.save();

		return clonedObject;
	}
	catch (error) {
		log('Error cloning object: ' + error, 'err');
		throw error;
	}
}

async function getUser(userId) {
	let user = await User.findOne({ userId: userId });
	if (!user) {
		user = await createUser();
	}

	return user;
}

async function createUser(userId) {
	const rod = await Item.findOne({ name: 'Old Rod' });
	const clonedRod = await clone(rod, userId);
	clonedRod.obtained = Date.now();
	const data = new User({
		userId: userId,
		commands: 0,
		xp: 0,
		inventory: {
			equippedRod: null,
			rods: [],
			fish: [],
			quests: [],
		},
		type: 'user',
	});
	data.inventory.rods.push(clonedRod);
	data.inventory.equippedRod = data.inventory.rods[0];
	await data.save();

	return data;
}

async function generateDailyQuest(userId) {
	const user = await User.findOne({ userId: userId });

	const dailies = await Quest.find({ daily: true });
	const randomIndex = Math.floor(Math.random() * dailies.length);
	const originalQuest = dailies[randomIndex];

	if (!user) {
		throw new Error('User not found');
	}
	if (user.inventory.quests.includes(originalQuest.id)) {
		return false;
	}

	const hasDailyQuest = user.inventory.quests.some(async (questId) => {
		const quest = await QuestData.findById(questId);
		return quest.daily;
	});

	if (hasDailyQuest || Date.now() - user.stats.lastDailyQuest < 864000000) {
		return false;
	}
	else {
		const quest = await clone(originalQuest);
		quest.status = 'in_progress';
		quest.user = userId;
		quest.startDate = Date.now();
		await quest.save();
		user.inventory.quests.push(quest._id);
		user.stats.lastDailyQuest = Date.now();
		await user.save();
		return quest;
	}
}

async function startQuest(userId, questId) {
	const user = await User.findOne({ userId: userId });
	const originalQuest = await Quest.findById(questId);
	const quest = await clone(originalQuest);
	if (!user) {
		throw new Error('User not found');
	}
	if (!quest) {
		throw new Error('Quest not found');
	}
	if (user.inventory.quests.includes(questId)) {
		throw new Error('User already has this quest');
	}

	quest.status = 'in_progress';
	quest.user = userId;
	quest.startDate = Date.now();
	await quest.save();
	user.inventory.quests.push(quest._id);
	await user.save();
	return quest;
}

async function getQuests(userId) {
	const user = await User.findOne({ userId: userId });
	const questIds = user.inventory.quests;
	const quests = await QuestData.find({ _id: { $in: questIds } });
	return quests;
}

async function findQuests(specificFish, specificRod, specificQualities) {
	const query = {
		'status': 'in_progress',
		$and: [],
	};

	query.$and.push({ $or: [{ 'progressType.fish': specificFish }, { 'progressType.fish': 'any' }] });
	query.$and.push({ $or: [{ 'progressType.rod': specificRod }, { 'progressType.rod': 'any' }] });
	specificQualities.map(quality => query.$and.push({ $or: [{ 'progressType.qualities': quality }, { 'progressType.qualities': 'any' }] }));

	const quests = await QuestData.find(query);
	return quests;
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
	getUser,
	createUser,
	generateDailyQuest,
	startQuest,
	getQuests,
	clone,
	findQuests,
};
