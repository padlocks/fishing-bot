const { clone } = require('./Utils');
const { FishData } = require('../schemas/FishSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { User } = require('../schemas/UserSchema');

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

const getUser = async (userId) => {
	let user = await User.findOne({ userId: userId || '0' });
	if (!user) {
		user = await createUser(userId);
	}

	return user;
};

const createUser = async (userId) => {
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
};

const xpToLevel = async (xp) => {
	return Math.floor(0.1 * Math.sqrt(xp));
};

const xpToNextLevel = async (xp) => {
	const level = await xpToLevel(xp);
	const progress = xp - (level ** 2 * 100);
	const nextLevelProgress = ((level + 1) ** 2 * 100) - (level ** 2 * 100);
	return `${progress.toLocaleString()} / ${nextLevelProgress.toLocaleString()}`;
};

const getInventoryValue = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const fishIds = user.inventory.fish;
	const totalValue = await FishData.aggregate([
		{ $match: { _id: { $in: fishIds } } },
		{ $group: { _id: null, totalValue: { $sum: '$value' } } },
	]);
	return totalValue[0]?.totalValue || 0;
};

const decreaseRodDurability = async (userId, amount) => {
	const user = await User.findOne({ userId: userId });
	const rod = await ItemData.findById(user.inventory.equippedRod);

	if (rod.durability - amount <= 0) {
		rod.state = 'broken';
		rod.durability = 0;

		if (rod.repairs >= rod.maxRepairs) {
			rod.state = 'destroyed';
			user.equippedRod = null;
		}
	}
	else {
		rod.durability -= amount;
	}

	await rod.save();
	await user.save();
	return rod;
};

const repairRod = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const rod = await ItemData.findById(user.inventory.equippedRod);

	rod.repairs += 1;
	rod.durability = rod.maxDurability;
	rod.state = 'repaired';
	await rod.save();
	return rod;
};


module.exports = {
	getEquippedRod,
	setEquippedRod,
	decreaseRodDurability,
	repairRod,
	getUser,
	createUser,
	xpToLevel,
	xpToNextLevel,
	getInventoryValue,
};
