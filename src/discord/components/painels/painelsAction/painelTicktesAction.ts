import { Component, Modal } from "#base";
import { TicketSchema, db } from "#database";
import { generateUUID } from "#functions";
import { settings } from "#settings";
import { EmbedBuilderPlus, createEmbed, createEmbedFooter } from "@magicyan/discord";
import { createTranscript } from "discord-html-transcripts";
import { EmbedBuilder, GuildMember, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle, formatEmoji } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel } from "discord.js";

new Component({
    customId: "sairTicket/:userID",
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { userID }) {

        const { guild, client } = interaction

        if (userID !== interaction.user.id) {
            interaction.reply({ content: "apenas quem abriu o ticket pode sair do canal!", ephemeral })
            return
        }

        const buttons = [
            new ButtonBuilder()
                .setCustomId(`sairTicket`)
                .setLabel("Sair do Canal")
                .setDisabled(true)
                .setStyle(ButtonStyle.Primary),
        ];

        buttons.push(
            new ButtonBuilder()
                .setCustomId("assumirTicket")
                .setLabel("Assumir Ticket")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        buttons.push(
            new ButtonBuilder()
                .setCustomId("finalizarTicket")
                .setLabel("Finalizar Ticket")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)
        );
        if (!interaction.channel) return

        const canal = await guild.channels.fetch(interaction.channel.id) as TextChannel
        const uuid = generateUUID()

        canal.setName(`⛔・fechado-${uuid}`);

        canal.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: false,
        });

        await interaction.update({
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
        });

        await interaction.followUp({
            embeds: [
                new EmbedBuilder().setDescription(
                    `_**${interaction.user.username}** finalizou seu **ATENDIMENTO** após clicar em Sair do Canal_`
                ),
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteChannel")
                        .setLabel("Deletar Ticket")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("saveMessages")
                        .setLabel("Salvar Mensagens")
                        .setStyle(ButtonStyle.Danger)
                ),
            ],
        });
        const ticketConfigs = await db.ticketsP.findOne({ guildId: interaction.guild.id }) as TicketSchema
        const ChannelT = ticketConfigs.tickets.map(t => t.channelId)
        const userT = guild.members.cache.get(userID)

        if (!ChannelT.includes(interaction.channel.id)) return

        try {
            await interaction.user.send({
                embeds: [
                    new EmbedBuilderPlus({
                        footer: createEmbedFooter({
                            text: `Espero que tenha tido um bom atendimento na ${interaction.guild.name}!`,
                            iconURL: client.user.avatarURL()
                        }),
                        title: `${formatEmoji(settings.emojis.terms)} **ATENDIMENTO FINALIZADO**`,
                        description: `${formatEmoji(settings.emojis.user)} - Ticket Aberto Por: ${userT?.user.username}\n\n${formatEmoji(settings.emojis.lockClose)} - Ticket Fechado Por: ${interaction.user.username}\n\n${formatEmoji(settings.emojis.clockEmoji)} - Horário: <t:${Math.floor(Date.now() / 1000)}:R>`,
                        thumbnail: client.user.avatarURL()
                    })
                ],
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    }
})


new Component({
    customId: "deleteChannel",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({ content: `${interaction.user} você não possui permissão para utilizar este comando.`, ephemeral });
            return
        }

        const Data = await db.ticketsP.findOne({ guildId: interaction.guild.id }) as TicketSchema
        if (!Data) return

        const deleteTicket = Data.tickets

        const ticketIndex = deleteTicket.findIndex(
            (ticket) => ticket.channelId === interaction.channel?.id
        );

        if (ticketIndex !== -1) {
            deleteTicket.splice(ticketIndex, 1);

            await db.ticketsP.findOneAndUpdate({ guildId: interaction.guild.id },
                { tickets: deleteTicket }, { new: true, upsert: true })
        }

        interaction.channel?.delete();
    },
});

new Component({
    customId: "saveMessages",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({ content: `${interaction.user} você não possui permissão para utilizar este comando.`, ephemeral });
            return
        }
        const { modal, msg } = {
            modal: new ModalBuilder()
                .setTitle("Descreva o que foi resolvido:")
                .setCustomId(`modalSave`),
            msg: new TextInputBuilder()
                .setCustomId("msg")
                .setLabel("DESCREVA A SEGUIR:")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("📃 Escreva aqui")
        }

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(msg);
        modal.addComponents(row);
        await interaction.showModal(modal);
    }
});

