import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm"
import Member from "./member"

@Entity()
export default class Faction {
    @PrimaryColumn({
        unique: true,
    })
    name!: string;

    @Column({
        nullable: true
    })
    description?: string;

    @Column({
        nullable: true
    })
    leaderId?: string;

    @Column({
        nullable: true
    })
    roleId?: string;

    @Column({
        nullable: true
    })
    emoji?: string;

    @Column({
        nullable: true
    })
    flag?: string;

    @OneToMany(() => Member, (member) => member.faction)
    members!: Member[];
}