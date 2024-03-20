import { Code } from '@nextui-org/react';
import Markdown from 'markdown-to-jsx';

export function MarkdownWrapper({ content }: { content: string }) {
  return (
    <Markdown
      options={{
        overrides: {
          h1: {
            component: H1,
          },
          h2: {
            component: H2,
          },
          p: {
            component: P,
          },
          a: {
            component: A,
          },
          pre: {
            component: Pre,
          },
          ul: {
            component: Ul,
          },
          li: {
            component: Li,
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
}

type Props = { children: React.ReactNode } & Record<string, unknown>;

const H1 = ({ children, ...restProps }: Props) => (
  <h2 {...restProps} className="mt-6 mb-2 text-xl font-semibold">
    {children}
  </h2>
);

const H2 = ({ children, ...restProps }: Props) => (
  <h2 {...restProps} className="mt-6 mb-2 text-lg font-semibold">
    {children}
  </h2>
);

const P = ({ children, ...restProps }: Props) => (
  <p {...restProps} className="mb-2 text-md">
    {children}
  </p>
);

const A = ({ children, ...restProps }: Props) => (
  <a
    {...restProps}
    className="text-blue-500 dark:text-blue-400 hover:text-blue-600 underline cursor-pointer"
  >
    {children}
  </a>
);

const Pre = ({ children, ...restProps }: Props) => (
  <Code
    {...restProps}
    className="mb-2 p-4 pr-24 text-sm whitespace-pre-wrap rounded-md"
  >
    {children}
  </Code>
);

const Ul = ({ children, ...restProps }: Props) => (
  <ul {...restProps} className="mb-2">
    {children}
  </ul>
);

const Li = ({ children, ...restProps }: Props) => (
  <li {...restProps}>
    <span className="mx-4">•</span>
    {children}
  </li>
);
