module.exports = {
	customId: 'example-select',
	/**
     *
     * @param {ExtendedClient} client
     * @param {StringSelectMenuInteraction} interaction
     */
	async run(client, interaction) {
		const value = interaction.values[0];

		await interaction.reply({
			content: `You have selected from the menu: **${value}**`,
			ephemeral: true,
		});
	},
};
