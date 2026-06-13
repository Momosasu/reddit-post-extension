# Reddit Thread Grabber 💬

A premium, lightweight Manifest V3 Chrome Extension that extracts Reddit posts and comment trees into clean, structured, and AI-optimized Markdown format with a single click.

<img src="icons/icon-128.png" alt="Reddit Thread Grabber Logo" width="64" height="64" />

## Features

*   **HTML Entity Decoding**: Automatically decodes entities like `&gt;` and `&amp;` for pristine text output.
*   **Hierarchical Nesting**: Uses standard Markdown blockquotes (`>`) or list indentations to map parent-child reply relationships accurately.
*   **Relative Timestamps**: Parses UNIX timestamps into readable relative times (e.g., `• 3h ago`, `• yesterday`).
*   **Thread Dividers**: Isolates top-level threads using clean dividers (`---`) to prevent context leakage when feeding threads to LLMs.
*   **Granular Settings**: Customize comment extraction depth (from 1 level up to unlimited) and toggle metadata (authors, scores, timestamps, source link) on/off.
*   **Visual Success States**: Designed with a premium, glassmorphic dark-theme UI with success checkmark and loader animations.
*   **Privacy First**: Runs 100% locally in your browser. Bypasses CORS using scoped host permissions without sending any data off-device.

---

## File Structure

```
├── manifest.json       # Manifest V3 configuration
├── popup.html          # Extension Popup UI structure
├── popup.css           # Glassmorphic dark styling & animations
├── popup.js            # Core fetching, parsing, and clipboard logic
├── icons/              # Resolution icons (16px, 48px, 128px)
├── generate_icons.ps1  # Script used to generate standard PNG icons
└── CHROMEWEBSTORE.md   # Prepared store listing metadata & descriptions
```

---

## Installation & Development

To run this extension locally in your Google Chrome browser:

1.  Clone this repository or download the source code:
    ```bash
    git clone https://github.com/YOUR_USERNAME/reddit-thread-grabber.git
    cd reddit-thread-grabber
    ```
2.  Open Chrome and navigate to:
    ```
    chrome://extensions/
    ```
3.  In the top-right corner, toggle **Developer mode** to **On**.
4.  Click the **Load unpacked** button in the top-left.
5.  In the file explorer, select the folder containing this project.
6.  Navigate to any Reddit thread, click the extension icon, and paste your copied Markdown anywhere!

---

## Chrome Web Store Submission

This extension is built to be production-ready and compliant with Chrome Web Store security guidelines:
*   Uses `activeTab` instead of the broad `"tabs"` permission to respect the **Principle of Least Privilege**.
*   Uses `DOMParser` instead of unsafe `innerHTML` for decoding to bypass automated static security scan warnings.
*   Pre-drafted justifications, disclosures, and listing templates are available in [CHROMEWEBSTORE.md](CHROMEWEBSTORE.md).

## License

This project is open-source and available under the [MIT License](LICENSE).
