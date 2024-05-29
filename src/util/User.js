const { clone, generateXP, generateCash, getWeightedChoice } = require('./Utils');
const { Fish, FishData } = require('../schemas/FishSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { User } = require('../schemas/UserSchema');
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

	const boxes = user.inventory.gacha.filter((box) => !box.opened && box.name !== name);
	if (boxes.length === 0) return null;

	const box = await ItemData.findById(boxes[0]);
	if (!box.opened) {
		box.opened = true;
		await box.save();

		// remove box from user inventory
		user.inventory.gacha = user.inventory.gacha.filter((i) => i.valueOf() !== box.id);
		await user.save();

		// check box capabilities to generate items
		const capabilities = box.capabilities;
		const weights = box.weights;
		let items = [...await Item.find({ type: { $in: capabilities } })];
		if (capabilities.includes('fish')) {
			items = [...items, ...await Fish.find()];
		}

		// check for active buffs
		const activeBuffs = await BuffData.find({ user: userId, active: true });
		const gachaBuff = activeBuffs.find((buff) => buff.capabilities.includes('gacha'));
		const gachaMultiplier = gachaBuff ? parseFloat(gachaBuff.capabilities[1]) : 1;

		// multiply rare+ item weights by gachaMultiplier
		const weightValues = Object.values(weights);
		for (let i = 0; i < weightValues.length; i++) {
			if (i > 1) {
				weightValues[i] *= gachaMultiplier;
			}
		}

		// generate random items from box
		let filteredItems = [];
		while (filteredItems.length === 0) {
			let draw = await getWeightedChoice(Object.keys(box.weights), weightValues);
			draw = draw.charAt(0).toUpperCase() + draw.slice(1);
			filteredItems = items.filter((item) => item.rarity.toLowerCase() === draw.toLowerCase());
		}

		const numItems = box.items || 1;
		const generatedItems = [];
		for (let i = 0; i < numItems; i++) {
			const random = Math.floor(Math.random() * filteredItems.length);
			const item = filteredItems[random];
			generatedItems.push(await sendToInventory(userId, item));
		}

		return generatedItems;
	}
	else {
		return null;
	}
};

const sendToInventory = async (userId, item) => {
	const user = await User.findOne({ userId: userId });
	const itemObject = await Item.findById(item);

	let existingItem;
	let clonedItem;
	let finalItem;
	switch (itemObject.type) {
	case 'rod':
		clonedItem = await clone(itemObject, userId);
		user.inventory.rods.push(clonedItem);
		finalItem = clonedItem;
		break;
	case 'bait':
		existingItem = user.inventory.baits.find((b) => b.name === itemObject.name);
		if (existingItem) {
			existingItem.count += clonedItem.count;
			await existingItem.save();
			finalItem = existingItem;
		}
		else {
			clonedItem = await clone(itemObject, userId);
			user.inventory.baits.push(clonedItem);
			finalItem = clonedItem;
		}
		break;
	case 'fish':
		clonedItem = await clone(itemObject, userId);
		user.inventory.fish.push(clonedItem);
		finalItem = clonedItem;
		break;
	case 'buff':
		existingItem = user.inventory.buffs.find((b) => b.name === itemObject.name);
		if (existingItem && existingItem.length === clonedItem.length) {
			existingItem.count += clonedItem.count;
			await existingItem.save();
			finalItem = existingItem;
		}
		else {
			clonedItem = await clone(itemObject, userId);
			user.inventory.buffs.push(clonedItem);
			finalItem = clonedItem;
		}
		break;
	case 'gacha':
		existingItem = user.inventory.gacha.find((b) => b.name === itemObject.name);
		if (existingItem) {
			existingItem.count += clonedItem.count;
			await existingItem.save();
			finalItem = existingItem;
		}
		else {
			clonedItem = await clone(itemObject, userId);
			user.inventory.gacha.push(clonedItem);
			finalItem = clonedItem;
		}
		break;
	case 'quest':
		clonedItem = await clone(itemObject, userId);
		user.inventory.quests.push(clonedItem);
		finalItem = clonedItem;
		break;
	default:
		clonedItem = await clone(itemObject, userId);
		user.inventory.items.push(clonedItem);
		finalItem = clonedItem;
		break;
	}
	await user.save();

	return finalItem;
};

const startBooster = async (userId, id) => {
	const buff = await BuffData.findById(id);
	if (!buff) return null;
	buff.active = true;
	buff.endTime = Date.now() + buff.length;
	await buff.save();
	return buff;
};

const endBooster = async (userId, id) => {
	const user = await User.findOne({ userId: userId });
	const buff = await BuffData.findById(id);
	if (!buff) return null;
	buff.active = false;
	await buff.save();

	user.inventory.buffs = user.inventory.buffs.filter((b) => b.id !== buff.id);
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
	sendToInventory,
	startBooster,
	endBooster,
};
