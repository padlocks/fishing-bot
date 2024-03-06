const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { fish, generateXP, getEquippedRod, getUser, clone, findQuests } = require('../../../functions');
const { Item } = require('../../../schemas/ItemSchema');

const updateUserWithFish = async (userId) => {
	const rod = await getEquippedRod(userId);
	const fishArray = await fish(rod.name, userId);
	let xp = 0;

	for (let i = 0; i < fishArray.length; i++) {
		xp += generateXP();
	}

	const completedQuests = [];
	const user = await getUser(userId);
	if (user) {
		await Promise.all(fishArray.map(async (f) => {
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
			rod.fishCaught += f.count || 1;
			user.stats.fishCaught += f.count || 1;
			user.stats.latestFish = f;
			user.stats.soldLatestFish = false;
			user.xp += xp;

			// quest stuff
			const quests = await findQuests(f.name.toLowerCase(), rod.name.toLowerCase(), f.qualities.map(q => q.toLowerCase()));

			await Promise.all(quests.map(async quest => {
				fishArray.forEach(oneFish => {
					quest.progress += oneFish.count || 1;
				});
				if (quest.progress >= quest.progressMax) {
					quest.status = 'completed';
					user.xp += quest.xp;
					user.inventory.money += quest.cash;
					quest.reward.forEach(reward => {
						if (reward.toLowerCase().includes('rod')) {
							user.inventory.rods.push(reward);
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
			}));
			// end quest stuff

			f.save();
		}));

		rod.save();
		user.save();
		return { fish: fishArray, questsCompleted: completedQuests.filter((quest, index, self) => self.findIndex(q => q.title === quest.title) === index), xp: xp };
	}
};

const followUpMessage = async (interaction, user, fishArray, completedQuests, xp) => {
	const fields = [];
	let fishString = '';
	let questString = '';
	let totalQuestXp = 0;
	let totalQuestCash = 0;
	const questRewards = [];

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
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('sell-one-fish')
						.setLabel('Sell')
						.setStyle(ButtonStyle.Danger),
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

		const followUp = await followUpMessage(interaction, user, newFish, completedQuests, xp);

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
		});
	},
};