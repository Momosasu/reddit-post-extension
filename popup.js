let currentThreadData = null;
let commentCount = 0;

// Helper to decode HTML entities (e.g. &amp; -> &, &gt; -> >)
function decodeHtmlEntities(str) {
  if (!str) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.documentElement.textContent || '';
}

// Helper to format timestamps as relative time (e.g. "2h ago", "yesterday")
function getRelativeTime(utcSeconds) {
  if (!utcSeconds) return '';
  const diffMs = Date.now() - (utcSeconds * 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  
  const date = new Date(utcSeconds * 1000);
  return date.toLocaleDateString();
}

// Helper to switch states
function showState(stateName) {
  document.querySelectorAll('.state').forEach(el => el.classList.remove('active'));
  const targetState = document.getElementById(`state-${stateName}`);
  if (targetState) {
    targetState.classList.add('active');
  }
}

// Helper to update loading message
function updateLoading(title, subtitle) {
  document.getElementById('loading-title').textContent = title;
  document.getElementById('loading-subtitle').textContent = subtitle;
  showState('loading');
}

// Helper to copy text to clipboard with fallback
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('Navigator clipboard failed, using fallback copy:', err);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
    }
  }
  return false;
}

// Load settings from chrome.storage.local
async function loadSettings() {
  const defaults = {
    maxDepth: 3,
    formatStyle: 'blockquote',
    includeAuthor: true,
    includeScore: true,
    includeTimestamp: false,
    includeSource: true
  };
  
  const settings = await chrome.storage.local.get(defaults);
  
  document.getElementById('select-depth').value = settings.maxDepth;
  
  const radio = document.querySelector(`input[name="format-style"][value="${settings.formatStyle}"]`);
  if (radio) radio.checked = true;
  
  document.getElementById('chk-author').checked = settings.includeAuthor;
  document.getElementById('chk-score').checked = settings.includeScore;
  document.getElementById('chk-timestamp').checked = settings.includeTimestamp;
  document.getElementById('chk-source').checked = settings.includeSource;
  
  return settings;
}

// Save settings to chrome.storage.local
async function saveSettings() {
  const settings = {
    maxDepth: parseInt(document.getElementById('select-depth').value, 10),
    formatStyle: document.querySelector('input[name="format-style"]:checked').value,
    includeAuthor: document.getElementById('chk-author').checked,
    includeScore: document.getElementById('chk-score').checked,
    includeTimestamp: document.getElementById('chk-timestamp').checked,
    includeSource: document.getElementById('chk-source').checked
  };
  
  await chrome.storage.local.set(settings);
  
  // Re-format and copy if we already have the raw thread data loaded
  if (currentThreadData) {
    await processAndCopy(currentThreadData.post, currentThreadData.comments, settings);
  }
}

// Parse comments recursively
function parseComment(commentNode, depth, options) {
  if (!commentNode || commentNode.kind !== 't1') {
    return '';
  }
  
  const data = commentNode.data;
  if (!data) return '';
  
  // Check depth limits (depth is 0-indexed)
  if (options.maxDepth !== -1 && depth > options.maxDepth) {
    return '';
  }
  
  // Increment global count of successfully parsed comments
  commentCount++;
  
  const author = data.author || '[unknown]';
  const body = decodeHtmlEntities(data.body || '');
  const score = data.score !== undefined ? data.score : 0;
  const created_utc = data.created_utc || 0;
  
  // Build pretty meta header
  let metaParts = [];
  if (options.includeAuthor) {
    metaParts.push(`**u/${author}**`);
  }
  if (options.includeScore) {
    metaParts.push(`(Score: ${score})`);
  }
  
  let metaHeader = '';
  if (metaParts.length > 0) {
    const timeStr = (options.includeTimestamp && created_utc) ? ` • ${getRelativeTime(created_utc)}` : '';
    metaHeader = `💬 ${metaParts.join(' ')}${timeStr}`;
  }
  
  let formatted = '';
  
  if (options.formatStyle === 'blockquote') {
    const prefix = '> '.repeat(depth + 1);
    
    if (metaHeader) {
      formatted += `${prefix}${metaHeader}\n`;
    }
    
    const bodyLines = body.split('\n');
    for (const line of bodyLines) {
      formatted += `${prefix}${line}\n`;
    }
    formatted += `${prefix}\n`;
  } else {
    // List indentation style
    const indent = '  '.repeat(depth);
    const bullet = `${indent}- `;
    
    if (metaHeader) {
      formatted += `${bullet}${metaHeader}\n`;
    }
    
    const bodyIndent = '  '.repeat(depth + 1);
    const bodyLines = body.split('\n');
    
    if (metaHeader) {
      for (const line of bodyLines) {
        formatted += `${bodyIndent}${line}\n`;
      }
    } else {
      if (bodyLines.length > 0) {
        formatted += `${bullet}${bodyLines[0]}\n`;
        for (let i = 1; i < bodyLines.length; i++) {
          formatted += `${bodyIndent}${bodyLines[i]}\n`;
        }
      }
    }
    formatted += '\n';
  }
  
  // Parse replies recursively
  if (data.replies && data.replies.kind === 'Listing' && data.replies.data && data.replies.data.children) {
    const repliesList = data.replies.data.children;
    for (const reply of repliesList) {
      formatted += parseComment(reply, depth + 1, options);
    }
  }
  
  return formatted;
}

