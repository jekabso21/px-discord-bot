import { Client, Collection } from 'discord.js';

interface Command {
    data: any;
    execute: Function;
}

export class CustomClient extends Client {
    commands: Collection<string, Command>;

    constructor(options: any) {
        super(options);
        this.commands = new Collection();
    }
}
