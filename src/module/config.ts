export type Config = {
    abilities: {
        str: string;
        sta: string;
        agl: string;
        dex: string;
        fgt: string;
        int: string;
        awe: string;
        pre: string;
    };

    abilityAbbreviations: {
        str: string;
        sta: string;
        agl: string;
        dex: string;
        fgt: string;
        int: string;
        awe: string;
        pre: string;
    };

    actionTypes: {
        attack: string;
        control: string;
        defense: string;
        general: string;
        movement: string;
        sensory: string;
    };

    activationTypes: {
        none: string;
        standard: string;
        move: string;
        free: string;
        reaction: string;
    };

    areaTargetType: {
        burst: string;
        cloud: string;
        cone: string;
        cylinder: string;
        line: string;
        shapeable: string;
    } & {[type: string]: string};

    areaTypes: {
        burst: string;
        cloud: string;
        cone: string;
        cylinder: string;
        line: string;
        perception: string;
        shapeable: string;
    };

    defenses: {
        dge: string;
        pry: string;
        frt: string;
        tgh: string;
        wil: string;
    };

    defenseAbbreviations: {
        dge: string;
        pry: string;
        frt: string;
        tgh: string;
        wil: string;
    };

    durationTypes: {
        instant: string;
        concentration: string;
        sustained: string;
        continuous: string;
        permanent: string;
    };

    measurements: {
        mass: {
            lbs: string;
            tons: string;
            ktons: string;
        };
        time: {
            seconds: string;
            minutes: string;
            hours: string;
            days: string;
            weeks: string;
            months: string;
            years: string;
        };
        distance: {
            inches: string;
            feet: string;
            miles: string;
            mmiles: string;
        };
        volume: {
            cft: string;
            mcft: string;
            bcft: string;
        };
    };

    movement: {
        burrowing: string;
        flight: string;
        leaping: string;
        speed: string;
        swim: string;
        teleport: string;
    };

    rangeTypes: {
        personal: string;
        close: string;
        ranged: string;
        perception: string;
        rank: string;
    };

    rangedMultiplier: {
        positive: string;
        negative: string;
    }

    rankCostTypes: {
        flat: string;
        perRank: string;
        discount: string;
    };

    rollTypes: {
        none: string;
        required: string;
    };

    skills: {
        acr: string;
        ath: string;
        cco: string;
        dec: string;
        exp: string;
        ins: string;
        itm: string;
        inv: string;
        prc: string;
        per: string;
        rco: string;
        slt: string;
        ste: string;
        tec: string;
        tre: string;
        vhc: string;
    };

    summaryPositions: {
        prefix: string;
        suffix: string;
    };
} & {[key: string]: any};

