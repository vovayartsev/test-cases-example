# QA Test Run Builder - Chrome Extension

A Chrome extension that fetches test cases from GitHub and provides an interactive UI for building custom test runs with markdown export.

## Features

- **Interactive Test Case Selection**: Browse test cases organized by section with collapsible tree view
- **Flexible Selection**: Select entire sections or individual test cases with checkboxes
- **Live Markdown Preview**: See your test run markdown update in real-time as you select cases
- **One-Click Copy**: Copy the generated markdown to clipboard with a single button click
- **GitHub Integration**: Fetches test cases from GitHub raw content using your authenticated session
- **Split-Panel UI**: Figma Build-inspired interface with test cases on the left, preview on the right
- **Indeterminate State**: Visual indicators show when a section is partially selected

## Installation

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension` folder from this project
   - The extension icon should appear in your toolbar

## Usage

### Opening the Test Run Builder

**Simply click the extension icon** in your Chrome toolbar. The QA Test Run Builder will open directly in a new tab and automatically fetch test cases from GitHub.

### Building a Test Run

The interface is divided into two panels:

#### Left Panel - Test Cases Tree

- **Browse by Section**: Test cases are organized by sections (e.g., Authentication, User Management, Dashboard)
- **Expand/Collapse**: Click the chevron icon to show/hide test cases within a section
- **Select Sections**: Check a section's checkbox to include all its test cases
- **Select Individual Cases**: Check individual test case checkboxes for granular control
- **Visual Indicators**:
  - Solid checkmark: Section or test case is selected
  - Minus sign: Section is partially selected (some but not all test cases)
  - Empty checkbox: Not selected

#### Right Panel - Test Run Preview

- **Live Markdown Preview**: Shows the generated markdown as you make selections
- **Copy Button**: Click "Copy Markdown" to copy the test run to your clipboard
- **Format**: Markdown is generated with:
  - `# Test Run` as the main heading
  - `## Section Name` for each section with selected test cases
  - `- [ ] TEST-ID   Test case name` for each test case

### Example Workflow

1. **Click the extension icon** - QA Test Run Builder opens in a new tab
2. Wait for test cases to load (usually takes 1-2 seconds)
3. Expand or collapse sections using the chevron icons
4. **Select test cases**:
   - Click the "Authentication" section checkbox to include all auth test cases, OR
   - Expand "Authentication" and select individual test cases
   - Repeat for other sections as needed
5. **Review the preview** - See your markdown update in real-time on the right panel
6. **Copy to clipboard** - Click "Copy Markdown" button
7. **Paste** into your test run document, Notion, Linear, Jira, etc.

## Authentication & Permissions

### How Authentication Works

The extension can access authenticated GitHub content in two ways:

#### Method 1: Direct Fetch with Credentials
- The extension makes a fetch request with `credentials: 'include'`
- This automatically includes cookies from your browser session
- **Works from any page**, not just GitHub.com

#### Method 2: Background Service Worker (Fallback)
- If direct fetch fails, the extension uses a background service worker
- The service worker explicitly reads GitHub cookies using Chrome's cookies API
- Includes them in the request headers
- **Also works from any page**

### To Your Question: Does it Only Work on GitHub?

**No, the extension works from any page!** Here's why:

1. **Chrome Extension Permissions**: The extension has `host_permissions` for:
   - `https://raw.githubusercontent.com/*` (where the content is fetched from)
   - `https://github.com/*` (where authentication cookies are stored)

2. **Cookie Access**: Chrome extensions with proper permissions can access cookies from any domain they have permission for, regardless of which page is currently open.

3. **Cross-Origin Requests**: Extensions can make cross-origin requests that regular web pages cannot, bypassing CORS restrictions.

**What this means:**
- You can trigger the extension from a blank page ✓
- You can trigger it from any website ✓
- You can trigger it from GitHub.com ✓
- As long as you're logged into GitHub in Chrome, the extension will use those credentials

### Required Permissions

The extension requests:
- `storage`: To save user preferences (future feature)
- `cookies`: To read GitHub authentication cookies
- `host_permissions`: To fetch from raw.githubusercontent.com and github.com

### Security Notes