// Format entire markdown string and copy it
async function processAndCopy(post, comments, options) {
  commentCount = 0;
  
  // Extract post details with safe fallbacks
  const title = decodeHtmlEntities(post.title || '[No Title]');
  const selftext = decodeHtmlEntities(post.selftext || '');
  const subreddit = post.subreddit || 'subreddit';
  const author = post.author || '[deleted]';
  const score = post.score !== undefined ? post.score : 0;
  const num_comments = post.num_comments !== undefined ? post.num_comments : 0;
  const permalink = post.permalink || '';
  
  // 1. Post title and meta
  let md = `# ${title}\n`;
  
  let postMeta = [];
  postMeta.push(`r/${subreddit}`);
  if (options.includeAuthor) {
    postMeta.push(`Posted by u/${author}`);
  }
  if (options.includeScore) {
    postMeta.push(`Score: ${score}`);
  }
  if (post.num_comments !== undefined) {
    postMeta.push(`Comments: ${num_comments}`);
  }
  if (post.created_utc) {
    postMeta.push(getRelativeTime(post.created_utc));
  }
  
  md += `*${postMeta.join(' • ')}*\n\n`;
  
  // 2. Post body
  if (selftext) {
    md += `${selftext}\n\n`;
  }
  
  // 3. Source Link
  if (options.includeSource && permalink) {
    md += `🔗 **Source**: [View Original Reddit Thread](https://www.reddit.com${permalink})\n\n`;
  }
  
  md += `---\n\n`;
  md += `## Comments\n\n`;
  
  // 4. Comments list recursive compilation with dividers
  if (comments && comments.length > 0) {
    let first = true;
    for (const comment of comments) {
      if (comment.kind === 't1') {
        if (!first) {
          md += `---\n\n`;
        }
        md += parseComment(comment, 0, options);
        first = false;
      }
    }
  } else {
    md += '*No comments found.*\n';
  }
  
  // Copy to clipboard
  const success = await copyToClipboard(md);
  
  if (success) {
    document.getElementById('success-subtitle').textContent = `Copied post and ${commentCount} comments. Ready to paste!`;
    showState('success');
  } else {
    document.getElementById('error-title').textContent = 'Copy Failed';
    document.getElementById('error-subtitle').textContent = 'Unable to write to clipboard. Please grant permission.';
    showState('error');
  }
}

// Core execution function
async function runExtraction() {
  try {
    updateLoading('Detecting Page...', 'Locating active browser tab');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      throw new Error('No active browser tab found.');
    }
    
    // Validate Reddit URL
    // Matches reddit.com/r/subreddit/comments/id/title/ or reddit.com/comments/id/ etc.
    const redditRegex = /https:\/\/(?:[a-z0-9-]+\.)?reddit\.com\/(?:r\/[a-zA-Z0-9_]+\/)?comments\/([a-zA-Z0-9]+)/i;
    const match = tab.url.match(redditRegex);
    
    if (!match) {
      document.getElementById('error-title').textContent = 'Not on Reddit';
      document.getElementById('error-subtitle').textContent = 'Open a Reddit comment thread (post) and click the extension again.';
      showState('error');
      
      // Update footer
      document.getElementById('footer-text').textContent = 'Extraction unavailable';
      return;
    }
    
    // Update footer with subreddit name if available
    const subMatch = tab.url.match(/reddit\.com\/r\/([a-zA-Z0-9_]+)/i);
    const subName = subMatch ? `r/${subMatch[1]}` : 'Reddit';
    document.getElementById('footer-text').textContent = `Subreddit: ${subName}`;
    
    updateLoading('Fetching Thread...', 'Retrieving comments from Reddit API');
    
    // Prepare JSON URL (strip query parameters and append .json)
    const urlObj = new URL(tab.url);
    const jsonUrl = `${urlObj.origin}${urlObj.pathname}.json`;
    
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch thread data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length < 2) {
      throw new Error('Reddit returned invalid thread data.');
    }
    
    const post = data[0]?.data?.children[0]?.data;
    const comments = data[1]?.data?.children;
    
    if (!post) {
      throw new Error('Unable to parse post content.');
    }
    
    // Store globally for quick settings adjustments
    currentThreadData = { post, comments };
    
    updateLoading('Formatting Text...', 'Compiling Markdown and writing to clipboard');
    
    const options = await loadSettings();
    await processAndCopy(post, comments, options);
    
  } catch (err) {
    console.error('Reddit Thread Grabber Error:', err);
    document.getElementById('error-title').textContent = 'Extraction Failed';
    document.getElementById('error-subtitle').textContent = err.message || 'An unexpected error occurred.';
    showState('error');
    document.getElementById('footer-text').textContent = 'Error occurred';
  }
}

// Bind event listeners
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  await loadSettings();
  
  // Set up settings save listeners
  document.getElementById('select-depth').addEventListener('change', saveSettings);
  document.querySelectorAll('input[name="format-style"]').forEach(el => {
    el.addEventListener('change', saveSettings);
  });
  document.getElementById('chk-author').addEventListener('change', saveSettings);
  document.getElementById('chk-score').addEventListener('change', saveSettings);
  document.getElementById('chk-timestamp').addEventListener('change', saveSettings);
  document.getElementById('chk-source').addEventListener('change', saveSettings);
  
  // Buttons
  document.getElementById('btn-copy-again').addEventListener('click', async () => {
    if (currentThreadData) {
      const options = await loadSettings();
      updateLoading('Copying...', 'Writing to clipboard');
      await processAndCopy(currentThreadData.post, currentThreadData.comments, options);
    }
  });
  
  document.getElementById('btn-retry').addEventListener('click', runExtraction);
  
  // Initial run
  await runExtraction();
});
