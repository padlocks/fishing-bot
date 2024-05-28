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

		if (opened) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Opened ${name}`)
						.setDescription(`You got a <${opened.icon?.animated ? 'a' : ''}:${opened.icon?.data}> ${opened.name}! Congrats!`)
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
