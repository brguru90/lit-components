import os
os.environ['DANGEROUSLY_OMIT_AUTH']="true"
import json
import traceback
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastmcp import FastMCP, Context
from fastmcp.prompts.prompt import PromptMessage, TextContent
from fastmcp.server.dependencies import get_context
from pydantic import BaseModel


# Path to the component registry JSON file
COMPONENT_REGISTRY_PATH = Path(__file__).parent.parent.parent.parent / "storybook-static" / "stories_doc" / "component-registry.json"

# Global variables to store loaded data
component_registry: Dict[str, Any] = {}
components_data: Dict[str, Any] = {}
schemas_data: Dict[str, Any] = {}
categories_data: Dict[str, Any] = {}
css_definitions: str = ""

def load_component_registry_sync() -> str:
    """Load the component registry from the JSON file."""
    global component_registry, components_data, schemas_data, categories_data, css_definitions
    
    try:
        print(f"Loading component registry from {COMPONENT_REGISTRY_PATH}")
        
        if not COMPONENT_REGISTRY_PATH.exists():
            error_msg = f"Component registry file not found at {COMPONENT_REGISTRY_PATH}"
            print(f"ERROR: {error_msg}")
            return error_msg
        
        with open(COMPONENT_REGISTRY_PATH, 'r', encoding='utf-8') as f:
            component_registry = json.load(f)
        
        # Extract different sections
        components_data = component_registry.get('components', {})
        schemas_data = component_registry.get('schemas', {})
        categories_data = component_registry.get('categories', {})
        css_definitions = component_registry.get('predefined_css_definitions', "")
        
        success_msg = f"Successfully loaded component registry with {len(components_data)} components, {len(schemas_data)} schemas, and {len(categories_data)} categories"
        print(success_msg)
        return success_msg
        
    except Exception as e:
        error_traceback = traceback.format_exc()
        error_msg = f"Error loading component registry: {str(e)}"
        print(f"ERROR: {error_msg}\n{error_traceback}")
        return error_msg

async def load_component_registry() -> str:
    """Async wrapper for loading the component registry."""
    return load_component_registry_sync()


@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[str]:
    """Load the component registry on startup."""
    # Load the component registry during startup
    await load_component_registry()
    # Yield to indicate startup is complete, then keep running
    yield "started"
    # The function continues to run here, keeping the server alive


instructions = """
This MCP server provides access to Lit Components documentation from the Storybook component registry.
You can use the tools to fetch, categorize, and retrieve information about Lit components, their schemas, CSS styles, and examples.

# Lit Components Documentation Server

## Overview
This server provides access to comprehensive Lit component documentation including:
- Component definitions with props, events, and slots
- TypeScript type schemas and definitions
- CSS variables and styling information
- Component examples and usage patterns
- Category-based component organization

## Usage Guidelines
1. Start by listing available components to understand what's available
2. Use schema tools to understand TypeScript types and interfaces
3. Get detailed component documentation for specific components
4. Access CSS definitions for styling information
5. Browse examples to see component usage patterns

## Recommended Tool Usage Flow
1. **list_components** - Get overview of all available components
2. **get_component_by_tag** - Get specific component documentation
3. **list_schemas** - See available TypeScript types
4. **get_schema_definition** - Get specific type definitions
5. **list_categories** - Browse components by category
"""

# Initialize FastMCP server
mcp = FastMCP(
    name="Lit Components Documentation Server",
    lifespan=app_lifespan,
    instructions=instructions,
    version="0.1.0"
)


@mcp.prompt
def get_instructions() -> PromptMessage:
    """Get startup instructions for the Lit Components documentation server."""
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text=instructions
        )
    )


@mcp.tool(name="reload_registry")
async def reload_registry() -> str:
    """Reload the component registry from the file system."""
    return await load_component_registry()


@mcp.tool(name="get_server_info")
async def get_server_info() -> Dict[str, Any]:
    """Get information about the server and loaded data."""
    return {
        "version": component_registry.get('version', 'unknown'),
        "framework": component_registry.get('framework', 'unknown'),
        "library": component_registry.get('library', 'unknown'),
        "components_count": len(components_data),
        "schemas_count": len(schemas_data),
        "categories_count": len(categories_data),
        "has_css_definitions": bool(css_definitions),
        "registry_path": str(COMPONENT_REGISTRY_PATH)
    }


