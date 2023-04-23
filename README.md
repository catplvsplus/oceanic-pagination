# Oceanic Pagination
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/oceanic-pagination?style=flat-square)
![GitHub](https://img.shields.io/github/license/NotGhex/djs-pagination?style=flat-square)
![npm (scoped)](https://img.shields.io/npm/v/oceanic-pagination?label=Latest%20Version&style=flat-square)

A simple button and reaction pagination library for Oceanic.js

## Installation

```bash
npm i oceanic-pagination oceanic.js
```

## Usage

### Button Pagination

```js
const { ButtonPaginationBuilder } = require('@falloutstudios/djs-pagination');
const { ButtonStyles, Client, ComponentTypes, InteractionTypes } = require('oceanic.js');

const bot = new Client({
    auth: 'Bot TOKEN_HERE',
    gateway: {
        intents: ['GUILDS', 'MESSAGE_CONTENT']
    }
});

bot.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionTypes.APPLICATION_COMMAND && interaction.data.name === 'pagination') {
        // Create pagination
        const pagination = new ButtonPaginationBuilder({
            pages: [
                'Page 1',
                { author: { name: 'Page 2' } },
                { content: 'Page 3', embeds: [{ title: 'Page 3' }] },
                () => ({ author: { name: 'Page 4' } })
            ],
            buttons: [
                {
                    button: { type: ComponentTypes.BUTTON, label: 'First', customID: 'first', style: ButtonStyles.SECONDARY },
                    type: 'FirstPage'
                },
                {
                    button: { type: ComponentTypes.BUTTON, label: 'Previous', customID: 'prev', style: ButtonStyles.PRIMARY },
                    type: 'PreviousPage'
                },
                {
                    button: { type: ComponentTypes.STOP, label: 'Stop', customID: 'stop', style: ButtonStyles.DANGER },
                    type: 'Stop'
                },
                {
                    button: { type: ComponentTypes.BUTTON, label: 'Next', customID: 'next', style: ButtonStyles.PRIMARY },
                    type: 'NextPage'
                },
                {
                    button: { type: ComponentTypes.BUTTON, label: 'Last', customID: 'last', style: ButtonStyles.SECONDARY },
                    type: 'LastPage'
                },
            ]
        });

        // Listens to pagination errors
        pagination.on('error', console.log);

        // Sends the pagination message
        await pagination.send({ command: interaction, sendAs: 'ReplyMessage' });
    }
});

bot.connect();
```

### Reaction Pagination

> ⚠️ You cannot use reaction pagination with ephemeral messages

```js
const { ReactionPaginationBuilder } = require('@falloutstudios/djs-pagination');
const { Client } = require('oceanic.js');

const bot = new Client({
    auth: 'Bot TOKEN_HERE',
    gateway: {
        intents: ['GUILDS', 'MESSAGE_CONTENT', 'GUILD_MESSAGE_REACTIONS']
    }
});

bot.on('interactionCreate', async interaction => {
    if (interaction.type === InteractionTypes.APPLICATION_COMMAND && interaction.data.name === 'pagination') {
        // Create pagination
        const pagination = new ReactionPaginationBuilder({
            pages: [
                'Page 1',
                { author: { name: 'Page 2' } },
                { content: 'Page 3', embeds: [{ title: 'Page 3' }] },
                () => ({ author: { name: 'Page 4' } })
            ],
            reactions: [
                { emoji: '⏪', type: 'FirstPage' }
                { emoji: '⬅', type: 'PreviousPage' }
                { emoji: '🛑', type: 'Stop' }
                { emoji: '➡️', type: 'NextPage' }
                { emoji: '⏩', type: 'LastPage' }
            ]
        });

        // Listens to pagination errors
        pagination.on('error', console.log);

        // Sends the pagination message
        await pagination.send({ command: interaction, sendAs: 'ReplyMessage' });
    }
});

bot.connect();
```