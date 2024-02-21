const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const { Fish } = require("../../../schemas/FishSchema");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("remove-fish")
        .setDescription("Removes fish from fishing pool.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the fish.")
                .setRequired(true)
        ),
    options: {
        developers: true,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction<true>} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        let name = interaction.options.getString("name");

        try {
            await Fish.findOneAndDelete({ name: name });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Fish Removed")
                        .setDescription(`Successfully removed the fish from the registry.`)
                        .setColor('Green')
                ]
            });
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(`Something went wrong.`)
                        .setColor('Red')
                ]
            });
        };

    },
};
