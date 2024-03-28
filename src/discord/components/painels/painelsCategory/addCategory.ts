import { Component, Modal } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";


new Modal({
    customId: `addCatModal/:id`,
    cache: "cached", isFromMessage: true,

    async run(interaction, { id }) {
        const { fields } = interaction

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })
        if (!Data?.categorias) return

        const nome = fields.getTextInputValue("nome");
        const emoji = fields.getTextInputValue("emoji");
        const descricao = fields.getTextInputValue("descricao");

        const novaCategoria: Categorydb = {
            nome: nome,
            descricao: descricao,
            emoji: emoji,
            value: nome.toLowerCase(),
        };

        Data.categorias.push(novaCategoria);

        await Data.save();

        await interaction.reply({ content: "✅ | Categoria adicionada com sucesso.", ephemeral });
    }

})
new Component({
    customId: `addTicket/:id`,
    type: ComponentType.Button, cache: "cached",

    async run(interaction, { id }) {
        const catModal = new ModalBuilder()
            .setCustomId(`addCatModal/${id}`)
            .setTitle("Adicionar Categoria");

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
    },
});


