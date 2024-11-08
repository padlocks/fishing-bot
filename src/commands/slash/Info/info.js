const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../../class/User');
const { ItemData } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Check various information!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('rod')
				.setDescription('Check your current fishing rod.')),
	options: {
		cooldown: 10_000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction, analyticsObject) => {
		const subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'rod') {
			const user = new User(await User.get(interaction.user.id));
			const rodId = await user.getEquippedRod();
			const rod = await ItemData.findById(rodId);

			const embed = new EmbedBuilder()
				.setTitle('Fishing Rod Information')
				.addFields(
					{ name: 'Rod', value: `<${rod.icon?.animated ? 'a' : ''}:${rod.icon?.data}> **${rod.rarity}** ${rod.name}`, inline: false },
					{ name: 'Description', value: rod.description, inline: false },
					{ name: 'Durability', value: `${rod.durability}/${rod.maxDurability}`, inline: true },
					{ name: 'State', value: `${rod.state} - ${rod.maxRepairs - rod.repairs}/${rod.maxRepairs} repairs left\nRepair Cost: $${rod.repairCost}`, inline: true },
				)
				.setColor('Green');

			await interaction.reply({ embeds: [embed] });
		}
	},
};
