const { Fish, FishData } = require('../schemas/FishSchema');
const { User } = require('../schemas/UserSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { log, clone, getWeightedChoice } = require('./Utils');

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
