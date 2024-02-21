const {SlashCommandBuilder} = require('discord.js');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong!'),
	options: {
		cooldown: 5000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction) {
		await interaction.reply({
			content: 'Pong! ' + client.ws.ping,
		});
	},
};
