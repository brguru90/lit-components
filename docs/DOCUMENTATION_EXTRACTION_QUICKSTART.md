# Documentation Extraction - Quick Start Guide

## Prerequisites

1. Build the project and generate custom-elements.json:
   ```bash
   npm run build-module
   npm run lsp-support
   ```

2. Build Storybook:
   ```bash
   npm run build-storybook
   ```

## Step-by-Step Usage

### Option 1: Full Documentation Build (Recommended)

Run the complete documentation extraction pipeline:

```bash
npm run docs:build
```

This single command will:
1. Extract documentation from all stories (`docs:extract`)
2. Merge all documentation chunks (`docs:merge`)
3. Generate component registry (`docs:generate`)

**Output Location**: `./storybook-static/stories_doc/`

### Option 2: Step-by-Step Execution

If you prefer to run each step individually:

#### Step 1: Extract Documentation
```bash
npm run docs:extract
# or
npm run test
```

This runs the Storybook test runner which extracts documentation from each story.

**What it does**:
- Visits each story in Storybook
- Extracts props, events, slots, and metadata
- Reads additional info from custom-elements.json
- Saves documentation chunks

**Output**: `./storybook-static/stories_doc/chunk_*.json`

#### Step 2: Merge Documentation
```bash
npm run docs:merge
```

**What it does**:
- Merges all chunk files into single docs.json
- Extracts TypeScript types from source code
- Processes SCSS to extract CSS
- Validates component coverage
- Cleans up chunk files

**Output**: 
- `./storybook-static/stories_doc/docs.json`

#### Step 3: Generate Component Registry
```bash
npm run docs:generate
```

**What it does**:
- Transforms docs.json into structured registry
- Creates component definitions with props/events/slots
- Generates type schemas
- Creates category mappings
- Produces minimal documentation version

**Output**:
- `./storybook-static/stories_doc/component-registry.json` (full registry)
- `./storybook-static/stories_doc/docs-min.json` (lightweight version)

## Understanding the Output

### 1. docs.json
Complete merged documentation with all story information.

**Size**: Large (includes all metadata, rendered HTML, etc.)
**Use**: Intermediate format for processing

### 2. component-registry.json
Structured component registry with:
- Component definitions
- Type schemas
- Categories
- Examples from stories

**Size**: Large (comprehensive metadata)
**Use**: Full documentation system, IDE integration

### 3. docs-min.json
Lightweight documentation with:
- Essential component props/events/slots
- Type definitions
- Component counts

**Size**: Small (only essential data)
**Use**: NPM bundle, quick reference

## Checking the Output

### View Documentation Files

```bash
# View merged documentation
cat ./storybook-static/stories_doc/docs.json | jq '.' | less

# View component registry
cat ./storybook-static/stories_doc/component-registry.json | jq '.components' | less

# View minimal docs
cat ./storybook-static/stories_doc/docs-min.json | jq '.'

# List all output files
ls -lh ./storybook-static/stories_doc/
```

### Check Component Coverage

The merge process will warn about missing components:

```
📊 Component counts:
  - Components from stories: 10
  - Lit components found: 12
⚠️  2 components without stories:
VgNewComponent
VgExperimentalFeature
```

## Troubleshooting

### Issue: No documentation extracted

**Solution**:
1. Ensure Storybook is built: `npm run build-storybook`
2. Verify test runner works: `npm run test`
3. Check story files have proper meta configuration

### Issue: Missing component in registry

**Solution**:
1. Ensure component has at least one story
2. Check story meta includes `component: YourComponent`
3. Verify component is exported from `src/index.ts`

### Issue: Empty docs.json

**Solution**:
1. Delete existing docs: `rm -rf ./storybook-static/stories_doc/`
2. Re-run: `npm run docs:build`
3. Check console for errors during extraction

### Issue: Type extraction fails

**Solution**:
1. Fix TypeScript errors: `npm run type-check`
2. Ensure types are properly exported
3. Check TypeScript configuration

### Issue: SCSS processing fails

**Solution**:
1. Verify `.storybook/all.scss` exists
2. Check SCSS imports are valid
3. Install sass if missing: `npm install -D sass`

## Integration with Development Workflow

### During Development

Run documentation extraction after making component changes:

```bash
# After updating components
npm run build-module
npm run lsp-support

# After updating stories
npm run build-storybook
npm run docs:build
```

### In CI/CD

Add to your CI pipeline:

```yaml
- name: Build Documentation
  run: |
    npm run build-module
    npm run lsp-support
    npm run build-storybook
    npm run docs:build
    
- name: Upload Documentation
  uses: actions/upload-artifact@v3
  with:
    name: component-docs
    path: ./storybook-static/stories_doc/
```

### Pre-commit Hook

Add documentation extraction to pre-commit:

```bash
# .husky/pre-commit
npm run type-check
npm run lsp-support
npm run build-storybook
npm run docs:extract
```

## Next Steps

1. **Review the output**: Check `component-registry.json` to see all extracted metadata

2. **Improve stories**: Add missing descriptions and AI instructions to stories

3. **Add missing stories**: Create stories for components without documentation

4. **Integrate with tools**: Use generated documentation for:
   - IDE autocomplete
   - API documentation sites
   - AI/LLM training data
   - Component catalogs

5. **Customize extraction**: Modify `.storybook/utils/` files to extract additional metadata

## Common Commands Reference

```bash
# Full documentation build
npm run docs:build

# Extract only
npm run docs:extract

# Merge only (after extraction)
npm run docs:merge

# Generate registry only (after merge)
npm run docs:generate

# Build everything from scratch
npm run build-module && \
npm run lsp-support && \
npm run build-storybook && \
npm run docs:build
```

## Files Created

After running documentation extraction, you'll have:

```
storybook-static/
└── stories_doc/
    ├── docs.json              # Merged documentation (large)
    ├── component-registry.json # Structured registry (large)
    └── docs-min.json          # Minimal docs (small)
```

## Getting Help

- See full documentation: `docs/DOCUMENTATION_EXTRACTION.md`
- Check implementation: `.storybook/utils/documentation-extraction.ts`
- Review test runner: `.storybook/test-runner.ts`
- Custom elements config: `custom-elements-manifest.config.mjs`

## Performance Tips

1. **Incremental builds**: Only run extraction when stories change
2. **Parallel testing**: Use `--maxWorkers` flag for test runner
3. **Cache custom-elements.json**: Don't regenerate if source unchanged
4. **Skip coverage**: Use `--no-coverage` to speed up test runner
5. **Watch mode**: Run storybook in dev mode for live updates

---

**Questions or Issues?**
Refer to the troubleshooting section or the main documentation file.
