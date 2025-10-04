# VG UI Library MCP Server - Development Environment

This directory contains a complete Model Context Protocol (MCP) server that provides comprehensive access to VG UI Library web components documentation, built with FastMCP 2.0+ and enhanced debugging capabilities.

## 🚀 Quick Start

### Prerequisites
- Python 3.13+ with uv package manager
- Node.js (for MCP Inspector in development mode)

### Production Mode
```bash
# Install and run the server
uv run vg-ui-lib-mcp-server
```

### Development Mode (Recommended)
```bash
# Install with development dependencies
uv sync --extra dev

# Start with MCP Inspector for debugging
uv run vg-ui-lib-mcp-dev
```


## 📦 Installation & Setup

### Development Commands

#### Development Mode (with MCP Inspector)
```bash
# Run development server with inspector
uv run fastmcp dev src/vg_ui_lib_mcp/main.py

# Or use the dev script
uv run vg-ui-lib-mcp-dev

# Run with specific framework support
uv run vg-ui-lib-mcp-dev --use-framework react19
```

#### Production Mode
```bash
# Run production server
uv run vg-ui-lib-mcp-server
```

### Installing as a Tool

#### Quick Install (may not always work)
```bash
uv run fastmcp install src/vg_ui_lib_mcp/main.py
```

#### Reliable Install Method
```bash
# Build and install the package
rm -rf dist
uv build
uv tool install dist/*.whl
uv tool update-shell
```

**Note**: The component registry is automatically copied from `storybook-static/stories_doc/component-registry.json` during the build process. Make sure you've run `npm run build-storybook && npm run docs:build` to generate the registry before building the MCP package.

### Claude Desktop Integration

After installing the tool, configure it in Claude Desktop:

```bash
# List configured MCP servers
claude mcp list

# Remove existing configuration (if updating)
claude mcp remove vg-ui-lib-mcp-server

# Add as stdio transport (recommended)
claude mcp add -s user vg-ui-lib-mcp-server vg-ui-lib-mcp-server

# Alternative: Add as HTTP transport
claude mcp add --transport http vg-ui-lib-mcp http://127.0.0.1:8000/vg-ui-lib/mcp/
```

### VS Code MCP Configuration

Add to `.vscode/mcp.json`:

```json
{
    "servers": {
        "vg-ui-lib-mcp": {
            "type": "stdio",      
            "command": "uvx",
            "args": [
                "vg-ui-lib-mcp-server",
				"--use-framework",
				"react19"
            ]
        }
    }
}
```

### Tool Management

```bash
# List installed UV tools
uv tool list

# Uninstall the tool
uv tool uninstall vg-ui-lib-mcp-server
uv tool uninstall vg-ui-lib-mcp-dev
```

**Note**: The MCP Inspector (`@modelcontextprotocol/inspector@0.17.0`) is automatically installed by FastMCP CLI when running development mode.

The development mode provides:
- 🔍 **MCP Inspector** - Interactive web interface for testing tools
- 📊 **Real-time debugging** - Live request/response monitoring  
- 🐛 **Enhanced logging** - Debug messages with context
- 🔄 **Hot reload** - Automatic server restart on changes
- 📈 **Performance metrics** - Tool execution timing

## 🛠️ Development Tools

### 1. Development Test Script
```bash
# Run comprehensive functionality tests
python dev_test.py
```

This script tests all MCP tools and demonstrates debugging features.

### 2. FastMCP Configuration
The `fastmcp.json` file provides development-optimized configuration:
- Debug logging enabled
- Development environment variables
- Enhanced error reporting

### 3. MCP Inspector
When running in development mode, the MCP Inspector provides:

#### Interactive Tool Testing
- Test any MCP tool with custom parameters
- View structured and unstructured responses
- Validate input schemas automatically

#### Real-time Monitoring
- See all MCP requests/responses live
- Debug protocol-level communication
- Monitor tool execution performance

#### Debug Log Streaming  
- Watch debug logs in real-time
- Filter by log level (DEBUG, INFO, WARN, ERROR)
- Context-aware logging from enhanced tools

## 🔧 Available MCP Tools

The server provides 14 comprehensive tools:

### Component Discovery
- `list_components` - List all components with debug logging
- `search_components` - Search by name/description/category
- `get_component_by_tag` - Get detailed component info with debug logging
- `get_component_properties` - Get all component properties
- `get_component_events` - Get all component events

### Documentation Access  
- `get_component_examples` - Get usage examples
- `get_component_slots` - Get slot information
- `get_component_css_properties` - Get CSS custom properties
- `get_schema_by_name` - Get JSON schemas
- `list_schemas` - List all available schemas

### Category & Analysis
- `get_components_by_category` - Filter by category
- `list_categories` - List all categories
- `analyze_component_relationships` - Component hierarchy analysis
- `get_component_usage_stats` - Usage statistics

## 🐛 Debugging Features

### Enhanced Tools with Context Logging
Some tools include enhanced debugging via the FastMCP Context object:

- `list_components` - Shows component loading and processing steps
- `get_component_by_tag` - Detailed component lookup debugging

These tools provide:
- **Info logs**: High-level operation status (🔍 ✅ ❌)
- **Debug logs**: Detailed step-by-step execution
- **Warning logs**: Non-fatal issues and fallbacks
- **Error logs**: Detailed error information

### Debugging Workflow

1. **Start Development Server**
   ```bash
   uv run lit-components-mcp-dev
   ```

2. **Open MCP Inspector**
   - URL will be displayed in console output
   - Usually http://localhost:8080 or similar

3. **Test Tools Interactively**
   - Select any tool from the inspector interface
   - Enter parameters and execute
   - View real-time logs and responses

4. **Monitor Debug Output**
   - Watch console for enhanced debug logs
   - Use inspector's log panel for formatted output
   - Filter logs by level and context

## 📁 Project Structure

```
mcp/
├── src/vg_ui_lib_mcp/
│   └── main.py              # Main MCP server implementation
├── fastmcp.json             # Development configuration  
├── dev_test.py              # Development testing script
├── pyproject.toml           # Project configuration
└── README.md                # This file
```

## 🔍 Troubleshooting

### Server Won't Start
```bash
# Check dependencies
uv sync

# Test basic functionality
python dev_test.py
```

### MCP Inspector Not Available
```bash
# Install CLI tools
uv add "fastmcp[cli]"

# Verify CLI availability
uv run fastmcp --help

# Note: The MCP Inspector (@modelcontextprotocol/inspector@0.17.0) 
# is automatically installed by FastMCP when running dev mode
```

### Component Data Not Loading
- Check that `component-registry.json` exists in project root
- Verify file permissions and JSON format
- Use debug logs to trace loading process

## 📚 Learning Resources

- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [MCP Inspector Guide](https://github.com/jlowin/fastmcp/docs/development)

## 🎯 Next Steps

1. **Run the development server**: `uv run vg-ui-lib-mcp-dev`
2. **Open the MCP Inspector** in your browser
3. **Test tools interactively** to see debugging in action
4. **Monitor logs** to understand server behavior
5. **Customize tools** by adding more Context logging

Happy debugging! 🚀