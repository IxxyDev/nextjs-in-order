/** the specimen app's build and response artifacts every lens quotes alike (experience-architecture.md §2, stable artifact values) */

/** updateProfile's action ID, truncated as on the canvas */
export const ACTION_ID = '603a9c1e2b44…'

/** DashboardNav's browser chunk, as a static/chunks/ listing names it */
export const NAV_CHUNK_NAME = 'app/dashboard/layout-3c4d.js'
/** DashboardNav's browser chunk, as the client-reference manifest and the 1:I row name it */
export const NAV_CHUNK = `static/chunks/${NAV_CHUNK_NAME}`

/** the Flight rows of GET /dashboard/settings, exactly as j0-7 writes them: 1:I DashboardNav, 2:I ProfileForm, 0: the root */
export const REF_NAV = `1:I[…,["${NAV_CHUNK}"],"default"]`
export const REF_FORM = '2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]'
export const ROOT_ROW = '0:{"P":…,"c":["","dashboard","settings"],"q":"","i":false,"f":[[["",{…}],…,…,false]],"S":true,…,"b":"k7Qm2xLp9"}'

/** the 1:I row as the HTML document carries it: a string pushed to self.__next_f */
export const REF_NAV_SCRIPT = `<script>self.__next_f.push([1,${JSON.stringify(`${REF_NAV}\n…`)}])</script>`

/** the Pages Router product page's browser chunk (illustrative, in the style of §2) */
export const PRODUCT_CHUNK = 'static/chunks/pages/products/[id]-6e7f.js'
