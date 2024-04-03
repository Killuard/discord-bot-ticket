import { Command } from "#base";
import { db } from "#database";
import { findCommand } from "@magicyan/discord";
import { ApplicationCommandOptionType, PermissionFlagsBits, chatInputApplicationCommandMention } from "discord.js";
import { ApplicationCommandType } from "discord.js";

new Command({
    name: "perm-add",
    description: "[Dono] Painel de gerenciar permissões.",
    dmPermission: false,
    defaultMemberPermissions: (PermissionFlagsBits.Administrator),
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Usúario Para adicionar no sistema de [ADM]",
            type: ApplicationCommandOptionType.User
        }
    ],
    async run(interaction) {
        const { options } = interaction;

        const member = options.getMember(`user`) || interaction.member

        const command = findCommand(interaction.guild.client).byName("perm-add");
		if (!command) return;

        if (interaction.guild.ownerId !== interaction.user.id) {
            await interaction.reply({ content: "**❌ | Apenas o dono do Servidor pode executar isso.**", ephemeral });
            return
        }

        const Data = await db.guilds.findOne({ id: interaction.guild.id })
        if (!Data) {
            await db.guilds.create({ id: interaction.guild.id })
            await interaction.reply({ content: `Database Criada, utilize ${chatInputApplicationCommandMention(command.name, command.id)} novamente`, ephemeral})
            return
        }

        if (!Data?.userPermissions.includes(member.id)) {
            Data?.userPermissions.push(member.id);
        }

        await Data?.save()

        await interaction.reply({
            content: `**✅ | Usuário ${member} agora possui a permissão de gerenciar o bot.**`, ephemeral
        });
    },
})