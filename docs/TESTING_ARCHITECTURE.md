# Testing Architecture: Play Functions + Framework Demos

## Overview

This document explains how Play Functions complement your existing demo projects to provide comprehensive cross-framework testing.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        YOUR WEB COMPONENT LIBRARY                        │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Core Web Components                          │    │
│  │  • vg-button  • vg-input  • vg-card  • vg-dropdown            │    │
│  │  • Same shadow DOM rendering across ALL frameworks              │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
            ▼                                               ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│   PLAY FUNCTION TESTING         │       │   FRAMEWORK DEMO PROJECTS       │
│   (Storybook Tests)             │       │   (Integration Examples)        │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│                                 │       │                                 │
│ What: Universal Behavior Tests  │       │ What: Framework Integration     │
│                                 │       │                                 │
│ Tests:                          │       │ Tests:                          │
│ ✓ Component rendering           │       │ ✓ Framework-specific syntax     │
│ ✓ User interactions             │       │ ✓ Event handler mapping         │
│ ✓ Accessibility (ARIA)          │       │ ✓ Prop/attribute conversion     │
│ ✓ Keyboard navigation           │       │ ✓ Build system integration      │
│ ✓ State changes                 │       │ ✓ Routing integration           │
│ ✓ Slot content                  │       │ ✓ State management (Redux, Vuex)│
│ ✓ Custom events                 │       │ ✓ Full app context              │
│                                 │       │                                 │
│ Validates:                      │       │ Validates:                      │
│ → Does it work?                 │       │ → Does it integrate?            │
│ → Is it accessible?             │       │ → Are wrappers correct?         │
│ → Does it follow standards?     │       │ → Does syntax work?             │
│                                 │       │                                 │
│ Coverage:                       │       │ Coverage:                       │
│ • All frameworks at once        │       │ • Each framework separately     │
│ • Single test = universal       │       │ • 5 separate demo projects      │
│                                 │       │                                 │
│ Run:                            │       │ Run:                            │
│ npm run storybook               │       │ npm run demo                    │
│ npm run test-storybook          │       │ cd demo/react-demo && npm start │
│                                 │       │ cd demo/vue-demo && npm run dev │
│ Files:                          │       │                                 │
│ stories/*.stories.ts            │       │ Files:                          │
│ stories/*.interaction.test.ts   │       │ demo/html-demo/                 │
│                                 │       │ demo/react-demo/                │
│ Example:                        │       │ demo/vue-demo/                  │
│ Button.interaction.test.stories │       │ demo/angular-demo/              │
│                                 │       │ demo/react19-demo/              │
└─────────────────────────────────┘       └─────────────────────────────────┘
            │                                               │
            │                                               │
            └───────────────────────┬───────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      COMPLEMENTARY TESTING STRATEGY                      │
│                                                                          │
│  Play Functions           +        Framework Demos                       │
│  ─────────────────                 ─────────────────                     │
│  Fast execution                    Realistic environments                │
│  Automated CI/CD                   Manual verification                   │
│  Component isolation               Full integration                      │
│  One test suite                    Per-framework tests                   │
│  Proves universality               Proves compatibility                  │
│                                                                          │
│  Together = Complete Confidence                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Testing Matrix

| Test Type | Play Functions | Framework Demos | Lighthouse |
|-----------|---------------|-----------------|------------|
| **Component Behavior** | ✅ Primary | ✅ Secondary | ❌ |
| **User Interactions** | ✅ Automated | ✅ Manual | ❌ |
| **Accessibility** | ✅ ARIA/Keyboard | ✅ Screen readers | ✅ Audits |
| **Performance** | ❌ | ✅ Real-world | ✅ Metrics |
| **Framework Syntax** | ❌ | ✅ Primary | ❌ |
| **Integration** | ❌ | ✅ Primary | ❌ |
| **Build Systems** | ❌ | ✅ Primary | ❌ |
| **CI/CD Friendly** | ✅ Fast | ⚠️ Slow | ✅ Automated |
| **Cross-Framework** | ✅ One test | ⚠️ 5 projects | ✅ Universal |
| **Documentation** | ✅ Interactive | ✅ Examples | ✅ Reports |

## When to Use Each

### Use Play Functions For:

1. **Component Behavior Testing**
   - Does button click work?
   - Does input accept text?
   - Does dropdown open?

2. **Accessibility Testing**
   - Keyboard navigation
   - ARIA roles
   - Focus management

3. **State Testing**
   - Disabled state
   - Loading state
   - Error state

4. **Interaction Testing**
   - Click events
   - Form submission
   - Drag and drop

5. **Universal Validation**
   - Prove it works everywhere
   - One test = all frameworks

### Use Framework Demos For:

1. **Integration Testing**
   - React hooks integration
   - Vue Composition API
   - Angular services

2. **Framework Features**
   - Routing (React Router, Vue Router)
   - State management (Redux, Vuex, NgRx)
   - Form libraries (Formik, VeeValidate)

3. **Build System Validation**
   - Webpack configuration
   - Vite setup
   - Angular CLI

4. **Real-World Usage**
   - Complete applications
   - Production scenarios
   - Developer experience

5. **Manual QA**
   - Visual inspection
   - Browser compatibility
   - Mobile responsiveness

### Use Lighthouse For:

1. **Performance Metrics**
   - Core Web Vitals
   - Load times
   - Bundle size impact

2. **Best Practices**
   - Console errors
   - Security headers
   - Modern standards

3. **SEO Validation**
   - Meta tags
   - Semantic HTML
   - Structured data

## Recommended Workflow

### Development Phase

1. **Write Component** → `src/components/MyComponent/`
2. **Create Story** → `stories/MyComponent.stories.ts`
3. **Add Play Functions** → Test interactions
4. **Test in Storybook** → `npm run storybook`
5. **Run Automated Tests** → `npm run test-storybook`
6. **Test in Demos** → `npm run demo` (spot check)

### CI/CD Pipeline

```bash
# 1. Build library
npm run build-module

# 2. Run Play Function tests (fast)
npm run test-storybook

# 3. Run Lighthouse audits (performance)
npm run lighthouse

# 4. Build demos (optional - can be separate job)
npm run install-demos

# 5. Run demo smoke tests (optional)
# ... custom scripts per demo
```

### Pre-Release Checklist

- [x] All Play Functions passing
- [x] Lighthouse thresholds met
- [x] Manual testing in key demos:
  - [ ] React demo
  - [ ] Vue demo
  - [ ] Angular demo
  - [ ] HTML demo
- [x] Documentation updated
- [x] Framework Switcher working
- [x] Changelog updated

## Example: Button Testing Strategy

### Play Functions (Automated)
```typescript
// stories/Button.interaction.test.stories.ts
✓ Button renders
✓ Button is clickable
✓ Disabled button doesn't click
✓ Loading state shows spinner
✓ Keyboard navigation works
✓ Custom events fire correctly
✓ All variants render
✓ All sizes render
✓ Slots work correctly
```

### Framework Demos (Manual/Spot Check)
```
demo/react-demo/
✓ Button works with React hooks
✓ onVgClick prop works
✓ TypeScript types are correct

demo/vue-demo/
✓ Button works with Composition API
✓ @vg-click directive works
✓ v-model integration

demo/angular-demo/
✓ Button works with services
✓ (vg-click) binding works
✓ Two-way binding

demo/html-demo/
✓ addEventListener works
✓ No framework needed
✓ Works in vanilla HTML
```

### Lighthouse (Automated)
```
✓ Performance: 95+
✓ Accessibility: 100
✓ Best Practices: 95+
✓ SEO: 90+
```

## Benefits Summary

### Play Functions
- ⚡ **Fast** - Run in seconds
- 🤖 **Automated** - No manual intervention
- 🌍 **Universal** - One test = all frameworks
- 📊 **Consistent** - Same test every time
- 🐛 **Debug-friendly** - Visual feedback in Storybook
- 📝 **Documentation** - Tests serve as examples

### Framework Demos
- 🎯 **Realistic** - Real-world scenarios
- 🔧 **Integration** - Framework-specific features
- 👀 **Visual** - See it in action
- 🛠️ **DX Testing** - Developer experience
- 📚 **Examples** - Working code samples
- 🔍 **Comprehensive** - Full app context

### Lighthouse
- 📊 **Metrics** - Quantifiable performance
- ♿ **Accessibility** - Automated audits
- 🏆 **Best Practices** - Industry standards
- 📈 **Trending** - Track improvements
- 🎯 **Thresholds** - Enforce quality gates

## Conclusion

Your web component library now has **three layers of testing**:

1. **Play Functions** - Universal behavior validation
2. **Framework Demos** - Integration verification
3. **Lighthouse** - Performance & best practices

Together, they provide **comprehensive confidence** that your components:
- ✅ Work correctly
- ✅ Work everywhere
- ✅ Work well
- ✅ Work fast
- ✅ Work accessibly

**The best part?** Play Functions prove your components are truly framework-agnostic - write once, test once, use anywhere! 🎉

---

## See Also

- [Play Function Testing Guide](./PLAY_FUNCTION_TESTING.md)
- [Play Function Quick Start](./PLAY_FUNCTION_QUICKSTART.md)
- [Framework Switcher](./FRAMEWORK_SWITCHER.md)
- [Lighthouse Integration](./LIGHTHOUSE.md)
