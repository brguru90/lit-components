import os
os.environ['DANGEROUSLY_OMIT_AUTH']="true"
import sys
from pathlib import Path
import json
import re
import traceback
import argparse
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path
import importlib.resources as pkg_resources

from fastmcp import FastMCP, Context
from fastmcp.prompts.prompt import PromptMessage, TextContent
from fastmcp.server.dependencies import get_context
from pydantic import BaseModel


# Path to the component registry JSON file
COMPONENT_REGISTRY_PATH = Path(__file__).parent.parent.parent.parent / "storybook-static" / "stories_doc" / "component-registry.json"
# Embedded file path (relative to the package data directory)
COMPONENT_REGISTRY_EMBEDDED = "component-registry.json"

# Global variables to store loaded data
component_registry: Dict[str, Any] = {}
components_data: Dict[str, Any] = {}
schemas_data: Dict[str, Any] = {}
categories_data: Dict[str, Any] = {}
css_definitions: str = ""
css_categorized: Dict[str, str] = {}
css_category_list: str = ""

# Global variable to store framework preference from command-line argument or environment
_use_framework: Optional[str] = os.environ.get('FASTMCP_USE_FRAMEWORK') or None

async def load_component_registry(no_ctx:bool=False) -> str:
    """Load the component registry from the JSON file."""
    global component_registry, components_data, schemas_data, categories_data, css_definitions,_use_framework

    if no_ctx:
        class fake_ctx:
            def __init__(self):
                self.info = self.async_print
                self.error = self.async_print
            async def async_print(self,msg):
                print(msg) 
        ctx=fake_ctx()
    else:
        ctx = get_context()
    if _use_framework:
        await ctx.info(f"🎯 Framework filter enabled: {_use_framework}")
    else:
        await ctx.info("📚 Framework filter disabled - showing all frameworks")
    
    try:
        await ctx.info(f"Loading component registry from {COMPONENT_REGISTRY_PATH}")
        
        # Try to load from the development path first (for local development)
        if COMPONENT_REGISTRY_PATH.exists():
            await ctx.info("Loading from development path (storybook-static)")
            with open(COMPONENT_REGISTRY_PATH, 'r', encoding='utf-8') as f:
                component_registry = json.load(f)
        else:
            # Fall back to embedded data (for packaged distribution)
            await ctx.info("Development path not found, loading from embedded data")
            try:
                with pkg_resources.files('vg_ui_lib_mcp.data').joinpath(COMPONENT_REGISTRY_EMBEDDED).open('r', encoding='utf-8') as f:
                    component_registry = json.load(f)
                await ctx.info("Successfully loaded from embedded data")
            except Exception as embed_error:
                error_msg = f"Component registry file not found at {COMPONENT_REGISTRY_PATH} and failed to load embedded data: {str(embed_error)}"
                await ctx.error(f"ERROR: {error_msg}")
                return error_msg
        
        # Extract different sections
        components_data = component_registry.get('components', {})
        schemas_data = component_registry.get('schemas', {})
        categories_data = component_registry.get('categories', {})
        css_definitions = component_registry.get('predefined_css_definitions', "")
        
        success_msg = f"Successfully loaded component registry with {len(components_data)} components, {len(schemas_data)} schemas, and {len(categories_data)} categories"
        await ctx.info(success_msg)
        return success_msg
        
    except Exception as e:
        error_traceback = traceback.format_exc()
        error_msg = f"Error loading component registry: {str(e)}"
        await ctx.error(f"ERROR: {error_msg}\n{error_traceback}")
        return error_msg



def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="VG UI Library Web Components Documentation MCP Server",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--use-framework",
        type=str,
        default=None,
        choices=["html", "react", "react19", "vue", "angular", "lit"],
        help="Filter component examples to show only the specified framework (html, react, react19, vue, angular, lit)"
    )
    return parser.parse_args()


@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[str]:
    """Load the component registry on startup."""
    # Load the component registry during startup
    await load_component_registry(True)
    # Yield to indicate startup is complete, then keep running
    yield "started"
    # The function continues to run here, keeping the server alive


