const {
	SlashCommandBuilder,
} = require('discord.js');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('nsfw')
		.setDescription('Nsfw command.'),
	options: {
		nsfw: true,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction) {
		await interaction.reply({content: 'NSFW Command!'});
	},
};
