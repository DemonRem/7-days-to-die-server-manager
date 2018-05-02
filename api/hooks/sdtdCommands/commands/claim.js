let SdtdCommand = require('../command.js');
const sevenDays = require('machinepack-7daystodiewebapi');

class Claim extends SdtdCommand {
    constructor(serverId) {
        super(serverId, {
            name: 'claim',
        });
        this.serverId = serverId;
    }

    async run(chatMessage, player, server, args) {
        let itemsToClaim = await PlayerClaimItem.find({player: player.id});

        if (args[0] === 'list') {

            itemsToClaim.forEach(item => {
                chatMessage.reply(`${item.amount}x ${item.name} of quality ${item.quality}`);
            })

            return chatMessage.reply(`There are ${itemsToClaim.length} items for you to claim`)
        }

        if (itemsToClaim.length === 0) {
            return chatMessage.reply(`You have no items to claim!`);
        }

        itemsToClaim.forEach(item => {
            sevenDays.giveItem({
                ip: server.ip,
                port: server.webPort,
                authName: server.authName,
                authToken: server.authToken,
                entityId: player.entityId,
                amount: item.amount,
                itemName: item.name,
                quality: 1
            }).exec({
                success: async data => {
                    await PlayerClaimItem.destroy({id: item.id});
                    chatMessage.reply(`Dropped ${item.amount}x ${item.name} of quality ${item.quality} at your feet.`)
                },
                error: e => {
                    sails.log.error(e, item);
                    chatMessage.reply(`Something went wrong while trying to give ${item.name}. Please contact a server admin.`)
                }
            })
        })


        
    }
}

module.exports = Claim;