instructions = """
This MCP server provides access to VG UI Library web components documentation from the Storybook component registry.
You can use the tools to fetch, categorize, and retrieve information about VG web components, their schemas, CSS styles, and examples.

# VG UI Library Web Components Documentation Server

## Overview
This server provides access to comprehensive VG UI Library web component documentation including:
- Component definitions with props, events, and slots
- TypeScript type schemas and definitions
- CSS variables and styling information (with categorization support)
- Component examples and usage patterns with framework-specific filtering
- Category-based component organization

## Framework Filtering
When fetching component examples, you can use the `--use-framework` command-line argument to filter sources for a specific framework:
- Supported frameworks: `html`, `react`, `react19`, `vue`, `angular`, `lit`
- Command-line usage: `--use-framework vue` will return only Vue.js code samples
- Example: `python main.py --use-framework vue` or `fastmcp run main.py --use-framework react`
- If no argument is provided or framework not found, all framework sources are returned

## Instructions
- List all VG UI Library components initially before starting implementation to understand available options
- For any slot in web components, if documentation shows a `default` value, it can be used directly in the template
- Use VG UI Library web components extensively and minimize custom HTML elements
- Minimize custom CSS/styling and custom classes; prefer using VG component CSS properties and variables
- In CSS: avoid absolute pixels, avoid custom colors (use VG CSS variables instead), prefer flexbox over grid
- All VG UI Library components are prefixed with `vg-` (e.g., `vg-button`, `vg-card`, `vg-flex`)

## Usage Guidelines
1. Start by listing available components to understand what's available
2. Use schema tools to understand TypeScript types and interfaces
3. Get detailed component documentation for specific components
4. Access CSS definitions for styling information
5. Browse examples to see component usage patterns

## Import Patterns
```typescript
{import_statements}
```

## Recommended Tool Usage Flow

### For Finding and Using Components:
1. **list_components** - Get overview of all available components (recommended first step)
2. **search_components** - Search for components by name or category
3. **get_component_by_tag** - Get specific component documentation with props, events, slots
4. **get_component_example** - Get usage examples for specific component and example ID
5. **list_categories** - Browse components by category

### For TypeScript Types and Schemas:
1. **list_schemas** - See available TypeScript types
2. **get_schema_definition** - Get specific type definitions for interfaces, enums, and type aliases

### For CSS Styles and Variables:
1. **categorize_css** - Categorize CSS styles using LLM (run once per session, avoid unless necessary)
2. **list_css_categories** - List all CSS categories
3. **get_css_for_category** - Fetch CSS variables and styles for a specific category

## Indexing and Categorizing
- **categorize_css**: Avoid using this tool unless you want to re-categorize the CSS styles, as it will take time to process and categorize using LLM sampling.
- Only call the categorization tool once per server session or if the quality of categorization is not good.
- If CSS categories are not available, run `categorize_css` first, then use `list_css_categories` and `get_css_for_category`.

## Best Practices
- Always start with `list_components` or `search_components` to discover available components
- Use `get_component_by_tag` to understand component APIs (props, events, slots) before implementation
- Reference `get_component_example` for real usage patterns and framework-specific code samples
- Use VG CSS variables for consistent theming and styling instead of hardcoded values
- Leverage TypeScript schemas for type-safe component integration
"""

# Initialize FastMCP server
mcp = FastMCP(
    name="VG UI Library Web Components Documentation Server",
    lifespan=app_lifespan,
    instructions=instructions,
    version="0.1.0"
)


@mcp.tool(name="ClearCache")
def ClearCache() -> PromptMessage:
    """Clear all cached VG UI Library web components data and reset to default state."""
    global component_registry, components_data, schemas_data, categories_data, css_definitions, css_categorized, css_category_list
    
    # Reset all global variables to their default empty state
    component_registry = {}
    components_data = {}
    schemas_data = {}
    categories_data = {}
    css_definitions = ""
    css_categorized = {}
    css_category_list = ""
    
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text="Cache cleared successfully. All VG UI Library web components data has been reset to default state."
        )
    )

