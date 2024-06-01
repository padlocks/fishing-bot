const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { getUser } = require('../../../util/User');
const { log } = require('../../../util/Utils');
const { User } = require('../../../class/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Locks fish in your inventory by name.')
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
		const user = new User(await getUser(interaction.user.id));

		if (!user) {
			log('User not found.', 'err');
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

		// Find all fish objects with the specified name and update their 'locked' property
		const fishList = await user.getFish();
		fishList.forEach(async fish => {
			if (fish.name.toLowerCase() === name.toLowerCase()) {
				fish.locked = true;
				await fish.save();
			}
		});

		try {
		// Save the updated user
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Locked')
						.setDescription(`Successfully locked all **${name}**.`)
						.setColor('Green'),
				],
			});
		}
		catch (err) {
			log('Error updating fish: ' + err, 'err');
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Fish Not Locked')
						.setDescription(`Failed to lock **${name}**. An error occurred.`)
						.setColor('Red'),
				],
			});
		}
	},
};
