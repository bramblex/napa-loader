
import { Zone, ZoneSettings } from 'napajs/types/zone';

export function load(id: string, module_path: string, _opts: ZoneSettings): {
    zone: Zone
    execute: (name: string, args?: any[]) => Promise<any>
    broadcast: (name: string, args?: any[]) => Promise<void>
}

export function warp(zone: Zone): {
    zone: Zone
    execute: (name: string, args?: any[]) => Promise<any>
    broadcast: (name: string, args?: any[]) => Promise<void>
}