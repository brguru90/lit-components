#!/usr/bin/env python3
"""
Test script to verify the framework-specific instructions generation
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from vg_ui_lib_mcp.main import get_project_setup_instructions, get_instructions

def test_framework_instructions():
    """Test that instructions are generated correctly for each framework"""
    
    frameworks = ['html', 'react', 'react19', 'vue', 'angular', 'lit', None]
    
    print("=" * 80)
    print("Testing Framework-Specific Project Setup Instructions")
    print("=" * 80)
    
    for framework in frameworks:
        print(f"\n{'='*80}")
        if framework:
            print(f"Testing framework: {framework}")
        else:
            print(f"Testing all frameworks (framework=None)")
        print(f"{'='*80}")
        
        try:
            setup_instructions = get_project_setup_instructions(framework)
            print(f"\n✅ Successfully generated setup instructions")
            print(f"Length: {len(setup_instructions)} characters")
            
            # Check for framework-specific keywords
            if framework == 'html':
                assert 'addEventListener' in setup_instructions
                assert 'vg-click' in setup_instructions
                print("✅ Contains HTML-specific keywords")
            elif framework == 'react':
                assert 'vg/react' in setup_instructions
                assert 'onVgClick' in setup_instructions
                print("✅ Contains React-specific keywords")
            elif framework == 'react19':
                assert 'vg/jsx' in setup_instructions
                assert 'onvg-click' in setup_instructions
                print("✅ Contains React 19-specific keywords")
            elif framework == 'vue':
                assert 'vg/vue' in setup_instructions
                assert '@vg-click' in setup_instructions
                print("✅ Contains Vue-specific keywords")
            elif framework == 'angular':
                assert 'CUSTOM_ELEMENTS_SCHEMA' in setup_instructions
                assert '(vg-click)' in setup_instructions
                print("✅ Contains Angular-specific keywords")
            elif framework == 'lit':
                assert 'LitElement' in setup_instructions
                assert '@vg-click' in setup_instructions
                assert '@customElement' in setup_instructions
                print("✅ Contains Lit-specific keywords")
            else:
                # All frameworks
                assert 'HTML/Vanilla JavaScript' in setup_instructions
                assert 'React' in setup_instructions
                assert 'Vue' in setup_instructions
                assert 'Angular' in setup_instructions
                assert 'Lit' in setup_instructions
                print("✅ Contains all framework examples")
            
            # Test full instructions generation
            full_instructions = get_instructions(framework)
            assert 'VG UI Library' in full_instructions
            assert 'Project Setup' in full_instructions
            assert setup_instructions in full_instructions
            print("✅ Full instructions generated correctly")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    print(f"\n{'='*80}")
    print("✅ All tests passed!")
    print(f"{'='*80}\n")
    return True

if __name__ == "__main__":
    success = test_framework_instructions()
    sys.exit(0 if success else 1)
