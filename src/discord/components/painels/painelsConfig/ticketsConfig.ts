import { Component } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createEmbedFooter, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";

new Component({
    customId: `tickets/:id`,
    type: ComponentType.Button, cache: "cached",

    async run(interaction, { id }) {
        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })
        if (!Data) return

        const categorias: Categorydb[] = Data.categorias as Categorydb[]
        let descricao: string = "";

        for (const categoria in categorias) {
            descricao += `- \`\`${categorias[categoria].nome.toUpperCase()}\`\`\n`;
        }

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Categorias do ticket de ID: \`\`${id}\`\``)
                    .setDescription(descricao),
            ],
            components: [
                createRow(
                    new ButtonBuilder()
                        .setCustomId(`addTicket/${id}`)
                        .setEmoji("➕")
                        .setLabel("Adicionar Categoria")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`removeTicket/${id}`)
                        .setEmoji("➖")
                        .setLabel("Remover Categoria")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`editCategoria/${id}`)
                        .setEmoji("⚙")
                        .setLabel("Editar Categoria")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`voltarProTicket/${id}`)
                        .setEmoji("◀")
                        .setLabel("Voltar")
                        .setStyle(ButtonStyle.Primary)
                ),
            ],
        })
    }
})

new Component({
    customId: `voltarProTicket/:id`,
    type: ComponentType.Button, cache: "cached",
    async run(interaction, { id }) {

        const { client } = interaction

        await interaction.update({
            embeds: [
                new EmbedBuilder({
                    title: `${client.user.username} | Gerenciar Ticket`,
                    description: `Escolha oque deseja gerenciar.`,
                    footer: createEmbedFooter({ text: `${client.user.username} - Todos os direitos reservados.`, iconURL: client.user.avatarURL() })
                })
            ],

            components: [
                createRow(
                    new ButtonBuilder()
                        .setCustomId(`embed/${id}`)
                        .setEmoji(`<:Lost100:1098257166793715782>`)
                        .setLabel(`Configurar Embed`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`tickets/${id}`)
                        .setEmoji(`<:TermosLost7:1098144396551147561>`)
                        .setLabel(`Configurar Tickes`)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`atualizarP/${id}`)
                        .setEmoji(`<a:loading:1107106161657905242>`)
                        .setLabel(`Atualizar Painel`)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`deleteP/${id}`)
                        .setEmoji(`<:LixoLost7:1106015127184085052>`)
                        .setLabel(`Deletar Painel`)
                        .setStyle(ButtonStyle.Danger)
                ),
            ],
        });

    },
});