interface DegreeResult {
    degrees: number;
    cssClass: string;
}

const degreeClasses = [
    'four-fail',
    'three-fail',
    'two-fail',
    'one-fail',
    'unused', // not possible since the degree can never be 0
    'one-success',
    'two-success',
    'three-success',
    'four-success',
];

export const calculateDegrees = (dc: number, rolled: number): DegreeResult => {
    const dcDiff = rolled - dc;
    const degrees = Math.floor(dcDiff / 5) + (dcDiff >= 0 ? 1 : 0);

    return {
        degrees,
        cssClass: degreeClasses[Math.clamped(degrees + 4, 0, degreeClasses.length - 1)],
    }
}