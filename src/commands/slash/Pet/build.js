const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { capitalizeWords } = require('../../../util/Utils');
const { Aquarium } = require('../../../class/Aquarium');
const { Habitat } = require('../../../schemas/HabitatSchema');
const { User, getUser } = require('../../../class/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('build')
		.setDescription('Build and aquarium!')
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription('Name of the aquarium.')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('watertype')
				.setDescription('Freshwater or Saltwater?')
				.setRequired(true),
		),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		await interaction.deferReply();

		const user = new User(await getUser(interaction.user.id));
		if (!user) return interaction.followUp({ content: 'There was an error retrieving your data!', ephemeral: true });

		const name = interaction.options.getString('name');
		// check to see if user already has an aquarium with that name
		const exists = await Habitat.exists({ name: name, owner: await user.getUserId() });
		if (exists) return interaction.followUp({ content: 'You already have an aquarium with that name!', ephemeral: true });

		let waterType = interaction.options.getString('watertype');
		waterType = capitalizeWords(waterType.toLowerCase());
		// make sure waterType is equal to either freshwater or saltwater
		if (waterType.toLowerCase() !== 'freshwater' && waterType.toLowerCase() !== 'saltwater') {
			return interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aquarium')
						.addFields(
							{ name: 'Build', value: 'Invalid water type!' },
						),
				],
			});
		}

		const license = await user.getAquariumLicense(waterType);
		if (!license) return interaction.followUp({ content: 'You do not have an aquarium license for that water type!', ephemeral: true });

		let success = false;
		let newAquarium;
		if (license) {
			newAquarium = new Aquarium({
				name,
				size: license.aquarium.size,
				waterType,
				owner: await user.getUserId(),
			});

			success = await newAquarium.save();
			if (success) {
				(await user.getInventory()).aquariums.push(await newAquarium.getId());
				await user.save();
			}
		}

		if (success) {
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aquarium')
						.addFields(
							{ name: 'Construction Complete', value: `You have successfully constructed aquarium **${name}**!` },
						),
				],
			});
		}
		else {
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aquarium')
						.addFields(
							{ name: 'Construction Incomplete', value: 'Aquarium was unable to be constructed.' },
						),
				],
			});
		}
	},
};
