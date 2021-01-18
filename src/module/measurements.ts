import { Config } from './config';

export interface MeasurementValue {
    value: number;
    units: string;
}

export type MeasurementType = 'mass' | 'time' | 'distance' | 'volume';

export const getMeasurement = (mType: MeasurementType, rank: number): MeasurementValue => {
    let targetTable: MeasurementValue[];
    switch (mType) {
        case 'mass':
            targetTable = massTable;
            break;
        case 'time':
            targetTable = timeTable;
            break;
        case 'distance':
            targetTable = distanceTable;
            break;
        case 'volume':
            targetTable = volumeTable;
            break;
        default:
            throw new Error(`unknown measurement type ${mType}`);
    }

    const index = rank + 5; // tables start at -5
    if (index >= 0 && index < targetTable.length) {
        return {...targetTable[index]}; // return copy
    }

    let referenceMeasurement = targetTable[0];
    let power = index;
    if (index >= targetTable.length) {
        referenceMeasurement = targetTable[targetTable.length - 1];
        power = index - targetTable.length + 1;
    }

    return {
        value: referenceMeasurement.value * Math.pow(2, power),
        units: referenceMeasurement.units
    };
}

let massTable: MeasurementValue[] = [];
let timeTable: MeasurementValue[] = [];
let distanceTable: MeasurementValue[] = [];
let volumeTable: MeasurementValue[] = [];

