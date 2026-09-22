import React from 'react';
import Link from 'next/link';
import { Sparkles, Lightbulb, Compass, BookOpen } from 'lucide-react';

interface BlogContentProps {
  content: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Regex to match bold, italic, code, links
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) {
      return (
        <em key={index} className="italic text-[var(--text-primary)]">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-primary)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isInternal = href.startsWith('/');
      if (isInternal) {
        return (
          <Link
            key={index}
            href={href}
            className="text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-4 hover:decoration-[var(--accent)] transition-colors font-medium"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-4 hover:decoration-[var(--accent)] transition-colors font-medium"
        >
          {label}
        </a>
      );
    }
    return token;
  });
}

export function BlogContent({ content }: BlogContentProps) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentBlockquote: string[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const items = currentList.items;
    currentList = null;

    elements.push(
      <ListTag
        key={`list-${keyCounter++}`}
        className={`my-5 space-y-2.5 text-[var(--text-secondary)] text-base md:text-lg leading-relaxed ${
          ListTag === 'ol' ? 'list-decimal pl-6' : 'list-disc pl-6 marker:text-[var(--accent)]'
        }`}
      >
        {items.map((item, idx) => (
          <li key={idx} className="pl-1">
            {parseInline(item)}
          </li>
        ))}
      </ListTag>
    );
  };

  const flushBlockquote = () => {
    if (currentBlockquote.length === 0) return;
    const text = currentBlockquote.join(' ').trim();
    currentBlockquote = [];

    // Check if it's a special callout box
    const isCallout =
      text.startsWith('**Key Takeaway') ||
      text.startsWith('**Lucid Tip') ||
      text.startsWith('**Scientific Note') ||
      text.startsWith('**Reflection Prompt');

    if (isCallout) {
      elements.push(
        <div
          key={`callout-${keyCounter++}`}
          className="my-8 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs flex items-start gap-4"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
            {parseInline(text)}
          </div>
        </div>
      );
    } else {
      elements.push(
        <blockquote
          key={`quote-${keyCounter++}`}
          className="my-8 border-l-2 border-[var(--accent)] pl-6 py-2 italic font-display text-lg md:text-xl text-[var(--text-primary)] leading-relaxed"
        >
          {parseInline(text)}
        </blockquote>
      );
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for Blockquote line
    if (line.startsWith('>')) {
      flushList();
      currentBlockquote.push(line.replace(/^>\s?/, ''));
      continue;
    } else if (currentBlockquote.length > 0) {
      flushBlockquote();
    }

    // Check for Horizontal rule
    if (line === '---' || line === '***') {
      flushList();
      elements.push(
        <hr key={`hr-${keyCounter++}`} className="border-[var(--border-default)] my-10" />
      );
      continue;
    }

    // Check for H2 Heading
    if (line.startsWith('## ')) {
      flushList();
      const titleText = line.replace('## ', '').trim();
      const id = titleText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      elements.push(
        <h2
          key={`h2-${keyCounter++}`}
          id={id}
          className="scroll-mt-28 font-display text-2xl md:text-3xl font-medium text-[var(--text-primary)] mt-12 mb-4 tracking-tight border-b border-[var(--border-default)] pb-2.5"
        >
          {parseInline(titleText)}
        </h2>
      );
      continue;
    }

    // Check for H3 Heading
    if (line.startsWith('### ')) {
      flushList();
      const titleText = line.replace('### ', '').trim();
      const id = titleText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      elements.push(
        <h3
          key={`h3-${keyCounter++}`}
          id={id}
          className="scroll-mt-28 font-display text-xl md:text-2xl font-medium text-[var(--text-primary)] mt-8 mb-3 tracking-tight"
        >
          {parseInline(titleText)}
        </h3>
      );
      continue;
    }

    // Check for Ordered list item: e.g. "1. "
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Check for Unordered list item: e.g. "- " or "* "
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${keyCounter++}`}
        className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-6 font-normal"
      >
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  flushBlockquote();

  return <div className="blog-article-content max-w-none">{elements}</div>;
}
