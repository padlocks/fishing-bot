const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Code } = require('../../../schemas/CodeSchema');
const { User, getUser } = require('../../../class/User');

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
		const user = new User(await getUser(interaction.user.id));
		await interaction.deferReply();

		const code = interaction.options.getString('code');
		const redemption = await Code.findOne({ code });
		if (!redemption) return await interaction.followUp('That code is invalid.');

		// check if the user has already redeemed the code
		if ((await user.getCodes()).includes(redemption._id)) {
			return await interaction.followUp('You have already redeemed this code.');
		}

		// check if the code has reached the maximum number of redemptions
		if (redemption.usesLeft <= 0) {
			return await interaction.followUp('This code has reached the maximum number of redemptions.');
		}

		// check if the code has expired
		if (redemption.expiresAt < Date.now()) {
			return await interaction.followUp('This code has expired.');
		}

		// decrement the number of usesLeft
		redemption.usesLeft--;
		await redemption.save();

		// add the code to the user's inventory
		await user.addCode(redemption._id);

		// add the money to the user's balance
		await user.addMoney(redemption.money);

		// add the items to the user's inventory
		const addedItems = [];
		for (const item of redemption.items) {
			addedItems.push(await user.sendToInventory(item));
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
