const mongoose = require('mongoose');
const { Utils } = require('../class/Utils');
const { User } = require('../class/User');
const { Quest: QuestSchema, QuestData } = require('../schemas/QuestSchema');
const { Gacha } = require('../schemas/GachaSchema');

class Quest {
	constructor(data) {
		this.quest = new QuestData(data);
	}

	save() {
		return QuestData.findOneAndUpdate({ _id: this.quest._id }, this.quest, { upsert: true });
	}

	async getId() {
		return this.quest._id;
	}

	async getTitle() {
		return this.quest.title;
	}

	async getDescription() {
		return this.quest.description;
	}

	async getLevelRequirement() {
		return this.quest.requirements.level;
	}

	async getPrerequesites() {
		return this.quest.requirements.previous;
	}

	async clone(userId) {
		if (!userId) return null;
		try {
			const clonedObject = new Quest({
				...this.quest.toObject(),
				_id: new mongoose.Types.ObjectId(),
				user: userId,
				startDate: Date.now(),
				status: 'in_progress',
				__t: 'QuestData',
			});

			await clonedObject.save();
			return clonedObject;
		}
		catch (error) {
			Utils.log('Error cloning object: ' + error, 'err');
			throw error;
		}
	};

	async getProgressType() {
		return this.quest.progressType;
	}

	async getProgress() {
		return this.quest.progress;
	}

	async getMaxProgress() {
		return this.quest.progressMax;
	}

	async setProgress(progress) {
		this.quest.progress = progress;
		return this.save();
	}

	async getStatus() {
		return this.quest.status;
	}

	async setStatus(status) {
		this.quest.status = status;
		return this.save();
	}

	async getReward() {
		return this.quest.reward;
	}

	async getXP() {
		return this.quest.xp;
	}

	async getCash() {
		return this.quest.cash;
	}

	async end() {
		this.quest.status = 'completed';
		this.quest.endDate = Date.now();
		return this.save();
	}

	async fail() {
		this.quest.status = 'failed';
		this.quest.endDate = Date.now();
		return this.save();
	}

	async isDaily() {
		return this.quest.daily;
	}

	async isRepeatable() {
		return this.quest.repeatable;
	}

	async isFishable() {
		return this.quest.fishable;
	}

	async getStartDate() {
		return this.quest.startDate;
	}

	async getEndDate() {
		return this.quest.endDate;
	}

	async getSpecialConditions() {
		return this.quest.requirements.specialConditions;
	}

	async getRequiredWeather() {
		return this.quest.requirements.weather;
	}

	async getRequiredTimeOfDay() {
		return this.quest.requirements.timeOfDay;
	}

	async getEventTrigger() {
		return this.quest.eventTrigger;
	}

	async getHiddenTitle() {
		return this.quest.hiddenTitle;
	}

	async getHiddenUntilEvent() {
		return this.quest.hiddenUntilEvent;
	}

	async getNpcs() {
		return this.quest.npcs;
	}

	async getQuestType() {
		return this.quest.questType;
	}

	static async generateDailyQuest(userId) {
		const user = new User(await User.get(userId));
		const inventory = await user.getInventory();
		const stats = await user.getStats();
	
		const dailies = await QuestSchema.find({ daily: true });
		const randomIndex = Math.floor(Math.random() * dailies.length);
		const originalQuest = dailies[randomIndex];
	
		if (!user) {
			throw new Error('User not found');
		}
		if (inventory.quests.includes(originalQuest.id)) {
			return await this.generateDailyQuest(userId);
		}
	
		const hasDailyQuest = await Promise.all(inventory.quests.map(async (questId) => {
			const quest = await QuestData.findById(questId);
			return (quest && quest.daily && quest.status === 'in_progress');
		})).then(results => results.some(Boolean));
	
		if (hasDailyQuest || Date.now() - stats.lastDailyQuest < 86400000) {
			return false;
		}
		else {
			// check requirements
			const level = await user.getLevel();
			if (originalQuest.requirements.level > level) {
				return await this.generateDailyQuest(userId);
			}
	
			if (originalQuest.requirements.previous.length > 0) {
				const existingQuests = await QuestSchema.find({ user: userId }) || [];
				const hasPrevious = existingQuests.some(quest => originalQuest.requirements.previous.includes(quest.title) && quest.status === 'completed');
				if (!hasPrevious) {
					return await this.generateDailyQuest(userId);
				}
			}
	
			const quest = await Utils.clone(originalQuest);
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

	static async get(questId) {
		const quest = await QuestSchema.findById(questId);
		return quest;
	}

	static async reelRandomQuest(userId) {
		const user = new User(await User.get(userId));
		const inventory = await user.getInventory();
	
		const quests = await QuestSchema.find({ daily: false, fishable: true });
		const randomIndex = Math.floor(Math.random() * quests.length);
		const originalQuest = new Quest(quests[randomIndex]);
	
		if (!user) {
			throw new Error('User not found');
		}
		if (inventory.quests.includes(await originalQuest.getId())) {
			return await this.reelRandomQuest(userId);
		}
		else {
			// check requirements
			const level = await user.getLevel();
			if (originalQuest.requirements.level > level) {
				return await this.reelRandomQuest(userId);
			}
	
			if (originalQuest.requirements.previous.length > 0) {
				const existingQuests = await QuestSchema.find({ user: userId }) || [];
				const hasPrevious = existingQuests.some(quest => originalQuest.requirements.previous.includes(quest.title) && quest.status === 'completed');
				if (!hasPrevious) {
					return await this.reelRandomQuest(userId);
				}
			}
	
			const quest = await Utils.clone(originalQuest);
			quest.status = 'in_progress';
			quest.user = userId;
			quest.startDate = Date.now();
			await quest.save();
			await user.addQuest(quest._id);
			return quest;
		}
	}
}

module.exports = { Quest };