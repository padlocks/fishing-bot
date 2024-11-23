const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Quest } = require('../../../class/Quest');
const { User } = require('../../../class/User');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('tutorial')
		.setDescription('Learn how to play the game!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction, analyticsObject) => {
		// Start the tutorial quest
		const tutorialQuest = await Quest.getByTitle('My First Rod I');
		const userObject = await User.get(interaction.user.id);
		const user = new User(userObject);

		// Check if the user already has the quest
		const inventory = await user.getQuests();
		if (inventory.some(q => q.title === tutorialQuest.title)) {
			return await interaction.reply({ content: "You already have the tutorial quest!", ephemeral: true });
		}

		// Add the quest to the user's inventory
		await user.startQuest(new Quest(tutorialQuest));

		// Send the tutorial message
		const embed = new EmbedBuilder()
			.setTitle('Tutorial')
			.setDescription(
				`Welcome to the tutorial! You have received the quest **${tutorialQuest.title}**.`
			)
			.addFields({name: "Dialogue", value: tutorialQuest.description})
			.setFooter({ text: 'Good luck! 🎣' });

		await interaction.reply({ embeds: [embed], ephemeral: false });
	},
};
