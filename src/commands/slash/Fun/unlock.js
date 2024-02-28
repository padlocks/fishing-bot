const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require('discord.js');
const { FishData } = require('../../../schemas/FishSchema');
const { log, getUser } = require('../../../functions');

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
		const user = await getUser(interaction.user.id);

		if (!user) {
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

		// Find all fish objects with the specified name and update their 'locked' property
		const fishPromises = await user.inventory.fish.map(async x => await FishData.findById(x.valueOf()));
		const fishList = await Promise.all(fishPromises);
		fishList.forEach(async fish => {
			if (fish.name.toLowerCase() === name.toLowerCase()) {
				fish.locked = false;
				await fish.save();
			}
		});

		try {
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
