import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/States'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

// Shown to agents on admin-only pages (Settings, AI & Workflows, Channels).
export function NoAccess({ title, testId = 'settings-no-access' }: { title: string; testId?: string }) {
  return (
    <div className="space-y-8" data-testid={testId}>
      <PageHeader title={title} />
      <Card>
        <EmptyState
          title={`You don't have access to ${title}`}
          description={`${title} is limited to admins. Ask an admin if you need something changed.`}
          icon={<ShieldOff className="h-6 w-6" aria-hidden />}
          action={<Link to="/dashboard" className={buttonVariants({ variant: 'outline' })} data-testid="no-access-back-dashboard">Back to Dashboard</Link>}
          testId="no-access-state"
        />
      </Card>
    </div>
  )
}
