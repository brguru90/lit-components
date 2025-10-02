import { ArgTypes } from "@storybook/web-components-vite";
import { CustomElementsManifest } from "cem-plugin-vs-code-custom-data-generator/types";
import customElements from '../dist/custom-elements.json'


export function getArgTypesFromManifest(componentName: string) {
    const manifest = customElements as CustomElementsManifest
    const module = manifest.modules.find((mod) =>
        mod.declarations.some((decl) => decl.tagName === componentName)
    );

    if (!module) return {};

    const declaration = module.declarations.find(
        (decl) => decl.tagName === componentName
    );

    if (!declaration) return {};


    const argTypes: ArgTypes = {};


    (declaration.members?.flat()?.filter(memeber=>memeber.kind=="field" && memeber.type) || declaration.attributes).forEach((attr) => {
        if((attr as any).privacy === "public" && (attr as any).kind == "field" && !(attr as any)?.attribute) return; // means its a runtime property not an attribute
        const options = getOptions(attr.type!.text);
        const valueType = getControlType(attr.type!.text)
        const argType: any = {
            control: { type: valueType },
            description: attr.description,
            defaultValue: attr.default,
            table: {
                disable: (attr as any).privacy === "private"
            }
        };

        // Only add options if there are actual options (for select controls)
        if (options.length > 0) {
            argType.options = options;
        }

        argTypes[attr.name] = argType;
    });

    return { argTypes };
}

function getControlType(type: string): string {
    // Handle nullable union types (e.g., "string | null", "number | undefined")
    if (type.includes("|")) {
        const types = type.split("|").map(t => t.trim());
        const nonNullableTypes = types.filter(t => t !== "null" && t !== "undefined");

        // If it's a nullable union with only one non-nullable type, treat as that type
        if (nonNullableTypes.length === 1) {
            const baseType = nonNullableTypes[0].replace(/"/g, "");
            switch (baseType) {
                case "string":
                    return "text";
                case "number":
                    return "number";
                case "boolean":
                    return "boolean";
                default:
                    return "text";
            }
        }

        // If it's a true union with multiple non-nullable types, treat as select
        if (nonNullableTypes.length > 1) {
            return "select";
        }
    }

    // Handle single types
    const cleanType = type.replace(/"/g, "");
    switch (cleanType) {
        case "string":
            return "text";
        case "number":
            return "number";
        case "boolean":
            return "boolean";
        default:
            return "text";
    }
}

function getOptions(type: string): string[] {
    if (type.includes("|")) {
        const types = type.split("|").map(t => t.trim().slice(1, -1));
        const nonNullableTypes = types.filter(t => t !== "null" && t !== "undefined");

        // Only return options for true unions (not nullable types)
        if (nonNullableTypes.length > 1) {
            return nonNullableTypes.map(option => option.replace(/"/g, ""));
        }
    }
    return [];
}
