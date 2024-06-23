const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Code } = require('../../../schemas/CodeSchema');
const { User } = require('../../../class/User');
const config = require('../../../config');

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
	run: async (client, interaction, analyticsObject) => {
		const user = new User(await User.get(interaction.user.id));
		await interaction.deferReply();

		const code = interaction.options.getString('code');
		const redemption = await Code.findOne({ code });
		if (!redemption) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Invalid code.');
			}

			return await interaction.followUp('That code is invalid.');
		}

		// check if the user has already redeemed the code
		if ((await user.getCodes()).includes(redemption._id)) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Already redeemed.');
			}

			return await interaction.followUp('You have already redeemed this code.');
		}

		// check if the code has reached the maximum number of redemptions
		if (redemption.usesLeft <= 0) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Max redemptions.');
			}
			return await interaction.followUp('This code has reached the maximum number of redemptions.');
		}

		// check if the code has expired
		if (redemption.expiresAt < Date.now()) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('Expired.');
			}
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

		if (process.env.ANALYTICS || config.client.analytics) {
			await analyticsObject.setStatus('completed');
			await analyticsObject.setStatusMessage('Redeemed a code.');
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
