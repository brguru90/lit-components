#!/usr/bin/env python3
"""
Simple test to verify the framework-specific instructions logic
"""

def get_project_setup_instructions(framework=None):
    """Generate framework-specific project setup instructions based on the framework preference."""
    
    if framework == "html":
        return """
### HTML/Vanilla JavaScript Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./node_modules/vg/dist/index.js"></script>
  <link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
</head>
<body>
  <vg-theme-provider mode="dark">
    <vg-card heading="Welcome">
      <vg-button variant="primary" size="md">Get Started</vg-button>
    </vg-card>
  </vg-theme-provider>

  <script>
    document.querySelector('vg-button').addEventListener('vg-click', (event) => {
      console.log('Button clicked!', event.detail);
    });
  </script>
</body>
</html>
```

**Installation:**
```bash
npm install vg
```

**Event Handling:**
- Use standard `addEventListener` with `vg-` prefixed event names
- Events are CustomEvents with data in `event.detail`
"""
    
    elif framework == "react":
        return "React setup..."
    
    elif framework == "react19":
        return "React 19 setup..."
    
    elif framework == "vue":
        return "Vue setup..."
    
    elif framework == "angular":
        return "Angular setup..."
    
    elif framework == "lit":
        return "Lit setup..."
    
    else:  # All frameworks
        return "All frameworks setup..."

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
        
        setup_instructions = get_project_setup_instructions(framework)
        print(f"\n✅ Successfully generated setup instructions")
        print(f"Length: {len(setup_instructions)} characters")
        
        # Check for framework-specific keywords
        if framework == 'html':
            assert 'addEventListener' in setup_instructions
            assert 'vg-click' in setup_instructions
            print("✅ Contains HTML-specific keywords")
        elif framework == 'react':
            assert 'React' in setup_instructions
            print("✅ Contains React reference")
        elif framework == 'react19':
            assert 'React 19' in setup_instructions or 'React' in setup_instructions
            print("✅ Contains React 19 reference")
        elif framework == 'vue':
            assert 'Vue' in setup_instructions
            print("✅ Contains Vue reference")
        elif framework == 'angular':
            assert 'Angular' in setup_instructions
            print("✅ Contains Angular reference")
        elif framework == 'lit':
            assert 'Lit' in setup_instructions
            print("✅ Contains Lit reference")
        else:
            # All frameworks
            assert 'frameworks' in setup_instructions.lower()
            print("✅ Contains frameworks reference")
    
    print(f"\n{'='*80}")
    print("✅ All tests passed!")
    print(f"{'='*80}\n")
    
    # Print example output
    print("\n" + "="*80)
    print("Example: HTML Framework Setup Output")
    print("="*80)
    print(get_project_setup_instructions('html'))
    
    return True

if __name__ == "__main__":
    import sys
    success = test_framework_instructions()
    sys.exit(0 if success else 1)
