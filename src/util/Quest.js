const { clone } = require('./Utils');
const { User } = require('../class/User');
const { Quest, QuestData } = require('../schemas/QuestSchema');
const { Gacha } = require('../schemas/GachaSchema');

const generateDailyQuest = async (userId) => {
	const user = new User(await User.get(userId));
	const inventory = await user.getInventory();
	const stats = await user.getStats();

	const dailies = await Quest.find({ daily: true });
	const randomIndex = Math.floor(Math.random() * dailies.length);
	const originalQuest = dailies[randomIndex];

	if (!user) {
		throw new Error('User not found');
	}
	if (inventory.quests.includes(originalQuest.id)) {
		return await generateDailyQuest(userId);
	}

	const hasDailyQuest = await Promise.all(inventory.quests.map(async (questId) => {
		const quest = await QuestData.findById(questId);
		return (quest.daily && quest.status === 'in_progress');
	})).then(results => results.some(Boolean));

	if (hasDailyQuest || Date.now() - stats.lastDailyQuest < 86400000) {
		return false;
	}
	else {
		// check requirements
		const level = await user.getLevel();
		if (originalQuest.requirements.level > level) {
			return await generateDailyQuest(userId);
		}

		if (originalQuest.requirements.previous.length > 0) {
			const existingQuests = await Quest.find({ user: userId }) || [];
			const hasPrevious = existingQuests.some(quest => originalQuest.requirements.previous.includes(quest.title) && quest.status === 'completed');
			if (!hasPrevious) {
				return await generateDailyQuest(userId);
			}
		}

		const quest = await clone(originalQuest);
		quest.status = 'in_progress';
		quest.user = userId;
		quest.startDate = Date.now();
		quest.reward = [];
		quest.reward.push(await Gacha.findOne({ name: 'Daily Box' }));
		await quest.save();
		await user.addQuest(quest._id);

		stats.lastDailyQuest = Date.now();
		await user.setStats(stats);
		return quest;
	}
};

const startQuest = async (userId, questId) => {
	const user = new User(await User.get(userId));
	const inventory = await user.getInventory();
	const originalQuest = await Quest.findById(questId);
	const quest = await clone(originalQuest);
	if (!user) {
		throw new Error('User not found');
	}
	if (!quest) {
		throw new Error('Quest not found');
	}
	if (inventory.quests.includes(questId)) {
		throw new Error('User already has this quest');
	}

	quest.status = 'in_progress';
	quest.user = userId;
	quest.startDate = Date.now();
	await quest.save();
	await user.addQuest(quest._id);
	return quest;
};

const getQuests = async (userId) => {
	const user = new User(await User.get(userId));
	const inventory = await user.getInventory();
	const questIds = inventory.quests;
	const quests = await QuestData.find({ _id: { $in: questIds } });
	return quests;
};

const findQuests = async (specificFish, specificRod, specificQualities) => {
	const query = {
		'status': 'in_progress',
		$and: [],
	};

	query.$and.push({ $or: [{ 'progressType.fish': specificFish }, { 'progressType.fish': 'any' }] });
	query.$and.push({ $or: [{ 'progressType.rod': specificRod }, { 'progressType.rod': 'any' }] });
	specificQualities.map(quality => query.$and.push({ $or: [{ 'progressType.qualities': quality }, { 'progressType.qualities': 'any' }] }));

	const quests = await QuestData.find(query);
	return quests;
};

module.exports = {
	generateDailyQuest,
	startQuest,
	getQuests,
	findQuests,
};
