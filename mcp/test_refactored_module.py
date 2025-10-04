#!/usr/bin/env python3
"""
Test to verify the refactored framework_instructions module works correctly
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from vg_ui_lib_mcp.framework_instructions import get_project_setup_instructions

def test_import_and_functionality():
    """Test that the moved function works correctly"""
    
    print("=" * 80)
    print("Testing Refactored framework_instructions Module")
    print("=" * 80)
    
    # Test that function is importable
    print("\n✅ Successfully imported get_project_setup_instructions")
    
    # Test each framework
    frameworks = ['html', 'react', 'react19', 'vue', 'angular', 'lit', None]
    
    for framework in frameworks:
        framework_name = framework if framework else "All Frameworks"
        try:
            result = get_project_setup_instructions(framework)
            assert isinstance(result, str)
            assert len(result) > 0
            print(f"✅ {framework_name}: {len(result)} characters")
            
            # Verify framework-specific content
            if framework == 'html':
                assert 'addEventListener' in result
            elif framework == 'react':
                assert 'vg/react' in result
            elif framework == 'vue':
                assert '@vg-click' in result
            
        except Exception as e:
            print(f"❌ {framework_name} failed: {e}")
            return False
    
    print("\n" + "=" * 80)
    print("✅ All tests passed! Refactoring successful!")
    print("=" * 80)
    
    # Show example
    print("\n" + "=" * 80)
    print("Example: React Setup (first 500 chars)")
    print("=" * 80)
    example = get_project_setup_instructions('react')
    print(example[:500] + "...")
    
    return True

if __name__ == "__main__":
    success = test_import_and_functionality()
    sys.exit(0 if success else 1)
