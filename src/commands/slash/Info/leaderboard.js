const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { FishData } = require('../../../schemas/FishSchema');
const buttonPagination = require('../../../buttonPagination');
const config = require('../../../config');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Check the leaderboard!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction, analyticsObject) => {
		try {
			const embeds = [];
			const fields = [];

			const fish = await FishData.find({});
			const monthlyFish = await fish.filter((f) => {
				if (f.obtained < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return false;
				else return true;
			});

			const userData = [];
			for (const f of monthlyFish) {
				if (!f.user) continue;
				if (userData.some((u) => u.user === f.user)) {
					const index = userData.findIndex((u) => u.user === f.user);
					userData[index].count++;
				}
				else {
					userData.push({ user: f.user, count: 1 });
				}

				// sort the array by count
				userData.sort((a, b) => b.count - a.count);
			}

			// sort the array by count
			userData.sort((a, b) => b.count - a.count);

			const chunkSize = 10;
			for (let i = 0; i < userData.length; i++) {
				if (userData[i].count > 1) {
					const userId = userData[i].user;
					const user = await interaction.client.users.fetch(userId);
					fields.push(`Rank ${i + 1}: **${user?.username || 'undefined'}** - ${userData[i].count} fish\n`);
				}
			}

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);
				embeds.push(
					new EmbedBuilder()
						.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
						.setTitle('Monthly Leaderboard')
						.setColor('Green')
						.addFields([{ name: 'Rankings', value: chunk.join('') }]),
				);
			}

			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('completed');
				await analyticsObject.setStatusMessage('Displayed leaderboard.');
			}

			await buttonPagination(interaction, embeds, analyticsObject);
		}
		catch (err) {
			if (process.env.ANALYTICS || config.client.analytics) {
				await analyticsObject.setStatus('failed');
				await analyticsObject.setStatusMessage(err);
			}
			console.error(err);
		}
	},
};
