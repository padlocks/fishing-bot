const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { User, getUser } = require('../../../class/User');
const config = require('../../../config');

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
	run: async (client, interaction, analyticsObject) => {
		await interaction.deferReply();

		const name = interaction.options.getString('name');

		// Open the box
		const user = new User(await getUser(interaction.user.id));
		const opened = await user.openBox(name.toLowerCase());
		let description = 'Rewards: \n';

		if (opened) {
			for (const object of opened) {
				const item = object.item;
				description += `<${item.icon?.animated ? 'a' : ''}:${item.icon?.data}> ${object.count}x ${item.name}\n`;
			}

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Opened a box.');
			}

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
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('You do not have a box with that name.');
			}

			return await interaction.editReply({
				content: 'You do not have a box with that name!',
				ephemeral: true,
			});
		}
	},
};
