import { Command } from "#base";
import { db } from "#database";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { ApplicationCommandType } from "discord.js";

new Command({
    name: "perm-add",
    description: "[DONO] Adicione uma pessoa para gerenciar o sistema.",
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

        const member = options.getMember(`user`) || interaction.user

        if (interaction.guild.ownerId !== interaction.user.id) {
            return await interaction.reply({ content: "**❌ | Apenas o dono do Servidor pode executar isso.**", ephemeral });
        }

        const Data = await db.guilds.findOne({ id: interaction.guild.id })
        if (!Data){ await db.guilds.create({ id: interaction.guild.id }) }

        const usersPerms = Data?.userPermissions as Array<string>

        if (!usersPerms.includes(member.id)) {
            usersPerms.push(member.id);
            await Data?.save();
        }

        return await interaction.reply({
            content: `**✅ | Usuário ${member} agora possui a permissão de gerenciar o bot.**`, ephemeral
        });
    },
})