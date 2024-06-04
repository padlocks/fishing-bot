const { Fish, FishData } = require('../schemas/FishSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { BuffData } = require('../schemas/BuffSchema');
const { getWeightedChoice, sumArrays, sumCountsInArrays } = require('./Utils');
const { User, getUser } = require('../class/User');

const fish = async (rod, bait, biome, user) => {
	const rodObject = await ItemData.findById(rod);
	const rarities = Object.keys(rodObject.weights);
	let capabilities = rodObject.capabilities;
	let weights = Object.values(rodObject.weights);
	biome = biome.toLowerCase();

	if (bait && (bait.biomes.includes(biome))) {
		capabilities = await sumCountsInArrays(rodObject.capabilities, bait.capabilities);
		weights = await sumArrays(Object.values(rodObject.weights), Object.values(bait.weights));
	}

	return await sendFishToUser(capabilities, rarities, weights, user);
};

const generateFish = async (capabilities, choices, weights, user) => {
	// const userData = await User.findOne({ userId: user });
	let draw = await getWeightedChoice(choices, weights);
	draw = draw.charAt(0).toUpperCase() + draw.slice(1);
	const currentBiome = await user.getCurrentBiome();
	const biome = currentBiome.charAt(0).toUpperCase() + currentBiome.slice(1);

	let f = await Fish.find({ rarity: draw, biome: biome });
	if (draw === 'Lucky') {
		const itemFind = await getWeightedChoice(['fish', 'item'], [80, 20]);
		if (itemFind === 'item') {
			const options = await Item.find({ rarity: draw });
			const random = Math.floor(Math.random() * options.length);
			f = [options[random]];
		}
	}
	const filteredChoices = await Promise.all(f.map(async fishObj => {
		await new Promise(resolve => setTimeout(resolve, 100));

		const isMatch = capabilities.some(capability => fishObj.qualities.includes(capability));

		if (isMatch) {
			return fishObj;
		}
		else {
			return null;
		}
	}));

	// Remove null values (fish that didn't match the capabilities) from the array
	const validChoices = filteredChoices.filter(choice => choice !== null);

	if (validChoices.length === 0) {
		return await generateFish(capabilities, choices, weights, user);
	}

	const random = Math.floor(Math.random() * validChoices.length);
	const choice = validChoices[random];

	// const clonedChoice = await clone(choice, user);
	const clonedChoice = await user.sendToInventory(choice, 1);

	// Check for locked status and update the cloned fish as necessary.
	if (user) {
		const fishIds = (await user.getInventory()).fish;
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
		for (let i = 0; i < numberCapability; i++) {
			const nextChoice = await generateFish(capabilities, choices, weights, user);
			fishArray.push(nextChoice);
		}
	}
	else {
		const nextChoice = await generateFish(capabilities, choices, weights, user);
		fishArray.push(nextChoice);
	}

	const uniqueFishArray = [];
	fishArray.forEach(oneFish => {
		const countCapability = capabilities.find(capability => capability.toLowerCase().includes('count'));
		if (countCapability !== undefined) {
			const count = Number(countCapability.split(' ')[0]);
			oneFish.count = count;
		}

		const existingFish = uniqueFishArray.find(f => f.item.name === oneFish.item.name);
		if (existingFish) {
			existingFish.item.count++;
		}
		else {
			uniqueFishArray.push(oneFish);
		}

		oneFish.item.save();
	});

	return await uniqueFishArray.map(element => element.item);
};

const sellFishByRarity = async (userId, targetRarity) => {
	let totalValue = 0;
	const fishToRemove = [];
	const user = new User(await getUser(userId));

	// check for buffs
	const activeBuffs = await BuffData.find({ user: userId, active: true });
	const cashBuff = activeBuffs.find((buff) => buff.capabilities.includes('cash'));
	const cashMultiplier = cashBuff ? parseFloat(cashBuff.capabilities[1]) : 1;

	const fishList = await user.getFish();
	fishList.forEach(async (f) => {
		if (f.rarity.toLowerCase() === targetRarity.toLowerCase() || targetRarity.toLowerCase() === 'all') {
			totalValue += f.value * cashMultiplier * f.count;
			fishToRemove.push(f._id);
		}
	});

	await user.removeListOfFish(fishToRemove);
	await user.addMoney(totalValue);

	return totalValue;
};

const getFishCount = async (userId, fishName) => {
	const user = new User(await getUser(userId));
	const fishIds = (await user.getInventory()).fish;
	const fishList = await FishData.find({ _id: { $in: fishIds }, name: fishName });

	let total = 0;
	fishList.forEach(f => {
		total += f.count;
	});

	return total;
};

const getFishByName = async (fishName) => {
	const capitalized = fishName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	return await Fish.findOne({ name: capitalized });
};

module.exports = {
	fish,
	generateFish,
	sendFishToUser,
	sellFishByRarity,
	getFishCount,
	getFishByName,
};
