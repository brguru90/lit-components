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
def FetchInstructions() -> PromptMessage:
    """Startup instructions for the Lit Components documentation server."""
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text=instructions
        )
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


@mcp.tool(name="ClearCache")
def ClearCache() -> PromptMessage:
    """Clear all cached Lit Components data and reset to default state."""
    global component_registry, components_data, schemas_data, categories_data, css_definitions
    
    # Reset all global variables to their default empty state
    component_registry = {}
    components_data = {}
    schemas_data = {}
    categories_data = {}
    css_definitions = ""
    
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text="Cache cleared successfully. All Lit Components data has been reset to default state."
        )
    )

@mcp.tool(name="StartupInstructions", description="Provides special startup instructions for the Lit Components documentation server. It should be called for every user prompt.")
def StartupInstructions() -> PromptMessage:
    """Provides special startup instructions for the Lit Components documentation usage. It should be called for every user prompt."""
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

@mcp.tool()
async def RefetchDocs() -> str:
    """Refetch the Lit Components documentation from the file system."""
    return await load_component_registry()


@mcp.tool(name="get_server_info", description="Get information about the Lit Components documentation server and loaded data statistics.")
async def get_server_info(ctx: Context) -> Dict[str, Any]:
    """Get information about the Lit Components documentation server and loaded data statistics."""
    await ctx.debug("Retrieving server information and statistics")
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


@mcp.tool(name="list_components", description="List all available Lit components with basic information including props, events, slots and examples count.")
async def list_components(ctx: Context) -> Dict[str, Any]:
    """List all available Lit components with basic information including props, events, slots and examples count."""
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


