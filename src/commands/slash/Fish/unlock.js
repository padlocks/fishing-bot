const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { User } = require('../../../class/User');
const { log } = require('../../../util/Utils');
const config = require('../../../config');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlocks fish in your inventory by name.')
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription('Name of the fish you wish to lock.')
				.setRequired(true),
		),
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
	run: async (client, interaction) => {
		await interaction.deferReply();

		const name = interaction.options.getString('name');
		const user = new User(await User.get(interaction.user.id));

		if (!user) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User not found.');
			}
			log('User not found', 'err');
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Not Locked')
						.setDescription('Failed to lock fish. User not found.')
						.setColor('Red'),
				],
			});
			return;
		}
		try {
			// Find all fish objects with the specified name and update their 'locked' property
			const fishList = await user.getFish();
			fishList.forEach(async fish => {
				if (fish.name.toLowerCase() === name.toLowerCase()) {
					fish.locked = false;
					await fish.save();
				}
			});
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Unlocked fish.');
			}
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Unlocked')
						.setDescription(`Successfully unlocked all **${name}**.`)
						.setColor('Green'),
				],
			});
		}
		catch (err) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage(err);
			}
			log('Error updating fish:' + err, 'err');
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Not Unlocked')
						.setDescription(`Failed to unlock **${name}**. An error occurred.`)
						.setColor('Red'),
				],
			});
		}
	},
};
