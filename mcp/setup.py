"""
Setup script for lit-components-mcp-server package.
This copies component-registry.json before building the package.
"""
from setuptools import setup
from setuptools.command.build_py import build_py
from setuptools.command.sdist import sdist
from pathlib import Path
import shutil
import sys


def copy_registry_file():
    """Copy component-registry.json from storybook-static to the package data directory."""
    # Get the directory where setup.py is located
    setup_dir = Path(__file__).parent.absolute()
    
    # Define paths relative to setup.py location
    # When building from source, setup_dir is the mcp directory
    project_root = setup_dir.parent
    source_file = project_root / "storybook-static" / "stories_doc" / "component-registry.json"
    dest_dir = setup_dir / "src" / "lit_components_mcp" / "data"
    dest_file = dest_dir / "component-registry.json"
    
    print(f"\n{'='*60}")
    print("Pre-build: Copying component-registry.json")
    print(f"{'='*60}")
    print(f"Setup directory: {setup_dir}")
    print(f"Source: {source_file}")
    print(f"Destination: {dest_file}")
    
    # Check if source file exists
    if not source_file.exists():
        print(f"⚠️  Warning: Source file not found at {source_file}")
        
        # Check if destination already has the file
        if dest_file.exists():
            file_size_kb = dest_file.stat().st_size / 1024
            print(f"✅ Using existing registry file ({file_size_kb:.2f} KB)")
            print(f"{'='*60}\n")
            return True
        else:
            print(f"❌ Error: Registry file not found in source or destination")
            print(f"💡 Run 'npm run build-storybook && npm run docs:build' to generate it")
            print(f"{'='*60}\n")
            return False
    
    # Create destination directory if it doesn't exist
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy the file
    try:
        shutil.copy2(source_file, dest_file)
        file_size_kb = dest_file.stat().st_size / 1024
        print(f"✅ Successfully copied component-registry.json ({file_size_kb:.2f} KB)")
        print(f"{'='*60}\n")
        return True
    except Exception as e:
        print(f"❌ Error copying file: {e}")
        print(f"{'='*60}\n")
        return False


class BuildPyCommand(build_py):
    """Custom build command that copies the registry file before building."""
    
    def run(self):
        """Copy registry file before the standard build."""
        copy_registry_file()
        # Run the standard build
        super().run()


class SDistCommand(sdist):
    """Custom sdist command that ensures registry is copied before creating source distribution."""
    
    def run(self):
        """Copy registry file before creating source distribution."""
        copy_registry_file()
        # Run the standard sdist
        super().run()


# Run setup
setup(
    cmdclass={
        'build_py': BuildPyCommand,
        'sdist': SDistCommand,
    },
)