Hooks.once('ready', () => {
    const MNM3E: Config = CONFIG.MNM3E;
    massTable = [
        { value: 1.5, units: MNM3E.measurements.mass.lbs },
        { value: 3, units: MNM3E.measurements.mass.lbs },
        { value: 6, units: MNM3E.measurements.mass.lbs },
        { value: 12, units: MNM3E.measurements.mass.lbs },
        { value: 25, units: MNM3E.measurements.mass.lbs },
        { value: 50, units: MNM3E.measurements.mass.lbs },
        { value: 100, units: MNM3E.measurements.mass.lbs },
        { value: 200, units: MNM3E.measurements.mass.lbs },
        { value: 400, units: MNM3E.measurements.mass.lbs },
        { value: 800, units: MNM3E.measurements.mass.lbs },
        { value: 1600, units: MNM3E.measurements.mass.lbs },
        { value: 3200, units: MNM3E.measurements.mass.lbs },
        { value: 3, units: MNM3E.measurements.mass.tons },
        { value: 6, units: MNM3E.measurements.mass.tons },
        { value: 12, units: MNM3E.measurements.mass.tons },
        { value: 25, units: MNM3E.measurements.mass.tons },
        { value: 50, units: MNM3E.measurements.mass.tons },
        { value: 100, units: MNM3E.measurements.mass.tons },
        { value: 200, units: MNM3E.measurements.mass.tons },
        { value: 400, units: MNM3E.measurements.mass.tons },
        { value: 800, units: MNM3E.measurements.mass.tons },
        { value: 1600, units: MNM3E.measurements.mass.tons },
        { value: 3.2, units: MNM3E.measurements.mass.ktons },
        { value: 6, units: MNM3E.measurements.mass.ktons },
        { value: 12, units: MNM3E.measurements.mass.ktons },
        { value: 25, units: MNM3E.measurements.mass.ktons },
        { value: 50, units: MNM3E.measurements.mass.ktons },
        { value: 100, units: MNM3E.measurements.mass.ktons },
        { value: 200, units: MNM3E.measurements.mass.ktons },
        { value: 400, units: MNM3E.measurements.mass.ktons },
        { value: 800, units: MNM3E.measurements.mass.ktons },
        { value: 1600, units: MNM3E.measurements.mass.ktons },
        { value: 3200, units: MNM3E.measurements.mass.ktons },
        { value: 6400, units: MNM3E.measurements.mass.ktons },
        { value: 12500, units: MNM3E.measurements.mass.ktons },
        { value: 25000, units: MNM3E.measurements.mass.ktons },
    ];

    timeTable = [
        { value: 0.125, units: MNM3E.measurements.time.seconds },
        { value: 0.25, units: MNM3E.measurements.time.seconds },
        { value: 0.50, units: MNM3E.measurements.time.seconds },
        { value: 1, units: MNM3E.measurements.time.seconds },
        { value: 3, units: MNM3E.measurements.time.seconds },
        { value: 6, units: MNM3E.measurements.time.seconds },
        { value: 12, units: MNM3E.measurements.time.seconds },
        { value: 30, units: MNM3E.measurements.time.seconds },
        { value: 1, units: MNM3E.measurements.time.minutes },
        { value: 2, units: MNM3E.measurements.time.minutes },
        { value: 4, units: MNM3E.measurements.time.minutes },
        { value: 8, units: MNM3E.measurements.time.minutes },
        { value: 15, units: MNM3E.measurements.time.minutes },
        { value: 30, units: MNM3E.measurements.time.minutes },
        { value: 1, units: MNM3E.measurements.time.hours },
        { value: 2, units: MNM3E.measurements.time.hours },
        { value: 4, units: MNM3E.measurements.time.hours },
        { value: 8, units: MNM3E.measurements.time.hours },
        { value: 16, units: MNM3E.measurements.time.hours },
        { value: 1, units: MNM3E.measurements.time.days },
        { value: 2, units: MNM3E.measurements.time.days },
        { value: 4, units: MNM3E.measurements.time.days },
        { value: 1, units: MNM3E.measurements.time.weeks },
        { value: 2, units: MNM3E.measurements.time.weeks },
        { value: 1, units: MNM3E.measurements.time.months },
        { value: 2, units: MNM3E.measurements.time.months },
        { value: 4, units: MNM3E.measurements.time.months },
        { value: 8, units: MNM3E.measurements.time.months },
        { value: 1.5, units: MNM3E.measurements.time.years },
        { value: 3, units: MNM3E.measurements.time.years },
        { value: 6, units: MNM3E.measurements.time.years },
        { value: 12, units: MNM3E.measurements.time.years },
        { value: 25, units: MNM3E.measurements.time.years },
        { value: 50, units: MNM3E.measurements.time.years },
        { value: 100, units: MNM3E.measurements.time.years },
        { value: 200, units: MNM3E.measurements.time.years },
    ];

    distanceTable = [
        { value: 6, units: MNM3E.measurements.distance.inches },
        { value: 1, units: MNM3E.measurements.distance.feet },
        { value: 3, units: MNM3E.measurements.distance.feet },
        { value: 6, units: MNM3E.measurements.distance.feet },
        { value: 15, units: MNM3E.measurements.distance.feet },
        { value: 30, units: MNM3E.measurements.distance.feet },
        { value: 60, units: MNM3E.measurements.distance.feet },
        { value: 120, units: MNM3E.measurements.distance.feet },
        { value: 250, units: MNM3E.measurements.distance.feet },
        { value: 500, units: MNM3E.measurements.distance.feet },
        { value: 900, units: MNM3E.measurements.distance.feet },
        { value: 1800, units: MNM3E.measurements.distance.feet },
        { value: 0.5, units: MNM3E.measurements.distance.miles },
        { value: 1, units: MNM3E.measurements.distance.miles },
        { value: 2, units: MNM3E.measurements.distance.miles },
        { value: 4, units: MNM3E.measurements.distance.miles },
        { value: 8, units: MNM3E.measurements.distance.miles },
        { value: 16, units: MNM3E.measurements.distance.miles },
        { value: 30, units: MNM3E.measurements.distance.miles },
        { value: 60, units: MNM3E.measurements.distance.miles },
        { value: 120, units: MNM3E.measurements.distance.miles },
        { value: 250, units: MNM3E.measurements.distance.miles },
        { value: 500, units: MNM3E.measurements.distance.miles },
        { value: 1000, units: MNM3E.measurements.distance.miles },
        { value: 2000, units: MNM3E.measurements.distance.miles },
        { value: 4000, units: MNM3E.measurements.distance.miles },
        { value: 8000, units: MNM3E.measurements.distance.miles },
        { value: 16000, units: MNM3E.measurements.distance.miles },
        { value: 32000, units: MNM3E.measurements.distance.miles },
        { value: 64000, units: MNM3E.measurements.distance.miles },
        { value: 125000, units: MNM3E.measurements.distance.miles },
        { value: 250000, units: MNM3E.measurements.distance.miles },
        { value: 500000, units: MNM3E.measurements.distance.miles },
        { value: 1, units: MNM3E.measurements.distance.mmiles },
        { value: 2, units: MNM3E.measurements.distance.mmiles },
        { value: 4, units: MNM3E.measurements.distance.mmiles },
    ];

    volumeTable = [
        { value: 0.03125, units: MNM3E.measurements.volume.cft },
        { value: 0.0625, units: MNM3E.measurements.volume.cft },
        { value: 0.125, units: MNM3E.measurements.volume.cft },
        { value: 0.25, units: MNM3E.measurements.volume.cft },
        { value: 0.5, units: MNM3E.measurements.volume.cft },
        { value: 1, units: MNM3E.measurements.volume.cft },
        { value: 2, units: MNM3E.measurements.volume.cft },
        { value: 4, units: MNM3E.measurements.volume.cft },
        { value: 8, units: MNM3E.measurements.volume.cft },
        { value: 15, units: MNM3E.measurements.volume.cft },
        { value: 30, units: MNM3E.measurements.volume.cft },
        { value: 60, units: MNM3E.measurements.volume.cft },
        { value: 125, units: MNM3E.measurements.volume.cft },
        { value: 250, units: MNM3E.measurements.volume.cft },
        { value: 500, units: MNM3E.measurements.volume.cft },
        { value: 1000, units: MNM3E.measurements.volume.cft },
        { value: 2000, units: MNM3E.measurements.volume.cft },
        { value: 4000, units: MNM3E.measurements.volume.cft },
        { value: 8000, units: MNM3E.measurements.volume.cft },
        { value: 15000, units: MNM3E.measurements.volume.cft },
        { value: 32000, units: MNM3E.measurements.volume.cft },
        { value: 65000, units: MNM3E.measurements.volume.cft },
        { value: 125000, units: MNM3E.measurements.volume.cft },
        { value: 250000, units: MNM3E.measurements.volume.cft },
        { value: 500000, units: MNM3E.measurements.volume.cft },
        { value: 1, units: MNM3E.measurements.volume.mcft },
        { value: 2, units: MNM3E.measurements.volume.mcft },
        { value: 4, units: MNM3E.measurements.volume.mcft },
        { value: 8, units: MNM3E.measurements.volume.mcft },
        { value: 15, units: MNM3E.measurements.volume.mcft },
        { value: 32, units: MNM3E.measurements.volume.mcft },
        { value: 65, units: MNM3E.measurements.volume.mcft },
        { value: 125, units: MNM3E.measurements.volume.mcft },
        { value: 250, units: MNM3E.measurements.volume.mcft },
        { value: 500, units: MNM3E.measurements.volume.mcft },
        { value: 1, units: MNM3E.measurements.volume.bcft },
    ];
});