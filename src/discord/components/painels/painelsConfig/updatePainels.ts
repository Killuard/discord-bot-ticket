import { Component } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ColorResolvable, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel } from "discord.js";


new Component({
    customId: `atualizarP/:id`,
    type: ComponentType.Button, cache: "cached",

    async run(interaction, { id }) {

        await interaction.deferUpdate({});

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild?.id })
        if (!Data?.channels) return interaction.reply({ ephemeral, content: "Não foi possivel atualizar o painel" })

        const msgId: string = Data.channels.msg
        
        const channel = interaction.guild.channels.cache.get(Data.channels.general) as TextChannel
        const color = Data?.configs?.embedColor as ColorResolvable

        const embed = new EmbedBuilder()
            .setFooter({ text: `${Data.configs?.footer}` })
            .setColor(color)
            .setTitle(`${Data.configs?.titulo || `Não configurado ainda...`} `)
            .setDescription(`${Data.configs?.descricao || `Não configurado ainda...`} `);

        if (Data.configs?.banner) {
            embed.setImage(Data?.configs?.banner);
        }

        if (Data.configs?.miniatura) {
            embed.setThumbnail(Data.configs?.miniatura);
        }

        if (!Data.configs?.placeholder) {
            return await interaction.reply({ content: "Placeholder do selectMenu não definida, verifique para continuar", ephemeral })
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`abrirTicketMenu/${id}`)
            .setPlaceholder(Data.configs?.placeholder);

        const categorias = Data.categorias

        if (categorias) {
            const listaCategorias: Categorydb[] = Object.values(categorias) as Categorydb[]

            listaCategorias.forEach((categoria) => {
                menu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`${categoria.nome.toUpperCase()}`)
                        .setDescription(`${categoria.descricao}`)
                        .setEmoji(`${categoria.emoji}`)
                        .setValue(`${categoria.value}`)
                );
            });
        } else {
            menu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setDescription("Nenhuma categoria disponivel")
                    .setValue(".")
                    .setEmoji("❌")
            );
        }



        return channel.messages.fetch(msgId).then(async (msg) => {
            await msg.edit({
                embeds: [embed],
                components: [createRow(menu)],
            });
        });

    } //end run
})