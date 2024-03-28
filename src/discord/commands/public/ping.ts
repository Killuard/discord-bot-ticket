import { Command } from "#base";
import { createRow, findCommand } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, chatInputApplicationCommandMention } from "discord.js";

new Command({
	name: "pings",
	description: "🏓 replies with pong",
	dmPermission: false,
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {

		const row = createRow(
			new ButtonBuilder({
				customId: `remind/${new Date().toISOString()}`,
				label: "Ping",
				style: ButtonStyle.Success
			})
		);

		await interaction.reply({ ephemeral, embeds, content: "Pong", components: [row] })
		

		const command = findCommand(interaction.guild.client).byName("pings");
		if (!command) return;
		
		await interaction.followUp({ ephemeral, embeds, content: `${chatInputApplicationCommandMention(command.name, command.id)}` })
	}
});