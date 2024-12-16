import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import { WardenClient } from "./client";
import { format } from 'date-fns';
import Log from "../entities/log";
import Faction from "../entities/faction";
import Member from "../entities/member";

interface memberData {
    discordId: string,
    points: number,
    faction: string,
    emoji: string,
}

interface factionData {
    name: string,
    emoji: string,
    totalPoints: number
}

export default class embedGenerator {

    private client;

    constructor(client: WardenClient) {
        this.client = client;
    }
        
    errorEmbed(error: string): EmbedBuilder {
        const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription(error)
        .setColor('Red')
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        return embed;
    }

    successEmbed(title: string, description: string): EmbedBuilder {
        const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('Green')
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        return embed;
    }

    logsEmbed(logs: Log[]): EmbedBuilder 
    {
        let description = ``;
        const length = logs.length > 10 ? 10 : logs.length;

        const embed = new EmbedBuilder()
        .setTitle(`Logs`)
        .setColor('Blurple')
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        for(let i = 0; i < length; i++) {
            let formattedDate = format(logs[i].date, 'MM/dd/yyyy');
            description += `**${i + 1}.** ${logs[i].action} (${formattedDate})\n`;
        }

        embed.setDescription(description);

        return embed;
    }

    memberRankingsEmbed(interaction: ChatInputCommandInteraction, type: string, members: memberData[]): EmbedBuilder 
    {
        let description = ``;
        const length = members.length > 10 ? 10 : members.length;

        const embed = new EmbedBuilder()
        .setTitle(`${type} Member Point Rankings`)
        .setColor('Blurple')
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        for(let i = 0; i < length; i++) {
            let discordMember = interaction.guild?.members.cache.get(members[i].discordId);
            let emoji = members[i].emoji != '' &&  members[i].emoji != null ? members[i].emoji : `(**${members[i].faction}**)`;

            description += `**${i + 1}.** ${discordMember?.user.username}: ${members[i].points} ${emoji}\n`;
        }

        embed.setDescription(description);

        return embed;
    }

    factionRankingsEmbed(type: string, factions: factionData[]): EmbedBuilder 
    {
        let description = ``;
        const length = factions.length > 10 ? 10 : factions.length;

        const embed = new EmbedBuilder()
        .setTitle(`${type} Faction Point Rankings`)
        .setColor('Blurple')
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        for(let i = 0; i < length; i++) {
            let emoji = factions[i].emoji != '' && factions[i].emoji != null ? factions[i].emoji : `${factions[i].name}:`;
            description += `**${i + 1}.** ${emoji} ${factions[i].totalPoints}\n`;
        }

        embed.setDescription(description);

        return embed;
    }

    factionEmbed(faction: Faction): EmbedBuilder {

        const totalPoints = faction.members.reduce((memberSum, point) => memberSum + point.totalPoints, 0);
        const leaderId = faction.leaderId != '' && faction.leaderId != null ? `<${faction.leaderId}@>` : 'none';

        const embed = new EmbedBuilder()
        .setTitle(faction.name)
        .setColor('Blurple')
        .setThumbnail(faction.flag!)
        .addFields(
            [
                {
                    name: 'Stats',
                    value: `
                    **Leader:** ${leaderId}
                    **Total Points:** ${totalPoints.toLocaleString('en-US')}
                    **Avg Points:** ${(totalPoints / faction.members.length).toLocaleString('en-US')}
                    **Members:** ${faction.members.length}
                    `,
                    inline: true,
                },
                {
                    name: 'Description',
                    value: `${faction.description ? faction.description : 'none'}`,
                    inline: true,
                },
            ]
        )
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        return embed;
    }

    memberEmbed(user: User, member: Member): EmbedBuilder {

        const embed = new EmbedBuilder()
        .setTitle(user.username)
        .setColor('Blurple')
        .setThumbnail(user.avatarURL())
        .addFields(
            [
                {
                    name: 'Stats',
                    value: `
                    **Faction:** ${member.faction.name}
                    **Leader?** ${member.discordId == member.faction.leaderId}
                    **Total Points:** ${member.totalPoints.toLocaleString('en-US')}
                    `,
                    inline: true,
                },
            ]
        )
        .setFooter({ text: `Powered by ${this.client.user?.username}`, iconURL: this.client.user?.avatarURL()! });

        return embed;
    }
}