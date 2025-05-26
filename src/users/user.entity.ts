import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";
export enum Role{
    ADMIN='admin',
    VETERINARIO='veterinario',
    SUPERVISOR='supervisor',
    COLABORADOR='colaborador',
}

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({unique:true})
    email: string;

    @Column()
    password:string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.COLABORADOR,
    })
    role:Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}