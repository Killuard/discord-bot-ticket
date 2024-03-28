import mongoose, { InferSchemaType, model } from "mongoose";
import { guildSchema } from "./schemas/guild.js";
import { memberSchema } from "./schemas/member.js";
import { log } from "#settings";
import chalk from "chalk";
import { ticketsP } from "./schemas/ticketsPainel.js";
import { ticketsB } from "./schemas/ticketsButton.js";

mongoose.connect(process.env.MONGO_URI)
   .then(() => {
      log.success(chalk.green("MongoDB conectado"));
   })
   .catch((err) => {
      log.error(err);
      process.exit(1);
   });

export const db = {
   guilds: model("guild", guildSchema, "guilds"),
   members: model("member", memberSchema, "members"),
   ticketsP: model("painel", ticketsP, "painels"),
   ticketsB: model("ticket", ticketsB, "tickets")
};

export type GuildSchema = InferSchemaType<typeof guildSchema>;
export type MemberSchema = InferSchemaType<typeof memberSchema>;
export type TicketSchema = InferSchemaType<typeof ticketsP>;
export type TicketBSchema = InferSchemaType<typeof ticketsB>;