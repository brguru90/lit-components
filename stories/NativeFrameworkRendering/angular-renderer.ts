/**
 * Angular Renderer Utility for Storybook Web Components
 * 
 * This utility allows Angular component configurations to be rendered
 * within Storybook's web-components renderer by manually bootstrapping
 * Angular modules and mounting them to DOM elements.
 */

// Import Angular compiler FIRST - required for JIT compilation
import '@angular/compiler'
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

export interface AngularComponentConfig {
  props: Record<string, any>
  template: string
}

/**
 * Renders an Angular component by dynamically creating a component class,
 * module, and bootstrapping it to a container element.
 * 
 * @param config - Angular component configuration with props and template
 * @returns The container DOM element with the bootstrapped Angular app
 */
export async function renderAngularComponent(config: AngularComponentConfig): Promise<HTMLElement> {
  const container = document.createElement('div')
  
  // Create a dynamic component class
  @Component({
    selector: 'app-story',
    template: config.template,
    standalone: false
  })
  class StoryComponent {
    constructor() {
      Object.assign(this, config.props)
    }
  }
  
  // Assign props to component prototype
  Object.keys(config.props).forEach(key => {
    (StoryComponent.prototype as any)[key] = config.props[key]
  })
  
  // Create a module for this component
  @NgModule({
    declarations: [StoryComponent],
    imports: [BrowserModule],
    bootstrap: [StoryComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  class StoryModule {}
  
  // Bootstrap the module
  try {
    const moduleRef = await platformBrowserDynamic().bootstrapModule(StoryModule, {
      ngZone: 'noop' // Disable zone.js for better performance
    })
    
    // Get the root element and move it to our container
    const appRoot = moduleRef.injector.get(StoryComponent as Type<any>)
    const rootElement = document.querySelector('app-story')
    if (rootElement) {
      container.appendChild(rootElement)
    }
    
    // Store module ref for cleanup
    ;(container as any).__angularModule = moduleRef
    
    return container
  } catch (error) {
    console.error('Failed to bootstrap Angular module:', error)
    container.innerHTML = `<div style="color: red;">Error bootstrapping Angular: ${error}</div>`
    return container
  }
}

/**
 * Destroys an Angular module (cleanup utility)
 * 
 * @param container - The container element that has a bootstrapped Angular module
 */
export function unmountAngularComponent(container: HTMLElement): void {
  const moduleRef = (container as any).__angularModule
  if (moduleRef) {
    moduleRef.destroy()
    delete (container as any).__angularModule
  }
}
