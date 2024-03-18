const { Fish, FishData } = require('../schemas/FishSchema');
const { User } = require('../schemas/UserSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { log, clone, getWeightedChoice, sumArrays, sumCountsInArrays } = require('./Utils');

const fish = async (rod, bait, biome, user) => {
	const rodObject = await ItemData.findOne({ name: rod, user: user });
	const rarities = Object.keys(rodObject.weights);
	let capabilities = rodObject.capabilities;
	let weights = Object.values(rodObject.weights);

	if (biome in (bait?.biomes ?? [])) {
		capabilities = await sumCountsInArrays(rodObject.capabilities, bait.capabilities);
		weights = await sumArrays(Object.values(rodObject.weights), Object.values(bait.weights));
	}

	return await sendFishToUser(capabilities, rarities, weights, user);
};

const generateFish = async (capabilities, choices, weights, user) => {
	const userData = await User.findOne({ userId: user });
	let draw = await getWeightedChoice(choices, weights);
	draw = draw.charAt(0).toUpperCase() + draw.slice(1);
	const biome = userData.currentBiome.charAt(0).toUpperCase() + userData.currentBiome.slice(1);

	let f = await Fish.find({ rarity: draw, biome: biome });
	if (draw === 'Lucky') {
		const itemFind = await getWeightedChoice(['fish, item'], [80, 20]);
		if (itemFind === 'item') {
			f = await Item.find({ rarity: draw });
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

	const clonedChoice = await clone(choice, user);

	// Check for locked status and update the cloned fish as necessary.
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

	const updatedFish = await Promise.all(user.inventory.fish.map(async (f) => {
		const fishToSell = await FishData.findById(f.valueOf());
		if (!fishToSell.locked && (targetRarity.toLowerCase() === 'all' || fishToSell.rarity.toLowerCase() === targetRarity.toLowerCase())) {
			totalValue += fishToSell.value;
			return null;
		}
		return f;
	}));

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

const getFishCount = async (userId, fishName) => {
	const user = await User.findOne({ userId: userId });
	const fishIds = user.inventory.fish;
	const fishList = await FishData.find({ _id: { $in: fishIds }, name: fishName });

	let total = 0;
	fishList.forEach(f => {
		total += f.count;
	});

	return total;
};

module.exports = {
	fish,
	generateFish,
	sendFishToUser,
	sellFishByRarity,
	getFishCount,
};
