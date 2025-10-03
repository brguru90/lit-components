import type { Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { StoryContextForEnhancers } from 'storybook/internal/types';

const STORIES_DIR = `./storybook-static/stories_doc`;

// Ensure the directory exists
if (!fs.existsSync(STORIES_DIR)) {
    fs.mkdirSync(STORIES_DIR, { recursive: true });
}

/**
 * Type definitions for documentation extraction
 */
export interface StoryDocContext {
    id: string;
    title: string;
    name: string;
}

export interface PropType {
    name?: string;
    value?: string | string[];
    text?: string;
    required?: boolean;
}

export interface StoryProp {
    name: string;
    type?: PropType;
    defaultValue?: any;
    description?: string;
    kind?:string;
    run_time_property?: boolean;
}

export interface StorySlot {
    name: string;
    type?: any;
    description?: string;
}

export interface StoryEvent {
    name: string;
    type?: any;
    description?: string;
    signature?: string;
    parameters?: any;
}

export interface StoryEntry {
    context: StoryDocContext;
    component_tag: string;
    story_name?: string;
    descriptions?: string;
    component_hierarchy?: string;
    component_type?: string;
    source?: string;
    rendered_source?: string;
    meta?: any;
    props: Record<string, StoryProp>;
    slots: Record<string, StorySlot>;
    events: Record<string, StoryEvent>;
    exposed: Record<string, any>;
    unknownArgs: Record<string, any>;
    cssParts?: Record<string, any>;
    cssProperties?: Record<string, any>;
    currentArgs: Record<string, any>;
    design?: any;
    storyContext?: any
}

/**
 * Interface for custom-elements.json structure
 */
export interface CustomElementsMember {
    name: string;
    kind: string;
    type?: {
        text: string;
    };
    description?: string;
    default?: string;
    attribute?: string;
    privacy?: string;
}

export interface CustomElementsDeclaration {
    kind: string;
    name: string;
    tagName?: string;
    customElement?: boolean;
    members?: CustomElementsMember[];
    attributes?: any[];
    events?: any[];
    slots?: any[];
    cssProperties?: any[];
    cssParts?: any[];
}

export interface CustomElementsModule {
    path: string;
    declarations: CustomElementsDeclaration[];
}

export interface CustomElementsManifest {
    schemaVersion: string;
    modules: CustomElementsModule[];
}

/**
 * Get all valid custom element tag names from custom-elements.json
 */
export function getAllCustomElementTags(): string[] {
    try {
        const manifestPath = path.resolve(process.cwd(), 'dist/custom-elements.json');
        if (!fs.existsSync(manifestPath)) {
            return [];
        }

        const manifest: CustomElementsManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const tags: string[] = [];

        for (const module of manifest.modules) {
            for (const declaration of module.declarations) {
                if (declaration.tagName && declaration.customElement) {
                    tags.push(declaration.tagName);
                }
            }
        }

        return tags;
    } catch (error) {
        console.warn('⚠️  Error reading custom-elements.json:', error);
        return [];
    }
}

/**
 * Extract documentation from custom-elements.json for a given component
 */
export function getCustomElementsInfo(componentTag: string): {
    props: Record<string, any>;
    events: Record<string, any>;
    slots: Record<string, any>;
    cssProperties: any[];
    cssParts: any[];
} | null {
    try {
        const manifestPath = path.resolve(process.cwd(), 'dist/custom-elements.json');
        if (!fs.existsSync(manifestPath)) {
            console.warn('⚠️  custom-elements.json not found at:', manifestPath);
            return null;
        }

        const manifest: CustomElementsManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        // Find the module and declaration for the component
        let targetDeclaration: CustomElementsDeclaration | null = null;

        for (const module of manifest.modules) {
            for (const declaration of module.declarations) {
                if (declaration.tagName === componentTag || declaration.name === componentTag) {
                    targetDeclaration = declaration;
                    break;
                }
            }
            if (targetDeclaration) break;
        }

        if (!targetDeclaration) {
            return null;
        }

        const props: Record<string, any> = {};
        const events: Record<string, any> = {};
        const slots: Record<string, any> = {};

        // Extract props/attributes
        if (targetDeclaration.members) {
            targetDeclaration.members.forEach((member) => {
                if (member.kind === 'field') {
                    props[member.name] = {
                        name: member.name,
                        type: member.type?.text || 'any',
                        kind:member.kind,
                        description: member.description || '',
                        default: member.default,
                        attribute: member.attribute,
                        privacy: member.privacy,
                    };
                }
            });
        }

        // Extract attributes directly
        if (targetDeclaration.attributes) {
            targetDeclaration.attributes.forEach((attr: any) => {
                if (!props[attr.name]) {
                    props[attr.name] = {
                        name: attr.name,
                        type: attr.type?.text || 'any',
                        kind:attr.kind,
                        description: attr.description || '',
                        default: attr.default,
                        privacy: attr.privacy,
                    };
                }
            });
        }

        // Extract events
        if (targetDeclaration.events) {
            targetDeclaration.events.forEach((event: any) => {
                events[event.name] = {
                    name: event.name,
                    type: event.type?.text || 'Event',
                    description: event.description || '',
                };
            });
        }

        // Extract slots
        if (targetDeclaration.slots) {
            targetDeclaration.slots.forEach((slot: any) => {
                slots[slot.name || 'default'] = {
                    name: slot.name || 'default',
                    description: slot.description || '',
                };
            });
        }

        return {
            props,
            events,
            slots,
            cssProperties: targetDeclaration.cssProperties || [],
            cssParts: targetDeclaration.cssParts || [],
        };
    } catch (error) {
        console.warn('⚠️  Error reading custom-elements.json:', error);
        return null;
    }
}

/**
 * Extract story documentation from Storybook context
 */
export async function extractStoryDocumentation(
    page: Page,
    context: any,
    storyContext: StoryContextForEnhancers
): Promise<StoryEntry> {

    // Get the rendered HTML
    const elementHandler = await page.$('#storybook-root');
    const renderedSource = await elementHandler?.innerHTML() || '';

    // Extract component information
    const props: Record<string, StoryProp> = {};
    const slots: Record<string, StorySlot> = {};
    const events: Record<string, StoryEvent> = {};
    const exposed: Record<string, any> = {};
    const unknownArgs: Record<string, any> = {};
    const cssParts: Record<string, any> = {};
    const cssProperties: Record<string, any> = {};

    // Parse argTypes to extract props, events, and slots
    for (const [key, curArg] of Object.entries(storyContext.argTypes || {})) {
        const argType = curArg as any;
        const category = argType.table?.category?.toLowerCase();

        // Skip internal Storybook handlers
        if (key.startsWith('on') && argType.table?.disable === true) {
            continue;
        }

        // Categorize based on table.category
        if (category === 'slots') {
            slots[key] = {
                name: argType.name || key,
                type: argType.type,
                description: argType.description || '',
            };
        } else if (category === 'events') {
            events[key] = {
                name: argType.name || key,
                type: argType.type,
                description: argType.description || '',
            };
        } else if (category === 'css shadow parts') {
            cssParts[key] = {
                name: argType.name || key,
                description: argType.description || '',
            };
        } else if (category === 'css properties' || category === 'css custom properties') {
            cssProperties[key] = {
                name: argType.name || key,
                description: argType.description || '',
                defaultValue: argType.defaultValue || argType.table?.defaultValue,
            };
        } else if (
            category === 'props' ||
            category === 'properties' ||
            category === 'attributes' ||
            (!category && argType.type?.name !== 'function')
        ) {
            // Skip disabled internal properties
            if (argType.table?.disable === true) {
                continue;
            }

            props[key] = {
                name: argType.name || key,
                type: argType.type,
                defaultValue: argType.defaultValue || argType.table?.defaultValue,
                description: argType.description || '',
            };

            // Handle options for enums
            if (argType.options) {
                props[key].type = props[key].type || { name: 'enum' };
                (props[key].type as any).value = argType.options;
            }
        } else {
            unknownArgs[key] = argType;
        }
    }

    // Try to get the component tag name from storyContext or index.json
    let componentTag = '';

    // First, try to get it from storyContext.component (direct assignment in stories)
    if (typeof (storyContext as any).component === 'string') {
        componentTag = (storyContext as any).component;
        console.log('  ✅ Found component tag from storyContext.component:', componentTag);
    }

    // If not found, try from index.json tags
    if (!componentTag) {
        try {
            const indexUrl = new URL('/index.json', page.url()).href;
            const resp = await page.request.get(indexUrl);
            const indexJson = await resp.json();

            // Get the story entry from index.json
            const storyEntry = indexJson?.entries?.[context.id];

            // Get all valid custom element tags from custom-elements.json
            const allCustomElementTags = getAllCustomElementTags();

            // Check if any of the story tags match a custom element tag
            if (storyEntry?.tags && allCustomElementTags.length > 0) {
                const componentTagFromIndex = storyEntry.tags.find((tag: string) =>
                    allCustomElementTags.includes(tag)
                );
                if (componentTagFromIndex) {
                    componentTag = componentTagFromIndex;
                    console.log('  ✅ Found component tag from index.json tags:', componentTag);
                }
            }
        } catch (error) {
            console.warn('  ⚠️  Could not fetch component from index.json:', error);
        }
    }

    // Get additional info from custom-elements.json
    const customElementsInfo = getCustomElementsInfo(componentTag)

    console.log({ componentTag, customElementsInfo })

    // Merge custom-elements.json data with story data
    if (customElementsInfo) {
        // Add missing props from custom-elements.json
        // But skip if the property is already categorized elsewhere (slots, events, cssParts, cssProperties)
        Object.entries(customElementsInfo.props).forEach(([key, value]) => {

            console.log(key,value)
            
            if ((value as any).privacy === "private" && props[key]) {
                delete props[key]
                return
            }

            if((value as any).privacy === "private"){
                return
            }


            // Check if this key is already in other categories
            const isInOtherCategory =
                slots[key] !== undefined ||
                events[key] !== undefined ||
                cssParts[key] !== undefined ||
                cssProperties[key] !== undefined;

            if (isInOtherCategory) {
                // Skip this property as it's already categorized elsewhere
                return;
            }

            if (!props[key]) {
                props[key] = {
                    name: key,
                    type: { name: 'string', text: (value as any).type },
                    defaultValue: (value as any).default,
                    description: (value as any).description || '',
                };
            } else {
                // Enhance existing prop with type info if missing
                if (!props[key].type?.text && (value as any).type) {
                    props[key].type = { ...props[key].type, text: (value as any).type };
                }
            }
            if(props[key]){
                console.log("run_time_property",key,value)
                props[key].run_time_property=(value as any).privacy === "public" && (value as any).kind == "field" && !(value as any)?.attribute
            }
        });

        // Add missing events from custom-elements.json
        Object.entries(customElementsInfo.events).forEach(([key, value]) => {
            if (!events[key]) {
                events[key] = value as StoryEvent;
            }
        });

        // Add missing slots from custom-elements.json
        Object.entries(customElementsInfo.slots).forEach(([key, value]) => {
            if (!slots[key]) {
                slots[key] = value as StorySlot;
            }
        });
    }

    // Extract descriptions
    const descriptions = [
        storyContext.parameters?.docs?.description?.component,
        storyContext.parameters?.docs?.description?.story,
    ]
        .filter((item) => !!item)
        .join('\n');

    // Get the source code
    const source =
        storyContext.parameters?.docs?.source?.code ||
        storyContext.parameters?.docs?.source?.originalSource ||
        '';

    const storyEntry: StoryEntry = {
        context: {
            id: context.id,
            title: context.title,
            name: context.name,
        },
        component_tag: componentTag,
        story_name: context.name,
        descriptions,
        component_hierarchy: storyContext.parameters?.docs?.component_hierarchies,
        component_type: storyContext.parameters?.docs?.component_type,
        source,
        rendered_source: renderedSource,
        meta: {
            id: context.id,
            title: context.title,
            name: context.name,
        },
        props,
        slots,
        events,
        exposed,
        unknownArgs,
        currentArgs: (storyContext as any).args || (storyContext as any).initialArgs || {},
        design: storyContext.parameters?.design,
        cssParts,
        cssProperties,
        storyContext
    };

    return storyEntry;
}

/**
 * Save story documentation to file
 */
export function saveStoryDocumentation(
    storyId: string,
    storyEntry: StoryEntry
): void {
    try {
        const processId = process.pid;
        const chunkPath = path.join(STORIES_DIR, `chunk_${processId}_${storyId}.json`);

        // Read existing chunk if it exists
        let stories: Record<string, StoryEntry> = {};
        if (fs.existsSync(chunkPath)) {
            try {
                stories = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
            } catch (error) {
                console.warn(`⚠️  Error reading existing chunk file: ${chunkPath}`);
            }
        }

        // Add/update the story
        stories[storyId] = storyEntry;

        // Write back to file
        fs.writeFileSync(chunkPath, JSON.stringify(stories, null, 2));

        console.log(`✅ Saved documentation for story: ${storyId}`);
    } catch (error) {
        console.error(`❌ Error saving documentation for ${storyId}:`, error);
    }
}

/**
 * Main function to extract and save documentation for a story
 */
export async function extractAndSaveDocumentation(
    page: Page,
    context: any,
    storyContext: StoryContextForEnhancers
): Promise<void> {
    try {
        // Skip documentation extraction for NativeFrameworkRendering stories
        if (context.title?.includes('Native Framework Rendering') ||
            context.id?.includes('native-framework-rendering')) {
            console.log(`⏭️  Skipping documentation extraction for: ${context.title} - ${context.name}`);
            return;
        }

        console.log(`\n📝 Extracting documentation for: ${context.title} - ${context.name}`);

        const storyEntry = await extractStoryDocumentation(page, context, storyContext);
        saveStoryDocumentation(context.id, storyEntry);
    } catch (error) {
        console.error(`❌ Error extracting documentation for ${context.id}:`, error);
        throw error;
    }
}
