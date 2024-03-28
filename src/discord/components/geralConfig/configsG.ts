import { Component, Modal } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";


new Modal({
    customId: "addCatM",
    cache: "cached", isFromMessage: true,

    async run(interaction) {

        const Data = await db.guilds.findOne({ id: interaction.guild.id });
        if (!Data?.botConfigs) return

        const nome = interaction.fields.getTextInputValue("nome");
        const emoji = interaction.fields.getTextInputValue("emoji");
        const descricao = interaction.fields.getTextInputValue("descricao");

        const novaCategoria: Categorydb = {
            nome: nome,
            descricao: descricao,
            emoji: emoji,
            value: nome.toLowerCase(),
        };

        Data.botConfigs.categoriasSelect.push(novaCategoria);
        
        await Data.save();

        await interaction.reply({ content: "✅ | Categoria adicionada com sucesso.", ephemeral });
    }
})

new Component({
    customId: "addCat",
    type: ComponentType.Button, cache: "cached",

    async run(interaction) {
        const catModal = new ModalBuilder()
            .setCustomId(`addCatM`)
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

new Component({
    customId: "removeCat",
    type: ComponentType.Button, cache: "cached",

    async run(interaction) {

        const Data = await db.guilds.findOne({ id: interaction.guild.id });
        if (!Data) return

        const categorias = Data.botConfigs?.categoriasSelect as Categorydb[]

        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Selecione uma categoria")
            .setCustomId(`removeCatM`);

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
    },
});

new Component({
    customId: "removeCatM",
    type: ComponentType.StringSelect, cache: "cached",
    async run(interaction) {
        const Data = await db.guilds.findOne({ id: interaction.guild.id });
        if (!Data) return

        const categoriaValue = interaction.values[0];
        const categorias = Data.botConfigs?.categoriasSelect as Categorydb[]

        const categoriaIndex = categorias.findIndex(
            (categoria) => categoria.value === categoriaValue
        );

        if (categoriaIndex !== -1) {
            categorias.splice(categoriaIndex, 1);

            await db.ticketsP.findOneAndUpdate({ guildId: interaction.guild.id },
                { "botConfigs.categoriasSelect": categorias }, { new: true, upsert: true })
        }

        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Selecione uma categoria")
            .setCustomId(`removeCatM`);

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

        await interaction.update({ components: [row] });

        await interaction.followUp({ content: "**✅ | Categoria excluida com sucesso.**", ephemeral });
    }



});

new Component({
    customId: "configCategorias",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Categorias Selecionadas`)
                    .setDescription(
                        "Configure as categorias do menu de **SELEÇÃO DE CATEGORIAS**"
                    ),
            ],
            components: [
                createRow(
                    new ButtonBuilder()
                        .setCustomId(`addCat`)
                        .setEmoji("➕")
                        .setLabel("Adicionar Categoria")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`removeCat`)
                        .setEmoji("➖")
                        .setLabel("Remover Categoria")
                        .setStyle(ButtonStyle.Danger)
                ),
            ],
            ephemeral,
        });
    },
});

new Component({
    customId: "configAvaliacao",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        await interaction.reply({
            ephemeral,
            components: [
                createRow(
                    new ChannelSelectMenuBuilder()
                        .setChannelTypes(ChannelType.GuildText)
                        .setCustomId("configAvaliacaoMenu")
                ),
            ],
        });
    },
});

new Component({
    customId: "configLogs",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {

        await interaction.reply({
            ephemeral,
            components: [
                createRow(
                    new ChannelSelectMenuBuilder()
                        .setChannelTypes(ChannelType.GuildText)
                        .setCustomId("configLogsMenu")
                ),
            ],
        });
    },
});

new Component({
    customId: "configAvaliacaoMenu",
    type: ComponentType.ChannelSelect, cache: "cached",
    async run(interaction) {

        const channel = interaction.values[0];

        await db.guilds.findOneAndUpdate({ id: interaction.guild.id }, {
            $set: {
                "botConfigs.channelAvaliation": channel,
            }
        })

        await interaction.update({
            embeds: [
                new EmbedBuilder().setDescription(
                    "**✅ | Configurou avalição com sucesso!**"
                ),
            ],
            components: []
        });
    },
});

new Component({
    customId: "configLogsMenu",
    type: ComponentType.ChannelSelect, cache: "cached",
    async run(interaction) {

        const channel = interaction.values[0];

        await db.guilds.findOneAndUpdate({ id: interaction.guild.id }, {
            $set: {
                "botConfigs.logsChannel": channel,
            }
        })

        await interaction.update({
            embeds: [
                new EmbedBuilder().setDescription(
                    "**✅ | Configurou logs com sucesso!**"
                ),
            ],
            components: [],
        });
    },
});

