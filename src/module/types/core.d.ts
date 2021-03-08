declare class EmbeddedEntity<T = any> {
    constructor(data: T, parent: Entity);

    get data(): T;

    get id(): string;
    prepareData(): T;

    getFlag(scope: string, key: string): any;
    async setFlag(scope: string, key: string, value: any): Promise<PlaceableObject>;
    async unsetFlag(scope: string, key: string): Promise<Entity>;
}

declare interface ActiveEffectData<T = any> extends EntityData<T> {

}

declare interface ActiveEffectChange {
    key: string;
    value: any;
    mode: number;
    priority: number;
    effect: ActiveEffect;

    // Custom to mnm3e
    flags: {
        mnm3e: {
            namespace: string;
        };
    } & {[k: string]: any};
}

declare class ActiveEffectConfig extends FormApplication {
    get title(): string;
}

declare class ActiveEffect<T = any> extends EmbeddedEntity<T> {
    get isTemporary(): boolean;
    sheet: ActiveEffectConfig;
    get sourceName(): string;

    static create(...args): any;

    async _getSourceName(): Promise<string>;
    apply(actor: Actor, change: ActiveEffectChange): any;
    async create(data: T, options?: object): Promise<ActiveEffect<T>>;
    async delete(options: object): Promise<string>;
    async update(data: T, options: object): Promise<ActiveEffect<T>>;
}

declare type ActiveEffectType = 'temporary' | 'passive' | 'inactive';

declare interface ActiveEffectCategory<T = any> {
    type: ActiveEffectType;
    label: string;
    effects: ActiveEffect<T>[];
}

declare interface ActiveEffectCategories<T = any> {
    temporary: ActiveEffectCategory<T>;
    passive: ActiveEffectCategory<T>;
    inactive: ActiveEffectCategory<T>;
}

declare interface DragDropParams {
    dragSelector: string;
    dropSelector: string;
    permissions: {[key: string]: Function};
    callbacks: {[key: string]: Function};
}

declare class DragDrop {
    constructor(params: DragDropParams);

    bind(selector: HTMLElement);
}

declare interface DataOptions {
    renderData?: any;
}

declare type CardType = 'check' | 'effects' | 'basic-roll';

declare interface Speaker {
    scene?: string;
    actor?: string;
    token?: string;
    alias: string;
};