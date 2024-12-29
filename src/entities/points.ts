import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import Member from "./member"

@Entity()
export default class Points {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    value!: number;

    @Column()
    created!: Date;

    @ManyToOne(() => Member, (member) => member.points, { onDelete: "CASCADE" })
    @JoinColumn({ name: "memberId" })
    member!: Member;
}