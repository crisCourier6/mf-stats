import { Stat } from "./Stat";

export interface UserHasStat {
    id: string,
    userId: string,
    statId: string,
    value: string|number,
    createdAt: Date,
    updatedAt: Date,
    stat: Stat
}