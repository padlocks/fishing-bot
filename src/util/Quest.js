const { clone } = require('./Utils');
const { xpToLevel } = require('./User');
const { Quest, QuestData } = require('../schemas/QuestSchema');
const { User } = require('../schemas/UserSchema');

const generateDailyQuest = async (userId) => {
	const user = await User.findOne({ userId: userId });

	const dailies = await Quest.find({ daily: true });
	const randomIndex = Math.floor(Math.random() * dailies.length);
	const originalQuest = dailies[randomIndex];

	if (!user) {
		throw new Error('User not found');
	}
	if (user.inventory.quests.includes(originalQuest.id)) {
		return await generateDailyQuest(userId);
	}

	const hasDailyQuest = await Promise.all(user.inventory.quests.map(async (questId) => {
		const quest = await QuestData.findById(questId);
		return (quest.daily && quest.status === 'in_progress');
	})).then(results => results.some(Boolean));

	if (hasDailyQuest || Date.now() - user.stats.lastDailyQuest < 86400000) {
		return false;
	}
	else {
		// check requirements
		const level = await xpToLevel(user.xp);
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
		await quest.save();
		user.inventory.quests.push(quest._id);
		user.stats.lastDailyQuest = Date.now();
		await user.save();
		return quest;
	}
};

const startQuest = async (userId, questId) => {
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
};

const getQuests = async (userId) => {
	const user = await User.findOne({ userId: userId });
	const questIds = user.inventory.quests;
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
