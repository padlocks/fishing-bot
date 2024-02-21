const {SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('show-modal')
		.setDescription('Modal interaction testing.'),
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction) {
		const modal = new ModalBuilder()
			.setTitle('Modal Example')
			.setCustomId('modal-example')
			.addComponents(
				new ActionRowBuilder()
					.addComponents(
						new TextInputBuilder()
							.setLabel('What\'s your name?')
							.setCustomId('name')
							.setPlaceholder('Type your name here!')
							.setStyle(TextInputStyle.Short)
							.setRequired(true),
					),
			);

		await interaction.showModal(modal);
	},
};