@mcp.tool(name="StartupInstructions", description="Provides special startup instructions for the VG UI Library web components documentation server. It should be called for every user prompt.")
def StartupInstructions() -> PromptMessage:
    """Provides special startup instructions for the VG UI Library web components documentation usage. It should be called for every user prompt."""
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text=instructions
        )
    )

@mcp.tool(name="list_components", description="List all available VG UI Library web components with basic information including props, events, slots and examples_ids.")
async def list_components(ctx: Context) -> List[str]:
    """List all available VG UI Library web components with basic information including props, events, slots and examples_ids."""
    await ctx.info("🔍 Listing all available VG UI Library web components")
    await ctx.debug("Checking if component registry is loaded")
    
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    components_list = []
    for i, (component_tag, component_info) in enumerate(components_data.items()):
        components_list.append(component_tag)
    
    await ctx.info(f"✅ Successfully listed {len(components_list)} components")
    return components_list


@mcp.tool(name="get_component_by_tag", description="Get detailed documentation for a specific VG UI Library web component by its tag name including props, events, slots, and usage examples.")
async def get_component_by_tag(component_tag: str, ctx: Context) -> Dict[str, Any] | str:
    """Get detailed documentation for a specific VG UI Library web component by its tag name including props, events, slots, and usage examples."""
    await ctx.info(f"🔍 Looking up component: {component_tag}")
    await ctx.debug("Checking if component registry is loaded")
    
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
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


@mcp.tool(name="search_components", description="Search for VG UI Library web components by nacomponent_tagme or category.")
async def search_components(search_term: str, ctx: Context) -> List[Dict]:
    """Search for VG UI Library web components by component_tag, or category."""
    await ctx.debug(f"Searching for components with term: {search_term}")
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
        await ctx.debug(f"Registry loaded with {len(components_data)} components")
    
    search_term_lower = search_term.lower()
    matching_components = []
    
    for component_tag, component_info in components_data.items():
        # Search in tag name, category, and description
        if (search_term_lower in component_tag.lower() or
            search_term_lower in component_info.get('category', '').lower()):
            
            matching_components.append({
                "tag": component_tag,
                "category": component_info.get('category', ''),
                "description": component_info.get('descriptions', ''),
                "match_reason": "component_tag" if search_term_lower in component_tag.lower() else
                              "category"
            })
    
    return matching_components


@mcp.tool(name="list_schemas", description="List all available TypeScript schemas and type definitions used by VG UI Library web components.")
async def list_schemas(ctx: Context) -> List[str]:
    """List all available TypeScript schemas and type definitions used by VG UI Library web components."""
    await ctx.debug("Fetching TypeScript schemas and type definitions")
    if not schemas_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
        await ctx.debug(f"Registry loaded with {len(schemas_data)} schemas")
    return [schema_name for schema_name, schema_def in schemas_data.items()]


@mcp.tool(name="get_schema_definition", description="Get the full definition of a specific TypeScript schema including interfaces, enums, and type aliases.")
async def get_schema_definition(schema_name: str, ctx: Context) -> Dict[str, Any] | str:
    """Get the full definition of a specific TypeScript schema including interfaces, enums, and type aliases."""
    await ctx.debug(f"Retrieving schema definition for: {schema_name}")
    if not schemas_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
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
async def list_categories(ctx: Context) -> List[Dict]:
    """List all component categories and their associated components for better organization and discovery."""
    await ctx.debug("Fetching component categories and organization")
    if not categories_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
        await ctx.debug(f"Registry loaded with {len(categories_data)} categories")
    
    categories_list = []
    for category_name, category_info in categories_data.items():
        categories_list.append({
            "category": category_name,
            "components_count": len(category_info.get('components', [])),
            "components": category_info.get('components', [])
        })
    
    return categories_list


