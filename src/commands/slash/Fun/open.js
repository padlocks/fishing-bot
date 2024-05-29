const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { openBox } = require('../../../util/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Opens a gacha box.')
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription('Name of the box you wish to open.')
				.setRequired(true),
		),
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	run: async (client, interaction) => {
		await interaction.deferReply();

		const name = interaction.options.getString('name');

		// Open the box
		const opened = await openBox(interaction.user.id, name.toLowerCase());
		let description = 'Rewards: \n';

		for (const item of opened) {
			description += `<${item.icon?.animated ? 'a' : ''}:${item.icon?.data}> ${item.count}x ${item.name}\n`;
		}

		if (opened) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Opened ${name.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`)
						.setDescription(description)
						.setColor('Green'),
				],
			});
		}
		else {
			return await interaction.editReply({
				content: 'You do not have a box with that name!',
				ephemeral: true,
			});
		}
	},
};
