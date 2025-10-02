import type { StoryContext } from '@storybook/web-components'

export type FrameworkType = 'html' | 'react' | 'vue' | 'angular' | 'lit'

interface TransformOptions {
  componentName: string
  attrs: Record<string, any>
  children?: string
  slots?: Record<string, string>
}

// Cache for storing extracted slots by story ID
const slotCache = new Map<string, { slots: Record<string, string>, children: string }>()

/**
 * Transform attributes to HTML format
 */
function toHTMLAttributes(attrs: Record<string, any>): string {
  let result = ''
  
  for (const [key, value] of Object.entries(attrs)) {
    const attrName = key
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^on-/, '@')

    // Skip event handlers - they'll be shown in the <script> section instead
    if (attrName.startsWith('@')) {
      continue
    }

    if (value === true) {
      result += `\n  ${attrName}`
    } else if (value !== false && value !== undefined && value !== null) {
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value).replace(/"/g, "'")
        : String(value)
      result += `\n  ${attrName}="${stringValue}"`
    }
  }
  
  return result
}

/**
 * Transform to vanilla HTML/Web Component syntax
 */
function transformToHTML({ componentName, attrs, children, slots }: TransformOptions): string {
  const htmlAttrs = toHTMLAttributes(attrs)
  
  // Build slot content
  let slotContent = ''
  if (slots && Object.keys(slots).length > 0) {
    slotContent = Object.values(slots).map(content => `  ${content}`).join('\n')
  }
  
  // Combine slots and children
  const allContent = [slotContent, children].filter(Boolean).join('\n  ')
  
  return `<${componentName}${htmlAttrs}\n>
  ${allContent}
</${componentName}>

<script>
  const element = document.querySelector('${componentName}');
  
  // Event listeners
${Object.entries(attrs)
  .filter(([key]) => key.startsWith('on'))
  .map(([key]) => {
    const eventName = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^on-/, '');
    return `  element.addEventListener('${eventName}', (event) => {
    console.log('${eventName}', event.detail);
  });`
  })
  .join('\n')}
</script>`
}

/**
 * Transform to React syntax
 */
function transformToReact({ componentName, attrs, children, slots }: TransformOptions): string {
  const pascalName = componentName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  
  let jsxAttrs = ''
  const imports: string[] = []
  
  for (const [key, value] of Object.entries(attrs)) {
    const propName = key.startsWith('on') 
      ? `on${key.slice(2).charAt(0).toUpperCase()}${key.slice(3)}`
      : key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    
    if (value === true) {
      jsxAttrs += `\n      ${propName}`
    } else if (value !== false && value !== undefined && value !== null) {
      if (typeof value === 'string') {
        jsxAttrs += `\n      ${propName}="${value}"`
      } else if (typeof value === 'function') {
        jsxAttrs += `\n      ${propName}={handleEvent}`
      } else {
        jsxAttrs += `\n      ${propName}={${JSON.stringify(value)}}`
      }
    }
  }
  
  imports.push(`import { ${pascalName} } from 'vg/react'`)
  imports.push(`import 'vg'`)
  
  const eventHandlers = Object.entries(attrs)
    .filter(([key]) => key.startsWith('on'))
    .map(([key]) => {
      const eventName = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^on-/, '');
      return `const handleEvent = (event) => {
    console.log('${eventName}', event.detail);
  };`
    })
    .join('\n\n')
  
  // Build slot and children content
  let contentLines: string[] = []
  if (slots && Object.keys(slots).length > 0) {
    contentLines.push(...Object.values(slots).map(s => `    ${s}`))
  }
  if (children) {
    contentLines.push(`    ${children}`)
  }
  
  const content = contentLines.length > 0 
    ? '\n' + contentLines.join('\n') + '\n    '
    : '\n    '
  
  return `${imports.join('\n')}

function MyComponent() {
${eventHandlers ? `  ${eventHandlers}\n\n` : ''}  return (
    <${pascalName}${jsxAttrs}\n    >${content}</${pascalName}>
  );
}`
}

/**
 * Transform to Vue syntax
 */
