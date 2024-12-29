import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm"
import Points from "./points"
import Faction from "./faction";

@Entity()
export default class Member {
    @PrimaryColumn({
        unique: true,
    })
    discordId!: string;

    @Column()
    totalPoints!: number;

    @Column()
    loggedIn!: boolean;

    @Column({
        nullable: true
    })
    pnwID?: string

    @OneToMany(() => Points, (points) => points.member)
    points!: Points[];

    @ManyToOne(() => Faction, (faction) => faction.members, { onDelete: "CASCADE" })
    faction!: Faction;
}