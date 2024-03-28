import { Command } from "#base";
import { db } from "#database";
import { createEmbedFooter, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from "discord.js";

new Command({
    name: "config-painel",
    description: "[ADM] Configure um painel de Ticket.",
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
    },

    async run(interaction) {

        const { options, client } = interaction;

       

        const usersPerms = await db.guilds.findOne({ id: interaction.guild.id}).then((user) => user?.userPermissions) as Array<string>;

        if (!usersPerms.includes(interaction.user.id)) {
            return await interaction.reply({ content: `**❌ | Você não tem permissão.**`, ephemeral });
        };

        const painelID = options.getString(`id`);

        const { embed, button } = {
            embed: new EmbedBuilder({
                title: `${client.user.username} | Gerenciar Ticket`,
                footer: createEmbedFooter({ text: `${client.user.username} - Todos os direitos reservados.`, iconURL: client.user.avatarURL() }),
                description: `Escolha o que deseja gerenciar.`
            }),
            button: createRow(
                new ButtonBuilder()
                    .setCustomId(`embed/${painelID}`)
                    .setEmoji(`🛠`)
                    .setLabel(`Configurar Embed`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`tickets/${painelID}`)
                    .setEmoji(`🧾`)
                    .setLabel(`Configurar Tickes`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`atualizarP/${painelID}`)
                    .setEmoji(`⏳`)
                    .setLabel(`Atualizar Painel`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`deleteP/${painelID}`)
                    .setEmoji(`🗑`)
                    .setLabel(`Deletar Painel`)
                    .setStyle(ButtonStyle.Danger)
            )
        }

       return await interaction.reply({ embeds: [embed], components: [button], ephemeral});
    }

})