@mcp.tool(name="list_components")
async def list_components(ctx: Context) -> Dict[str, Any]:
    """List all available Lit components with basic information."""
    await ctx.info("🔍 Listing all available Lit components")
    await ctx.debug("Checking if component registry is loaded")
    
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    components_list = []
    for i, (component_tag, component_info) in enumerate(components_data.items()):
        await ctx.debug(f"Processing component {i+1}: {component_tag}")
        components_list.append({
            "tag": component_tag,
            "category": component_info.get('category', ''),
            "description": component_info.get('descriptions', ''),
            "props_count": len(component_info.get('props', {})),
            "events_count": len(component_info.get('events', {})),
            "slots_count": len(component_info.get('slots', {})),
            "examples_count": len(component_info.get('examples', []))
        })
    
    result = {
        "total_components": len(components_list),
        "components": components_list
    }
    
    await ctx.info(f"✅ Successfully listed {len(components_list)} components")
    return result


@mcp.tool(name="get_component_by_tag")
async def get_component_by_tag(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed documentation for a specific component by its tag name."""
    await ctx.info(f"🔍 Looking up component: {component_tag}")
    await ctx.debug("Checking if component registry is loaded")
    
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        available_components = list(components_data.keys())
        await ctx.warning(f"❌ Component '{component_tag}' not found")
        await ctx.debug(f"Available components: {available_components}")
        return f"Component '{component_tag}' not found. Available components: {available_components}"
    
    await ctx.debug(f"Found component data with {len(component.get('props', {}))} props, {len(component.get('events', {}))} events")
    
    result = {
        "tag": component_tag,
        "category": component.get('category', ''),
        "description": component.get('descriptions', ''),
        "component_hierarchy": component.get('component_hierarchy', ''),
        "component_type": component.get('component_type', ''),
        "props": component.get('props', {}),
        "events": component.get('events', {}),
        "slots": component.get('slots', {}),
        "exposed": component.get('exposed', {}),
        "examples": component.get('examples', [])
    }
    
    await ctx.info(f"✅ Successfully retrieved component '{component_tag}' with complete documentation")
    return result


@mcp.tool(name="search_components")
async def search_components(search_term: str) -> Dict[str, Any]:
    """Search for components by name, description, or category."""
    if not components_data:
        load_component_registry_sync()
    
    search_term_lower = search_term.lower()
    matching_components = []
    
    for component_tag, component_info in components_data.items():
        # Search in tag name, category, and description
        if (search_term_lower in component_tag.lower() or
            search_term_lower in component_info.get('category', '').lower() or
            search_term_lower in component_info.get('descriptions', '').lower()):
            
            matching_components.append({
                "tag": component_tag,
                "category": component_info.get('category', ''),
                "description": component_info.get('descriptions', ''),
                "match_reason": "name" if search_term_lower in component_tag.lower() else
                              "category" if search_term_lower in component_info.get('category', '').lower() else
                              "description"
            })
    
    return {
        "search_term": search_term,
        "matches_found": len(matching_components),
        "components": matching_components
    }


@mcp.tool(name="list_schemas")
async def list_schemas() -> Dict[str, Any]:
    """List all available TypeScript schemas and type definitions."""
    if not schemas_data:
        load_component_registry_sync()
    
    schemas_list = []
    for schema_name, schema_def in schemas_data.items():
        schema_info = {
            "name": schema_name,
            "type": "enum" if schema_def.get('values') else "interface" if isinstance(schema_def, dict) and not schema_def.get('values') else "type"
        }
        
        if schema_def.get('values'):
            schema_info["enum_values"] = schema_def.get('values')
        elif isinstance(schema_def, dict):
            schema_info["properties_count"] = len(schema_def)
        
        schemas_list.append(schema_info)
    
    return {
        "total_schemas": len(schemas_list),
        "schemas": schemas_list
    }


@mcp.tool(name="get_schema_definition")
async def get_schema_definition(schema_name: str) -> Dict[str, Any] | str:
    """Get the full definition of a specific TypeScript schema."""
    if not schemas_data:
        load_component_registry_sync()
    
    schema = schemas_data.get(schema_name)
    if not schema:
        return f"Schema '{schema_name}' not found. Available schemas: {list(schemas_data.keys())}"
    
    return {
        "name": schema_name,
        "definition": schema
    }


@mcp.tool(name="list_categories")
async def list_categories() -> Dict[str, Any]:
    """List all component categories and their components."""
    if not categories_data:
        load_component_registry_sync()
    
    categories_list = []
    for category_name, category_info in categories_data.items():
        categories_list.append({
            "name": category_name,
            "description": category_info.get('description', ''),
            "components_count": len(category_info.get('components', [])),
            "components": category_info.get('components', [])
        })
    
    return {
        "total_categories": len(categories_list),
        "categories": categories_list
    }


@mcp.tool(name="get_components_by_category")
async def get_components_by_category(category_name: str) -> Dict[str, Any] | str:
    """Get all components in a specific category with their basic information."""
    if not categories_data:
        load_component_registry_sync()
    
    category = categories_data.get(category_name)
    if not category:
        return f"Category '{category_name}' not found. Available categories: {list(categories_data.keys())}"
    
    category_components = []
    for component_tag in category.get('components', []):
        component_info = components_data.get(component_tag, {})
        category_components.append({
            "tag": component_tag,
            "description": component_info.get('descriptions', ''),
            "props_count": len(component_info.get('props', {})),
            "events_count": len(component_info.get('events', {})),
            "examples_count": len(component_info.get('examples', []))
        })
    
    return {
        "category": category_name,
        "description": category.get('description', ''),
        "components_count": len(category_components),
        "components": category_components
    }


@mcp.tool(name="get_css_definitions")
async def get_css_definitions() -> str:
    """Get the predefined CSS definitions and variables."""
    if not css_definitions:
        load_component_registry_sync()
    
    if not css_definitions:
        return "No CSS definitions found in the component registry."
    
    return css_definitions


@mcp.tool(name="get_component_examples")
async def get_component_examples(component_tag: str) -> Dict[str, Any] | str:
    """Get all examples for a specific component."""
    if not components_data:
        load_component_registry_sync()
    
    component = components_data.get(component_tag)
    if not component:
        return f"Component '{component_tag}' not found."
    
    examples = component.get('examples', [])
    return {
        "component_tag": component_tag,
        "examples_count": len(examples),
        "examples": examples
    }


@mcp.tool(name="get_component_props")
async def get_component_props(component_tag: str) -> Dict[str, Any] | str:
    """Get detailed information about a component's properties."""
    if not components_data:
        load_component_registry_sync()
    
    component = components_data.get(component_tag)
    if not component:
        return f"Component '{component_tag}' not found."
    
    props = component.get('props', {})
    return {
        "component_tag": component_tag,
        "props_count": len(props),
        "props": props
    }


@mcp.tool(name="get_component_events")
async def get_component_events(component_tag: str) -> Dict[str, Any] | str:
    """Get detailed information about a component's events."""
    if not components_data:
        load_component_registry_sync()
    
    component = components_data.get(component_tag)
    if not component:
        return f"Component '{component_tag}' not found."
    
    events = component.get('events', {})
    return {
        "component_tag": component_tag,
        "events_count": len(events),
        "events": events
    }


@mcp.tool(name="get_component_slots")
async def get_component_slots(component_tag: str) -> Dict[str, Any] | str:
    """Get detailed information about a component's slots."""
    if not components_data:
        load_component_registry_sync()
    
    component = components_data.get(component_tag)
    if not component:
        return f"Component '{component_tag}' not found."
    
    slots = component.get('slots', {})
    return {
        "component_tag": component_tag,
        "slots_count": len(slots),
        "slots": slots
    }


def run():
    """Run the MCP server."""
    print("Starting Lit Components Documentation MCP Server...")
    mcp.run(transport="stdio")


def run_dev():
    """Run the MCP server in development mode with enhanced debugging."""
    import asyncio
    import sys
    import os
    from pathlib import Path
    
    # Get the path to this script for fastmcp dev command
    script_path = Path(__file__).absolute()
    
    try:
        # Try to use FastMCP CLI development mode
        from fastmcp.cli.cli import dev
        print("🚀 Starting FastMCP development server with MCP Inspector")
        print(f"📁 Server script: {script_path}")
        print("📊 The MCP Inspector provides:")
        print("   • Real-time tool execution monitoring")
        print("   • Interactive tool testing interface")
        print("   • Request/response debugging")
        print("   • Schema validation")
        print("🔍 Inspector will be available at the URL shown below")
        print("=" * 60)
        
        # Use FastMCP's development mode with inspector
        if asyncio.iscoroutinefunction(dev):
            asyncio.run(dev(server_spec=str(script_path)))
        else:
            dev(server_spec=str(script_path))
        
    except ImportError as e:
        print(f"⚠️  FastMCP CLI not available ({e})")
        print("💡 Install with: pip install 'fastmcp[cli]' for full dev experience")
        print("🔄 Falling back to standard MCP server mode")
        print("=" * 60)
        
        # Fallback to standard FastMCP server
        print("Starting Lit Components Documentation MCP Server (Development Mode)...")
        mcp.run(transport="stdio")
        
    except Exception as e:
        print(f"❌ Error starting FastMCP dev server: {e}")
        print("🔄 Falling back to standard MCP server mode")
        print("=" * 60)
        
        # Fallback to standard FastMCP server
        print("Starting Lit Components Documentation MCP Server (Development Mode)...")
        mcp.run(transport="stdio")


if __name__ == "__main__":
    run()