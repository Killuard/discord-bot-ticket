import { Component } from "#base";
import { db } from "#database";
import { ComponentType, TextChannel } from "discord.js";

    new Component({
        customId: `deleteP/:id`,
        type: ComponentType.Button, cache: "cached",

        async run(interaction, { id }) {

            setTimeout(async () => { await db.ticketsP.deleteOne({ idP: id, guildId: interaction.guild.id }) }, 3000);
            const Data = await db.ticketsP.findOne({ idP: id, guildId: interaction.guild.id })

            if(!Data?.channels) return

            const msgId: string = Data.channels.msg 

            const channel = interaction.guild.channels.cache.get(Data.channels.general) as TextChannel;

            channel.messages.fetch(msgId).then(async (msg) => {
                await msg.delete();
            });


            interaction.reply({ content: "✅ | Painel deletado com sucesso.", ephemeral });
        }
    })