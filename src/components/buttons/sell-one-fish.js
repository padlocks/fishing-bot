const { User } = require('../../schemas/UserSchema');
const { FishData } = require('../../schemas/FishSchema');
const { log, getUser } = require('../../functions');

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

		const fish = userData.stats.latestFish;
		const fishData = await FishData.findById(fish.valueOf());
		const value = fishData.value;
		const newFish = userData.inventory.fish.filter(x => {
			return x._id.valueOf() != fishData._id.valueOf();
		});

		if (userData.stats.soldLatestFish) {
			await interaction.reply({
				content: 'You already sold this fish!',
				ephemeral: true,
			});
			return;
		}

		try {
			const updatedUser = await User.findOneAndUpdate(
				{ userId: userData.userId },
				{ $set: {
					'inventory.fish': newFish,
					'inventory.money': userData.inventory.money + value,
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
				content: `Successfully sold your **${fishData.rarity}** ${fishData.name}!`,
				ephemeral: true,
			});
		}
		catch (err) {
			log(err, 'err');
			await interaction.reply({
				content: 'There was an error updating your userdata!',
				ephemeral: true,
			});
		}

	},
};