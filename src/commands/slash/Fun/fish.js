const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { fish, generateXP, getEquippedRod, getUser, clone, findQuests } = require('../../../functions');
const { Item } = require('../../../schemas/ItemSchema');

const updateUserWithFish = async (i, userId) => {
	const rod = await getEquippedRod(userId);
	const fishArray = await fish(rod.name, userId);

	const completedQuests = [];
	const user = await getUser(userId);
	if (user) {
		fishArray.forEach(async (f) => {
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
			user.xp += generateXP();

			// quest stuff
			const quests = await findQuests(f.name.toLowerCase(), rod.name.toLowerCase(), f.qualities.map(q => q.toLowerCase()));

			quests.forEach(async quest => {
				quest.progress += f.count || 1;
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

					completedQuests.push(quest);
				}
				quest.endDate = Date.now();
				await quest.save();
			});
			// end quest stuff

			f.save();
		});

		rod.save();
		user.save();
		return { fish: fishArray, questsCompleted: completedQuests };
	}
};

const followUpMessage = async (interaction, user, fishArray, completedQuests) => {
	const fields = [];

	fishArray.forEach(f => {
		fields.push({ name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${user.globalName} caught ${f.count} **${f.rarity}** ${f.name}!` });
	});

	completedQuests.forEach(quest => {
		fields.push({ name: 'Quest Completed!', value: `**${quest.title}** completed!` });
	});

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

		const object = await updateUserWithFish(interaction, user.id);
		const newFish = object.fish;
		const completedQuests = object.questsCompleted;

		const followUp = await followUpMessage(interaction, user, newFish, completedQuests);

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