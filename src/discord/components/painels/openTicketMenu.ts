import { Component } from "#base";
import { db } from "#database";
import { generateUUID } from "#functions";
import { Categorydb, Ticketsdb } from "#interfaces";
import { settings } from "#settings";
import { createEmbedFooter, createRow } from "@magicyan/discord";
import { CategoryChannel, ChannelType } from "discord.js";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, PermissionsBitField, TextChannel, formatEmoji } from "discord.js";


const uuid = generateUUID()

new Component({
    customId: `abrirTicketMenu/:id`,
    type: ComponentType.StringSelect, cache: "cached",

    async run(interaction, { id }) {
        const { client, values, guild } = interaction
        const tipo = values[0];

        const category = guild.channels.cache.find(parent => parent.type === ChannelType.GuildCategory && parent.name === tipo) as CategoryChannel

        await interaction.update({});

        if (interaction.channel instanceof TextChannel) {

            await interaction.guild.channels.create({
                name: `🎫・${tipo}丨${interaction.user.username}`,
                topic: `<:info:1211927548527910933>・info: ${interaction.user.id}`,
                parent: category || interaction.channel.parent,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                ],
            }).then(async (c) => {
                await interaction.followUp({
                    embeds: [new EmbedBuilder().setDescription(`**_✅ | <@${interaction.user.id}>, seu TICKET foi aberto, use o botão abaixo para encontra-lo_**`)],
                    components: [createRow(
                        new ButtonBuilder()
                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${c.id}`)
                            .setEmoji("<:email:1137104275953156146>")
                            .setLabel("Ir para o Ticket")
                            .setStyle(ButtonStyle.Link))
                    ],
                    ephemeral

                }).then(async () => {

                    const buttons = createRow(
                        new ButtonBuilder()
                            .setCustomId(`sairTicket/${interaction.user.id}`)
                            .setLabel("Sair do Canal")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId("assumirTicket")
                            .setLabel("Assumir Ticket")
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("finalizarTicket")
                            .setLabel("Finalizar Ticket")
                            .setStyle(ButtonStyle.Danger));

                    const ticket = interaction.guild.channels.cache.get(c.id) as TextChannel;
                    if (!ticket) return console.log("erro")

                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })
                    if (!Data) return

                    await db.ticketsP.findOneAndUpdate<Ticketsdb>({ idP: id, guildId: interaction.guild.id }, {
                        $push: {
                            tickets: {
                                abertPor: interaction.user.username,
                                abertoPorId: interaction.user.id,
                                assumido: "Ninguém",
                                ticketId: uuid,
                                channelId: c.id
                            }
                        }
                    },
                        { upsert: true, new: true })

                    const categoriaS: Categorydb[] = Data.categorias as Categorydb[];
                    const listaCategorias = Object.values(categoriaS);
                    let assuntoCategory = listaCategorias.find(categoria => categoria.value === tipo);

                    let assuntoFinal = assuntoCategory ? assuntoCategory.value : 'Categoria não encontrada';

                    await ticket.send({
                        embeds: [new EmbedBuilder({
                            description: `${formatEmoji(settings.emojis.ticket)} Ticket **aberto** por: <@${interaction.user.id}>\n\n> A equipe já está ciente do seu ticket, não marque a equipe, aguarde um retorno no ticket:\n\n${formatEmoji(settings.emojis.terms)} | Motivo do Ticket:\`\`\`${assuntoFinal}\`\`\``,
                            author: ({ name: `${client.user.username}` }),
                            footer: createEmbedFooter({ text: `Estamos aqui para tirar todas suas duvidas!`, iconURL: client.user.avatarURL() })
                        })
                        ],
                        content: `<@${interaction.user.id}>`,
                        components: [buttons]
                    });

                })//end second then

            });//end first then
        }
    }//end run
})