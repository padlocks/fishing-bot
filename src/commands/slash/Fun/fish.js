const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { Item } = require('../../../schemas/ItemSchema');
const { getEquippedRod, getUser, decreaseRodDurability } = require('../../../util/User');
const { fish } = require('../../../util/Fish');
const { generateXP, clone } = require('../../../util/Utils');
const { findQuests } = require('../../../util/Quest');

const updateUserWithFish = async (userId) => {
	let rod = await getEquippedRod(userId);
	const fishArray = await fish(rod.name, userId);
	let xp = 0;

	for (let i = 0; i < fishArray.length; i++) {
		xp += generateXP();
	}

	const completedQuests = [];
	const user = await getUser(userId);
	if (user) {
		user.stats.latestFish = [];
		for (let i = 0; i < fishArray.length; i++) {
			const f = fishArray[i];
			if (!f.count) f.count = 1;

			if (f.name.toLowerCase().includes('rod')) {
				user.inventory.rods.push(f);
			}
			else if (f.name.toLowerCase().includes('trophy')) {
				user.inventory.items.push(f);
			}
			else {
				user.inventory.fish.push(f);
			}

			let message = '';
			switch (rod.state) {
			case 'broken':
				message = `Your rod is ${rod.state}! You can't catch any more fish until you repair it.`;
				break;
			case 'destroyed':
				message = `Your rod is ${rod.state}! You can't use it anymore.`;
				break;
			default:
				message = '';
				break;
			}

			if (rod.state === 'broken' || rod.state === 'destroyed') {
				return { fish: [], questsCompleted: [], xp: 0, rodState: rod.state, success: false, message: message };
			}
			else {
				rod = await decreaseRodDurability(userId, f.count || 1);
			}

			rod.fishCaught += f.count || 1;

			user.stats.fishCaught += f.count || 1;
			user.stats.latestFish.push(f);
			user.stats.soldLatestFish = false;
			user.stats.fishStats.set(f.name.toLowerCase(), (user.stats.fishStats.get(f.name.toLowerCase()) || 0) + (f.count || 1));
			user.xp += xp;

			// quest stuff
			const quests = await findQuests(f.name.toLowerCase(), rod.name.toLowerCase(), f.qualities.map(q => q.toLowerCase()));

			for (let j = 0; j < quests.length; j++) {
				const quest = quests[j];
				fishArray.forEach(oneFish => {
					quest.progress += oneFish.count || 1;
				});
				if (quest.progress >= quest.progressMax) {
					quest.status = 'completed';
					user.xp += quest.xp;
					user.inventory.money += quest.cash;
					quest.reward.forEach(async reward => {
						if (reward.toLowerCase().includes('rod')) {
							// find rod in db, clone it, and add to user inventory
							const originalRod = await Item.findOne({ name: reward });
							const clonedRod = await clone(originalRod);
							user.inventory.rods.push(clonedRod);
						}
						else {
							const item = Item.findOne({ name: reward });
							if (item) {
								user.inventory.items.push(clone(item));
							}
						}
					});

					quest.endDate = Date.now();
					completedQuests.push(quest);
				}
				await quest.save();
			}
			// end quest stuff

			await f.save();
		}

		await rod.save();
		await user.save();
		return { fish: fishArray, questsCompleted: completedQuests.filter((quest, index, self) => self.findIndex(q => q.title === quest.title) === index), xp: xp, rodState: rod.state, success: true, message: '' };
	}
};

const followUpMessage = async (interaction, user, fishArray, completedQuests, xp, rodState, success, message) => {
	const fields = [];
	let fishString = '';
	let questString = '';
	let totalQuestXp = 0;
	let totalQuestCash = 0;
	const questRewards = [];
	let fishAgainDisabled = false;

	if (success) {
		fishArray.forEach(f => {
			fishString += `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${f.count} **${f.rarity}** ${f.name}\n`;
			// fields.push({ name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${user.globalName} caught ${f.count} **${f.rarity}** ${f.name}!` });
		});

		fishString += `+ ${xp} XP\n`;
		fields.push({ name: `${user.globalName} Caught:`, value: fishString });

		if (completedQuests.length > 0) {
			completedQuests.forEach(quest => {
				questString += `**${quest.title}** completed\n`;
				totalQuestXp += quest.xp;
				totalQuestCash += quest.cash;
				quest.reward.forEach(reward => {
					questRewards.push(reward);
				});
				// fields.push({ name: 'Quest Completed!', value: `**${quest.title}** completed!` });
			});
			questString += `+ ${totalQuestXp} XP, + $${totalQuestCash}\n ${questRewards.length > 0 ? questRewards.join(', ') : ''}`;
			fields.push({ name: 'Quest complete:', value: questString });
		}
		if (rodState === 'broken') {
			fishAgainDisabled = true;
			fields.push({ name: 'Uh oh!', value: 'Your fishing rod has broken!' });
		}
		else if (rodState === 'destroyed') {
			fishAgainDisabled = true;
			fields.push({ name: 'Uh oh!', value: 'Your fishing rod has been destroyed! Looks like you need to buy a new one..' });
		}
	}
	else {
		fields.push({ name: 'Uh oh!', value: message });
		fishAgainDisabled = true;
	}

	return await interaction.followUp({
		embeds: [
			new EmbedBuilder()
				.setTitle('Fished!')
				.addFields(
					fields,
				),
		],
		components: [
			new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('fish-again')
						.setLabel('Fish again!')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(fishAgainDisabled),
					new ButtonBuilder()
						.setCustomId('sell-one-fish')
						.setLabel('Sell')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(fishArray.length === 0),
					new ButtonBuilder()
						.setCustomId('repair-rod')
						.setLabel('Repair')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(rodState === 'mint' || rodState === 'repaired' || rodState === 'destroyed'),
				),
		],
	});
};

module.exports = {
	customId: 'fish-again',
	structure: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('Fish!'),
	options: {
		cooldown: 5000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		await interaction.deferReply();

		const object = await updateUserWithFish(user.id);
		const newFish = object.fish;
		const completedQuests = object.questsCompleted;
		const xp = object.xp;
		const rodState = object.rodState;
		const success = object.success;
		const message = object.message;

		const followUp = await followUpMessage(interaction, user, newFish, completedQuests, xp, rodState, success, message);

		// const filter = () => interaction.user.id === interaction.message.author.id;

		const collector = followUp.createMessageComponentCollector({
			componentType: ComponentType.Button,
			// filter,
			time: 10000,
		});

		collector.on('collect', async collectionInteraction => {
			if (collectionInteraction.user.id !== user.id) return;
			if (collectionInteraction.customId === 'fish-again') {
				await this.run(client, collectionInteraction, user);
			}
			if (collectionInteraction.customId === 'sell-one-fish') {
				//
			}
			if (collectionInteraction.customId === 'repair-rod') {
				//
			}
		});
	},
};