export const MNM3E: Config = {
    abilities: {
        str: 'MNM3E.AbilityStr',
        sta: 'MNM3E.AbilitySta',
        agl: 'MNM3E.AbilityAgl',
        dex: 'MNM3E.AbilityDex',
        fgt: 'MNM3E.AbilityFgt',
        int: 'MNM3E.AbilityInt',
        awe: 'MNM3E.AbilityAwe',
        pre: 'MNM3E.AbilityPre',
    },
    abilityAbbreviations: {
        str: 'MNM3E.AbilityStrAbbrev',
        sta: 'MNM3E.AbilityStaAbbrev',
        agl: 'MNM3E.AbilityAglAbbrev',
        dex: 'MNM3E.AbilityDexAbbrev',
        fgt: 'MNM3E.AbilityFgtAbbrev',
        int: 'MNM3E.AbilityIntAbbrev',
        awe: 'MNM3E.AbilityAweAbbrev',
        pre: 'MNM3E.AbilityPreAbbrev',
    },
    actionTypes: {
        attack: 'MNM3E.EffectTypeAttack',
        control: 'MNM3E.EffectTypeControl',
        defense: 'MNM3E.EffectTypeDefense',
        general: 'MNM3E.EffectTypeGeneral',
        movement: 'MNM3E.EffectTypeMovement',
        sensory: 'MNM3E.EffectTypeSensory',
    },
    activationTypes: {
        none: 'MNM3E.None',
        standard: 'MNM3E.ActionStandard',
        move: 'MNM3E.ActionMove',
        free: 'MNM3E.ActionFree',
        reaction: 'MNM3E.ActionReaction',
    },
    areaTargetType: {
        burst: 'circle',
        cloud: 'circle',
        cone: 'cone',
        cylinder: 'circle',
        line: 'ray',
        shapeable: 'circle',
    },
    areaTypes: {
        burst: 'MNM3E.TargetBurst',
        cloud: 'MNM3E.TargetCloud',
        cone: 'MNM3E.TargetCone',
        cylinder: 'MNM3E.TargetCylinder',
        line: 'MNM3E.TargetLine',
        perception: 'MNM3E.TargetPerception',
        shapeable: 'MNM3E.TargetShapeable',
    },
    defenses: {
        dge: 'MNM3E.DefenseDge',
        pry: 'MNM3E.DefensePry',
        frt: 'MNM3E.DefenseFrt',
        tgh: 'MNM3E.DefenseTgh',
        wil: 'MNM3E.DefenseWil',
    },
    defenseAbbreviations: {
        dge: 'MNM3E.DefenseDgeAbbrev',
        pry: 'MNM3E.DefensePryAbbrev',
        frt: 'MNM3E.DefenseFrtAbbrev',
        tgh: 'MNM3E.DefenseTghAbbrev',
        wil: 'MNM3E.DefenseWilAbbrev',
    },
    durationTypes: {
        instant: 'MNM3E.DurationInstant',
        concentration: 'MNM3E.DurationConcentration',
        sustained: 'MNM3E.DurationSustained',
        continuous: 'MNM3E.DurationContinuous',
        permanent: 'MNM3E.DurationPermanent',
    },
    measurements: {
        mass: {
            lbs: 'MNM3E.MassPoundsAbbrev',
            tons: 'MNM3E.MassTons',
            ktons: 'MNM3E.MassKiloTonsAbbrev',
        },
        time: {
            seconds: 'MNM3E.TimeSecondsAbbrev',
            minutes: 'MNM3E.TimeMinutesAbbrev',
            hours: 'MNM3E.TimeHoursAbbrev',
            days: 'MNM3E.TimeDays',
            weeks: 'MNM3E.TimeWeeks',
            months: 'MNM3E.TimeMonths',
            years: 'MNM3E.TimeYears',
        },
        distance: {
            inches: 'MNM3E.DistanceInchesAbbrev',
            feet: 'MNM3E.DistanceFeetAbbrev',
            miles: 'MNM3E.DistanceMilesAbbrev',
            mmiles: 'MNM3E.DistanceMillionMilesAbbrev',
        },
        volume: {
            cft: 'MNM3E.VolumeCubicFeetAbbrev',
            mcft: 'MNM3E.VolumeMillionCubicFeetAbbrev',
            bcft: 'MNM3E.VolumeBillionCubicFeetAbbrev',
        },
    },
    movement: {
        burrowing: 'MNM3E.MovementBurrowing',
        flight: 'MNM3E.MovementFlight',
        leaping: 'MNM3E.MovementLeaping',
        speed: 'MNM3E.MovementSpeed',
        swim: 'MNM3E.MovementSwim',
        teleport: 'MNM3E.MovementTeleport',
    },
    rangeTypes: {
        personal: 'MNM3E.RangeTypePersonal',
        close: 'MNM3E.RangeTypeClose',
        ranged: 'MNM3E.RangeTypeRanged',
        perception: 'MNM3E.RangeTypePerception',
        rank: 'MNM3E.RangeTypeRank',
    },
    rangedMultiplier: {
        positive: 'MNM3E.Positive',
        negative: 'MNM3E.Negative',
    },
    rankCostTypes: {
        flat: 'MNM3E.RankCostTypeFlat',
        perRank: 'MNM3E.RankCostTypePerRank',
        discount: 'MNM3E.RankCostTypeDiscount',
    },
    rollTypes: {
        none: 'MNM3E.None',
        required: 'MNM3E.Required',
    },
    skills: {
        acr: 'MNM3E.SkillAcr',
        ath: 'MNM3E.SkillAth',
        cco: 'MNM3E.SkillCco',
        dec: 'MNM3E.SkillDec',
        exp: 'MNM3E.SkillExp',
        ins: 'MNM3E.SkillIns',
        itm: 'MNM3E.SkillItm',
        inv: 'MNM3E.SkillInv',
        prc: 'MNM3E.SkillPrc',
        per: 'MNM3E.SkillPer',
        rco: 'MNM3E.SkillRco',
        slt: 'MNM3E.SkillSlt',
        ste: 'MNM3E.SkillSte',
        tec: 'MNM3E.SkillTec',
        tre: 'MNM3E.SkillTre',
        vhc: 'MNM3E.SkillVhc',
    },
    summaryPositions: {
        prefix: 'MNM3E.SummaryPrefix',
        suffix: 'MNM3E.SummarySuffix',
    },
}