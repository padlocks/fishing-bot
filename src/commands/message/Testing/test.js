const {ContextMenuCommandBuilder} = require('discord.js');

module.exports = {
	structure: new ContextMenuCommandBuilder()
		.setName('Test Message command')
		.setType(3),
	/**
     * @param {ExtendedClient} client
     * @param {MessageContextMenuCommandInteraction} interaction
     */
	async run(client, interaction) {
		await interaction.reply({
			content: 'Hello message context command!',
		});
	},
};
