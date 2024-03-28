import { Schema } from "mongoose";
import { t } from "../utils.js";
import { Categorydb, Ticketsdb } from "#interfaces";


export const ticketsP = new Schema(
    {
        idP: t.string,
        guildId: t.string,

        channels: {
            msg: t.stringN,
            general: t.stringN,
        }, 

        configs: {
            titulo: t.stringN,
            descricao: t.stringN,
            placeholder: t.stringN,
            footer: t.stringN,
            embedColor: { type: String, default: "Blue"},
            banner: t.stringN,
            miniatura: t.stringN,
        },
        categorias: [<Categorydb>{}],
        cat: { type: String },

        tickets: [<Ticketsdb>{}]
    },
)