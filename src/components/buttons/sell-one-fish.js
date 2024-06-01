const { User, getUser } = require('../../class/User');
const { FishData } = require('../../schemas/FishSchema');
const { BuffData } = require('../../schemas/BuffSchema');

module.exports = {
	customId: 'sell-one-fish',
	/**
	 *
	 * @param {ExtendedClient} client
	 * @param {ButtonInteraction} interaction
	 */
	run: async (client, interaction) => {
		const userData = new User(await getUser(interaction.user.id));
		if (!userData) return;

		const fishArray = (await userData.getStats()).latestFish;
		// let newFish = (await userData.getInventory()).fish;

		// check for buffs
		const activeBuffs = await BuffData.find({ user: await userData.getUserId(), active: true });
		const cashBuff = activeBuffs.find((buff) => buff.capabilities.includes('cash'));
		const cashMultiplier = cashBuff ? parseFloat(cashBuff?.capabilities[1]) : 1;

		for (const fish of fishArray) {
			const fishData = await FishData.findById(fish.valueOf());
			const value = fishData.value * cashMultiplier * fish.count;
			// newFish.push(...userData.inventory.fish.filter(x => x._id.valueOf() !== fishData._id.valueOf()));
			await userData.removeFish(fishData._id);
			await userData.addMoney(value);
		}

		if (userData.stats.soldLatestFish) {
			await interaction.reply({
				content: 'You already sold these fish!',
				ephemeral: true,
			});
			return;
		}

		// try {
		// 	const updatedUser = await UserSchema.findOneAndUpdate(
		// 		{ userId: userData.userId },
		// 		{ $set: {
		// 			'inventory.fish': newFish,
		// 			'inventory.money': await userData.getMoney(),
		// 			'stats.soldLatestFish': true,
		// 		} },
		// 		{ $unset: { 'stats.latestFish': '' } },
		// 		{ new: true },
		// 	);

		// 	if (!updatedUser) {
		// 		await interaction.reply({
		// 			content: 'There was an error updating your userdata! Your userdata was not changed.',
		// 			ephemeral: true,
		// 		});
		// 	}

		// 	await interaction.reply({
		// 		content: 'Successfully sold your recent catch!',
		// 		ephemeral: true,
		// 	});
		// }
		// catch (err) {
		// 	console.error(err);
		// 	await interaction.reply({
		// 		content: 'There was an error updating your userdata!',
		// 		ephemeral: true,
		// 	});
		// }

	},
};
