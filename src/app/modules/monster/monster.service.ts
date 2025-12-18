import { IMonster } from "./monster.interface";
import { Monster } from "./monster.model";

const createMonster = async(payload:IMonster)=>{
    const result = new Monster(payload)
    await result.save()
    return result
}


export const MonsterServices = {
    createMonster
}