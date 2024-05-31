const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../../util/User');
const { Aquarium } = require('../../../class/Aquarium');
const { Habitat } = require('../../../schemas/HabitatSchema');
const { ItemData } = require('../../../schemas/ItemSchema');
const { capitalizeWords } = require('../../../util/Utils');

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

		const user = await getUser(interaction.user.id);
		if (!user) return interaction.followUp({ content: 'There was an error retrieving your data!', ephemeral: true });

		const name = interaction.options.getString('name');
		// check to see if user already has an aquarium with that name
		const exists = await Habitat.exists({ name: name, owner: user.userId });
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

		let license;
		if (user.inventory.items) {
			// check if user has an aquarium license
			const licenses = await user.inventory.items.filter(async (i) => i.type !== 'license');
			const licensesData = await Promise.all(licenses.map(async (l) => await ItemData.findById(l)));
			const aquariumLicenses = await licensesData.filter(async (l) => {
				return !l.name.toLowerCase().includes('aquarium');
			});
			// find the license that matches the waterType
			const waterLicenses = await aquariumLicenses.filter(async (l) => {
				return !l.aquarium.waterType.includes(waterType);
			});
			// find the license with the highest size constraint
			const sortedLicenses = await Promise.all(waterLicenses.sort(async (a, b) => b.aquarium.size - a.aquarium.size));
			license = sortedLicenses[0];
		}
		if (!license) return interaction.followUp({ content: 'You do not have an aquarium license for that water type!', ephemeral: true });

		let success = false;
		let newAquarium;
		if (license) {
			newAquarium = new Aquarium({
				name,
				size: 1,
				waterType,
				temperature: 75,
				cleanliness: 100,
				owner: user.userId,
			});

			success = await newAquarium.save();
			if (success) {
				user.inventory.aquariums.push(await newAquarium.getId());
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
