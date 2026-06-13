# Chrome Web Store Listing — Reddit Thread Grabber

> Last Updated: 2026-06-13

## Store Listing

**Extension Name**  
Reddit Thread Grabber

**Short Description**  
Copies Reddit posts and nested comments in formatted Markdown with a single click.

**Detailed Description**  
Reddit Thread Grabber is a lightweight developer utility designed to simplify content extraction from Reddit. With a single click, it parses the active Reddit post, aggregates all nested comments, and copies them to your clipboard as clean, hierarchical Markdown.

Key Features:
- Seamless Extraction: Fetches the raw thread data from Reddit's secure JSON API for maximum layout-agnostic robustness.
- Structured Formatting: Nest comments using standard blockquotes (>) or list indentations to preserve the original conversation tree.
- Configurable Depth: Limit replies up to 5 levels deep or fetch unlimited nested comments.
- Custom Metadata: Toggle authors, scores, timestamps, and the source thread link in your copy results.
- Sleek Design: A modern, glassmorphic UI with quick settings controls and smooth copy animations.

How to Use:
1. Navigate to any Reddit post thread in Google Chrome.
2. Click the Reddit Thread Grabber icon in your extension toolbar.
3. The popup will open, automatically fetch, parse, and copy the thread contents to your clipboard.
4. Paste the copied Markdown directly into text editors, Obsidian, Notion, or LLM chat prompts.

This extension runs completely locally and respects your privacy. It does not transmit any browsing data or personal information to external servers.

**Category**  
Developer Tools

**Single Purpose**  
Copies Reddit post and comment trees as formatted Markdown to the clipboard.

**Primary Language**  
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ⬜ Not created | *(mockup provided in walkthrough)* |
| Screenshot 2 | 1280×800 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Show the extension popup in its "Copied to Clipboard!" success state with an active Reddit post in the background.
- **Screenshot 2**: Show the expanded "Extraction Settings" panel, showcasing depth limits and metadata choices.

---

## Permissions Justification

| Permission | Type | Justification |
| :--- | :--- | :--- |
| `activeTab` | permissions | Allows the extension to get the URL of the current tab when the user clicks the extension icon in order to check if it is a Reddit thread. |
| `storage` | permissions | Used to save user preferences (max comment depth, formatting style, metadata inclusions) locally on their machine. |
| `https://*.reddit.com/*` | host_permissions | Allows the popup to query the Reddit JSON API endpoint for the thread to extract raw Markdown posts and comments without encountering CORS blocks. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL**  
*(Not required since no data is collected, but recommended to link to a local page or README section outlining that all processing is done 100% on-device).*

---

## Distribution

**Visibility**: Public  
**Regions**: All regions  
**Pricing**: Free  

---

## Developer Info

**Contact Email**  
developer@example.com

**Support URL / Email**  
https://github.com/example/reddit-thread-grabber/issues

---

## Version History

| Version | Date | Changes | Status |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-06-13 | Initial release. Supports recursive comment scraping and copy-to-clipboard formatting. | Draft |

---

## Review Notes

### Known Issues / Limitations
- Heavily paginated Reddit threads (over 500 comments) may have deeply nested comment sub-branches truncated by Reddit in the initial JSON payload (represented by `more` items). The extension focuses on the main comment list returned in the primary request.
