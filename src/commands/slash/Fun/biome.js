const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { getUser, xpToLevel } = require('../../../util/User');
const { log } = require('../../../util/Utils');
const { Biome } = require('../../../schemas/BiomeSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('biome')
		.setDescription('Switch to a new biome.'),
	options: {
		cooldown: 15000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	async run(client, interaction, user = null) {
		if (user === null) user = interaction.user;

		const biomes = await Biome.find({});
		const uniqueValues = new Set();

		let options = [];
		const biomePromises = biomes.map(async (biome) => {
			try {
				const value = biome._id.toString();

				if (!uniqueValues.has(value)) {
					uniqueValues.add(value);

					return new StringSelectMenuOptionBuilder()
						.setLabel(biome.name)
						.setDescription(`${biome.requirements}`)
						.setEmoji(biome.toJSON().icon.data.split(':')[1])
						.setValue(value);
				}

			}
			catch (error) {
				log(error, 'err');
			}
		});

		options = await Promise.all(biomePromises);
		options = options.filter((option) => option !== undefined);

		const select = new StringSelectMenuBuilder()
			.setCustomId('switch-biome')
			.setPlaceholder('Make a selection!')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Which biome would you like to switch to?',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 15000 });

		collector.on('collect', async i => {
			const selection = i.values[0];
			const userData = await getUser(user.id);
			const originalBiome = await Biome.findById(selection);

			// check if user meets biome requirements
			let unlocked = true;
			let reqLevel = 0;
			for (const requirement of originalBiome.requirements) {
				if (requirement.toLowerCase().includes('level')) {
					reqLevel = requirement.split(' ')[1];
					const level = await xpToLevel(userData.xp);

					if (level < reqLevel) {
						unlocked = false;
						break;
					}
				}
			}

			if (unlocked) {
				userData.currentBiome = originalBiome.name;
				userData.save();
				await i.reply(`${i.user} has switched to the **${originalBiome.name}**!`);
			}
			else {
				await i.reply({
					content: `You need to be level ${reqLevel} to switch to the ${originalBiome.name}!`,
					ephemeral: true,
				});
			}
		});
	},
};
