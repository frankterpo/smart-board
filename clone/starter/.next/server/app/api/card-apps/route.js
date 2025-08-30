"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/card-apps/route";
exports.ids = ["app/api/card-apps/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcard-apps%2Froute&page=%2Fapi%2Fcard-apps%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcard-apps%2Froute.ts&appDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcard-apps%2Froute&page=%2Fapi%2Fcard-apps%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcard-apps%2Froute.ts&appDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_franciscoterpolilli_Projects_smart_board_clone_starter_app_api_card_apps_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/card-apps/route.ts */ \"(rsc)/./app/api/card-apps/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/card-apps/route\",\n        pathname: \"/api/card-apps\",\n        filename: \"route\",\n        bundlePath: \"app/api/card-apps/route\"\n    },\n    resolvedPagePath: \"/Users/franciscoterpolilli/Projects/smart-board/clone/starter/app/api/card-apps/route.ts\",\n    nextConfigOutput,\n    userland: _Users_franciscoterpolilli_Projects_smart_board_clone_starter_app_api_card_apps_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/card-apps/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZjYXJkLWFwcHMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmNhcmQtYXBwcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNhcmQtYXBwcyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmZyYW5jaXNjb3RlcnBvbGlsbGklMkZQcm9qZWN0cyUyRnNtYXJ0LWJvYXJkJTJGY2xvbmUlMkZzdGFydGVyJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmZyYW5jaXNjb3RlcnBvbGlsbGklMkZQcm9qZWN0cyUyRnNtYXJ0LWJvYXJkJTJGY2xvbmUlMkZzdGFydGVyJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN3QztBQUNySDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2thbmJhbi1jbG9uZS1zdGFydGVyLz9hMjk2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9mcmFuY2lzY290ZXJwb2xpbGxpL1Byb2plY3RzL3NtYXJ0LWJvYXJkL2Nsb25lL3N0YXJ0ZXIvYXBwL2FwaS9jYXJkLWFwcHMvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2NhcmQtYXBwcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NhcmQtYXBwc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvY2FyZC1hcHBzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2ZyYW5jaXNjb3RlcnBvbGlsbGkvUHJvamVjdHMvc21hcnQtYm9hcmQvY2xvbmUvc3RhcnRlci9hcHAvYXBpL2NhcmQtYXBwcy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvY2FyZC1hcHBzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcard-apps%2Froute&page=%2Fapi%2Fcard-apps%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcard-apps%2Froute.ts&appDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/card-apps/route.ts":
/*!************************************!*\
  !*** ./app/api/card-apps/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! zod */ \"(rsc)/./node_modules/zod/v3/types.js\");\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/supabase */ \"(rsc)/./lib/supabase.ts\");\n\n\nconst GetQuery = zod__WEBPACK_IMPORTED_MODULE_1__.object({\n    cardId: zod__WEBPACK_IMPORTED_MODULE_1__.string()\n});\nconst UpsertBody = zod__WEBPACK_IMPORTED_MODULE_1__.object({\n    cardId: zod__WEBPACK_IMPORTED_MODULE_1__.string(),\n    provider: zod__WEBPACK_IMPORTED_MODULE_1__[\"enum\"]([\n        \"dust\",\n        \"openai\",\n        \"aci\"\n    ]),\n    appId: zod__WEBPACK_IMPORTED_MODULE_1__.string().optional(),\n    config: zod__WEBPACK_IMPORTED_MODULE_1__.any().optional()\n});\nasync function GET(req) {\n    const { searchParams } = new URL(req.url);\n    const cardId = searchParams.get(\"cardId\") || \"\";\n    const { cardId: id } = GetQuery.parse({\n        cardId\n    });\n    const { data, error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__.supabase.from(\"card_apps\").select(\"*\").eq(\"card_id\", id);\n    if (error) return new Response(JSON.stringify({\n        error: error.message\n    }), {\n        status: 500\n    });\n    return Response.json({\n        apps: data\n    });\n}\nasync function POST(req) {\n    const body = UpsertBody.parse(await req.json());\n    const { error } = await _lib_supabase__WEBPACK_IMPORTED_MODULE_0__.supabase.from(\"card_apps\").upsert({\n        card_id: body.cardId,\n        provider: body.provider,\n        app_id: body.appId ?? null,\n        config: body.config ?? null\n    });\n    if (error) return new Response(JSON.stringify({\n        error: error.message\n    }), {\n        status: 500\n    });\n    return Response.json({\n        ok: true\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NhcmQtYXBwcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ3dCO0FBQ2tCO0FBRTFDLE1BQU1FLFdBQVdGLHVDQUFRLENBQUM7SUFBRUksUUFBUUosdUNBQVE7QUFBRztBQUMvQyxNQUFNTSxhQUFhTix1Q0FBUSxDQUFDO0lBQUVJLFFBQVFKLHVDQUFRO0lBQUlPLFVBQVVQLHdDQUFNLENBQUM7UUFBQztRQUFPO1FBQVM7S0FBTTtJQUFHUyxPQUFPVCx1Q0FBUSxHQUFHVSxRQUFRO0lBQUlDLFFBQVFYLG9DQUFLLEdBQUdVLFFBQVE7QUFBRztBQUUvSSxlQUFlRyxJQUFJQyxHQUFnQjtJQUN4QyxNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlGLElBQUlHLEdBQUc7SUFDeEMsTUFBTWIsU0FBU1csYUFBYUcsR0FBRyxDQUFDLGFBQWE7SUFDN0MsTUFBTSxFQUFFZCxRQUFRZSxFQUFFLEVBQUUsR0FBR2pCLFNBQVNrQixLQUFLLENBQUM7UUFBRWhCO0lBQU87SUFDL0MsTUFBTSxFQUFFaUIsSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNckIsbURBQVFBLENBQUNzQixJQUFJLENBQUMsYUFBYUMsTUFBTSxDQUFDLEtBQUtDLEVBQUUsQ0FBQyxXQUFXTjtJQUNuRixJQUFJRyxPQUFPLE9BQU8sSUFBSUksU0FBU0MsS0FBS0MsU0FBUyxDQUFDO1FBQUVOLE9BQU9BLE1BQU1PLE9BQU87SUFBQyxJQUFJO1FBQUVDLFFBQVE7SUFBSTtJQUN2RixPQUFPSixTQUFTSyxJQUFJLENBQUM7UUFBRUMsTUFBTVg7SUFBSztBQUNwQztBQUVPLGVBQWVZLEtBQUtuQixHQUFnQjtJQUN6QyxNQUFNb0IsT0FBTzVCLFdBQVdjLEtBQUssQ0FBQyxNQUFNTixJQUFJaUIsSUFBSTtJQUM1QyxNQUFNLEVBQUVULEtBQUssRUFBRSxHQUFHLE1BQU1yQixtREFBUUEsQ0FBQ3NCLElBQUksQ0FBQyxhQUFhWSxNQUFNLENBQUM7UUFBRUMsU0FBU0YsS0FBSzlCLE1BQU07UUFBRUcsVUFBVTJCLEtBQUszQixRQUFRO1FBQUU4QixRQUFRSCxLQUFLekIsS0FBSyxJQUFJO1FBQU1FLFFBQVF1QixLQUFLdkIsTUFBTSxJQUFJO0lBQUs7SUFDbkssSUFBSVcsT0FBTyxPQUFPLElBQUlJLFNBQVNDLEtBQUtDLFNBQVMsQ0FBQztRQUFFTixPQUFPQSxNQUFNTyxPQUFPO0lBQUMsSUFBSTtRQUFFQyxRQUFRO0lBQUk7SUFDdkYsT0FBT0osU0FBU0ssSUFBSSxDQUFDO1FBQUVPLElBQUk7SUFBSztBQUNsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2thbmJhbi1jbG9uZS1zdGFydGVyLy4vYXBwL2FwaS9jYXJkLWFwcHMvcm91dGUudHM/ZTI5OSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tICdAL2xpYi9zdXBhYmFzZSc7XG5cbmNvbnN0IEdldFF1ZXJ5ID0gei5vYmplY3QoeyBjYXJkSWQ6IHouc3RyaW5nKCkgfSk7XG5jb25zdCBVcHNlcnRCb2R5ID0gei5vYmplY3QoeyBjYXJkSWQ6IHouc3RyaW5nKCksIHByb3ZpZGVyOiB6LmVudW0oWydkdXN0Jywnb3BlbmFpJywnYWNpJ10pLCBhcHBJZDogei5zdHJpbmcoKS5vcHRpb25hbCgpLCBjb25maWc6IHouYW55KCkub3B0aW9uYWwoKSB9KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICBjb25zdCBjYXJkSWQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdjYXJkSWQnKSB8fCAnJztcbiAgY29uc3QgeyBjYXJkSWQ6IGlkIH0gPSBHZXRRdWVyeS5wYXJzZSh7IGNhcmRJZCB9KTtcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbSgnY2FyZF9hcHBzJykuc2VsZWN0KCcqJykuZXEoJ2NhcmRfaWQnLCBpZCk7XG4gIGlmIChlcnJvcikgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pLCB7IHN0YXR1czogNTAwIH0pO1xuICByZXR1cm4gUmVzcG9uc2UuanNvbih7IGFwcHM6IGRhdGEgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcTogTmV4dFJlcXVlc3QpIHtcbiAgY29uc3QgYm9keSA9IFVwc2VydEJvZHkucGFyc2UoYXdhaXQgcmVxLmpzb24oKSk7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2NhcmRfYXBwcycpLnVwc2VydCh7IGNhcmRfaWQ6IGJvZHkuY2FyZElkLCBwcm92aWRlcjogYm9keS5wcm92aWRlciwgYXBwX2lkOiBib2R5LmFwcElkID8/IG51bGwsIGNvbmZpZzogYm9keS5jb25maWcgPz8gbnVsbCB9KTtcbiAgaWYgKGVycm9yKSByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSksIHsgc3RhdHVzOiA1MDAgfSk7XG4gIHJldHVybiBSZXNwb25zZS5qc29uKHsgb2s6IHRydWUgfSk7XG59XG5cbiJdLCJuYW1lcyI6WyJ6Iiwic3VwYWJhc2UiLCJHZXRRdWVyeSIsIm9iamVjdCIsImNhcmRJZCIsInN0cmluZyIsIlVwc2VydEJvZHkiLCJwcm92aWRlciIsImVudW0iLCJhcHBJZCIsIm9wdGlvbmFsIiwiY29uZmlnIiwiYW55IiwiR0VUIiwicmVxIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwiZ2V0IiwiaWQiLCJwYXJzZSIsImRhdGEiLCJlcnJvciIsImZyb20iLCJzZWxlY3QiLCJlcSIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJqc29uIiwiYXBwcyIsIlBPU1QiLCJib2R5IiwidXBzZXJ0IiwiY2FyZF9pZCIsImFwcF9pZCIsIm9rIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/card-apps/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase.ts":
/*!*************************!*\
  !*** ./lib/supabase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   logJob: () => (/* binding */ logJob),\n/* harmony export */   supabase: () => (/* binding */ supabase),\n/* harmony export */   upsertCard: () => (/* binding */ upsertCard)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst url = \"https://kaxuzqwvtakbnxrruyvq.supabase.co\";\nconst anonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtheHV6cXd2dGFrYm54cnJ1eXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTMxMTAsImV4cCI6MjA3MjEyOTExMH0.vnRiqMMLKBG2ICYs6SkfcDgI8gOGHzaQ7lBx26iN2qE\";\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(url, anonKey);\nasync function logJob(opts) {\n    const { error } = await supabase.from(\"jobs\").insert({\n        provider: opts.provider,\n        status: opts.status,\n        job_id: opts.job_id,\n        card_id: opts.card_id ?? null,\n        payload: opts.payload ?? null,\n        result: opts.result ?? null,\n        knowledge: opts.knowledge ?? null\n    });\n    if (error) console.error(\"supabase logJob error\", error);\n}\nasync function upsertCard(card) {\n    const { error } = await supabase.from(\"cards\").upsert({\n        id: card.id,\n        title: card.title,\n        list_id: card.listId,\n        position: card.position,\n        description: card.description ?? null\n    });\n    if (error) console.error(\"supabase upsertCard error\", error);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFxRDtBQUVyRCxNQUFNQyxNQUFNQywwQ0FBb0M7QUFDaEQsTUFBTUcsVUFBVUgsa05BQXlDO0FBRWxELE1BQU1LLFdBQVdQLG1FQUFZQSxDQUFDQyxLQUFLSSxTQUFTO0FBSTVDLGVBQWVHLE9BQU9DLElBUTVCO0lBQ0EsTUFBTSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNSCxTQUFTSSxJQUFJLENBQUMsUUFBUUMsTUFBTSxDQUFDO1FBQ3BEQyxVQUFVSixLQUFLSSxRQUFRO1FBQ3ZCQyxRQUFRTCxLQUFLSyxNQUFNO1FBQ25CQyxRQUFRTixLQUFLTSxNQUFNO1FBQ25CQyxTQUFTUCxLQUFLTyxPQUFPLElBQUk7UUFDekJDLFNBQVNSLEtBQUtRLE9BQU8sSUFBSTtRQUN6QkMsUUFBUVQsS0FBS1MsTUFBTSxJQUFJO1FBQ3ZCQyxXQUFXVixLQUFLVSxTQUFTLElBQUk7SUFDOUI7SUFDQSxJQUFJVCxPQUFPVSxRQUFRVixLQUFLLENBQUMseUJBQXlCQTtBQUNuRDtBQUVPLGVBQWVXLFdBQVdDLElBQWtHO0lBQ2xJLE1BQU0sRUFBRVosS0FBSyxFQUFFLEdBQUcsTUFBTUgsU0FBU0ksSUFBSSxDQUFDLFNBQVNZLE1BQU0sQ0FBQztRQUNyREMsSUFBSUYsS0FBS0UsRUFBRTtRQUNYQyxPQUFPSCxLQUFLRyxLQUFLO1FBQ2pCQyxTQUFTSixLQUFLSyxNQUFNO1FBQ3BCQyxVQUFVTixLQUFLTSxRQUFRO1FBQ3ZCQyxhQUFhUCxLQUFLTyxXQUFXLElBQUk7SUFDbEM7SUFDQSxJQUFJbkIsT0FBT1UsUUFBUVYsS0FBSyxDQUFDLDZCQUE2QkE7QUFDdkQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9rYW5iYW4tY2xvbmUtc3RhcnRlci8uL2xpYi9zdXBhYmFzZS50cz9jOTlmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmNvbnN0IHVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCE7XG5jb25zdCBhbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhO1xuXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQodXJsLCBhbm9uS2V5KTtcblxuZXhwb3J0IHR5cGUgSm9iUHJvdmlkZXIgPSAnZHVzdCcgfCAnb3BlbmFpJyB8ICdhY2knO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9nSm9iKG9wdHM6IHtcblx0cHJvdmlkZXI6IEpvYlByb3ZpZGVyO1xuXHRzdGF0dXM6ICdxdWV1ZWQnIHwgJ3J1bm5pbmcnIHwgJ3N1Y2NlZWRlZCcgfCAnZmFpbGVkJztcblx0am9iX2lkOiBzdHJpbmc7XG5cdGNhcmRfaWQ/OiBzdHJpbmc7XG5cdHBheWxvYWQ/OiB1bmtub3duO1xuXHRyZXN1bHQ/OiB1bmtub3duO1xuXHRrbm93bGVkZ2U/OiB1bmtub3duO1xufSkge1xuXHRjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdqb2JzJykuaW5zZXJ0KHtcblx0XHRwcm92aWRlcjogb3B0cy5wcm92aWRlcixcblx0XHRzdGF0dXM6IG9wdHMuc3RhdHVzLFxuXHRcdGpvYl9pZDogb3B0cy5qb2JfaWQsXG5cdFx0Y2FyZF9pZDogb3B0cy5jYXJkX2lkID8/IG51bGwsXG5cdFx0cGF5bG9hZDogb3B0cy5wYXlsb2FkID8/IG51bGwsXG5cdFx0cmVzdWx0OiBvcHRzLnJlc3VsdCA/PyBudWxsLFxuXHRcdGtub3dsZWRnZTogb3B0cy5rbm93bGVkZ2UgPz8gbnVsbCxcblx0fSk7XG5cdGlmIChlcnJvcikgY29uc29sZS5lcnJvcignc3VwYWJhc2UgbG9nSm9iIGVycm9yJywgZXJyb3IpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBzZXJ0Q2FyZChjYXJkOiB7IGlkOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmc7IGxpc3RJZDogc3RyaW5nOyBwb3NpdGlvbjogbnVtYmVyOyBkZXNjcmlwdGlvbj86IHN0cmluZyB8IG51bGwgfSkge1xuXHRjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdjYXJkcycpLnVwc2VydCh7XG5cdFx0aWQ6IGNhcmQuaWQsXG5cdFx0dGl0bGU6IGNhcmQudGl0bGUsXG5cdFx0bGlzdF9pZDogY2FyZC5saXN0SWQsXG5cdFx0cG9zaXRpb246IGNhcmQucG9zaXRpb24sXG5cdFx0ZGVzY3JpcHRpb246IGNhcmQuZGVzY3JpcHRpb24gPz8gbnVsbCxcblx0fSk7XG5cdGlmIChlcnJvcikgY29uc29sZS5lcnJvcignc3VwYWJhc2UgdXBzZXJ0Q2FyZCBlcnJvcicsIGVycm9yKTtcbn1cblxuIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJhbm9uS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJzdXBhYmFzZSIsImxvZ0pvYiIsIm9wdHMiLCJlcnJvciIsImZyb20iLCJpbnNlcnQiLCJwcm92aWRlciIsInN0YXR1cyIsImpvYl9pZCIsImNhcmRfaWQiLCJwYXlsb2FkIiwicmVzdWx0Iiwia25vd2xlZGdlIiwiY29uc29sZSIsInVwc2VydENhcmQiLCJjYXJkIiwidXBzZXJ0IiwiaWQiLCJ0aXRsZSIsImxpc3RfaWQiLCJsaXN0SWQiLCJwb3NpdGlvbiIsImRlc2NyaXB0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@supabase","vendor-chunks/next","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/zod"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcard-apps%2Froute&page=%2Fapi%2Fcard-apps%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcard-apps%2Froute.ts&appDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffranciscoterpolilli%2FProjects%2Fsmart-board%2Fclone%2Fstarter&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();