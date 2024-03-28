import { Command } from "#base";
import { db } from "#database";
import { createEmbedAsset, createEmbedFooter, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from "discord.js";

new Command({
    name: "avatars",
    description: "[utilidades] veja o avatar de um usúario ou o seu!",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: "membro",
            description: "escolha um usuario",
            type: ApplicationCommandOptionType.User
        }
    ],

    async run(interaction) {
        const { options } = interaction;

        let user = options.getUser("membro")
        if (!user) user = interaction.user

        const Data = await db.members.findOne({ id: user.id })

        if (!Data) {
            await db.members.create({ id: user.id, guildId: interaction.guild.id })
        }

        const { viewer, replyEmbed } = {
            replyEmbed: new EmbedBuilder({
                title: `📸 | ${user.username}`,
                color: 0x5865F2,
                image: createEmbedAsset(user.avatarURL()),
                timestamp: new Date().toISOString(),
                footer: createEmbedFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ size: 2048 }) })


            }),
            viewer: createRow(
                new ButtonBuilder()
                    .setURL(user.avatarURL({ size: 2048 }) || "https://i.imgur.com/ZrLcTe1.jpeg")
                    .setLabel("Abrir foto")
                    .setStyle(ButtonStyle.Link)
            )

        }
        await interaction.reply({ embeds: [replyEmbed], components: [viewer] });

    }
});