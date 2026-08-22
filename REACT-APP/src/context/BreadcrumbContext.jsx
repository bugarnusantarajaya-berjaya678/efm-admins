import { createContext, useContext, useState } from 'react'

const BreadcrumbContext = createContext({ crumbs: null, setCrumbs: () => {} })

export function BreadcrumbProvider({ children }) {
  const [crumbs, setCrumbs] = useState(null)
  return (
    <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() { return useContext(BreadcrumbContext) }
