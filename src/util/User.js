const { clone, generateXP, generateCash, getWeightedChoice } = require('./Utils');
const { Fish, FishData } = require('../schemas/FishSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { User } = require('../schemas/UserSchema');
const { Gacha } = require('../schemas/GachaSchema');
const { BuffData } = require('../schemas/BuffSchema');

const generateBoostedXP = async (userId) => {
	// check for active buffs
	const activeBuffs = await BuffData.find({ user: userId, active: true });
	const xpBuff = activeBuffs.find((buff) => buff.capabilities.includes('xp'));
	const xpMultiplier = xpBuff ? parseFloat(xpBuff.capabilities[1]) : 1;

	return generateXP(10 * xpMultiplier, 25 * xpMultiplier);
};

const generateBoostedCash = async (userId) => {
	// check for active buffs
	const activeBuffs = await BuffData.find({ user: userId, active: true });
	const cashBuff = activeBuffs.find((buff) => buff.capabilities.includes('cash'));
	const cashMultiplier = cashBuff ? parseFloat(cashBuff.capabilities[1]) : 1;

	return generateCash(10 * cashMultiplier, 100 * cashMultiplier);
};

const getEquippedRod = async (userId) => {
	let user = await User.findOne({ userId: userId });
	if (!user) user = await createUser(userId);
	const rodId = user.inventory.equippedRod.valueOf();
	if (!rodId) {
		const clonedRod = await clone(await ItemData.findOne({ name: 'Old Rod' }), userId);
		user.inventory.rods.push(clonedRod);
		user.inventory.equippedRod = clonedRod;
		await user.save();
		return clonedRod;
	}
	else {
		const rod = await ItemData.findById(rodId);
		return rod;
	}
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
			equippedBait: null,
			items: [],
			baits: [],
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

const getEquippedBait = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const baitId = user.inventory.equippedBait?.valueOf() || null;
	if (!baitId) return null;
	const bait = await ItemData.findById(baitId);
	return bait;
};

const setEquippedBait = async (userId, baitId) => {
	const user = await User.findOne({ userId: userId });
	const bait = user.inventory.baits.find((r) => r.valueOf() === baitId);

	user.inventory.equippedBait = bait;
	const baitObject = await ItemData.findById(bait?.valueOf()) || null;

	await user.save();
	return baitObject;
};

const getAllBaits = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const baitIds = user.inventory.baits;
	const baits = await ItemData.find({ _id: { $in: baitIds } });
	return baits;
};

const openBox = async (userId, name) => {
	const user = await User.findOne({ userId: userId });
	// uppercase the first letter of each word in name
	name = name.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	const box = await ItemData.findOne({ name: name, opened: false, user: userId });
	if (!box) return null;

	box.opened = true;
	await box.save();

	// check box capabilities to generate items
	const capabilities = box.capabilities;
	const weights = box.weights;
	const items = [...await Item.find({ type: { $in: capabilities } }), ...await Fish.find({ type: { $in: capabilities } })];

	// generate random item from box
	let draw = await getWeightedChoice(Object.keys(box.weights), Object.values(weights));
	draw = draw.charAt(0).toUpperCase() + draw.slice(1);

	const filteredItems = items.filter((item) => item.rarity === draw);
	const random = Math.floor(Math.random() * filteredItems.length);
	const item = filteredItems[random];

	// remove box from user inventory
	user.inventory.gacha = user.inventory.gacha.filter((i) => i._id !== box._id);

	// add item to user inventory
	const clonedItem = await clone(item, userId);
	switch (clonedItem.type) {
	case 'rod':
		user.inventory.rods.push(clonedItem);
		break;
	case 'bait':
		user.inventory.baits.push(clonedItem);
		break;
	case 'fish':
		user.inventory.fish.push(clonedItem);
		break;
	case 'buff':
		user.inventory.buffs.push(clonedItem);
		break;
	default:
		user.inventory.items.push(clonedItem);
		break;
	}
	await user.save();

	return clonedItem;
};

const generateBox = async (userId, name) => {
	const box = await Gacha.findOne({ name: name });
	const clonedBox = await clone(box, userId);
	clonedBox.obtained = Date.now();
	clonedBox.user = userId;
	await clonedBox.save();

	const user = await User.findOne({ userId: userId });
	user.inventory.gacha.push(clonedBox);
	await user.save();

	return clonedBox;
};

const sendToInventory = async (userId, item) => {
	const user = await User.findOne({ userId: userId });
	const itemObject = await Item.findById(item);
	const clonedItem = await clone(itemObject, userId);
	switch (clonedItem.type) {
	case 'rod':
		user.inventory.rods.push(item);
		break;
	case 'bait':
		user.inventory.baits.push(item);
		break;
	case 'fish':
		user.inventory.fish.push(item);
		break;
	case 'buff':
		user.inventory.buffs.push(item);
		break;
	case 'gacha':
		user.inventory.gacha.push(item);
		break;
	case 'quest':
		user.inventory.quests.push(item);
		break;
	default:
		user.inventory.items.push(item);
		break;
	}
	await user.save();
};

module.exports = {
	getEquippedRod,
	setEquippedRod,
	getEquippedBait,
	setEquippedBait,
	decreaseRodDurability,
	repairRod,
	getUser,
	createUser,
	xpToLevel,
	xpToNextLevel,
	getInventoryValue,
	getAllBaits,
	generateBoostedXP,
	generateBoostedCash,
	openBox,
	generateBox,
	sendToInventory,
};
