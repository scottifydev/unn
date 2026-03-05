import type { Json } from "@/lib/supabase/database.types";

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
}

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapRendererProps {
  content: Json;
}

function renderMarks(text: string, marks: TiptapMark[]): React.ReactNode {
  let node: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong>{node}</strong>;
        break;
      case "italic":
        node = <em>{node}</em>;
        break;
      case "code":
        node = (
          <code className="rounded bg-graphite px-1.5 py-0.5 font-mono text-sm text-parchment">
            {node}
          </code>
        );
        break;
      case "link": {
        const href = (mark.attrs?.href as string) ?? "#";
        node = (
          <a
            href={href}
            target={mark.attrs?.target as string | undefined}
            rel="noopener noreferrer"
            className="text-garnet-bright underline decoration-garnet-bright/40 transition-colors hover:text-paper"
          >
            {node}
          </a>
        );
        break;
      }
    }
  }

  return node;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  if (node.type === "text") {
    if (!node.text) return null;
    if (node.marks && node.marks.length > 0) {
      return (
        <span key={index}>{renderMarks(node.text, node.marks)}</span>
      );
    }
    return node.text;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      return (
        <p key={index} className="mb-5 font-crimson text-body text-parchment">
          {children}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      if (level === 2) {
        return (
          <h2
            key={index}
            className="mb-4 mt-8 font-cinzel text-xl font-bold text-paper"
          >
            {children}
          </h2>
        );
      }
      return (
        <h3
          key={index}
          className="mb-3 mt-6 font-cinzel text-lg font-bold text-paper"
        >
          {children}
        </h3>
      );
    }

    case "bulletList":
      return (
        <ul
          key={index}
          className="mb-5 ml-6 list-disc space-y-1 font-crimson text-body text-parchment"
        >
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={index}
          className="mb-5 ml-6 list-decimal space-y-1 font-crimson text-body text-parchment"
        >
          {children}
        </ol>
      );

    case "listItem":
      return <li key={index}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-6 border-l-2 border-garnet pl-4 font-cinzel italic text-paper"
        >
          {children}
        </blockquote>
      );

    case "horizontalRule":
      return (
        <hr
          key={index}
          className="my-8 border-t border-seam"
        />
      );

    case "image": {
      const src = (node.attrs?.src as string) ?? "";
      const alt = (node.attrs?.alt as string) ?? "";
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full rounded"
          />
          {alt && (
            <figcaption className="mt-2 font-barlow text-xs text-stone">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return <>{children}</>;
  }
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  if (!content || typeof content !== "object") return null;

  const doc = content as unknown as TiptapNode;

  if (doc.type !== "doc" || !doc.content) return null;

  return (
    <div className="tiptap-content">
      {doc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
}
