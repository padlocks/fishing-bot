const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { getUser, setEquippedRod } = require('../../../util/User');
const { ItemData } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('equip')
		.setDescription('Equip a new rod!'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		const userData = await getUser(user.id);
		let options = [];
		const uniqueValues = new Set();

		const rodPromises = userData.inventory.rods.map(async (rodObjectId) => {
			try {
				const rod = await ItemData.findById(rodObjectId.valueOf());
				const name = rod.name;
				const value = rod._id.toString();

				if (rod.state === 'destroyed') {
					return;
				}

				// Check if the value is unique
				if (!uniqueValues.has(name)) {
					uniqueValues.add(name);

					return new StringSelectMenuOptionBuilder()
						.setLabel(rod.name)
						.setDescription(rod.description)
						.setEmoji(rod.icon.data.split(':')[1])
						.setValue(value);
				}

			}
			catch (error) {
				console.error(error);
			}
		});

		options = await Promise.all(rodPromises);
		options = options.filter((option) => option !== undefined);

		const select = new StringSelectMenuBuilder()
			.setCustomId('equip-rod')
			.setPlaceholder('Make a selection!')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Choose your fishing rod!',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000 });

		collector.on('collect', async i => {
			const selection = i.values[0];
			const newRod = await setEquippedRod(user.id, selection);
			await i.reply(`${i.user} has selected **${newRod.name}**!`);
		});
	},
};
