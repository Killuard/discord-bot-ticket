import { Schema } from "mongoose";
import { t } from "../utils.js";
import { Functionsdb } from "#interfaces";


export const ticketsB = new Schema(
    {
        idB: t.string,
        guildId: t.string,

        name: t.stringN,

        configs: {
            titulo: t.stringN,
            descricao: t.stringN,
            banner: t.stringN,
            miniatura: t.stringN,
        },

        permissions: {

        },

        channels: {
            msg: t.stringN,
            general: t.stringN,
        }, 

        buttonConfig: {
            label: { type: String },
            emoji: { type: String },
            color: { type: String },
        },

        functions: [<Functionsdb>{}]

    }
)