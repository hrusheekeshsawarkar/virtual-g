"use client"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface FormattedMessageProps {
  content: string
  className?: string
}

export function FormattedMessage({ content, className }: FormattedMessageProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Custom styling for markdown elements
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed text-sm sm:text-base">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-white/90">
            {children}
          </em>
        ),
        code: ({ children, className }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            )
          }
          return (
            <code className="block bg-white/10 text-white/90 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre">
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-white/10 text-white/90 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-white/30 pl-4 my-2 text-white/80 italic">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1 text-sm">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1 text-sm">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-white/90">
            {children}
          </li>
        ),
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-white mb-2 mt-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-white mb-2 mt-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-white mb-1 mt-1">
            {children}
          </h3>
        ),
        a: ({ children, href }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 underline"
          >
            {children}
          </a>
        ),
        hr: () => (
          <hr className="border-white/20 my-3" />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border-collapse border border-white/20">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-white/10">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody>
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-white/10">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="border border-white/20 px-3 py-2 text-left text-xs font-semibold text-white">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-white/20 px-3 py-2 text-xs text-white/90">
            {children}
          </td>
        ),
              }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
