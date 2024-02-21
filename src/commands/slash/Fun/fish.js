const {SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const {fish, generateXP} = require('../../../functions');
const {User} = require('../../../schemas/UserSchema');

module.exports = {
	customId: 'fish-again',
	structure: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('Fish!'),
	options: {
		cooldown: 5000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction) {
		await interaction.deferReply();

		const f = await fish('');
		const user = await User.findOne({userId: interaction.user.id});
		if (user) {
			user.inventory.fish.push(f);
			user.stats.fishCaught++;
			user.stats.latestFish = f;
			user.stats.soldLatestFish = false;
			user.xp += generateXP();
			user.save();
		}

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle('Fished!')
					.addFields(
						{name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon.data}> You caught **${f.rarity}** ${f.name}!`},
					),
			],
			components: [
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('fish-again')
							.setLabel('Fish again!')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('sell-one-fish')
							.setLabel('Sell')
							.setStyle(ButtonStyle.Danger),
					),
			],
		});
	},
};