function transformToVue({ componentName, attrs, children, slots }: TransformOptions): string {
  let vueAttrs = ''
  const scriptContent: string[] = []
  const imports: string[] = [`import 'vg/vue'`]
  
  for (const [key, value] of Object.entries(attrs)) {
    const propName = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    
    if (key.startsWith('on')) {
         const eventName = key
              .replace(/([A-Z])/g, "-$1")
              .toLowerCase()
              .replace(/^on-/, "");
      vueAttrs += `\n    @${eventName}="handleEvent"`
    } else if (value === true) {
      vueAttrs += `\n    ${key}`
    } else if (value !== false && value !== undefined && value !== null) {
      if (typeof value === 'string') {
        vueAttrs += `\n    ${key}="${value}"`
      } else {
        scriptContent.push(`const ${propName} = ref(${JSON.stringify(value)})`)
        vueAttrs += `\n    :${key}="${propName}"`
      }
    }
  }
  
  const hasEvents = Object.keys(attrs).some(key => key.startsWith('on'))
  if (hasEvents) {
    scriptContent.push(`const handleEvent = (event) => {
  console.log(event.type, event.detail);
}`)
  }
  
  // Build slot and children content
  let contentLines: string[] = []
  if (slots && Object.keys(slots).length > 0) {
    contentLines.push(...Object.values(slots).map(s => `    ${s}`))
  }
  if (children) {
    contentLines.push(`    ${children}`)
  }
  
  const content = contentLines.length > 0 
    ? '\n' + contentLines.join('\n') + '\n  '
    : '\n  '
  
  return `<script setup>
${imports.join('\n')}
import { ref } from 'vue'

${scriptContent.join('\n')}
</script>

<template>
  <${componentName}${vueAttrs}\n  >${content}</${componentName}>
</template>`
}

/**
 * Transform to Angular syntax
 */
function transformToAngular({ componentName, attrs, children, slots }: TransformOptions): string {
  let angularAttrs = ''
  const properties: string[] = []
  const methods: string[] = []
  
  for (const [key, value] of Object.entries(attrs)) {
    const propName = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    
    if (key.startsWith('on')) {
      const eventName = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^on-/, '');
      angularAttrs += `\n    (${eventName})="onEvent($event)"`
    } else if (value === true) {
      angularAttrs += `\n    [${key}]="true"`
    } else if (value !== false && value !== undefined && value !== null) {
      if (typeof value === 'string') {
        properties.push(`  public ${propName} = '${value}';`)
        angularAttrs += `\n    [${key}]="${propName}"`
      } else {
        properties.push(`  public ${propName} = ${JSON.stringify(value)};`)
        angularAttrs += `\n    [${key}]="${propName}"`
      }
    }
  }
  
  const hasEvents = Object.keys(attrs).some(key => key.startsWith('on'))
  if (hasEvents) {
    methods.push(`  onEvent(event: Event) {
    console.log((event as CustomEvent).detail);
  }`)
  }
  
  // Build slot and children content
  let contentLines: string[] = []
  if (slots && Object.keys(slots).length > 0) {
    contentLines.push(...Object.values(slots).map(s => `  ${s}`))
  }
  if (children) {
    contentLines.push(`  ${children}`)
  }
  
  const content = contentLines.length > 0 
    ? '\n' + contentLines.join('\n') + '\n'
    : '\n'
  
  return `// component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-demo',
  standalone: true,
  templateUrl: './demo.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoComponent {
${properties.join('\n')}

${methods.join('\n')}
}

// demo.component.html
<${componentName}${angularAttrs}\n>${content}</${componentName}>`
}

/**
 * Transform to Lit Element syntax
 */
function transformToLit({ componentName, attrs, children, slots }: TransformOptions): string {
  const htmlAttrs = Object.entries(attrs)
    .map(([key, value]) => {
      const attrName = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^on-/, '@')

      if (key.startsWith('on')) {
        return `\n        ${attrName}=\${this.handleEvent}`
      } else if (value === true) {
        return `\n        ?${attrName}=\${true}`
      } else if (value !== false && value !== undefined && value !== null) {
        if (typeof value === 'string') {
          return `\n        ${attrName}="${value}"`
        } else {
          return `\n        .${attrName}=\${${JSON.stringify(value)}}`
        }
      }
      return ''
    })
    .filter(Boolean)
    .join('')
  
  const hasEvents = Object.keys(attrs).some(key => key.startsWith('on'))
  
  // Build slot and children content
  let contentLines: string[] = []
  if (slots && Object.keys(slots).length > 0) {
    contentLines.push(...Object.values(slots).map(s => `        ${s}`))
  }
  if (children) {
    contentLines.push(`        ${children}`)
  }
  
  const content = contentLines.length > 0 
    ? '\n' + contentLines.join('\n') + '\n      '
    : '\n      '
  
  return `import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-demo')
export class MyDemo extends LitElement {
${hasEvents ? `
  handleEvent(e: CustomEvent) {
    console.log(e.type, e.detail);
  }
` : ''}
  render() {
    return html\`
      <${componentName}${htmlAttrs}\n      >${content}</${componentName}>
    \`;
  }
}`
}

