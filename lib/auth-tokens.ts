type StorageProvider = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const safeWindow: any = typeof window !== 'undefined' ? window : null
const local: StorageProvider | null = safeWindow?.localStorage ?? null
const session: StorageProvider | null = safeWindow?.sessionStorage ?? null

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const REMEMBER_KEY = 'rememberMe'

const getStore = (remember?: boolean): StorageProvider | null => {
  if (remember === undefined) {
    // infer
    const remembered = local?.getItem(REMEMBER_KEY) === 'true'
    return remembered ? local : session
  }
  return remember ? local : session
}

export const setTokens = (opts: { accessToken: string; refreshToken?: string; remember?: boolean }) => {
  const store = getStore(opts.remember)
  const otherStore = opts.remember ? session : local
  if (!store) return
  store.setItem(ACCESS_KEY, opts.accessToken)
  if (opts.refreshToken) store.setItem(REFRESH_KEY, opts.refreshToken)
  store.setItem(REMEMBER_KEY, String(!!opts.remember))
  // clear from other storage to avoid stale
  otherStore?.removeItem(ACCESS_KEY)
  otherStore?.removeItem(REFRESH_KEY)
  otherStore?.removeItem(REMEMBER_KEY)
}

export const getAccessToken = (): string | null => {
  const remembered = local?.getItem(REMEMBER_KEY) === 'true'
  const store = remembered ? local : session
  return store?.getItem(ACCESS_KEY) || null
}

export const getRefreshToken = (): string | null => {
  const remembered = local?.getItem(REMEMBER_KEY) === 'true'
  const store = remembered ? local : session
  return store?.getItem(REFRESH_KEY) || null
}

export const clearTokens = () => {
  local?.removeItem(ACCESS_KEY)
  local?.removeItem(REFRESH_KEY)
  local?.removeItem(REMEMBER_KEY)
  session?.removeItem(ACCESS_KEY)
  session?.removeItem(REFRESH_KEY)
  session?.removeItem(REMEMBER_KEY)
}

