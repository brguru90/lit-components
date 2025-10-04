# Embedded Component Registry Implementation

## Overview
This document describes the implementation for embedding the `component-registry.json` file in the Python MCP package at build time.

## Implementation Summary

### Files Created/Modified

1. **`mcp/MANIFEST.in`** (Created)
   - Specifies which non-Python files to include in the package distribution
   - Includes all JSON files from the `lit_components_mcp/data` directory

2. **`mcp/build.py`** (Created)
   - Copies `storybook-static/stories_doc/component-registry.json` to `mcp/src/lit_components_mcp/data/`
   - Runs automatically during package build (before building the wheel)
   - Includes safety checks for source file existence and temporary build directories

3. **`mcp/setup.py`** (Created)
   - Custom setuptools build command that invokes `build.py` before the standard build process
   - Uses `BuildPyCommand` to hook into the build pipeline

4. **`mcp/pyproject.toml`** (Modified)
   - Updated `[tool.setuptools.package-data]` to include JSON files from the data directory

5. **`mcp/src/lit_components_mcp/main.py`** (Modified)
   - Added `importlib.resources` import for loading embedded files
   - Modified `load_component_registry()` function to:
     - First try loading from development path (`storybook-static/stories_doc/component-registry.json`)
     - Fall back to embedded data using `pkg_resources.files('lit_components_mcp.data')`
   - This ensures the package works both in development and when installed

## Build Process

### Automated Workflow
```bash
# 1. Generate the component registry (if not already done)
cd /home/guruprasad/Desktop/workspace/lit-components
npm run build-storybook && npm run docs:build

# 2. Build the Python package (registry is copied automatically)
cd mcp
rm -rf dist
uv build

# 3. Install the package
uv tool install dist/*.whl
```

### How It Works

1. **Pre-Build Step (Automatic)**: When you run `uv build`:
   - setuptools invokes the custom `SDistCommand` (for source dist) and `BuildPyCommand` (for wheel)
   - These commands execute `copy_registry_file()` which:
     - Locates the registry at `../storybook-static/stories_doc/component-registry.json`
     - Copies it to `src/lit_components_mcp/data/component-registry.json`
     - If source not found but destination exists, uses the existing file
     - If neither exists, shows a warning but continues the build

2. **Build Process**: When you run `uv build`:
   - setuptools uses `setup.py` which defines a custom `build_py` command
   - The custom command tries to run `build.py` (gracefully handles if it fails)
   - The registry file from the data directory is included in the package per MANIFEST.in and pyproject.toml settings
   - The wheel is created with the embedded JSON file

3. **Runtime Loading**: When the MCP server starts:
   - First attempts to load from development path (for local development)
   - If not found, loads from embedded data using `importlib.resources`
   - This dual approach supports both development and production environments

## Verification

### Check if the registry is in the wheel:
```bash
python3 -m zipfile -l dist/lit_components_mcp_server-0.1.0-py3-none-any.whl | grep component-registry
```

Expected output:
```
lit_components_mcp/data/component-registry.json 2025-10-04 17:07:36       212987
```

### Check the data directory:
```bash
ls -lh /home/guruprasad/Desktop/workspace/lit-components/mcp/src/lit_components_mcp/data/
```

Expected output:
```
-rw-rw-r-- 1 user user 208K Oct  4 13:10 component-registry.json
```

## Key Benefits

1. **No Runtime Dependencies**: The registry is embedded in the package, no need for external files
2. **Development Flexibility**: Works with live registry in development, embedded data in production
3. **Automatic Build**: Registry is copied automatically during package build
4. **Type Safety**: Uses standard Python packaging tools (setuptools, importlib.resources)
5. **Size**: ~208KB compressed JSON data embedded in the wheel

## Notes

- The registry file must be generated before building the package (via `npm run docs:build`)
- If the registry is not found during build, a warning is shown but the build continues
- The embedded data is loaded using `importlib.resources`, which is the modern Python way to access package data
- The approach is modeled after the reference implementation in `mcp_reference/src/fds/main.py`
