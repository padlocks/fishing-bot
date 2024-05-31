const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, sendToInventory } = require('../../../util/User');
const { Code } = require('../../../schemas/CodeSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Redeem a code!')
		.addStringOption((option) =>
			option
				.setName('code')
				.setDescription('The code you want to redeem.')
				.setRequired(true),
		),
	options: {
		cooldown: 3_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		const user = await getUser(interaction.user.id);
		await interaction.deferReply();

		const code = interaction.options.getString('code');
		const redemption = await Code.findOne({ code });
		if (!redemption) return await interaction.followUp('That code is invalid.');

		// check if the user has already redeemed the code
		if (user.inventory.codes.includes(redemption._id)) {
			return await interaction.followUp('You have already redeemed this code.');
		}

		// check if the code has expired
		if (redemption.expiresAt < Date.now()) {
			return await interaction.followUp('This code has expired.');
		}

		// add the code to the user's inventory
		user.inventory.codes.push(redemption._id);

		// add the money to the user's balance
		user.inventory.money += redemption.money;

		await user.save();

		// add the items to the user's inventory
		const addedItems = [];
		for (const item of redemption.items) {
			addedItems.push(await sendToInventory(user.userId, item));
		}

		let value = '';
		if (redemption.money > 0) {
			value += `$${redemption.money.toLocaleString()}\n`;
		}
		for (const item of addedItems) {
			value += `${item.count}x **${item.item.name}**\n`;
		}

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle('Code Redemption')
					.addFields(
						{ name: 'Contents:', value: value },
					),
			],
		});

	},
};