@mcp.tool(name="get_component_example", description="Get a specific example for a VG UI Library web component by example ID, including code samples for different frameworks. Use --use-framework CLI argument to filter by framework.")
async def get_component_example(component_tag: str, example_id: str, ctx: Context) -> Dict[str, Any] | str:
    """Get a specific example for a VG UI Library web component by example ID, including code samples for different frameworks."""
    await ctx.debug(f"Retrieving example '{example_id}' for component: {component_tag}")
    
    # Get framework preference from command-line argument
    global _use_framework
    use_framework = _use_framework
    
    if use_framework:
        await ctx.info(f"🎯 Framework filter active: {use_framework}")
    
    if not components_data:
        await ctx.debug("Registry not loaded, loading now...")
        await load_component_registry()
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
    
    # Filter sources based on use-framework header
    example_data = target_example.copy()
    sources = example_data.get('sources', {})
    
    if use_framework and sources:
        supported_frameworks = list(sources.keys())
        
        if use_framework in sources:
            # Filter to only include the requested framework
            filtered_sources = {use_framework: sources[use_framework]}
            example_data['sources'] = filtered_sources
            await ctx.info(f"✅ Successfully retrieved example '{example_id}' for component '{component_tag}' (framework: {use_framework})")
        else:
            # Framework not found, warn but return all sources
            await ctx.warning(f"⚠️ Framework '{use_framework}' not found in example sources. Available frameworks: {supported_frameworks}")
            await ctx.info(f"✅ Retrieved example '{example_id}' for component '{component_tag}' with all frameworks")
    else:
        await ctx.info(f"✅ Successfully retrieved example '{example_id}' for component '{component_tag}' with all frameworks")
    
    return {
        "component_tag": component_tag,
        "example_id": example_id,
        "framework_filter": use_framework if use_framework else "none",
        "example": example_data
    }


@mcp.tool(name="categorize_css", description="Categorize the VG UI Library CSS (Cascading Style Sheets) and index it for later reference. Returns categorized CSS to be reviewed by user (Avoid calling categorize_css unless necessary).")
async def categorize_css(ctx: Context) -> str:
    """Categorize the VG UI Library CSS (Cascading Style Sheets) and index it for later reference. Returns categorized CSS to be reviewed by user (Avoid calling categorize_css unless necessary)."""
    global css_definitions, css_categorized, css_category_list
    
    if not css_definitions:
        await ctx.debug("CSS definitions not loaded, loading now...")
        await load_component_registry()
        await ctx.debug(f"CSS definitions loaded: {len(css_definitions)} characters")
    
    if not css_definitions:
        return "No CSS definitions found in the component registry."
    
    prompt = f"""Categorize the following CSS(Cascading Style Sheets) properties and variables into different categories based on its usage like font types, colors, graph colors, color shades, color variants, font name, spacing, layout, animations, etc., making sure the css variables and style/properties are properly identified and differentiated and return the categorized css in the format of {{"category_name": "css_content"}}. css_content should contain the property exactly same as given in input, and it should be STRICTLY in valid JSON format and output should not contain any other content along with JSON.

{css_definitions}"""
    
    response = {"text": "Client side sampling not supported by the client"}
    try:
        await ctx.info("🧠 Using LLM sampling to categorize CSS...")
        response = await ctx.sample(prompt, max_tokens=10000)
        css_category_list = response.text
        resp = response.text
        
        try:
            # Remove thinking tags if present
            resp = resp.replace('<think>', '').replace('</think>', '')
            import re
            # Extract JSON from response
            resp = re.sub(r'<think>.*?</think>', '', resp, flags=re.DOTALL)
            resp = re.sub(r'[\s\S]*\{(\s|\")([\s\S]*?)(\s|\")\}[\s\S]*', r'{\1\2\3}', resp, flags=re.DOTALL)
            
            data = json.loads(resp)  # Validate JSON format
            css_categorized = data
            css_category_list = "\n".join(data.keys())
            await ctx.info(f"✅ Successfully categorized CSS into {len(data)} categories")
        except Exception as e:
            await ctx.warning(f"Failed to parse JSON response: {str(e)}")
            await ctx.debug(f"Raw response:\n{resp}")
            return response.text
            
    except Exception as e:
        error_msg = f"Failed to execute FastMCP client sampling: {str(e)}"
        await ctx.error(error_msg)
        css_category_list = css_definitions
        return f"Failed to execute FastMCP client sampling, but here is the raw CSS content:\n\n{css_definitions}"
    
    return f"CSS categorized successfully into the following categories:\n\n{css_category_list}"


