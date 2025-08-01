# JIRA Transition Blocker

A Chrome extension that blocks specific JIRA workflow dispatcher requests with `action=171`.

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder
5. Pin the extension to your toolbar

## Usage

- Click the extension icon to see blocked request count
- Blocked requests are logged to browser console
- Only blocks URLs with `action=171`

## Files

- `manifest.json` - Extension configuration
- `background.js` - Background service worker
- `popup.html/js` - Extension popup interface
- `rules.json` - Blocking rules
- `extension-icon.png` - Extension icon

## Development

Edit `background.js` to modify blocking criteria or `popup.js` to change the UI.

## CHROME EXTENSION DEVELOPMENT

### UPDATES

Chrome Policy -> updates.xml -> point to crx location

### REFERENCE

<https://developer.chrome.com/docs/apps/autoupdate#update_manifest>
