import { Schema } from "mongoose";
import { t } from "../utils.js";
import { Categorydb } from "#interfaces";

const userP:Array<string>  = []

export const guildSchema = new Schema(
    {
        id: t.string,
        botConfigs: { 
            categoriasSelect: [<Categorydb>{}],
            channelAvaliation: { type: String },
            logsChannel: { type: String },
        },
        userPermissions: userP
    },
    {
        statics: {
            async get(id: string) {
                return await this.findOne({ id }) ?? this.create({ id });
            }
        }
    }
);