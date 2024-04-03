import { Command } from "#base";
import { db } from "#database";
import { Categorydb } from "#interfaces";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ColorResolvable, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

new Command({
    name: "set-painel",
    description: "[ADM] Painel de setar ticket.",
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "id",
            description: "Coloque o ID do Ticket para Configurar!",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true

        }
    ],

    async autocomplete(interaction) {
        const { options } = interaction
        const focusedOption = options.getFocused(true);

        let choices: string[] = [];

        if (focusedOption.name === `id`) {
            const choicesMain = [];
            const all = await db.ticketsP.find({ guildId: interaction.guild.id }).exec();

            if (all.length < 1) {
                choicesMain.push(`Nenhum painel ticket criado!`);
            } else {
                all.map((p) => {
                    choicesMain.push(p.idP);
                });
            }

            choices = choicesMain;
        }
        const filtered = choices.filter((choice) =>
            choice.startsWith(focusedOption.value)
        );
        await interaction.respond(
            filtered.map((choice) => ({
                name: `ID - ${choice} | PAINEL `,
                value: choice,
            }))
        );
    }, //end autocomplete


    async run(interaction) {

        const { options } = interaction;

        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id })
        if (!usersPerms) {
            await db.guilds.create({ id: interaction.guild.id })
        }

        if (!usersPerms?.userPermissions.includes(interaction.user.id)) {
            return interaction.reply({ content: `**❌ | Você não tem permissão.**`, ephemeral });
        };
        
        const id = options.getString(`id`);

        const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id });
        if (!Data?.configs) return
        if (!Data.categorias) return

        const color = Data.configs.embedColor as ColorResolvable

        const embed = new EmbedBuilder()
            .setFooter({ text: Data.configs.footer })
            .setColor(color)
            .setTitle(
                `${Data.configs.titulo || `Não configurado ainda...`
                }`
            )
            .setDescription(
                `${Data.configs.descricao ||
                `Não configurado ainda...`
                }`
            );

        if (Data.configs.banner) {
            embed.setImage(Data.configs.banner);
        }

        if (Data.configs.miniatura) {
            embed.setThumbnail(Data.configs.miniatura);
        }
        if (!Data.configs.placeholder) {
            return interaction.reply({ content: "Placeholder do selectMenu não definida, verifique para continuar", ephemeral })
        }
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`abrirTicketMenu/${id}`)
            .setPlaceholder(Data.configs.placeholder);

        const categorias: Categorydb[] = Data.categorias as Categorydb[];

        if (categorias) {
            const listaCategorias: Categorydb[] = Object.values(categorias);

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

        await interaction.reply({ content: `**✅ | Painel enviado com sucesso.**`, ephemeral });

        return await interaction.channel?.send({ embeds: [embed], components: [row] })
            .then(async (msg) => {

                await db.ticketsP.findOneAndUpdate({ idP: id, guildId: interaction.guild.id }, {
                    $set: {
                        "channels.general": interaction.channel?.id,
                        "channels.msg": msg.id
                    }
                })
            });

    }
})