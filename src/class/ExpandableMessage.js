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
		this.questTracker = null;
		
		// Store original command information
		this.originalCommand = interaction.commandName || null;
		
		// Check if this is a button continuation
		if (interaction.message && interaction.message.interaction) {
			this.originalCommand = interaction.message.interaction.commandName || null;
		}
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

	attachQuestTracker(questTracker) {
		this.questTracker = questTracker;
		return this;
	}

	addQuestData(questData) {
		if (this.questTracker) {
			this.questTracker.addQuestData(questData);
		}
		return this;
	}

	async send() {
		const options = {};

		// Create message options first
		if (this.messageContent) {
			options.content = this.messageContent;
		}

		// Build the initial embeds
		if (this.embeds.length > 0) {
			options.embeds = this.embeds;
		} else {
			const embed = new EmbedBuilder()
				.setTitle('Notification')
				.setColor('BLUE');
			
			options.embeds = [embed];
		}

		// Set components
		options.components = this.components;

		if (this.questTracker) {
			const userId = await this.analyticsObject.getUser();
			const questResults = await this.questTracker.processQuests(userId);
			
			if (questResults.completedQuests.length > 0) {
				this.fields.push({ 
					name: 'Quest Complete:', 
					value: `${questResults.questString}+ ${questResults.totalQuestXp} XP, + $${questResults.totalQuestCash}\n ${questResults.questRewards.length > 0 ? questResults.questRewards.map(reward => `${reward.count}x ${reward.name}`).join(', ') : ''}`
				});
			}
			
			if (questResults.startedQuests.length > 0) {
				for (const quest of questResults.startedQuests) {
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
		
			if (questResults.levelUp) {
				const user = new User(await User.get(userId));
				const username = user.user.username || await user.getUserId();
				this.fields.push({ name: 'Level Up!', value: `${username} has leveled up to level **${await user.getLevel()}**!` });
			}
		}

		// Now add any fields that were added during quest processing
		if (this.fields.length > 0) {
			// Add fields to the last embed
			const lastEmbed = options.embeds[options.embeds.length - 1];
			this.fields.forEach(field => lastEmbed.addFields(field));
		}

		// Now send the message with all data processed
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
}

module.exports = ExpandableMessage;