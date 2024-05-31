const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../../util/User');
const { Habitat } = require('../../../schemas/HabitatSchema');
const { PetFish } = require('../../../schemas/PetSchema');
const { Aquarium } = require('../../../class/Aquarium');
const { Pet } = require('../../../class/Pet');
const buttonPagination = require('../../../buttonPagination');
const { ItemData } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('aquarium')
		.setDescription('Everything about your aquariums!')
		.addSubcommand((o) => o.setName('view').setDescription('View your aquariums.'))
		.addSubcommand((o) => o.setName('upgrade').setDescription('Upgrade your aquarium.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the aquarium you want to upgrade.').setRequired(true)))
		.addSubcommand((o) => o.setName('clean').setDescription('Clean your aquarium.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the aquarium you want to clean.').setRequired(true)))
		.addSubcommand((o) => o.setName('feed').setDescription('Feed your fish.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the aquarium you want to feed.').setRequired(true)))
		.addSubcommand((o) => o.setName('adjust').setDescription('Adjust the temperature of your aquarium.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the aquarium you want to adjust.').setRequired(true))
			.addIntegerOption((p) => p.setName('temperature').setDescription('The temperature you want to set the aquarium to.').setRequired(true)))
		.addSubcommandGroup((o) => o.setName('fish').setDescription('Manage the fish in your aquarium.')
			.addSubcommand((p) => p.setName('move').setDescription('Add a fish to your aquarium.')
				.addStringOption(q => q.setName('fish').setDescription('The name of the pet fish you want to move').setRequired(true))
				.addStringOption(q => q.setName('aquarium').setDescription('The name of the aquarium you want to add the fish to').setRequired(true)),
			),
		),
	options: {
		cooldown: 3_000,
	},
	run: async (client, interaction) => {
		const subcommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		const user = await getUser(interaction.user.id);
		if (!user) return await interaction.followUp('There was an issue retrieving your data. Please try again later.');

		if (subcommand === 'view') {
			// get aquariums owned by the user
			const aquariums = await Habitat.find({ owner: interaction.user.id });
			if (!aquariums.length) return await interaction.followUp('You do not own any aquariums. You can use the `build` command to create one.');

			const embeds = [];
			const fields = [];

			for (const aquarium of aquariums) {
				const fish = await Promise.all(aquarium.fish.map(async fishId => { return await PetFish.findById(fishId); }));
				const information = { name: `Aquarium: ${aquarium.name}`, value: `**Fish**: ${aquarium.fish.length}/${aquarium.size}\n**Cleanliness**: ${aquarium.cleanliness}%\n**Temperature**: ${aquarium.temperature}°C\n**Inhabitants**: ` };
				if (!fish.length) information.value += 'None';
				for (const f of fish) {
					information.value += `${f.name}\n`;
				}
				fields.push(information);
			}

			const chunkSize = 1;
			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.username}'s Aquariums`)
					.setDescription(`You own ${aquariums.length} aquariums.`)
					.setColor('Blue')
					.addFields(chunk),
				);
			}

			return await buttonPagination(interaction, embeds, true);
		}

		if (subcommand === 'upgrade') {
			const aquariumName = interaction.options.getString('name');
			const aquariumData = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquariumData) return await interaction.followUp(`You do not own an aquarium named **${aquariumName}**.`);

			const aquarium = new Aquarium(aquariumData);

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
					return !l.aquarium.waterType.includes(await aquarium.getWaterType());
				});
				// find the license with the highest size constraint
				const sortedLicenses = await waterLicenses.sort((a, b) => b.aquarium.size - a.aquarium.size);
				license = sortedLicenses[0];
			}
			if (license.aquarium.size <= await aquarium.getSize()) {
				return await interaction.followUp(`The aquarium named **${aquariumName}** is already at the maximum size allowed by your license.`);
			}
			else {
				await aquarium.upgrade(license.aquarium.size);
			}

			return await interaction.followUp(`You have upgraded the aquarium named **${aquariumName}**. It can now hold ${await aquarium.getSize()} fish.`);
		}

		if (subcommand === 'clean') {
			const aquariumName = interaction.options.getString('name');
			const aquariumData = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquariumData) return await interaction.followUp(`You do not own an aquarium named **${aquariumName}**.`);

			const aquarium = new Aquarium(aquariumData);
			await aquarium.clean();

			return await interaction.followUp(`You have cleaned the aquarium named **${aquariumName}**.`);
		}

		if (subcommand === 'feed') {
			const aquariumName = interaction.options.getString('name');
			const aquariumData = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquariumData) return await interaction.followUp(`You do not own an aquarium named **${aquariumName}**.`);

			const aquarium = new Aquarium(aquariumData);
			const fishIds = await aquarium.getFish();
			const fish = await Promise.all(fishIds.map(async fishId => { return await PetFish.findById(fishId); }));
			for (const f of fish) {
				const pet = new Pet(f);
				await pet.feed();
			}

			return await interaction.followUp(`You have fed the fish in the aquarium named **${aquariumName}**.`);
		}

		if (subcommand === 'adjust') {
			const aquariumName = interaction.options.getString('name');
			const aquariumData = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquariumData) return await interaction.followUp(`You do not own an aquarium named **${aquariumName}**.`);

			const aquarium = new Aquarium(aquariumData);
			const temperature = interaction.options.getInteger('temperature');
			if (temperature < -30 || temperature > 30) return await interaction.followUp('The temperature must be between -30 and 30 degrees Celsius.');

			await aquarium.adjustTemperature(temperature);

			return await interaction.followUp(`You have set the temperature of the aquarium named **${aquariumName}** to ${temperature}°C.`);
		}

		if (subcommand === 'fish') {
			await interaction.followUp('Please provide a subcommand.');
			return;
		}

		if (subcommand === 'move') {
			const fish = interaction.options.getString('fish');
			// find the pet fish owned by user
			const petFishData = await PetFish.findOne({ name: fish, owner: interaction.user.id });
			if (!petFishData) return await interaction.followUp(`You do not own a pet fish named **${fish}**. You can use the \`adopt\` command to adopt one.`);

			const aquariumName = interaction.options.getString('aquarium');
			// check if the aquarium exists
			const aquariumData = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquariumData) return await interaction.followUp(`You do not own an aquarium named **${aquariumName}**.`);
			// check if the fish is already in the aquarium
			if (aquariumData.fish.includes(petFishData.id)) return await interaction.followUp(`The fish named **${fish}** is already in the aquarium named **${aquariumName}**.`);
			// check if the aquarium is full
			if (aquariumData.fish.length >= aquariumData.size) return await interaction.followUp(`The aquarium named **${aquariumName}** is full.`);

			const pet = new Pet(petFishData);
			const aquarium = new Aquarium(aquariumData);

			// move pet to aquarium
			await aquarium.moveFish(pet, aquarium);

			return await interaction.followUp(`You have moved **${fish}** to the aquarium named **${aquariumName}**.`);
		}
	},
};