- The extension only accesses GitHub cookies
- No credentials are stored or transmitted elsewhere
- All requests go directly to GitHub's servers
- The extension runs in Chrome's secure sandbox environment

## Configuration

The GitHub repository URL is hardcoded in `viewer.js`:

```javascript
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/vovayartsev/test-cases-example/refs/heads/main/cache.txt';
```

To use a different repository:
1. Open `extension/viewer.js`
2. Change the `GITHUB_RAW_URL` constant to your desired raw GitHub URL
3. Reload the extension in `chrome://extensions/`

## File Structure

```
extension/
├── manifest.json        # Extension configuration and permissions
├── viewer.html         # QA Test Run Builder UI (split-panel layout)
├── viewer.js           # Core logic: fetching, parsing, selection, markdown generation
├── background.js       # Service worker with icon click handler and auth requests
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
├── popup.html         # (Optional - not used, kept for reference)
├── popup.js           # (Optional - not used, kept for reference)
├── README.md          # This file
└── ICONS_README.md    # Icon creation instructions
```

## Architecture

### background.js
- **Icon Click Handler**: Opens viewer.html directly when extension icon is clicked
- **Authenticated Fetch**: Handles GitHub API requests with browser cookies for private repositories
- **Message Passing**: Responds to fetch requests from viewer.js

### viewer.html
- **Split-panel layout** inspired by Figma Build
- **Left panel**: Collapsible tree view with checkboxes
- **Right panel**: Live markdown preview with copy button
- **Pure CSS** styling with no external dependencies

### viewer.js
Key components:
- **State Management**: Tracks expanded sections, selected sections, and selected test cases
- **Parsing Logic**: Converts GitHub raw YAML format into structured test case data
- **Tree Rendering**: Dynamically generates HTML for the test case tree with proper nesting
- **Selection Logic**: Handles checkbox states including indeterminate states for partial selection
- **Markdown Generation**: Creates formatted markdown with sections and checkboxes
- **Clipboard Integration**: One-click copy functionality

## Troubleshooting

### "Failed to Load" Error

If you see this error, check:

1. **GitHub Authentication**
   - Make sure you're logged into GitHub in Chrome
   - Try visiting github.com in another tab to verify

2. **Repository Access**
   - Ensure the repository is public, or
   - Ensure you have access if it's private

3. **Extension Permissions**
   - Check that the extension has the required permissions
   - Go to `chrome://extensions/` → Extension details → Permissions

4. **Network Issues**
   - Check your internet connection
   - Try refreshing the viewer

### Extension Not Appearing

- Make sure Developer Mode is enabled in `chrome://extensions/`
- Try removing and re-adding the extension
- Check the Chrome console for errors (F12 on the extension pages)

## Development

### Testing Changes

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Re-open the viewer to see changes

### Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Viewer**: Open the viewer tab → Press F12
- **Background Worker**: `chrome://extensions/` → Extension details → "Inspect views: service worker"

## Technical Details

### Test Case Format

The extension parses test cases in this format:

```yaml
---
id: A-1
section: Admin
feature: Create New Event
date_created: 2025-10-13
---
Steps:
1. Log in to admin panel
2. Click "Create Event" button
...
```

### Parsing Logic

1. Split content by `---` separators
2. Parse metadata (id, section, feature, date_created)
3. Parse steps section into numbered list
4. Render as structured HTML

## Implemented Features

- [x] Interactive tree view with collapsible sections
- [x] Checkbox selection for sections and individual test cases
- [x] Indeterminate checkbox states for partial selections
- [x] Live markdown preview
- [x] One-click markdown copy to clipboard
- [x] GitHub authentication integration
- [x] Split-panel responsive UI

## Future Enhancements

Potential features to add:
- [ ] Search/filter functionality for test cases
- [ ] Save selection state (remember selected cases between sessions)
- [ ] Multiple test run tabs (create multiple test runs simultaneously)
- [ ] Export to CSV format
- [ ] Bulk select/deselect all buttons
- [ ] Keyboard shortcuts for common actions
- [ ] Dark mode toggle
- [ ] Support for multiple GitHub repositories
- [ ] Test case details view (show steps on hover or click)
- [ ] Drag and drop to reorder test cases

## License

This extension is part of the test-cases-example project.
