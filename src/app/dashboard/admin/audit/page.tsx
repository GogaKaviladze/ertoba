import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'goga.kaviladze@anthronode.io'

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-white/50 mt-1">Last 200 entries · 12-month retention</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-white/60 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
              <th className="px-4 py-3">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="text-white/80 hover:bg-white/5">
                <td className="px-4 py-3 whitespace-nowrap text-white/50">
                  {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                </td>
                <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{log.userId}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    log.action === 'WRITE' ? 'bg-indigo-500/20 text-indigo-300' :
                    log.action === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{log.entityId ?? '—'}</td>
                <td className="px-4 py-3 text-white/50 text-xs">
                  {log.metadata ? JSON.stringify(log.metadata) : '—'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/30">No audit entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
