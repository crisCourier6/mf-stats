import { UserHasStat } from "./UserHasStat";

export interface Stat {
    id: string,
    name: string,
    description: string,
    unit: string,
    valueType: string,
    minValue:number,
    maxValue:number,
    decimals:number,
    userHasStat: UserHasStat[]
}