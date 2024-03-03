const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { log, getUser, startQuest, getQuests } = require('../../../functions');
const { Quest } = require('../../../schemas/QuestSchema');

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

		const questOptions = await Quest.find();
		const uniqueValues = new Set();

		let options = [];
		const questPromises = questOptions.map(async (q) => {
			try {
				const value = q._id.toString();

				if (!uniqueValues.has(value)) {
					uniqueValues.add(value);

					return new StringSelectMenuOptionBuilder()
						.setLabel(q.title)
						.setDescription(`$${q.reward} | ${q.description}`)
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
			const selection = i.values[0];
			const userData = await getUser(user.id);
			const originalQuest = await Quest.findById(selection);

			// Check if user meets quest requirements
			const existingQuest = await getQuests(user.id);
			const hasExistingQuest = existingQuest.some(quest => quest.title === originalQuest.title);

			if (hasExistingQuest) {
				await i.reply(`You already have a quest with the title **${originalQuest.title}**!`);
				return;
			}
			else {
				await startQuest(userData.userId, originalQuest._id);
				await i.reply(`${i.user} has started quest **${originalQuest.title}**!`);
			}
		});
	},
};
