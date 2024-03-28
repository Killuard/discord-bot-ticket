import { Component } from "#base";
import { db } from "#database";
import { createEmbedFooter, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageCollector, TextChannel } from "discord.js";


new Component({
    customId: `embed/:id`,
    type: ComponentType.Button,


    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })

        const { client } = interaction

        const { buttonOne, buttonTwo } = {
            buttonOne: createRow(
                new ButtonBuilder()
                    .setCustomId(`tituloEmbed/${id}`)
                    .setEmoji("<:config7:1107098507413827644>")
                    .setLabel("Titulo da embed")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`descEmbed/${id}`)
                    .setEmoji("<:config7:1107098507413827644>")
                    .setLabel("Descrição da embed")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`footerEmbed/${id}`)
                    .setEmoji("<:config7:1107098507413827644>")
                    .setLabel("Rodapé da embed")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`placeholder/${id}`)
                    .setEmoji("<:config7:1107098507413827644>")
                    .setLabel("Placeholder")
                    .setStyle(ButtonStyle.Primary)
            ),
            buttonTwo: createRow(
                new ButtonBuilder()
                    .setCustomId(`corEmbed/${id}`)
                    .setEmoji("<:config7:1107098507413827644>")
                    .setLabel("Cor Embed")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`bannerEmbed/${id}`)
                    .setEmoji("<:lb9:1113897601620770836>")
                    .setLabel("Banner")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`thumbEmbed/${id}`)
                    .setEmoji("<:lb9:1113897601620770836>")
                    .setLabel("Miniatura")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`atualizarP/${id}`)
                    .setEmoji("<a:loading:1107106161657905242>")
                    .setLabel("Atualizar Painel")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`voltarProTicket/${id}`)
                    .setEmoji("<:lb7:1113897476651499620>")
                    .setLabel("Voltar")
                    .setStyle(ButtonStyle.Primary)
            ),
        }

        await interaction.update({
            embeds: [
                new EmbedBuilder({
                    title: `Titulo Atual: ${Data?.configs?.titulo || "Não configurado ainda..."}`,

                    description:
                        `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                        "Não configurado ainda..."
                        }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                        "Não configurado ainda..."
                        }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                        "Selecione um Ticket"
                        }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                        }\n🖼 Miniatura: ${Data?.configs?.miniatura || "Sem miniatura."
                        }`,

                    footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                })
            ],

            components: [buttonOne, buttonTwo],
        });
    }

})



