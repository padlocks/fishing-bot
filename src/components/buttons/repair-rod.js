const { RodData } = require('../../schemas/RodSchema');
const { getEquippedRod } = require('../../util/User');

module.exports = {
	customId: 'repair-rod',
	/**
	 *
	 * @param {ExtendedClient} client
	 * @param {ButtonInteraction} interaction
	 */
	run: async (client, interaction) => {
		const rod = await getEquippedRod(interaction.user.id);
		if (!rod) {
			await interaction.reply({
				content: 'You do not have a rod equipped!',
				ephemeral: true,
			});
			return;
		}

		if (rod.state !== 'broken') {
			await interaction.reply({
				content: 'Your rod can\'t be repaired!',
				ephemeral: true,
			});
			return;
		}

		const newDurability = rod.maxDurability;
		const newRepairs = rod.repairs + 1;
		const newRodState = 'repaired';

		try {
			await RodData.findByIdAndUpdate(rod._id, {
				durability: newDurability,
				repairs: newRepairs,
				state: newRodState,
			});

			await interaction.reply({
				content: 'Your rod has been repaired!',
				ephemeral: true,
			});
		}
		catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'An error occurred while repairing your rod!',
				ephemeral: true,
			});
			return;
		}
	},
};