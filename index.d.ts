
import { Zone, ZoneSettings } from 'napajs/types/zone';

type Result = {
    zone: Zone
    execute: (name: string, args?: any[]) => Promise<any>
    broadcast: (name: string, args?: any[]) => Promise<void>
}

export function load(id: string, module_path: string, _opts: ZoneSettings): Result
export function warp(zone: Zone): Result