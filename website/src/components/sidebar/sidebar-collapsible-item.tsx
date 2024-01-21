'use client';
import { Accordion, AccordionItem, Input } from '@nextui-org/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { ChevronUpIcon } from '../icons/chevron-up';
import { SearchIcon } from '../icons/search';

interface Props {
  title: string;
  items: Array<{
    label: string;
    value: string;
    keywords: string[];
  }>;
  filterPlaceholder: string;
}

export const SidebarCollapsibleItem = ({
  items,
  title,
  filterPlaceholder,
}: Props) => {
  const [filterValue, setFilterValue] = useState<string>('');

  const itemsFiltered = items.filter(({ label, value, keywords }) => {
    if (filterValue === '') return true;

    const filterValueRegex = new RegExp(filterValue.toLowerCase(), 'g');
    return (
      filterValueRegex.test(label.toLowerCase()) ||
      filterValueRegex.test(value.toLowerCase()) ||
      keywords.some((keyword) => filterValueRegex.test(keyword.toLowerCase()))
    );
  });

  return (
    <div className="flex gap-4 h-full items-center cursor-pointer">
      <Accordion className="px-0">
        <AccordionItem
          indicator={<ChevronUpIcon />}
          classNames={{
            indicator: 'data-[open=true]:-rotate-180',
            trigger:
              'py-0 min-h-[44px] hover:bg-default-100 rounded-xl active:scale-[0.98] transition-transform px-3.5',
            title:
              'px-0 flex text-base gap-2 h-full items-center cursor-pointer',
          }}
          title={
            <div className="flex flex-row gap-2">
              <span>{title}</span>
            </div>
          }
          textValue={title}
        >
          <div className="flex flex-col gap-2">
            <Input
              placeholder={filterPlaceholder}
              size="sm"
              variant="underlined"
              value={filterValue}
              onValueChange={setFilterValue}
              startContent={<SearchIcon className="text-foreground-500" />}
              classNames={{
                mainWrapper: 'px-4',
                inputWrapper: 'h-8',
              }}
            />

            <div className="pl-12">
              {itemsFiltered.map((item) => (
                <NextLink key={item.value} href={`/month/${item.value}`}>
                  <span className="w-full flex text-default-500 hover:text-default-900 transition-colors">
                    {item.label}
                  </span>
                </NextLink>
              ))}
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
