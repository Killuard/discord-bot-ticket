import { Component } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

new Component({
    customId: `removeTicket/:id`,
    type: ComponentType.Button, cache: "cached",

    async run(interaction, { id }) {

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id });
        if (!Data) return

        const categorias = Data.categorias as Categorydb[]

        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Selecione uma categoria")
            .setCustomId(`removeCategoriaMenu/${id}`);

        if (categorias) {
            const listaCategorias = Object.values(categorias);

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

        const row = createRow(menu);
        await interaction.reply({ components: [row], ephemeral });

    }
})
new Component({
    customId: `removeCategoriaMenu/:id`,
    type: ComponentType.StringSelect, cache: "cached",

    async run(interaction, { id }) {

        const categoriaValue = interaction.values[0];

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })
        if (!Data) return

        const categorias = Data.categorias

        const categoriaIndex = categorias.findIndex(
            (categoria) => categoria.value === categoriaValue
        );

        if (categoriaIndex !== -1) {
            categorias.splice(categoriaIndex, 1);

            await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild.id },
                { categorias: categorias }, { new: true, upsert: true })
        }

        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Selecione uma categoria")
            .setCustomId(`removeCategoriaMenu/${id}`);

        if (categorias) {
            const listaCategorias = Object.values(categorias) as Categorydb[]

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

        const row = createRow(menu);

        await interaction.update({ components: [row] });

        await interaction.followUp({ content: "**✅ | Categoria excluida com sucesso.**", ephemeral });

    }
})
