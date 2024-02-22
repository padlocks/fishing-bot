const { User } = require('../../schemas/UserSchema');
const { Fish } = require('../../schemas/FishSchema');

module.exports = {
	customId: 'sell-one-fish',
	/**
     *
     * @param {ExtendedClient} client
     * @param {ButtonInteraction} interaction
     */
	run: async (client, interaction) => {
		if (interaction.message.interaction.user.id !== interaction.user.id) return;

		const user = await User.findOne({ userId: interaction.user.id });
		if (!user) return;

		const fish = user.stats.latestFish;
		const fishData = await Fish.findById(fish.valueOf());
		const value = fishData.value;
		const newFish = user.inventory.fish.filter(x => {
			return x._id.valueOf() != fishData._id.valueOf();
		});

		if (user.stats.soldLatestFish) {
			await interaction.reply({
				content: 'You already sold this fish!',
				ephemeral: true,
			});
			return;
		}

		try {
			const updatedUser = await User.findOneAndUpdate(
				{ userId: user.userId },
				{ $set: {
					'inventory.fish': newFish,
					'inventory.money': user.inventory.money + value,
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
			console.log(err);
			await interaction.reply({
				content: 'There was an error updating your userdata!',
				ephemeral: true,
			});
		}

	},
};