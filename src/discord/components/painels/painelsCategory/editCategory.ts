import { Component, Modal } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ComponentType, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

new Component({
    customId: `editCategoria/:id`,
    type: ComponentType.Button, cache: "cached",

    async run(interaction, { id }) {
        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id });
        if (!Data?.categorias) return

        const categorias = Data.categorias as Categorydb[]

        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Selecione uma categoria")
            .setCustomId(`editCategoriaMenu/${id}`);

        if (categorias) {
            const listaCategorias = Object.values(categorias)

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
    customId: `editCategoriaMenu/:id`,
    type: ComponentType.StringSelect, cache: "cached",

    async run(interaction, { id }) {

        const categoriaSelecionada = interaction.values[0];
        await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild.id }, {
            $set: {
                "cat": categoriaSelecionada
            }
        })

        const catModal = new ModalBuilder()
            .setCustomId(`editCatModal/${id}`)
            .setTitle("Editar Categoria");

        const nome = new TextInputBuilder()
            .setCustomId("nome")
            .setLabel("NOME")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emoji = new TextInputBuilder()
            .setCustomId("emoji")
            .setLabel("EMOJI")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const desc = new TextInputBuilder()
            .setCustomId("descricao")
            .setLabel("DESCRIÇÃO")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = createRow(nome);
        const row2 = createRow(desc);
        const row3 = createRow(emoji);
        catModal.addComponents(row1, row2, row3);

        await interaction.showModal(catModal);
    }
})

new Modal({
    customId: `editCatModal/:id`,
    cache: "cached", isFromMessage: true,
    async run(interaction, { id }) {

        const categoriaSelecionada = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })
        if (!Data?.categorias) return

        const nome = interaction.fields.getTextInputValue("nome");
        const emoji = interaction.fields.getTextInputValue("emoji");
        const descricao = interaction.fields.getTextInputValue("descricao");

        const categorias: Categorydb[] = Data.categorias as Categorydb[]

        const categoriaSelecionadaIndex = categorias.findIndex(
            (categoria) => categoria.value === categoriaSelecionada?.cat
        );

        if (categoriaSelecionadaIndex !== -1) {
            categorias[categoriaSelecionadaIndex].nome = nome;
            categorias[categoriaSelecionadaIndex].descricao = descricao;
            categorias[categoriaSelecionadaIndex].emoji = emoji;
            categorias[categoriaSelecionadaIndex].value = nome.toLowerCase();

            await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild.id },
                { categorias: categorias }, { new: true, upsert: true })

            await interaction.reply({ content: "✅ | Categoria editada com sucesso.", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ | Categoria não encontrada.", ephemeral: true });
        }
        setTimeout(async () => {
            await db.ticketsP.updateOne({ idP: id, guildId: interaction.guild.id },
                { $unset: { cat: "" } });
        }, 2000);
    },
});