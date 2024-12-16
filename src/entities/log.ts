import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity()
export default class Log {
    @PrimaryColumn()
    date!: Date

    @Column()
    action!: string
}