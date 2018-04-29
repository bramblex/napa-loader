
import { Zone, ZoneSettings } from 'napajs/types/zone';

type ZWResult = {
    zone: Zone
    execute: (name: string, args?: any[]) => Promise<any>
    broadcast: (name: string, args?: any[]) => Promise<void>
}

// for compatible with version 1.0
export function load(id: string, module_path: string, _opts?: ZoneSettings): ZWResult
export function warp(zone: Zone): ZWResult

export function zload(id: string, module_path: string, _opts?: ZoneSettings): ZWResult
export function zwarp(zone: Zone): ZWResult
export function zrequire(module_path: string, _opts: ZoneSettings & { broadcast_funcs: string[] }): any