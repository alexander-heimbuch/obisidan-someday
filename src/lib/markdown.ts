import { remark } from 'remark';
import type { Plugin } from 'unified';
import remarkParse from 'remark-parse';
// @ts-ignore: No type definitions available for this module
import remarkWikiLink from 'remark-wiki-link';
import remarkGfm from 'remark-gfm';
import { Root } from 'remark-parse/lib';
import remarkStringify from 'remark-stringify';
import { get } from 'lodash-es';
import { Node } from 'unified/lib';

export function filterFinishedItems() {
  return function (tree: Root) {
    tree.children = tree.children
      .filter((child) => child.type === 'list')
      .map((child) => ({
        ...child,
        children: get(child, ['children'], []).filter(
          (child: Node & { checked?: boolean }) => child.type === 'listItem' && child.checked === false
        )
      }));
  };
}

export function updateMovedItems(input: string) {
  return input.replace(/(?![-*]\s)\[\s\]/g, '[>]')
}

export const transform = (input: string, ...plugins: Plugin[]): Promise<string> =>
  remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikiLink)
    .use(plugins)
    .use(remarkStringify)
    .process(input)
    .then(({ value }) => value as string);
