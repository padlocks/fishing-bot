const { ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { Interaction } = require('./Interaction');
const { User } = require('./User');
const { Quest } = require('./Quest');
const { Item } = require('../schemas/ItemSchema');
const { Quest: QuestSchema } = require('../schemas/QuestSchema');

class ExpandableMessage {
	constructor(analyticsObject, interaction) {
		if (!analyticsObject || (!analyticsObject instanceof Interaction)) {
			throw new Error('Invalid analytics object provided.');
		}
		else if (!interaction) {
			throw new Error('Invalid interaction provided.');
		}

		this.analyticsObject = analyticsObject;
		this.interaction = interaction;
		this.messageContent = '';
		this.embeds = [];
		this.fields = [];
		this.components = [];
		this.sendType = ExpandableMessage.SendType.REPLY;
		this.sentMessage = null;
		this.questData = {};
	}

	static SendType = {
		REPLY: 'reply',
		FOLLOW_UP: 'followUp',
		EDIT: 'edit',
		UPDATE: 'update'
	};

	setSendType(type) {
		if (!Object.values(ExpandableMessage.SendType).includes(type)) {
			throw new Error(`Invalid send type. Must be one of: ${Object.values(ExpandableMessage.SendType).join(', ')}.`);
		}

		this.sendType = type;
		return this;
	}

	setContent(content) {
		if (typeof content !== 'string') {
			throw new Error('Content must be a string.');
		}
		this.messageContent = content;
		return this;
	}

	addEmbed(embed) {
		this.embeds.push(embed);
		return this;
	}

	clearEmbeds() {
		this.embeds = [];
		return this;
	}

	async send() {
		const options = {};

		const userId = await this.analyticsObject.getUser();
		await this.updateQuests(userId);

		if (this.messageContent) {
			options.content = this.messageContent;
		}

		if (this.embeds.length > 0) {
			// Inject fields into the last embed
			const lastEmbed = this.embeds[this.embeds.length - 1];
			if (this.fields.length > 0) {
				lastEmbed.addFields(this.fields);
			}

			options.embeds = this.embeds;
		}
		else {
			const embed = new EmbedBuilder()
				.setTitle('Notification')
				.setColor('BLUE')
				.addFields(this.fields);
			
			options.embeds = [embed];
		}

		options.components = this.components;

		if (this.sendType === ExpandableMessage.SendType.EDIT) {
			this.sentMessage = await this.interaction.editReply(options);
		} else if (this.sendType === ExpandableMessage.SendType.UPDATE) {
			this.sentMessage = await this.interaction.update(options);
		} else if (this.sendType === ExpandableMessage.SendType.REPLY) {
			this.sentMessage = await this.interaction.reply({
				...options,
				fetchReply: true,
			});
		} else if (this.sendType === ExpandableMessage.SendType.FOLLOW_UP) {
			this.sentMessage = await this.interaction.followUp({
				...options,
				fetchReply: true,
			});
		}

		return this.sentMessage;
	}

	// Add a helper to append fields to the last embed
	addEmbedField(name, value, inline = false) {
		if (this.embeds.length === 0) {
			throw new Error('No embed created. Use addEmbed() to create one first.');
		}

		this.embeds[this.embeds.length - 1].addFields([{ name, value, inline }]);
		return this;
	}

	setSendType(type) {
		if (!Object.values(ExpandableMessage.SendType).includes(type)) {
			throw new Error(`Invalid send type. Must be one of: ${Object.values(ExpandableMessage.SendType).join(', ')}.`);
		}

		this.sendType = type;
		return this;
	}

	addComponents(components = []) {
		if (!Array.isArray(components)) {
			throw new Error('Components must be an array.');
		}
	
		this.components = components.map(component => {
			if (component instanceof ActionRowBuilder) {
				return component;
			} else {
				throw new Error('Invalid component type. Must be an instance of ActionRowBuilder.');
			}
		});
	
		return this;
	}
	
	clearComponents() {
		this.components = [];
		return this;
	}

	addQuestData(questData) {
		if (!questData || typeof questData !== 'object') {
			throw new Error('Invalid quest data provided.');
		}
		this.questData = questData;
		return this;
	}

	async updateQuests(userId) {
		const user = new User(await User.get(userId));
		const quests = await user.getQuests();
		let questString = '';
		let totalQuestXp = 0;
		let totalQuestCash = 0;
		const questRewards = [];
		const completedQuestIds = new Set();
		const completedQuests = [];
		const startedQuests = [];
		let levelUp = false;
	
		// Process command-based progression
		for (const quest of quests) {
			if (quest.status === 'in_progress' && quest.progressType && quest.progressType.special && quest.progressType.special.length > 0) {
				for (const progressType of quest.progressType.special) {
					if (progressType === "/" + this.interaction.commandName) {
						if (quest.progress < quest.progressMax) {
							quest.progress += 1;
	
							if (quest.progress >= quest.progressMax) {
								if (!completedQuestIds.has(quest._id.toString())) {
									completedQuestIds.add(quest._id.toString());
									completedQuests.push(quest);
								}
							}
	
							await quest.save();
						} else {
							if (!completedQuestIds.has(quest._id.toString())) {
								completedQuestIds.add(quest._id.toString());
								completedQuests.push(quest);
							}
						}
						break;
					}
				}
			}
		}
	
		// Process data-based progression
		if (Object.keys(this.questData).length > 0) {
			const { fish = [], rod = null } = this.questData;
			
			if (fish && fish.length > 0) {
				for (const f of fish) {
					const matchingQuests = await user.findQuests(
						f.name.toLowerCase(),
						rod ? rod.name.toLowerCase() : 'any',
						f.qualities.map(q => q.toLowerCase())
					);
					
					for (const q of matchingQuests) {
						const quest = new Quest(q);
						const questProgress = {
							fish: false,
							rarity: false,
							rod: false,
							qualities: false,
							size: false,
							weight: false,
							special: false,
						};
	
						const progressType = await quest.getProgressType();
	
						if (progressType.fish.includes('any') || progressType.fish.includes(f.name.toLowerCase())) 
							questProgress.fish = true;
						if (progressType.rarity.includes('any') || progressType.rarity.includes(f.rarity.toLowerCase())) 
							questProgress.rarity = true;
						if (progressType.rod === 'any' || progressType.rod === rod.name.toLowerCase()) 
							questProgress.rod = true;
						if (progressType.qualities.includes('any') || progressType.qualities.some(q => f.qualities.map(quality => quality.toLowerCase()).includes(q))) 
							questProgress.qualities = true;
						if (progressType.size === 'any' || parseFloat(progressType.size).toFixed(3) <= f.size.toFixed(3)) 
							questProgress.size = true;
						if (progressType.weight === 'any' || parseFloat(progressType.weight).toFixed(3) <= f.weight.toFixed(3)) 
							questProgress.weight = true;
						if (progressType.special.length <= 0 || progressType.special.includes('any')) 
							questProgress.special = true;
	
						if (questProgress.fish && questProgress.rarity && questProgress.rod && questProgress.qualities && questProgress.size && questProgress.weight && questProgress.special) {
							const currentProgress = await quest.getProgress();
							await quest.setProgress(currentProgress + (f.count || 1));
						}
	
						if (await quest.getProgress() >= await quest.getMaxProgress()) {
							const questId = q._id.toString();
							if (!completedQuestIds.has(questId)) {
								completedQuestIds.add(questId);
								completedQuests.push(quest);
							}
						}
					}
				}
			}
		}
	
		// Distribute rewards and generate fields
		if (completedQuests.length > 0) {
			for await (const q of completedQuests) {
				const quest = q instanceof Quest ? q : new Quest(q);
				questString += `**${await quest.getTitle()}** completed\n`;
				totalQuestXp += await quest.getXP();
				totalQuestCash += await quest.getCash();
				questRewards.push(...await quest.getRewards());

				await user.addXP(await quest.getXP());
				levelUp = await user.updateLevel() || levelUp;
				await user.addMoney(await quest.getCash());
				
				await quest.grantRewards();
				
				if (await quest.getContinuous()) {
					const nextQuestDoc = await quest.getNextQuest();
					if (nextQuestDoc) {
						const nextQuestInstance = new Quest(nextQuestDoc);
						const startedQuest = await user.startQuest(nextQuestInstance);
						if (startedQuest) {
							startedQuests.push(startedQuest);
						}
					}
				}
				
				await quest.end();
			}
			questString += `+ ${totalQuestXp} XP, + $${totalQuestCash}\n ${questRewards.length > 0 ? questRewards.map(reward => `${reward.count}x ${reward.name}`).join(', ') : ''}`;
			this.fields.push({ name: 'Quest Complete:', value: questString });
		}
		
		if (startedQuests.length > 0) {
			for (const quest of startedQuests) {
				const questInstance = quest instanceof Quest ? quest : new Quest(quest);
				const title = await questInstance.getTitle();
				const description = await questInstance.getDescription();
				const rewardString = await questInstance.getRewardString();
				
				this.fields.push({ 
					name: 'Quest Started:', 
					value: `**${title}** started! ${description}\n\n${rewardString}` 
				});
			}
		}
	
		if (levelUp) {
			const username = user.user.username || await user.getUserId();
			this.fields.push({ name: 'Level Up!', value: `${username} has leveled up to level **${await user.getLevel()}**!` });
		}
	}
}

module.exports = ExpandableMessage;