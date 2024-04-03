import { Command } from "#base";
import { db } from "#database";
import { ActionRowBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { ButtonStyle } from "discord.js";
import { ApplicationCommandType, ButtonBuilder, PermissionFlagsBits } from "discord.js";

new Command({
    name: "bot-config",
    description: "[ADM] Painel de gerenciar o bot.",
    defaultMemberPermissions: (PermissionFlagsBits.Administrator),
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {

        const { client } = interaction

        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id })
        if (!usersPerms) {
            await db.guilds.create({ id: interaction.guild.id })
        }

        if (!usersPerms?.userPermissions.includes(interaction.user.id)) {
            interaction.reply({ content: `**❌ | Você não tem permissão.**`, ephemeral });
            return
        };

        const embed = new EmbedBuilder()
            .setTitle(`${client.user.username} | Gerenciar Ticket`)
            .setDescription("**_Selecione abaixo a opção que deseja configurar_**");

        const buttons = [
            new ButtonBuilder()
                .setCustomId("configLogs")
                .setEmoji("📰")
                .setLabel("Configurar LOGS")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("configAvaliacao")
                .setEmoji("⭐")
                .setLabel("Configurar AVALIAÇÃO")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("configCategorias")
                .setEmoji("📒")
                .setLabel("Configurar CATEGORIAS")
                .setStyle(ButtonStyle.Secondary),
        ];

        await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
            ephemeral
        });
    },

});