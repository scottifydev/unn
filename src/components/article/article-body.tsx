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
        [&>p]:mb-5
        [&>h2]:font-cinzel [&>h2]:font-bold [&>h2]:text-paper [&>h2]:text-xl [&>h2]:mt-8 [&>h2]:mb-4
        ${
          dropCap
            ? "[&>p:first-of-type]:first-letter:font-cinzel [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-[4.2em] [&>p:first-of-type]:first-letter:text-garnet-bright [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-2 [&>p:first-of-type]:first-letter:leading-[0.8]"
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
