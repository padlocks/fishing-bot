const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { fish, generateXP, getEquippedRod } = require('../../../functions');
const { User } = require('../../../schemas/UserSchema');

const updateUserWithFish = async (userId) => {
	const rod = await getEquippedRod(userId);
	const f = await fish(rod.name);
	const user = await User.findOne({ userId: userId });
	if (user) {
		if (f.name == 'Lucky Rod') {
			user.inventory.rods.push(f);
		}
		else {
			user.inventory.fish.push(f);
		}
		rod.fishCaught++;
		user.stats.fishCaught++;
		user.stats.latestFish = f;
		user.stats.soldLatestFish = false;
		user.xp += generateXP();
		user.save();
		rod.save();
	}

	return f;
};

const followUpMessage = async (interaction, user, f) => {
	return await interaction.followUp({
		embeds: [
			new EmbedBuilder()
				.setTitle('Fished!')
				.addFields(
					{ name: 'Congratulations!', value: `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${user.globalName} caught **${f.rarity}** ${f.name}!` },
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
};

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
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		await interaction.deferReply();

		const newFish = await updateUserWithFish(user.id);

		const followUp = await followUpMessage(interaction, user, newFish);

		// const filter = () => interaction.user.id === interaction.message.author.id;

		const collector = followUp.createMessageComponentCollector({
			componentType: ComponentType.Button,
			// filter,
			time: 10000,
		});

		collector.on('collect', async collectionInteraction => {
			if (collectionInteraction.user.id !== user.id) return;
			if (collectionInteraction.customId === 'fish-again') {
				await this.run(client, collectionInteraction, user);
			}
		});
	},
};
