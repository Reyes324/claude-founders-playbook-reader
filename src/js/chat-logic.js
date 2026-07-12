(function (root) {
  'use strict';

  var IDLE_THRESHOLD_MS = 30 * 60 * 1000;

  function stripTags(html) {
    return String(html == null ? '' : html).replace(/<[^>]+>/g, '');
  }

  function buildBookPlainText(chapters) {
    var lines = [];
    (chapters || []).forEach(function (ch) {
      lines.push('## ' + ch.title);
      lines.push('');
      (ch.blocks || []).forEach(function (b) {
        if (b.type === 'p') {
          lines.push(stripTags(b.text));
          lines.push('');
        } else if (b.type === 'callout') {
          lines.push('【' + stripTags(b.title || '') + '】');
          (b.paras || []).forEach(function (p) {
            lines.push(stripTags(p));
          });
          lines.push('');
        }
        // 'img' blocks carry no text and are intentionally skipped
      });
    });
    return lines.join('\n').trim();
  }

  function shouldStartNewSession(lastMessageTs, nowTs, idleMs) {
    if (idleMs === undefined) idleMs = IDLE_THRESHOLD_MS;
    if (lastMessageTs === null || lastMessageTs === undefined) return true;
    return (nowTs - lastMessageTs) > idleMs;
  }

  function parseSSELine(line) {
    if (typeof line !== 'string' || line.indexOf('data: ') !== 0) {
      return { done: false, delta: null };
    }
    var payload = line.slice(6);
    if (payload === '[DONE]') {
      return { done: true, delta: null };
    }
    try {
      var parsed = JSON.parse(payload);
      var delta =
        parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].delta
          ? parsed.choices[0].delta.content
          : null;
      return { done: false, delta: delta || null };
    } catch (e) {
      return { done: false, delta: null };
    }
  }

  function buildGroundingInstructions(bookTitle) {
    return [
      '你是《' + bookTitle + '》这本书的阅读助手。',
      '只根据下面提供的全书正文回答问题。',
      '如果书中没有提到用户问题相关的内容，明确说"书中没有提到这一点"，不要用书外的知识编造或强行凑答案。',
      '不要编造引用或书中不存在的情节。',
    ].join('\n');
  }

  var STYLE_INSTRUCTIONS = [
    'Respond directly without preamble. Do not start with phrases like "Here is...", "Based on...", etc.',
    '',
    '<avoid_excessive_markdown_and_bullet_points>',
    'When writing responses, write in clear, flowing prose using complete paragraphs and',
    'sentences. Use standard paragraph breaks for organization and reserve markdown',
    'primarily for `inline code`, code blocks, and simple headings. Avoid using **bold**',
    'and *italics*.',
    '',
    'DO NOT use ordered lists (1. ...) or unordered lists (*) unless the user explicitly',
    'asks for a list or a step-by-step sequence. Instead, incorporate points naturally',
    'into sentences. Your goal is readable, flowing text, not fragmented bullet points.',
    '</avoid_excessive_markdown_and_bullet_points>',
  ].join('\n');

  function buildSystemPrompt(bookTitle, bookPlainText) {
    return (
      buildGroundingInstructions(bookTitle) +
      '\n\n' +
      STYLE_INSTRUCTIONS +
      '\n\n# 全书正文\n\n' +
      bookPlainText
    );
  }

  var api = {
    stripTags: stripTags,
    buildBookPlainText: buildBookPlainText,
    buildSystemPrompt: buildSystemPrompt,
    shouldStartNewSession: shouldStartNewSession,
    parseSSELine: parseSSELine,
    IDLE_THRESHOLD_MS: IDLE_THRESHOLD_MS,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.ChatLogic = api;
  }
})(typeof window !== 'undefined' ? window : null);
