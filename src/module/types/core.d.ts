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