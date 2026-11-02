// Global Zero-Config Cloud Sync Backend
// Completely free, requires no tokens, no login setup by end-users.
// Anyone can create an account with just a name and receive a unique Sync Code!

const CLOUD_API_BASE = 'https://api.restful-api.dev/objects'

export interface CloudSession {
  accountName: string
  syncCode: string // Cloud storage object ID
  lastSyncedAt?: string
}

export function getActiveSession(): CloudSession | null {
  try {
    const saved = localStorage.getItem('vithang_cloud_session')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

let syncTimeout: any = null

/** Auto background sync debounce (runs automatically in background whenever data changes) */
export function triggerAutoSync(data: any) {
  const session = getActiveSession()
  if (!session) return // Not connected to cloud, skip

  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(async () => {
    try {
      await uploadCloudData(session.syncCode, session.accountName, data)
      const updated: CloudSession = {
        ...session,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
      }
      localStorage.setItem('vithang_cloud_session', JSON.stringify(updated))
      console.log('Auto cloud sync completed:', updated.lastSyncedAt)
    } catch (e) {
      console.warn('Auto cloud sync background error:', e)
    }
  }, 1000) // Wait 1 second after typing stops to sync
}

export async function registerCloudAccount(username: string, data: any): Promise<string> {
  const payload = {
    name: `vithang_${username.trim()}`,
    data: {
      username: username.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finances: data,
    },
  }

  const res = await fetch(CLOUD_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Không thể kết nối đến máy chủ đám mây')
  }

  const created = await res.json()
  return created.id // The unique Sync Code
}

export async function uploadCloudData(syncCode: string, username: string, data: any): Promise<void> {
  const payload = {
    name: `vithang_${username.trim()}`,
    data: {
      username: username.trim(),
      updatedAt: new Date().toISOString(),
      finances: data,
    },
  }

  const res = await fetch(`${CLOUD_API_BASE}/${syncCode}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Đồng bộ thất bại, vui lòng kiểm tra lại Mã đồng bộ')
  }
}

export async function downloadCloudData(syncCode: string): Promise<{ username: string; data: any; updatedAt: string }> {
  const res = await fetch(`${CLOUD_API_BASE}/${syncCode}?t=${Date.now()}`)

  if (!res.ok) {
    throw new Error('Mã đồng bộ không chính xác hoặc tài khoản không tồn tại')
  }

  const result = await res.json()
  if (!result.data || !result.data.finances) {
    throw new Error('Không tìm thấy dữ liệu tài chính trong tài khoản này')
  }

  return {
    username: result.data.username || result.name?.replace('vithang_', '') || 'Người dùng',
    data: result.data.finances,
    updatedAt: result.data.updatedAt || new Date().toISOString(),
  }
}
