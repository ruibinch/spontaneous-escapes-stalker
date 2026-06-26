import { CommonStyles } from '../common/styles';

export function SectionHeader({
  header,
  subtitle,
}: {
  header: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className={CommonStyles.SectionTitle}>{header}</h2>
      {subtitle && (
        <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
