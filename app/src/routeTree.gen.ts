/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IdImport } from './routes/$id'
import { Route as IdIndexImport } from './routes/$id.index'
import { Route as EndreIdImport } from './routes/endre.$id'
import { Route as IdVisImport } from './routes/$id.vis'
import { Route as IdOppsummeringImport } from './routes/$id.oppsummering'
import { Route as IdKvitteringImport } from './routes/$id.kvittering'
import { Route as IdInntektOgRefusjonImport } from './routes/$id.inntekt-og-refusjon'
import { Route as IdDineOpplysningerImport } from './routes/$id.dine-opplysninger'

// Create/Update Routes

const IdRoute = IdImport.update({
  path: '/$id',
  getParentRoute: () => rootRoute,
} as any)

const IdIndexRoute = IdIndexImport.update({
  path: '/',
  getParentRoute: () => IdRoute,
} as any)

const EndreIdRoute = EndreIdImport.update({
  path: '/endre/$id',
  getParentRoute: () => rootRoute,
} as any)

const IdVisRoute = IdVisImport.update({
  path: '/vis',
  getParentRoute: () => IdRoute,
} as any)

const IdOppsummeringRoute = IdOppsummeringImport.update({
  path: '/oppsummering',
  getParentRoute: () => IdRoute,
} as any)

const IdKvitteringRoute = IdKvitteringImport.update({
  path: '/kvittering',
  getParentRoute: () => IdRoute,
} as any)

const IdInntektOgRefusjonRoute = IdInntektOgRefusjonImport.update({
  path: '/inntekt-og-refusjon',
  getParentRoute: () => IdRoute,
} as any)

const IdDineOpplysningerRoute = IdDineOpplysningerImport.update({
  path: '/dine-opplysninger',
  getParentRoute: () => IdRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/$id': {
      id: '/$id'
      path: '/$id'
      fullPath: '/$id'
      preLoaderRoute: typeof IdImport
      parentRoute: typeof rootRoute
    }
    '/$id/dine-opplysninger': {
      id: '/$id/dine-opplysninger'
      path: '/dine-opplysninger'
      fullPath: '/$id/dine-opplysninger'
      preLoaderRoute: typeof IdDineOpplysningerImport
      parentRoute: typeof IdImport
    }
    '/$id/inntekt-og-refusjon': {
      id: '/$id/inntekt-og-refusjon'
      path: '/inntekt-og-refusjon'
      fullPath: '/$id/inntekt-og-refusjon'
      preLoaderRoute: typeof IdInntektOgRefusjonImport
      parentRoute: typeof IdImport
    }
    '/$id/kvittering': {
      id: '/$id/kvittering'
      path: '/kvittering'
      fullPath: '/$id/kvittering'
      preLoaderRoute: typeof IdKvitteringImport
      parentRoute: typeof IdImport
    }
    '/$id/oppsummering': {
      id: '/$id/oppsummering'
      path: '/oppsummering'
      fullPath: '/$id/oppsummering'
      preLoaderRoute: typeof IdOppsummeringImport
      parentRoute: typeof IdImport
    }
    '/$id/vis': {
      id: '/$id/vis'
      path: '/vis'
      fullPath: '/$id/vis'
      preLoaderRoute: typeof IdVisImport
      parentRoute: typeof IdImport
    }
    '/endre/$id': {
      id: '/endre/$id'
      path: '/endre/$id'
      fullPath: '/endre/$id'
      preLoaderRoute: typeof EndreIdImport
      parentRoute: typeof rootRoute
    }
    '/$id/': {
      id: '/$id/'
      path: '/'
      fullPath: '/$id/'
      preLoaderRoute: typeof IdIndexImport
      parentRoute: typeof IdImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IdRoute: IdRoute.addChildren({
    IdDineOpplysningerRoute,
    IdInntektOgRefusjonRoute,
    IdKvitteringRoute,
    IdOppsummeringRoute,
    IdVisRoute,
    IdIndexRoute,
  }),
  EndreIdRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/$id",
        "/endre/$id"
      ]
    },
    "/$id": {
      "filePath": "$id.tsx",
      "children": [
        "/$id/dine-opplysninger",
        "/$id/inntekt-og-refusjon",
        "/$id/kvittering",
        "/$id/oppsummering",
        "/$id/vis",
        "/$id/"
      ]
    },
    "/$id/dine-opplysninger": {
      "filePath": "$id.dine-opplysninger.tsx",
      "parent": "/$id"
    },
    "/$id/inntekt-og-refusjon": {
      "filePath": "$id.inntekt-og-refusjon.tsx",
      "parent": "/$id"
    },
    "/$id/kvittering": {
      "filePath": "$id.kvittering.tsx",
      "parent": "/$id"
    },
    "/$id/oppsummering": {
      "filePath": "$id.oppsummering.tsx",
      "parent": "/$id"
    },
    "/$id/vis": {
      "filePath": "$id.vis.tsx",
      "parent": "/$id"
    },
    "/endre/$id": {
      "filePath": "endre.$id.tsx"
    },
    "/$id/": {
      "filePath": "$id.index.tsx",
      "parent": "/$id"
    }
  }
}
ROUTE_MANIFEST_END */
