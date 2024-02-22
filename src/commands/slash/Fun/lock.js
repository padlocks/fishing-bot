const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { Fish } = require("../../../schemas/FishSchema");
const { User } = require("../../../schemas/UserSchema");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Locks fish in your inventory by name.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the fish you wish to lock.")
                .setRequired(true)
        ),
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        const name = interaction.options.getString("name");
		const user = await User.findOne({ userId: interaction.user.id });

		if (!user) {
		console.error('User not found');
		await interaction.editReply({
			embeds: [
			new EmbedBuilder()
				.setTitle("Fish Not Locked")
				.setDescription("Failed to lock fish. User not found.")
				.setColor('Red')
			]
		});
		return;
		}

		// Find all fish objects with the specified name and update their 'locked' property
		const fishPromises = await user.inventory.fish.map(async x => await Fish.findById(x.valueOf()))
		const fishList = await Promise.all(fishPromises);
		fishList.forEach(async fish => {
			if (fish.name === name) {
				fish.locked = true;
				await fish.save()
			}
		})

		try {
		// Save the updated user
		await interaction.editReply({
			embeds: [
			new EmbedBuilder()
				.setTitle("Fish Locked")
				.setDescription(`Successfully locked all **${name}**.`)
				.setColor('Green')
			]
		});
		} catch (err) {
		console.error('Error updating fish:', err);
		await interaction.editReply({
			embeds: [
			new EmbedBuilder()
				.setTitle("Fish Not Locked")
				.setDescription(`Failed to lock **${name}**. An error occurred.`)
				.setColor('Red')
			]
		});
		}
    }
};
