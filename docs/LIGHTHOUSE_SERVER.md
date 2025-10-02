# Lighthouse CI Server - Optional Feature

## What is the Lighthouse Server?

The Lighthouse CI server is an **optional** feature that allows you to:
- Store historical Lighthouse data in a database
- View trends over time with a web UI
- Compare scores across different builds
- Track performance regressions visually

## Installation

The server package is now installed:
```bash
npm install --save-dev @lhci/server
```

## Usage

### Start the Server

```bash
npm run lighthouse:server
```

This will:
- Start a local server on port 9001
- Create a SQLite database in `.lighthouseci/db.sql`
- Provide a web UI at `http://localhost:9001`

### Configure Upload to Server

Update `lighthouserc.json` to upload results to your local server:

```json
{
  "ci": {
    "collect": {
      // ... your collect config
    },
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "http://localhost:9001",
      "token": "your-build-token"  // Get this from the server UI
    }
  }
}
```

### Workflow

1. **Start the server** (first time):
   ```bash
   npm run lighthouse:server
   ```

2. **Create a project** in the web UI:
   - Open `http://localhost:9001`
   - Click "Create Project"
   - Get your build token

3. **Update `lighthouserc.json`** with the token

4. **Run Lighthouse** (will now upload to server):
   ```bash
   npm run lighthouse
   ```

5. **View results** in the web UI:
   - Historical trends
   - Score comparisons
   - Detailed reports

## When to Use

### ✅ Use the Server When:
- Working on a team and want to share results
- Need to track performance over time
- Want visual dashboards
- Running Lighthouse regularly in CI/CD

### ❌ Skip the Server When:
- Just starting with Lighthouse
- Only need quick spot checks
- Don't need historical data
- Running locally for development

## Configuration Example

### For Local Development

```json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### For Team/CI with Server

```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "http://your-lighthouse-server.com",
      "token": "your-build-token"
    }
  }
}
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run lighthouse:server` | Start the Lighthouse CI server |
| `lhci server --port 8080` | Start on custom port |
| `lhci server --storage.sqlDatabasePath=/path/to/db.sql` | Use custom DB path |

## Database Storage

The server creates a SQLite database by default:
- Location: `.lighthouseci/db.sql`
- Can be backed up/restored
- Can switch to PostgreSQL or MySQL for production

### PostgreSQL Example

```bash
lhci server \
  --storage.sqlDialect=postgres \
  --storage.sqlConnectionUrl="postgres://user:pass@localhost/lhci"
```

## Security Notes

For production servers:
- Use basic authentication:
  ```bash
  lhci server \
    --basicAuth.username=admin \
    --basicAuth.password=secret
  ```
- Use HTTPS
- Restrict network access
- Regular database backups

## Troubleshooting

### Port Already in Use
Change the port:
```bash
lhci server --port 9002
```

### Database Errors
Reset the database (⚠️ deletes all data):
```bash
lhci server --storage.sqlDangerouslyResetDatabase
```

### Can't Connect to Server
Check if it's running:
```bash
curl http://localhost:9001
```

## Alternative: Temporary Public Storage

If you don't want to run a server, Lighthouse CI can upload to temporary public storage:

```json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

This gives you a public URL to view results (expires after a few days).

## Summary

The Lighthouse server is **optional**:
- ✅ Installed and ready to use
- 🚀 Run with `npm run lighthouse:server`
- 📊 Great for teams and CI/CD
- 💡 Not required for basic Lighthouse testing

For most users, the default configuration (temporary public storage) is sufficient!
