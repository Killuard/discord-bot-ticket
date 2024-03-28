
export interface Categorydb {
    nome: string
    descricao: string;
    emoji: string;
    value: string;
}

export interface Ticketsdb {
    abertoPor: string;
    abertoPorId: number;
    assumido: string;
    ticketId: string;
    channelId: string
}
export interface Functionsdb {
    CriarCall: string,
    Poke: string,
    Assumir: string,
    Renomear: string,
    Pagamentos: string,
    GerenciarMembro: string
}