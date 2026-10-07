import type { CodeLine, LineChange, SpecimenFile } from '../../types'
import { FILE as rootLayout } from './root-layout'
import { FILE as dashboardLayout } from './dashboard-layout'
import { FILE as dashboardNav } from './dashboard-nav'
import { FILE as settingsPage } from './settings-page'
import { FILE as accountSummary } from './account-summary'
import { FILE as profileForm } from './profile-form'
import { FILE as actions } from './actions'
import { FILE as data } from './data'
import { FILE as billingPage } from './billing-page'
import { FILE as invoiceList } from './invoice-list'
import { FILE as proxy } from './proxy'
import { FILE as nextConfig } from './next-config'
import { FILE as customServer } from './custom-server'
import { FILE as pagesApp } from './pages-app'
import { FILE as pagesDocument } from './pages-document'
import { FILE as productPage } from './product-page'
import { FILE as postPage } from './post-page'
import { FILE as apiHello } from './api-hello'
import { FILE as settingsInlineAction } from './settings-inline-action'
import { FILE as settingsDynamic } from './settings-dynamic'
import { FILE as profileFormBarrel } from './profile-form-barrel'
import { FILE as actionsSwr } from './actions-swr'
import { FILE as billingCookiesUp } from './billing-cookies-up'
import { FILE as productInitialProps } from './product-initial-props'
import { FILE as themeProvider } from './theme-provider'
import { FILE as dashboardNavEdits } from './dashboard-nav-edits'
import { FILE as accountSummaryEdit } from './account-summary-edit'
import { FILE as actionsRedirect } from './actions-redirect'
import { FILE as billingLoading } from './billing-loading'
import { FILE as customServerRender } from './custom-server-render'
import { FILE as nextConfigFileRoutes } from './next-config-file-routes'

export { FATES } from './fates'

/** docs/code-lens.md §4: the sample app, every line colored once; the App Router files J0 uses first, then the rest of the app, then the what-if variants */
export const SPECIMEN: SpecimenFile[] = [
  rootLayout, dashboardLayout, dashboardNav, settingsPage, accountSummary, profileForm, actions, data, billingPage, invoiceList,
  proxy, nextConfig, customServer, pagesApp, themeProvider, pagesDocument, productPage, postPage, apiHello,
  settingsInlineAction, settingsDynamic, profileFormBarrel, actionsSwr, billingCookiesUp, productInitialProps,
  dashboardNavEdits, accountSummaryEdit, actionsRedirect, billingLoading, customServerRender, nextConfigFileRoutes
]

/** the lines inside DashboardNav's <nav>: the button and the two links its HTML renders */
export const DN_NAV = ['DN9', 'DN10', 'DN11', 'DN12']
/** the lines inside ProfileForm's <form>: the input and the Save button its HTML renders */
export const PF_FORM = ['PF7', 'PF8', 'PF9']

const LINES = new Map(SPECIMEN.flatMap((f) => f.lines.map((l) => [l.id, l] as const)))

/** specimen lines shown as written, colored once: the usual first pane of a lens step */
export const source = (ids: string[], change?: LineChange): CodeLine[] => ids.map((id) => {
  const l = LINES.get(id)
  if (!l) throw new Error(`no specimen line ${id}`)
  return { text: l.text, from: [id], fate: l.fate, mark: l.mark, change }
})