@mcp.tool(name="get_component_by_tag", description="Get detailed documentation for a specific Lit component by its tag name including props, events, slots, and usage examples.")
async def get_component_by_tag(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed documentation for a specific Lit component by its tag name including props, events, slots, and usage examples."""
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
        return f"Component '{component_tag}' not found, so check for other variants or other similar components. Available components: {available_components}"
    
    await ctx.debug(f"Found component data with {len(component.get('props', {}))} props, {len(component.get('events', {}))} events")
    
    examples = component.get('examples', [])
    example_ids = [example.get('id', '') for example in examples if example.get('id')]
    
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
        "example_ids": example_ids
    }
    
    await ctx.info(f"✅ Successfully retrieved component '{component_tag}' with complete documentation")
    return result


@mcp.tool(name="search_components", description="Search for Lit components by name, description, or category with fuzzy matching support.")
async def search_components(search_term: str, ctx: Context) -> Dict[str, Any]:
    """Search for Lit components by name, description, or category with fuzzy matching support."""
    await ctx.debug(f"Searching for components with term: {search_term}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
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


@mcp.tool(name="list_schemas", description="List all available TypeScript schemas and type definitions used by Lit components.")
async def list_schemas(ctx: Context) -> Dict[str, Any]:
    """List all available TypeScript schemas and type definitions used by Lit components."""
    await ctx.debug("Fetching TypeScript schemas and type definitions")
    if not schemas_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(schemas_data)} schemas")
    
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


@mcp.tool(name="get_schema_definition", description="Get the full definition of a specific TypeScript schema including interfaces, enums, and type aliases.")
async def get_schema_definition(schema_name: str, ctx: Context) -> Dict[str, Any] | str:
    """Get the full definition of a specific TypeScript schema including interfaces, enums, and type aliases."""
    await ctx.debug(f"Retrieving schema definition for: {schema_name}")
    if not schemas_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(schemas_data)} schemas")
    
    schema = schemas_data.get(schema_name)
    if not schema:
        await ctx.warning(f"❌ Schema '{schema_name}' not found")
        available_schemas = list(schemas_data.keys())
        await ctx.debug(f"Available schemas: {available_schemas}")
        return f"Schema '{schema_name}' not found, so check for other schema names. Available schemas: {available_schemas}"
    
    return {
        "name": schema_name,
        "definition": schema
    }


@mcp.tool(name="list_categories", description="List all component categories and their associated components for better organization and discovery.")
async def list_categories(ctx: Context) -> Dict[str, Any]:
    """List all component categories and their associated components for better organization and discovery."""
    await ctx.debug("Fetching component categories and organization")
    if not categories_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(categories_data)} categories")
    
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


@mcp.tool(name="get_components_by_category", description="Get all components in a specific category with their basic information and usage statistics.")
async def get_components_by_category(category_name: str, ctx: Context) -> Dict[str, Any] | str:
    """Get all components in a specific category with their basic information and usage statistics."""
    await ctx.debug(f"Retrieving components for category: {category_name}")
    if not categories_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(categories_data)} categories")
    
    category = categories_data.get(category_name)
    if not category:
        await ctx.warning(f"❌ Category '{category_name}' not found")
        available_categories = list(categories_data.keys())
        await ctx.debug(f"Available categories: {available_categories}")
        return f"Category '{category_name}' not found, so check for other category names. Available categories: {available_categories}"
    
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


@mcp.tool(name="get_css_definitions", description="Get the predefined CSS definitions, variables, and styling guidelines for Lit components.")
async def get_css_definitions(ctx: Context) -> str:
    """Get the predefined CSS definitions, variables, and styling guidelines for Lit components."""
    await ctx.debug("Retrieving CSS definitions and variables")
    if not css_definitions:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded, CSS definitions available: {bool(css_definitions)}")
    
    if not css_definitions:
        await ctx.warning("❌ No CSS definitions found in the component registry")
        return "No CSS definitions found in the component registry."
    
    return css_definitions


@mcp.tool(name="get_component_examples", description="Get all example IDs for a specific Lit component. Use get_component_example to fetch specific example details.")
async def get_component_examples(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get all example IDs for a specific Lit component. Use get_component_example to fetch specific example details."""
    await ctx.debug(f"Retrieving example IDs for component: {component_tag}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        return f"Component '{component_tag}' not found."
    
    examples = component.get('examples', [])
    example_ids = [example.get('id', '') for example in examples if example.get('id')]
    
    return {
        "component_tag": component_tag,
        "examples_count": len(examples),
        "example_ids": example_ids
    }


@mcp.tool(name="get_component_example", description="Get a specific example for a Lit component by example ID, including code samples for different frameworks.")
async def get_component_example(component_tag: str, example_id: str, ctx: Context) -> Dict[str, Any] | str:
    """Get a specific example for a Lit component by example ID, including code samples for different frameworks."""
    await ctx.debug(f"Retrieving example '{example_id}' for component: {component_tag}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        await ctx.warning(f"❌ Component '{component_tag}' not found")
        return f"Component '{component_tag}' not found."
    
    examples = component.get('examples', [])
    
    # Find the example with matching ID
    target_example = None
    for example in examples:
        if example.get('id') == example_id:
            target_example = example
            break
    
    if not target_example:
        available_example_ids = [ex.get('id', '') for ex in examples if ex.get('id')]
        await ctx.warning(f"❌ Example '{example_id}' not found for component '{component_tag}'")
        await ctx.debug(f"Available example IDs: {available_example_ids}")
        return f"Example '{example_id}' not found for component '{component_tag}'. Available example IDs: {available_example_ids}"
    
    await ctx.info(f"✅ Successfully retrieved example '{example_id}' for component '{component_tag}'")
    
    return {
        "component_tag": component_tag,
        "example_id": example_id,
        "example": target_example
    }


@mcp.tool(name="get_component_props", description="Get detailed information about a Lit component's properties including types, default values, and descriptions.")
async def get_component_props(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed information about a Lit component's properties including types, default values, and descriptions."""
    await ctx.debug(f"Retrieving properties for component: {component_tag}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        await ctx.warning(f"❌ Component '{component_tag}' not found")
        return f"Component '{component_tag}' not found, so check for other components or component names."
    
    props = component.get('props', {})
    return {
        "component_tag": component_tag,
        "props_count": len(props),
        "props": props
    }


@mcp.tool(name="get_component_events", description="Get detailed information about a Lit component's events including event types, payloads, and usage patterns.")
async def get_component_events(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed information about a Lit component's events including event types, payloads, and usage patterns."""
    await ctx.debug(f"Retrieving events for component: {component_tag}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        await ctx.warning(f"❌ Component '{component_tag}' not found")
        return f"Component '{component_tag}' not found, so check for other components or component names."
    
    events = component.get('events', {})
    return {
        "component_tag": component_tag,
        "events_count": len(events),
        "events": events
    }


@mcp.tool(name="get_component_slots", description="Get detailed information about a Lit component's slots for content projection and template composition.")
async def get_component_slots(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed information about a Lit component's slots for content projection and template composition."""
    await ctx.debug(f"Retrieving slots for component: {component_tag}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        load_component_registry_sync()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    component = components_data.get(component_tag)
    if not component:
        await ctx.warning(f"❌ Component '{component_tag}' not found")
        return f"Component '{component_tag}' not found, so check for other components or component names."
    
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