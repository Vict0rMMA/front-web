import { STATUS_CONFIG } from '@/lib/utils';
import type { TicketStatus } from '@/types';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { classes, dot } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
