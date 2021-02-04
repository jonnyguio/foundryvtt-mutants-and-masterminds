import Item3e from '../item/entity';
import { Config } from '../config';
import { getMeasurement } from '../measurements';

type PowerEffectTemplateWithActor = PowerEffectTemplate & { item: Item3e, actorSheet?: BaseEntitySheet};
export default class PowerEffectTemplate extends MeasuredTemplate {
    static fromItem(item: Item3e): PowerEffectTemplate | undefined {
        const activatedData = (item.data.data as unknown) as ItemActivatedEffect
        if (!activatedData?.activation.range.area.value) {
            return undefined;
        }
        const areaRank = activatedData.activation.range.area.overrideRank || 1;

        const templateShape = (CONFIG.MNM3E as Config).areaTargetType[activatedData.activation.range.area.value];
        if (!templateShape) {
            return undefined;
        }

        const templateData: {[k: string]: any} = {
            t: templateShape,
            user: game.user._id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: (game.user as any).color,
        };

        switch (templateShape) {
            case 'cone': 
                templateData.angle = (CONFIG as any).MeasuredTemplate.defaults.angle;
                templateData.distance = getMeasurement('distance', areaRank).value;
                break;
            case 'ray':
                templateData.width = canvas.dimensions.distance;
                templateData.distance = getMeasurement('distance', areaRank).value;
                break;
            default:
                templateData.distance = getMeasurement('volume', areaRank).value;
                break;
        }

        const template = new this(templateData) as PowerEffectTemplateWithActor;
        template.item = item;
        template.actorSheet = item.actor?.sheet || undefined;

        return template;
    }

    public drawPreview(): void {
        const initialLayer = canvas.activeLayer;

        this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        const thisWithSheet = (this as unknown) as PowerEffectTemplateWithActor;
        thisWithSheet.actorSheet?.minimize();

        this.activatePreviewListeners(initialLayer);
    }

    private activatePreviewListeners(initialLayer: any): void {
        const thisWithSheet = (this as unknown) as PowerEffectTemplateWithActor;
        const handlers: { [k: string]: (ev: JQuery.MouseEventBase) => void } = {};
        let moveTime = 0;

        handlers.mm = (ev: JQuery.MouseEventBase) => {
            
            ev.stopPropagation();
            let now = Date.now();
            if (now - moveTime <= 20) {
                return;
            }

            const center = ev.data.getLocalPosition(this.layer);
            const snapped = canvas.grid.getSnappedPosition(center.x, center.y);
            this.data.x = snapped.x;
            this.data.y = snapped.y;
            this.refresh();
            moveTime = now;
        };

        handlers.rc = () => {
            this.layer.preview.removeChildren();
            canvas.stage.off('mousemove', handlers.mm);
            canvas.stage.off('mousedown', handlers.lc);
            canvas.app.view.oncontextmenu = null;
            canvas.app.view.onwheel = null;
            initialLayer.activate();
            thisWithSheet.actorSheet?.maximize();
        };

        handlers.lc = ev => {
            handlers.rc(ev);

            const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
            this.data.x = destination.x;
            this.data.y = destination.y;

            canvas.scene.createEmbeddedEntity('MeasuredTemplate', this.data);
        };

        handlers.mw = ev => {
            if (ev.ctrlKey) {
                ev.preventDefault();
            }
            ev.stopPropagation();
            let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
            let snap = ev.shiftKey ? delta : 5;
            this.data.direction += (snap * Math.sign((ev as any).deltaY));
            this.refresh();
        };

        canvas.stage.on('mousemove', handlers.mm);
        canvas.stage.on('mousedown', handlers.lc);
        canvas.app.view.oncontextmenu = handlers.rc;
        canvas.app.view.onwheel = handlers.mw;
    }
}