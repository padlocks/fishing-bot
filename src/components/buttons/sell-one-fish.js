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
	run: async (client, interaction, analyticsObject) => {
		const userData = new User(await getUser(interaction.user.id));
		if (!userData) return;

		if ((await userData.getStats()).soldLatestFish) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage('User already sold these fish!');
			}
			await interaction.reply({
				content: 'You already sold these fish!',
				ephemeral: true,
			});
			return;
		}

		const fishArray = (await userData.getStats()).latestFish;
		// let newFish = (await userData.getInventory()).fish;

		// check for buffs
		const activeBuffs = await BuffData.find({ user: await userData.getUserId(), active: true });
		const cashBuff = activeBuffs.find((buff) => buff.capabilities.includes('cash'));
		const cashMultiplier = cashBuff ? parseFloat(cashBuff?.capabilities[1]) : 1;

		for (const fish of fishArray) {
			const fishData = await FishData.findById(fish.valueOf());
			const value = fishData.value * cashMultiplier * fishData.count;
			// newFish.push(...userData.inventory.fish.filter(x => x._id.valueOf() !== fishData._id.valueOf()));
			await userData.removeFish(fishData._id);
			await userData.addMoney(value);
		}

		if (process.env.ANALYTICS || config.client.analytics) {
			await analyticsObject.setStatus('completed');
			await analyticsObject.setStatusMessage('User sold their recent catch!');
		}

		return await interaction.reply({
			content: 'Successfully sold your recent catch!',
			ephemeral: true,
		});
	},
};
