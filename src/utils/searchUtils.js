/**
 * Search Utilities for RecallX
 * Performs keyword search across memory records and provides text highlighting
 */

/**
 * Filter and search memories by search term, type, tag, and sort order
 * @param {Array} memories List of memory records
 * @param {string} query Search query string
 * @param {object} options Filter and sort options: { type, tag, sortBy }
 * @returns {Array} Filtered and sorted memories with match details
 */
export function filterAndSearchMemories(memories = [], query = '', options = {}) {
  const { type = 'all', tag = '', sortBy = 'newest' } = options;
  const cleanQuery = query.trim().toLowerCase();
  const searchTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  let results = memories.filter((mem) => {
    // 1. Filter by memory type
    if (type && type !== 'all' && mem.type !== type) {
      return false;
    }

    // 2. Filter by tag
    if (tag) {
      const memTags = Array.isArray(mem.tags) ? mem.tags : [];
      const hasTag = memTags.some(t => t.toLowerCase() === tag.toLowerCase());
      if (!hasTag) return false;
    }

    // 3. If no query tokens, pass filter
    if (searchTokens.length === 0) {
      return true;
    }

    // 4. Keyword search across title, description, tags, extractedText, content, url
    const titleText = (mem.title || '').toLowerCase();
    const descText = (mem.description || '').toLowerCase();
    const tagsText = (Array.isArray(mem.tags) ? mem.tags.join(' ') : (mem.tags || '')).toLowerCase();
    const contentText = (mem.content || '').toLowerCase();
    const extractedText = (mem.extractedText || '').toLowerCase();
    const urlText = (mem.url || '').toLowerCase();

    // Check if ALL query tokens match at least one field (AND condition for precision)
    return searchTokens.every((token) => {
      return (
        titleText.includes(token) ||
        descText.includes(token) ||
        tagsText.includes(token) ||
        contentText.includes(token) ||
        extractedText.includes(token) ||
        urlText.includes(token)
      );
    });
  });

  // Sort results
  results.sort((a, b) => {
    if (sortBy === 'oldest') {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    }
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    // Default: newest
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return results;
}

/**
 * Escapes regex special characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights matches of query within a text string using React-friendly segment array
 * @param {string} text Text to highlight
 * @param {string} query Search query string
 * @returns {Array<{text: string, match: boolean}>}
 */
export function getHighlightedParts(text = '', query = '') {
  if (!text) return [];
  if (!query || !query.trim()) {
    return [{ text, match: false }];
  }

  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [{ text, match: false }];

  const regexPattern = `(${tokens.map(escapeRegExp).join('|')})`;
  const regex = new RegExp(regexPattern, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        match: false,
      });
    }
    parts.push({
      text: match[0],
      match: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      match: false,
    });
  }

  return parts;
}

/**
 * Collect all unique tags and their count from memories
 */
export function extractUniqueTags(memories = []) {
  const tagCounts = {};
  memories.forEach((mem) => {
    if (Array.isArray(mem.tags)) {
      mem.tags.forEach((t) => {
        const clean = t.trim();
        if (clean) {
          tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
