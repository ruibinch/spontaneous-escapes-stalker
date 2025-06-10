import { Link } from '@heroui/react';
import { AlertNotification } from '../common/alert-notification';
import { MarkdownWrapper } from '../common/markdown-wrapper';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';

export function HelpContent({ content }: { content: string }) {
  return (
    <div>
      <PageHeader title="Help" />

      <div className="max-w-[90rem] pb-8 px-4 lg:px-6">
        <AlertNotification
          style="flex-row mt-6"
          content={
            <>
              <span>🔔</span>
              <span className="text-md">
                {`For upcoming SE releases, you can subscribe to the `}
                <Link
                  href={'https://t.me/kfspontaneousescapes'}
                  target="_blank"
                  underline="always"
                  className={CommonStyles.Link}
                >
                  {'KFSpontaneousEscapes Telegram channel'}
                </Link>
                {', where a notification will be sent upon an update on '}
                <Link
                  href={
                    'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/'
                  }
                  target="_blank"
                  underline="always"
                  className={CommonStyles.Link}
                >
                  {"SIA's SE page"}
                </Link>
                {'.'}
              </span>
            </>
          }
        />

        <MarkdownWrapper content={content} />
      </div>
    </div>
  );
}