@mcp.tool(name="list_css_categories", description="Get the list of CSS (Cascading Style Sheets) categories from VG UI Library.")
async def list_css_categories(ctx: Context) -> str:
    """Get the list of CSS (Cascading Style Sheets) categories from VG UI Library."""
    global css_category_list
    
    await ctx.debug("Fetching CSS categories")
    
    if not css_category_list:
        await ctx.warning("No CSS categories found")
        return "No CSS categories found. Please run `categorize_css` to categorize the CSS styles."
    
    await ctx.info(f"✅ Listed {len(css_category_list.split(chr(10)))} CSS categories")
    return f"Here are the CSS (Cascading Style Sheets) categories from VG UI Library:\n\n{css_category_list}"


@mcp.tool(name="get_css_for_category", description="Get the CSS (Cascading Style Sheets) styles by category from VG UI Library.")
async def get_css_for_category(category_name: str, ctx: Context) -> str | Dict:
    """Get the CSS (Cascading Style Sheets) styles by category from VG UI Library."""
    global css_categorized
    
    await ctx.debug(f"Fetching CSS for category: {category_name}")
    
    if not css_categorized:
        await ctx.warning("No categorized CSS found")
        return "No CSS styles found. Please run `categorize_css` to categorize the CSS styles."
    
    try:
        if category_name in css_categorized:
            await ctx.info(f"✅ Retrieved CSS for category '{category_name}'")
            return f"Here are the CSS styles for category '{category_name}':\n\n{css_categorized[category_name]}"
        else:
            available_categories = list(css_categorized.keys())
            await ctx.warning(f"❌ Category '{category_name}' not found")
            await ctx.debug(f"Available categories: {available_categories}")
            return f"No CSS styles found for category '{category_name}'. Available categories: {available_categories}"
    except Exception as e:
        error_msg = f"Error retrieving CSS for category: {str(e)}"
        await ctx.error(error_msg)
        return "Error decoding JSON data. Please run `categorize_css` to categorize the CSS styles."


def load_user_configs():
    # Parse arguments first
    global _use_framework
    # Don't parse args again if already set
    if _use_framework is None:
        args = parse_args()
        _use_framework = args.use_framework
    
    
    # Build server arguments to pass to subprocess servers
    server_args = []
    if _use_framework:
        server_args.extend(['--use-framework', _use_framework])
    
    # If we have server args, we need to modify sys.argv so subprocess servers inherit them
    # The MCP Inspector spawns servers with: fastmcp run <script> --no-banner
    # We need to inject our args after the script path
    # original_argv = sys.argv.copy()
    if server_args:
        # When fastmcp dev spawns subprocess, it will use the script's __name__ == "__main__"
        # So we need the args to be visible via sys.argv when that happens
        # However, since dev() spawns external processes, we need a different approach
        # Let's use environment variable as a fallback
        os.environ['FASTMCP_USE_FRAMEWORK'] = _use_framework if _use_framework else ''
    # return original_argv
        


def run():
    """Run the MCP server."""
    load_user_configs()
    mcp.run(transport="stdio")


def run_dev():
    """Run the MCP server in development mode with enhanced debugging."""
    import asyncio
    load_user_configs()
    
    try:
        # Get the path to this script for fastmcp dev command
        script_path = Path(__file__).absolute()
        # Try to use FastMCP CLI development mode
        from fastmcp.cli.cli import dev

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
        print("Starting VG UI Library Web Components Documentation MCP Server (Development Mode)...")
        mcp.run(transport="stdio")
        
    except Exception as e:
        print(f"❌ Error starting FastMCP dev server: {e}")
        print("🔄 Falling back to standard MCP server mode")
        print("=" * 60)
        
        # Fallback to standard FastMCP server
        print("Starting VG UI Library Web Components Documentation MCP Server (Development Mode)...")
        mcp.run(transport="stdio")
    finally:
        pass
        # Restore original sys.argv
        # sys.argv = original_argv
        pass


if __name__ == "__main__":
    # Parse arguments once at module execution
    args = parse_args()
    _use_framework = args.use_framework
    run()