new Modal({
    customId: "modalSave",
    cache: "cached", isFromMessage: true,
    async run(interaction) {

        const { fields, guild, client } = interaction
        const cnsd = fields.getTextInputValue("msg");

        const Data = await db.ticketsP.findOne({ guildId: interaction.guild.id }) as TicketSchema
        if (!Data) return

        const ticketCreated = Data.tickets
        const userTicket = ticketCreated.filter(
            (user) => user.channelId === interaction.channel?.id
        );


        await interaction.reply({ content: "📫 _Salvando as mensagens e deletando o ticket_", ephemeral });

        setTimeout(async () => {

            const deleteTicket = Data.tickets
            const ticketIndex = deleteTicket.findIndex(
                (ticket) => ticket.channelId === interaction.channel?.id
            );

            interaction.channel?.delete()

            if (ticketIndex !== -1) {
                deleteTicket.splice(ticketIndex, 1);

                await db.ticketsP.findOneAndUpdate({ guildId: interaction.guild.id },
                    { tickets: deleteTicket }, { new: true, upsert: true })
            }
        }, 6000);

        const transcriptContent = await createTranscript(
            interaction.channel as TextChannel,
        );

        const botConfig = await db.guilds.findOne({ id: interaction.guild.id })
        const logsChannel = botConfig?.botConfigs?.logsChannel as string

        const logs = guild.channels.cache.get(logsChannel) as TextChannel

        if (!logs) {
            await interaction.reply({ content: "canal de logs não encontrado", ephemeral })
            return
        }

        return await logs.send({
            embeds: [
                createEmbed({
                    title: `${formatEmoji(settings.emojis.terms)} LOG ATENDIMENTO`,
                    description: `${formatEmoji(settings.emojis.lockClose)} Ticket fechado por: <@${interaction.user.id}>\n\n${formatEmoji(settings.emojis.user)} Ticket aberto por: <@${userTicket[0].abertoPorId}>\n\n${formatEmoji(settings.emojis.userOwner)} Ticket assumido por: <@${userTicket[0].assumido}>\n\n${formatEmoji(settings.emojis.starEmoji)} Considerações Finais: 
                    \`\`\`${cnsd}\`\`\``,

                    fields: [{
                        name: `${formatEmoji(settings.emojis.idTicket)} ID do Ticket:`,
                        value: `\`\`${userTicket[0].ticketId}\`\``,
                        inline: true,
                    },
                    {
                        name: `${formatEmoji(settings.emojis.clockLock)} Horario de fechamento:`,
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true,
                    }],

                    image: `${settings.embed.image}`,
                    footer: { text: `Todos os direitos reservados para ${client.user.username}`, iconURL: client.user.avatarURL() }

                })
            ],
            files: [transcriptContent],
        });
    },
});

