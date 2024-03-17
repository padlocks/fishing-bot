const { User } = require('../../schemas/UserSchema');
const { FishData } = require('../../schemas/FishSchema');
const { getUser } = require('../../util/User');
const { log } = require('../../util/Utils');

module.exports = {
	customId: 'sell-one-fish',
	/**
	 *
	 * @param {ExtendedClient} client
	 * @param {ButtonInteraction} interaction
	 */
	run: async (client, interaction) => {
		const userData = await getUser(interaction.user.id);
		if (!userData) return;

		const fishArray = userData.stats.latestFish;
		let newFish = userData.inventory.fish;

		for (const fish of fishArray) {
			const fishData = await FishData.findById(fish.valueOf());
			const value = fishData.value;
			// newFish.push(...userData.inventory.fish.filter(x => x._id.valueOf() !== fishData._id.valueOf()));
			newFish = newFish.filter(x => {
				return x._id.valueOf() != fishData._id.valueOf();
			});
			userData.inventory.money += value;
		}

		if (userData.stats.soldLatestFish) {
			await interaction.reply({
				content: 'You already sold these fish!',
				ephemeral: true,
			});
			return;
		}

		try {
			const updatedUser = await User.findOneAndUpdate(
				{ userId: userData.userId },
				{ $set: {
					'inventory.fish': newFish,
					'inventory.money': userData.inventory.money,
					'stats.soldLatestFish': true,
				} },
				{ $unset: { 'stats.latestFish': '' } },
				{ new: true },
			);

			if (!updatedUser) {
				await interaction.reply({
					content: 'There was an error updating your userdata! Your userdata was not changed.',
					ephemeral: true,
				});
			}

			await interaction.reply({
				content: 'Successfully sold your recent catch!',
				ephemeral: true,
			});
		}
		catch (err) {
			console.error(err);
			await interaction.reply({
				content: 'There was an error updating your userdata!',
				ephemeral: true,
			});
		}

	},
};
