import { Command } from "#base";
import { db } from "#database";
import { createRow, findCommand } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, chatInputApplicationCommandMention } from "discord.js";

new Command({
    name: "criar-painel",
    description: "[ADM] Crie Um Novo Painel De Ticket.",
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "id",
            description: "Coloque o ID do novo ticket aqui!",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],



    async run(interaction) {
        const { options } = interaction;
        
        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id }).then((user) => user?.userPermissions) as Array<string>;

        if (!usersPerms.includes(interaction.user.id)) {
            return interaction.reply({ content: `**❌ | Você não tem permissão.**`, ephemeral });
        };

        const id = options.getString("id");
        const command = findCommand(interaction.guild.client).byName("config-painel");
        if (!command) return;

        await interaction.reply({ content: `✅ | Painel criado com sucesso, use ${chatInputApplicationCommandMention(command.name, command.id)} **${id}** Para configura-lo`,
         ephemeral });

        await db.ticketsP.create({
            idP: id,
            guildId: interaction.guild.id
        })

        const novaCategoria = {
            nome: "TICKET",
            descricao: "Opção padrao após criar o painel.",
            emoji: "🎫",
            value: "ticket",
        };

        await db.ticketsP.findOneAndUpdate(
            { idP: id, guildId: interaction.guild.id },
            {
                categorias: novaCategoria
            },
            {
                new: true,
                upsert: true
            }
        );

        const { embed, select } = {
            embed: new EmbedBuilder()
                .setTitle(`Não configurado ainda...`)
                .setDescription(`Não configurado ainda...`),

            select: createRow(
                new StringSelectMenuBuilder()
                    .setCustomId(`abrirTicketMenu/${id}`)
                    .setPlaceholder("Selecione um Ticket")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("TICKET")
                            .setEmoji("🎫")
                            .setDescription("Opção padrao após criar o painel.")
                            .setValue("ticket")
                    )
            )
        };

        return await interaction.channel?.send({ embeds: [embed], components: [select] })
            .then(async (msg) => {
                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild.id }, {
                    $set: {
                        "channels.general": interaction.channel?.id,
                        "channels.msg": msg.id
                    }
                })
            });
    }

});