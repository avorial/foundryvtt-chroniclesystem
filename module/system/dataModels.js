function clone(value) {
    return foundry.utils.deepClone(value);
}

function templateFor(documentName, type) {
    const documentTemplate = game.system.template[documentName];
    const typeTemplate = documentTemplate[type] ?? {};
    const templateNames = typeTemplate.templates ?? [];
    let systemData = {};

    for (const templateName of templateNames) {
        systemData = foundry.utils.mergeObject(
            systemData,
            clone(documentTemplate.templates[templateName] ?? {}),
            { inplace: false }
        );
    }

    const ownData = clone(typeTemplate);
    delete ownData.templates;

    return foundry.utils.mergeObject(systemData, ownData, { inplace: false });
}

function fieldFor(value) {
    const fields = foundry.data.fields;
    const initial = () => clone(value);

    if (Array.isArray(value)) {
        return new fields.ArrayField(new fields.AnyField(), { required: true, initial });
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value);
        if (!entries.length) return new fields.ObjectField({ required: true, initial });
        return new fields.SchemaField(Object.fromEntries(entries.map(([key, entryValue]) => [key, fieldFor(entryValue)])));
    }
    if (typeof value === "number") return new fields.NumberField({ required: true, initial: value });
    if (typeof value === "boolean") return new fields.BooleanField({ required: true, initial: value });
    return new fields.StringField({ required: true, blank: true, initial: value ?? "" });
}

function schemaFor(documentName, type) {
    const systemData = templateFor(documentName, type);
    return Object.fromEntries(Object.entries(systemData).map(([key, value]) => [key, fieldFor(value)]));
}

class ChronicleTypeDataModel extends foundry.abstract.TypeDataModel {
    static documentName = "";
    static typeName = "";

    static defineSchema() {
        return schemaFor(this.documentName, this.typeName);
    }
}

function createTypeDataModel(documentName, typeName) {
    return class extends ChronicleTypeDataModel {
        static documentName = documentName;
        static typeName = typeName;
    };
}

export function registerDataModels() {
    CONFIG.Actor.dataModels = {
        character: createTypeDataModel("Actor", "character"),
        house: createTypeDataModel("Actor", "house")
    };

    CONFIG.Item.dataModels = {
        armor: createTypeDataModel("Item", "armor"),
        weapon: createTypeDataModel("Item", "weapon"),
        ability: createTypeDataModel("Item", "ability"),
        equipment: createTypeDataModel("Item", "equipment"),
        benefit: createTypeDataModel("Item", "benefit"),
        drawback: createTypeDataModel("Item", "drawback"),
        event: createTypeDataModel("Item", "event"),
        holding: createTypeDataModel("Item", "holding"),
        technique: createTypeDataModel("Item", "technique"),
        poison: createTypeDataModel("Item", "poison")
    };
}
