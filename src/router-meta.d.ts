import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    focus?: boolean
    title?: string
  }
}