new Component({
    customId: "finalizarTicket",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const { client } = interaction

        const Data = await db.ticketsP.findOne({ guildId: interaction.guild.id }) as TicketSchema
        if (!Data) return
        if (!interaction.channel) return

        const ticketCreated = Data.tickets
        const userTicket = ticketCreated.filter(
            (user) => user.channelId === interaction.channel?.id
        );

        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id })

        if (!usersPerms?.userPermissions.includes(interaction.user.id) || (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))) {
            const noPerm = new EmbedBuilder().setDescription(
                `📌・Opps! **${interaction.user.username}** parece que você não possui permissão para executar isso.`
            );
            interaction.reply({ embeds: [noPerm], ephemeral })
            return
        }

        const ticketUser = userTicket[0].abertoPorId as string
        const user = interaction.guild.members.cache.get(ticketUser) as GuildMember

        const canal = await interaction.guild.channels.fetch(interaction.channel.id) as TextChannel

        canal.permissionOverwrites.edit(user, {
            ViewChannel: false,
        });

        setTimeout(async () => {

            const deleteTicket = Data.tickets
            const ticketIndex = deleteTicket.findIndex(
                (ticket) => ticket.channelId === interaction.channel?.id
            );

            if (ticketIndex !== -1) {
                deleteTicket.splice(ticketIndex, 1);

                await db.ticketsP.findOneAndUpdate({ guildId: interaction.guild.id },
                    { tickets: deleteTicket }, { new: true, upsert: true })
            }
        }, 60000);

        setTimeout(() => {
            interaction.channel?.delete();
        }, 61000);

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setFooter({ text: "Este ticket será fechado em 1 minuto" })
                    .setTitle(`${formatEmoji(settings.emojis.ticket)} **TICKET FINALIZADO!**`)
            ],
            components: [],
        });

        const botConfig = await db.guilds.findOne({ id: interaction.guild.id })
        const logsChannel = botConfig?.botConfigs?.logsChannel as string
        const logs = interaction.guild.channels.cache.get(logsChannel) as TextChannel

        await logs.send({
            embeds: [
                createEmbed({
                    title: `${formatEmoji(settings.emojis.terms)} LOG ATENDIMENTO`,
                    description: `${formatEmoji(settings.emojis.lockClose)} Ticket fechado por: <@${interaction.user.id}>\n\n${formatEmoji(settings.emojis.user)} Ticket aberto por: <@${userTicket[0].abertoPorId}>\n\n${formatEmoji(settings.emojis.userOwner)} Ticket assumido por: <@${userTicket[0].assumido}>`,
                    fields: [{
                        name: `${formatEmoji(settings.emojis.idTicket)} ID do Ticket:`,
                        value: `\`\`${userTicket[0].ticketId}\`\``,
                        inline: true,
                    },
                    {
                        name: `${formatEmoji(settings.emojis.clockLock)} Horario de fechamento:`,
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true,
                    }],

                    image: `${settings.embed.image}`,
                    footer: { text: `Todos os direitos reservados para ${client.user.username}`, iconURL: client.user.avatarURL() }

                })
            ],
        });
        try {
            await user.send({
                embeds: [
                    new EmbedBuilderPlus({
                        footer: createEmbedFooter({
                            text: `Espero que tenha tido um bom atendimento na ${interaction.guild.name}!`,
                            iconURL: client.user.avatarURL()
                        }),
                        title: `${formatEmoji(settings.emojis.terms)} **ATENDIMENTO FINALIZADO**`,
                        description: `${formatEmoji(settings.emojis.user)} - Ticket Aberto Por: ${user.user.username}\n\n${formatEmoji(settings.emojis.lockClose)} - Ticket Fechado Por: ${interaction.user.username}\n\n${formatEmoji(settings.emojis.clockEmoji)} - Horário: <t:${Math.floor(Date.now() / 1000)}:R>`,
                        thumbnail: client.user.avatarURL()
                    })
                ],
            });

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    },
});

new Component({
    customId: "assumirTicket",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        const Data = await db.ticketsP.findOne({ guildId: interaction.guild.id }) as TicketSchema
        if (!Data) return
        if (!interaction.channel) return

        const ticketCreated = Data.tickets
        const userTicket = ticketCreated.filter((user) => user.channelId === interaction.channel?.id);
        const ticketUser = userTicket[0].abertoPorId as string
        const user = interaction.guild.members.cache.get(ticketUser) as GuildMember

        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id })

        if (!usersPerms?.userPermissions.includes(interaction.user.id) || (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))) {
            const noPerm = new EmbedBuilder().setDescription(`📌・Opps! **${interaction.user.username}** parece que você não possui permissão para executar isso.`);

            interaction.reply({ embeds: [noPerm], ephemeral })
            return
        }

        const assumyTicket = Data.tickets
        const ticketIndex = assumyTicket.findIndex((ticket) => ticket.channelId === interaction.channel?.id);

        if (ticketIndex !== -1) {
            assumyTicket[ticketIndex].assumido = interaction.user.id

            await db.ticketsP.findOneAndUpdate({ guildId: interaction.guild.id },
                { tickets: assumyTicket }, { new: true, upsert: true })
        }

        const canal = await interaction.guild.channels.fetch(interaction.channel.id) as TextChannel

        canal.setTopic(`👤 | ID DO MEMBRO: ${user.id} - 🎫 Ticket Atendido Por: ${interaction.user.username}`);

        const buttons = [
            new ButtonBuilder()
                .setCustomId(`sairTicket/${user.id}`)
                .setLabel("Sair do Canal")
                .setDisabled(false)
                .setStyle(ButtonStyle.Primary),
        ];

        buttons.push(
            new ButtonBuilder()
                .setCustomId("assumirTicket")
                .setLabel("Assumir Ticket")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
        buttons.push(
            new ButtonBuilder()
                .setCustomId("finalizarTicket")
                .setLabel("Finalizar Ticket")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false)
        );

        await interaction.update({ components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)] });
        await interaction.followUp({ content: "**✅ | Você assumiu o ticket com sucesso**", ephemeral });

        try {
            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`\`\`📡 ${interaction.guild.name} - NOTIFICAÇÃO\`\``)
                        .setDescription(
                            `_Olá **${user.user.username}**, seu TICKET foi assumido pelo staff <@${interaction.user.id}>, para acessar seu ticket, clique no botão abaixo:_`
                        ),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel("Ir para o Ticket")
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
                    ),
                ],
            })
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
        return;
    },
});