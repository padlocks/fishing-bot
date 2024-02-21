const {
	SlashCommandBuilder,
} = require('discord.js');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('set-animated-pfp')
		.setDescription('Change the bot\'s profile picture to an animated one.')
		.addAttachmentOption(option =>
			option
				.setName('attachment')
				.setDescription('The attachment.')
				.setRequired(true),
		),
	options: {
		developers: true,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	async run(client, interaction) {
		await interaction.deferReply();

		const attachment = interaction.options.getAttachment('attachment', true);

		if (attachment.contentType !== 'image/gif') {
			await interaction.editReply({
				content: 'Not a .gif image.',
			});

			return;
		}

		console.log(attachment);

		await client.user.setAvatar(attachment.proxyURL)
			.then(async () => {
				await interaction.editReply({
					content: 'Done, profile picture updated.',
				});
			})
			.catch(async err => {
				await interaction.editReply({
					content: 'Something went wrong:\n' + err,
				});
			});
	},
};
