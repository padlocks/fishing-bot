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

		// Process quests AFTER all questData has been configured
		// This ensures that flags are properly set before checking quests
		const userId = await this.analyticsObject.getUser();
		
		// Log quest data before processing to verify it's set correctly
		console.log("Processing quests with data:", JSON.stringify(this.questData));
		
		// Process quests
		await this.updateQuests(userId);

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

	/**
	 * Adds quest data to the message for processing by the quest system
	 * Expected structure:
	 * {
	 *   commandType: true,           // e.g. 'fish': true, 'bait': true
	 *   itemName: true,              // e.g. 'shrimp': true
	 *   fish: [                      // Optional array of caught fish
	 *     {
	 *       name: "Common Fish",
	 *       rarity: "common",
	 *       qualities: ["fresh", "small"],
	 *       size: 10.5,
	 *       weight: 2.3,
	 *       count: 1
	 *     }
	 *   ],
	 *   rod: {                       // Optional rod information
	 *     name: "Wooden Rod"
	 *   }
	 * }
	 * @param {Object} questData - The quest data to add
	 * @param {boolean} merge - Whether to merge with existing data
	 * @returns {ExpandableMessage} This instance for chaining
	 */
	addQuestData(questData, merge = true) {
		if (!questData || typeof questData !== 'object') {
			throw new Error('Invalid quest data provided.');
		}
		
		console.log("Adding quest data:", JSON.stringify(questData));
		
		// Normalize all keys to lowercase for consistent matching
		const normalizedData = this.normalizeQuestDataKeys(questData);
		
		if (merge && Object.keys(this.questData).length > 0) {
			this.questData = this.deepMergeQuestData(this.questData, normalizedData);
		} else {
			this.questData = normalizedData;
		}
		
		console.log("Quest data after adding:", JSON.stringify(this.questData));
		return this;
	}

	/**
	 * Normalizes quest data keys to lowercase for consistent matching
	 * @param {Object} data - Quest data to normalize
	 * @returns {Object} Normalized quest data
	 * @private
	 */
	normalizeQuestDataKeys(data) {
		const normalized = {};
		
		for (const key in data) {
			const lowerKey = key.toLowerCase();
			
			// Handle special objects like fish arrays
			if (Array.isArray(data[key])) {
				normalized[lowerKey] = data[key];
			}
			// Handle nested objects (like rod info)
			else if (typeof data[key] === 'object' && data[key] !== null) {
				normalized[lowerKey] = this.normalizeQuestDataKeys(data[key]);
			}
			// Handle primitive values
			else {
				normalized[lowerKey] = data[key];
			}
			
			// For special item names, keep both cases for backward compatibility
			// but ensure lowercase is always present
			if (key !== lowerKey && (data[key] === true || data[key] === false)) {
				console.log(`Normalizing quest flag: ${key} → ${lowerKey}`);
			}
		}
		
		return normalized;
	}

	/**
	 * Performs a deep merge of quest data objects
	 * @param {Object} target - Target object to merge into
	 * @param {Object} source - Source object to merge from
	 * @returns {Object} Merged object
	 * @private
	 */
	deepMergeQuestData(target, source) {
		const result = { ...target };
		
		for (const key in source) {
			// If property exists in both objects and they're both objects
			if (key in result && typeof result[key] === 'object' && 
				typeof source[key] === 'object' && !Array.isArray(source[key])) {
				result[key] = this.deepMergeQuestData(result[key], source[key]);
			}
			// Handle arrays (concatenate)
			else if (Array.isArray(result[key]) && Array.isArray(source[key])) {
				result[key] = [...result[key], ...source[key]];
			}
			// Otherwise just assign the source value
			else {
				result[key] = source[key];
			}
		}
		
		return result;
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
	
		 // Debug logging to see what's in questData
		console.log("Quest Data in updateQuests:", JSON.stringify(this.questData));
		
		// Process command-based progression with improved flag checking
		for (const quest of quests) {
			if (quest.status === 'in_progress' && quest.progressType && quest.progressType.special && quest.progressType.special.length > 0) {
				let shouldIncrement = false;
				let matchingFlags = [];

				// Log quest information
				console.log(`Processing quest: "${quest.title}"`);
				console.log(`Quest progression requirements: ${JSON.stringify(quest.progressType.special)}`);
				
				 // Extract command and non-command requirements
				const commandRequirements = quest.progressType.special.filter(req => req.startsWith('/'));
				const flagRequirements = quest.progressType.special.filter(req => !req.startsWith('/'));
				
				console.log(`Command requirements: ${JSON.stringify(commandRequirements)}`);
				console.log(`Flag requirements: ${JSON.stringify(flagRequirements)}`);
				
				// Check flags first - THIS IS THE MAIN CHANGE
				// If we have the right flags, we can progress the quest regardless of command context
				if (flagRequirements.length > 0) {
					for (const flag of flagRequirements) {
						const flagLower = flag.toLowerCase();
						const questDataKeys = Object.keys(this.questData).map(k => k.toLowerCase());
						
						console.log(`Checking for flag "${flagLower}" in keys: [${questDataKeys.join(', ')}]`);
						
						if (this.questData[flagLower] === true) {
							console.log(`✓ Flag "${flagLower}" found and is TRUE`);
							matchingFlags.push(flag);
						} else {
							console.log(`✗ Flag "${flagLower}" not found or not TRUE`);
						}
					}
					
					// If we have any matching flags, consider the quest progressable
					if (matchingFlags.length > 0) {
						shouldIncrement = true;
						console.log(`Quest "${quest.title}" matched flags: ${matchingFlags.join(', ')}`);
					} else {
						console.log(`No matching flags found for quest "${quest.title}"`);
					}
				}
				// If there are no flag requirements, check if this is the original command interaction 
				else if (commandRequirements.length > 0) {
					// Check both current command and original command
					const currentCommand = "/" + this.interaction.commandName;
					const originalCommand = this.originalCommand ? "/" + this.originalCommand : null;
					
					if (commandRequirements.some(cmd => cmd === currentCommand || cmd === originalCommand)) {
						console.log(`✓ Command requirement matched: ${currentCommand || originalCommand}`);
						shouldIncrement = true;
					} else {
						console.log(`✗ No command match: ${currentCommand} or ${originalCommand}`);
					}
				}
				
				console.log(`Should increment quest progress: ${shouldIncrement}`);
				
				if (shouldIncrement) {
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