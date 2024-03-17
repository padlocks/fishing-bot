const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { RodData } = require('../../schemas/RodSchema');
const { getEquippedRod } = require('../../util/User');
const { User } = require('../../schemas/UserSchema');

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

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Repair')
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		const response = await interaction.reply({
			// content: `Are you sure you want to repair your rod? This will cost $${rod.repairCost}!`,
			embeds: [
				new EmbedBuilder()
					.setTitle('Warning')
					.addFields(
						{ name: 'Are you sure?', value: `This will cost $${rod.repairCost.toLocaleString()}!` },
					),
			],
			fetchReply: true,
			components: [row],
		});

		const collectorFilter = i => {
			return i.user.id === interaction.user.id;
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation.customId === 'confirm') {
				const user = await User.findOne({ userId: interaction.user.id });

				if (user.money < rod.repairCost) {
					await confirmation.update({
						// content: 'You do not have enough money to repair your rod!',
						embeds: [
							new EmbedBuilder()
								.setTitle('Insufficient Balance')
								.setDescription('You do not have enough money to repair your rod!'),
						],
						components: [] });
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
				}
				catch (error) {
					console.error(error);
					await confirmation.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('Error')
								.setDescription('An error occurred while repairing your rod. You have not been charged.'),
						],
						components: [],
					});
					return;
				}

				user.money -= rod.repairCost;
				await user.save();

				await confirmation.update({
					components: [],
					embeds: [
						new EmbedBuilder()
							.setTitle('Congratulations!')
							.setDescription(`Repaired **${rod.name}** for **$${rod.repairCost.toLocaleString()}**!`),
					],
				});
			}
			else if (confirmation.customId === 'cancel') {
				await confirmation.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('Cancelled')
							.setDescription('Repair has been cancelled.'),
					],
					components: [],
				});
			}
		}
		catch (e) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Timed Out')
						.setDescription('Confirmation not received within 1 minute, cancelling.'),
				],
				components: [],
			});
		}

	},
};