/**
 * Extract slot content and children from rendered HTML
 */
function extractSlotsFromHTML(html: string, componentName: string): { 
  slots: Record<string, string>, 
  children: string 
} {
  const slots: Record<string, string> = {}
  let children = ''
  
  if (!html) {
    return { slots, children }
  }
  
  // Clean up the HTML by removing malformed event handler attributes
  // These contain full function bodies from Storybook's internal code
  let cleanedHtml = html
  
  // Remove @event="function(...) { ... }" attributes that span multiple lines
  cleanedHtml = cleanedHtml.replace(/@[\w-]+="function\([^)]*\)\s*\{[\s\S]*?\}"/g, '')
  
  // Match the component opening tag and closing tag
  const componentRegex = new RegExp(`<${componentName}[^>]*>([\\s\\S]*?)<\\/${componentName}>`, 'i')
  const match = cleanedHtml.match(componentRegex)
  
  if (!match) {
    return { slots, children }
  }
  
  const content = match[1]
  
  // Extract slotted content (including self-closing tags and multi-line content)
  const slotRegex = /<([a-z][a-z0-9-]*)\s+([^>]*\s)?slot="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>|<([a-z][a-z0-9-]*)\s+([^>]*\s)?slot="([^"]+)"([^>]*)\/>/gi
  let slotMatch
  const slottedContent: string[] = []
  
  while ((slotMatch = slotRegex.exec(content)) !== null) {
    const fullMatch = slotMatch[0]
    const slotName = slotMatch[3] || slotMatch[8]
    if (slotName) {
      slots[slotName] = fullMatch.trim()
      slottedContent.push(fullMatch)
    }
  }
  
  // Extract remaining children (non-slotted content)
  let remainingContent = content
  slottedContent.forEach(slotContent => {
    remainingContent = remainingContent.replace(slotContent, '')
  })
  
  // Clean up any leftover Storybook code that leaked into children
  remainingContent = remainingContent.replace(/h\.phase\s*===[\s\S]*$/g, '')
  remainingContent = remainingContent.replace(/i\.resolves\[u\][\s\S]*$/g, '')
  
  children = remainingContent.trim()
  
  return { slots, children }
}

/**
 * Main transformer function
 */
export function transformCodeForFramework(
  framework: FrameworkType,
  storyContext: StoryContext,
  renderedCode?: string
): string {
  const componentName = typeof storyContext.component === 'string'
    ? storyContext.component
    : storyContext.componentId?.split('--')[0]?.replace(/^components-/, '') || 'vg-component'

  const storyId = storyContext.id
  const attrs: Record<string, any> = {}
  let slots: Record<string, string> = {}
  let children = ''
  
  // Convert args to attributes
  for (const [key, value] of Object.entries(storyContext.args || {})) {
    // Skip function properties (likely event handlers) for now
    if (typeof value === 'function') {
      // Keep event handlers with a placeholder
      if (key.startsWith('on')) {
        attrs[key] = value
      }
      continue
    }
    attrs[key] = value
  }

  // Try to extract slots from the rendered code
  // But first check if this is already transformed code (to avoid re-processing)
  if (renderedCode) {
    // Check if the rendered code is already transformed (starts with import, etc.)
    const isAlreadyTransformed = /^(import|function|class|const|let|var|\s*<\w+[A-Z])/m.test(renderedCode.trim())
    
    if (isAlreadyTransformed) {
      // Try to use cached slots from previous HTML render
      const cached = slotCache.get(storyId)
      if (cached) {
        slots = cached.slots
        children = cached.children
      } else {
        children = attrs.children || ''
      }
    } else {
      // Extract slots from HTML and cache them
      const extracted = extractSlotsFromHTML(renderedCode, componentName)
      slots = extracted.slots
      children = extracted.children || attrs.children || ''
      
      // Cache the extracted slots for this story
      slotCache.set(storyId, { slots, children })
    }
  } else {
    // Try to use cached slots if available
    const cached = slotCache.get(storyId)
    if (cached) {
      slots = cached.slots
      children = cached.children
    } else {
      children = attrs.children || ''
    }
  }
  
  delete attrs.children

  const options: TransformOptions = {
    componentName,
    attrs,
    children,
    slots
  }

  switch (framework) {
    case 'html':
      return transformToHTML(options)
    case 'react':
      return transformToReact(options)
    case 'vue':
      return transformToVue(options)
    case 'angular':
      return transformToAngular(options)
    case 'lit':
      return transformToLit(options)
    default:
      return transformToHTML(options)
  }
}
