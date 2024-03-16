const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { Quest } = require('../../../schemas/QuestSchema');
const { getUser, xpToLevel } = require('../../../util/User');
const { log } = require('../../../util/Utils');
const { startQuest, getQuests } = require('../../../util/Quest');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('start-quest')
		.setDescription('Start a quest!'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		const questOptions = await Quest.find({ daily: false });
		const uniqueValues = new Set();

		let options = [];
		const questPromises = questOptions.map(async (q) => {
			try {
				const value = q._id.toString();

				if (!uniqueValues.has(value)) {
					uniqueValues.add(value);

					return new StringSelectMenuOptionBuilder()
						.setLabel(q.title)
						.setDescription(`$${q.cash}, ${q.xp} XP ${q.reward.length > 0 ? q.reward.join(', ') : ''} | ${q.description}`)
						// .setEmoji(q.toJSON().icon.data.split(':')[1])
						.setValue(value);
				}

			}
			catch (error) {
				log(error, 'err');
			}
		});

		options = await Promise.all(questPromises);
		options = options.filter((option) => option !== undefined);

		const select = new StringSelectMenuBuilder()
			.setCustomId('start-quest')
			.setPlaceholder('Make a selection!')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Which quest would you like to start?',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000 });

		collector.on('collect', async i => {
			let canAccept = true;
			const selection = i.values[0];
			const userData = await getUser(user.id);
			const originalQuest = await Quest.findById(selection);

			// Check if user meets quest requirements
			const reqLevel = originalQuest.requirements.level;
			const level = await xpToLevel(userData.xp);
			if (level < reqLevel) {
				canAccept = false;
				await i.reply({
					content: `You need to be level ${reqLevel} to start this quest!`,
					ephemeral: true,
				});
				return;
			}

			if (originalQuest.requirements.previous.length > 0) {
				const existingQuests = await getQuests(user.id) || [];
				const hasPrevious = existingQuests.some(quest => originalQuest.requirements.previous.includes(quest.title) && quest.status === 'completed');

				if (!hasPrevious) {
					canAccept = false;
					await i.reply({
						content: `You need to complete the previous quest(s) to start this quest!\n\n**Required Quests:**\n${originalQuest.requirements.previous.join('\n')}`,
						ephemeral: true,
					});
					return;
				}
			}

			const existingQuest = await getQuests(user.id) || [];
			const hasExistingQuest = existingQuest.some(quest => quest.title === originalQuest.title && quest.status === 'in_progress');

			if (hasExistingQuest) {
				await i.reply({
					content: `You already have a quest with the title **${originalQuest.title}**!`,
					ephemeral: true,
				});
				return;
			}
			else if (canAccept) {
				await startQuest(userData.userId, originalQuest._id);
				await i.reply(`${i.user} has started quest **${originalQuest.title}**!`);
			}
		});
	},
};
