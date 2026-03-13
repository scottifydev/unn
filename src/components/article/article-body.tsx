interface ArticleBodyProps {
  children: React.ReactNode;
  dropCap?: boolean;
}

interface PullQuoteProps {
  children: React.ReactNode;
}

export function ArticleBody({ children, dropCap = false }: ArticleBodyProps) {
  return (
    <div
      className={`
        font-crimson text-body text-parchment
        [&_p]:mb-7 [&_p]:leading-[1.78]
        [&_h2]:font-cinzel [&_h2]:font-bold [&_h2]:text-paper [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-4
        [&_h3]:font-cinzel [&_h3]:font-semibold [&_h3]:text-paper [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-3
        [&_blockquote]:border-l-2 [&_blockquote]:border-garnet [&_blockquote]:pl-6 [&_blockquote]:my-7 [&_blockquote]:italic [&_blockquote]:text-stone
        [&_ul]:mb-7 [&_ul]:pl-6 [&_ul]:list-disc
        [&_ol]:mb-7 [&_ol]:pl-6 [&_ol]:list-decimal
        [&_li]:mb-2
        [&_strong]:text-paper [&_strong]:font-semibold
        [&_a]:text-garnet-bright [&_a]:underline [&_a]:underline-offset-2
        [&_hr]:border-t [&_hr]:border-seam [&_hr]:my-8
        ${
          dropCap
            ? "[&_p:first-of-type]:first-letter:font-cinzel [&_p:first-of-type]:first-letter:font-black [&_p:first-of-type]:first-letter:text-[4.2em] [&_p:first-of-type]:first-letter:text-garnet-bright [&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:mr-2 [&_p:first-of-type]:first-letter:leading-[0.8]"
            : ""
        }
      `}
    >
      {children}
    </div>
  );
}

export function PullQuote({ children }: PullQuoteProps) {
  return (
    <blockquote className="border-l-2 border-garnet pl-4 my-6 font-cinzel italic text-paper">
      {children}
    </blockquote>
  );
}
