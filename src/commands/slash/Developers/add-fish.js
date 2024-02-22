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
        .setName("add-fish")
        .setDescription("Adds fish to fishing pool.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the fish.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("rarity")
                .setDescription("Rarity of the fish.")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("value")
                .setDescription("Value of the fish.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("qualities")
                .setDescription("Qualities of the fish.")
                .setRequired(false)
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
            let rarity = interaction.options.getString("rarity");
            let value = interaction.options.getInteger("value");
            let qualities = interaction.options.getString("qualities")?.split(",");

        try {
            let fishData = (await Fish.findOne({ name: name }));
            if (!fishData) {
                fishData = new Fish({
                    name: name,
                    rarity: rarity,
                    value: value,
                    qualities: qualities
                });
                fishData.save()
            } else {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription(`Fish with name already exists.`)
                            .setColor('Red')
                    ]
                });
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Fish Added")
                        .setDescription(`Successfully added the fish to the registry.`)
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
