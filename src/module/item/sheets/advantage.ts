import Item3e from '../entity';
import ItemSheet3e, { ExtendedItemSheetData } from './base';

export default class ItemSheet3eAdvantage extends ItemSheet3e<AdvantageData, Item3e<AdvantageData>> {
    /**
     * @override
     */
    public static get defaultOptions(): FormApplication.Options {
        const opts = super.defaultOptions;
        opts.classes?.push('advantage');
        return mergeObject(opts, {
            template: 'systems/mnm3e/templates/items/advantage-sheet.html',
        });
    }

    /**
     * @override
     */
    public getData(options: DataOptions = {}): ItemSheet.Data<AdvantageData> {
        const sheetData = super.getData(options) as ExtendedItemSheetData<ModifierData>;
        return sheetData;
    }

    /**
     * @override
     */
    protected activateListeners(html: JQuery): void {
        super.activateListeners(html);
    }
}