new Component({
    customId: `tituloEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })

        if (!Data) return console.log("Data não encontrado")

        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(`**🏷 | Title:** ${Data.configs?.titulo || `Não configurado ainda...`}`)
                    .setFooter({ text: "Envie o novo titulo abaixo:" }),
            ],
            components: [],
        });

        let titulo: string;

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel

        if (channel) {

            const collector = new MessageCollector(channel, { time: 15000 })

            collector.on("collect", async (message) => {
                titulo = message.content;
                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { $set: { 'configs.titulo': titulo } }, { new: true })

                await Data.save()

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {

                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data.configs?.titulo || "Não configurado ainda..."}`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data.configs?.footer || "Sem rodapé"}`, })
                            })
                        ],

                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });
        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `descEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Descricão:** ${Data?.configs?.descricao ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie a nova descrição abaixo:" }),
            ],
            components: [],
        });

        const configs = { descricao: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel;
        if (channel) {
            const collector = new MessageCollector(channel, { time: 15000 });

            collector.on("collect", async (message) => {
                configs.descricao = message.content;

                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { 'configs.descricao': configs.descricao }, { new: true, upsert: true })

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {

                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data?.configs?.titulo ||
                                    "Não configurado ainda..."
                                    }`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                            })

                        ],
                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });
        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `footerEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Rodapé:** ${Data?.configs?.footer ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie o novo rodapé abaixo:" }),
            ],
            components: [],
        });

        const configs = { footer: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel

        if (channel) {
            const collector = new MessageCollector(channel, { time: 15000 });

            collector.on("collect", async (message) => {

                configs.footer = message.content;
                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { 'configs.footer': configs.footer }, { new: true, upsert: true })

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {
                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data?.configs?.titulo ||
                                    "Não configurado ainda..."
                                    }`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })

                            })
                        ],
                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });

        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `placeholder/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Placeholder:** ${Data?.configs?.placeholder ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie o novo placeholder abaixo:" }),
            ],
            components: [],
        });

        const configs = { placeholder: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel;

        if (channel) {
            const collector = new MessageCollector(channel, { time: 15000 });

            collector.on("collect", async (message) => {
                configs.placeholder = message.content;

                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { 'configs.placeholder': configs.placeholder }, { new: true, upsert: true })

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {
                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data?.configs?.titulo ||
                                    "Não configurado ainda..."
                                    }`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                            })

                        ],
                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });
        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `corEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Cor:** ${Data?.configs?.embedColor ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie a nova cor abaixo:" }),
            ],
            components: [],
        });

        const configs = { corEmbed: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel;

        if (channel) {
            const collector = new MessageCollector(channel, { time: 15000 });

            collector.on("collect", async (message) => {
                configs.corEmbed = message.content;

                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { 'configs.embedColor': configs.corEmbed }, { new: true, upsert: true })

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {
                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data?.configs?.titulo ||
                                    "Não configurado ainda..."
                                    }`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                            })

                        ],
                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });
        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `bannerEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Banner:** ${Data?.configs?.banner ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie o novo banner abaixo:" }),
            ],
            components: [],
        });

        const configs = { bannerEmbed: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "") as TextChannel

        if (channel) {
            const collector = new MessageCollector(channel, { time: 15000 });

            collector.on("collect", async (message) => {
                configs.bannerEmbed = message.content;

                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                    { 'configs.banner': configs.bannerEmbed }, { new: true, upsert: true })

                message.delete();
                collector.stop();
            });

            collector.on("end", async () => {
                setTimeout(async () => {
                    const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                    if (!Data) return;

                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder({
                                title: `Titulo Atual: ${Data?.configs?.titulo ||
                                    "Não configurado ainda..."
                                    }`,
                                description:
                                    `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                    "Não configurado ainda..."
                                    }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                    "Não configurado ainda..."
                                    }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                    "Selecione um Ticket"
                                    }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                    }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                    "Sem miniatura."
                                    }`,
                                footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                            })

                        ],
                        components: [
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`tituloEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Titulo da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`descEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Descrição da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`footerEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Rodapé da embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`placeholder/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Placeholder")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            createRow(
                                new ButtonBuilder()
                                    .setCustomId(`corEmbed/${id}`)
                                    .setEmoji("<:config7:1107098507413827644>")
                                    .setLabel("Cor Embed")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`bannerEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Banner")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`thumbEmbed/${id}`)
                                    .setEmoji("<:lb9:1113897601620770836>")
                                    .setLabel("Miniatura")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`atualizarP/${id}`)
                                    .setEmoji("<a:loading:1107106161657905242>")
                                    .setLabel("Atualizar Painel")
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId(`voltarProTicket/${id}`)
                                    .setEmoji("<:lb7:1113897476651499620>")
                                    .setLabel("Voltar")
                                    .setStyle(ButtonStyle.Primary)
                            ),
                        ],

                    });
                }, 1500);
            });
        } else {
            console.log("Canal não encontrado");
        }
    },
});

new Component({
    customId: `thumbEmbed/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.user.username} | Gerenciar Ticket`)
                    .setDescription(
                        `**🏷 | Miniatura:** ${Data?.configs?.miniatura ||
                        `Não configurado ainda...`
                        }`
                    )
                    .setFooter({ text: "Envie a nova miniatura abaixo:" }),
            ],
            components: [],
        });

        const configs = { thumbEmbed: <string>"" };

        const channel = client.channels.cache.get(interaction.channel?.id || "");

        if (channel) {
            if (channel instanceof TextChannel) {
                const collector = new MessageCollector(channel, { time: 15000 });

                collector.on("collect", async (message) => {
                    configs.thumbEmbed = message.content;

                    await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild?.id },
                        { 'configs.miniatura': configs.thumbEmbed }, { new: true, upsert: true })

                    message.delete();
                    collector.stop();
                });

                collector.on("end", async () => {
                    setTimeout(async () => {
                        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
                        if (!Data) return;

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder({
                                    title: `Titulo Atual: ${Data?.configs?.titulo ||
                                        "Não configurado ainda..."
                                        }`,
                                    description:
                                        `**📰 | Descrição atual:**\n${Data?.configs?.descricao ||
                                        "Não configurado ainda..."
                                        }\n\n📦 | Cor da Embed: ${Data?.configs?.embedColor ||
                                        "Não configurado ainda..."
                                        }\n📒 | Texto Placeholder: ${Data?.configs?.placeholder ||
                                        "Selecione um Ticket"
                                        }\n🖼 | Banner: ${Data?.configs?.banner || "Sem banner."
                                        }\n🖼 Miniatura: ${Data?.configs?.miniatura ||
                                        "Sem miniatura."
                                        }`,
                                    footer: createEmbedFooter({ iconURL: client.user.avatarURL(), text: `${Data?.configs?.footer || "Sem rodapé"}` })
                                })

                            ],
                            components: [
                                createRow(
                                    new ButtonBuilder()
                                        .setCustomId(`tituloEmbed/${id}`)
                                        .setEmoji("<:config7:1107098507413827644>")
                                        .setLabel("Titulo da embed")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`descEmbed/${id}`)
                                        .setEmoji("<:config7:1107098507413827644>")
                                        .setLabel("Descrição da embed")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`footerEmbed/${id}`)
                                        .setEmoji("<:config7:1107098507413827644>")
                                        .setLabel("Rodapé da embed")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`placeholder/${id}`)
                                        .setEmoji("<:config7:1107098507413827644>")
                                        .setLabel("Placeholder")
                                        .setStyle(ButtonStyle.Primary)
                                ),
                                createRow(
                                    new ButtonBuilder()
                                        .setCustomId(`corEmbed/${id}`)
                                        .setEmoji("<:config7:1107098507413827644>")
                                        .setLabel("Cor Embed")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`bannerEmbed/${id}`)
                                        .setEmoji("<:lb9:1113897601620770836>")
                                        .setLabel("Banner")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`thumbEmbed/${id}`)
                                        .setEmoji("<:lb9:1113897601620770836>")
                                        .setLabel("Miniatura")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`atualizarP/${id}`)
                                        .setEmoji("<a:loading:1107106161657905242>")
                                        .setLabel("Atualizar Painel")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`voltarProTicket/${id}`)
                                        .setEmoji("<:lb7:1113897476651499620>")
                                        .setLabel("Voltar")
                                        .setStyle(ButtonStyle.Primary)
                                ),
                            ],

                        });
                    }, 1500);
                });
            }// end if channel
        } else {
            console.log("Canal não encontrado");
        }
    },
});
