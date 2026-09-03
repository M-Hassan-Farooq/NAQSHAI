(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/explore/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExplorePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-google-maps/api/dist/esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useGoogleMapsLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useGoogleMapsLoader.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserNav$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserNav.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AmenityScoreCard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AmenityScoreCard.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/FavoritesContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-alert.mjs [app-client] (ecmascript) <export default as ShieldAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.mjs [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.mjs [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.mjs [app-client] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.mjs [app-client] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.mjs [app-client] (ecmascript) <export default as Compass>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
const mapContainerStyle = {
    width: '100%',
    height: '100%'
};
// Fallback camera only — used before plots load or when no plot has geometry.
const defaultCenter = {
    lat: 33.6844,
    lng: 73.0479
};
const DEFAULT_ZOOM = 12;
const MAX_AUTO_ZOOM = 18;
// Below this zoom, show the green availability-marker layer (clustered). At/above it,
// individual plot polygons take over.
const POLYGON_MIN_ZOOM = 16;
// Programmatically generated green "availability" pin (SVG data URI — no image asset).
function availabilityPinDataUri() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">' + '<path d="M20 1C9.5 1 1 9.5 1 20c0 13.5 19 31 19 31s19-17.5 19-31C39 9.5 30.5 1 20 1z" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>' + '<circle cx="20" cy="20" r="7.5" fill="#ffffff"/>' + '<circle cx="20" cy="20" r="3.5" fill="#059669"/>' + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
// Green cluster bubble; the plot count is drawn as the marker label on top.
function clusterBubbleDataUri(size) {
    const c = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` + `<circle cx="${c}" cy="${c}" r="${c - 2}" fill="#059669" fill-opacity="0.22"/>` + `<circle cx="${c}" cy="${c}" r="${c - 9}" fill="#059669" stroke="#ffffff" stroke-width="3"/>` + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}
function ExploreContent() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const plotParam = searchParams ? searchParams.get('plot') : null;
    const [map, setMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedPlot, setSelectedPlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [is3DMode, setIs3DMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hoveredPlotId, setHoveredPlotId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [zoom, setZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_ZOOM);
    // Split-Screen Interface States
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isPlacesSearchOpen, setIsPlacesSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sidebarSearchQuery, setSidebarSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [activeCityFilter, setActiveCityFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    // Favorites Hook
    const { isFavorite, toggleFavorite } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"])();
    // Resizable Split Pane States (300px min - 600px max, default 400px)
    const [sidebarWidth, setSidebarWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(400);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isDraggingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Restore saved width from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            try {
                const savedWidth = localStorage.getItem('naqshai_explorer_sidebar_width');
                if (savedWidth) {
                    const parsed = parseInt(savedWidth, 10);
                    if (!Number.isNaN(parsed) && parsed >= 300 && parsed <= 600) {
                        setSidebarWidth(parsed);
                    }
                }
            } catch (_) {}
        }
    }["ExploreContent.useEffect"], []);
    // Handle Dragging to Resize Sidebar
    const handleMouseDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleMouseDown]": (e)=>{
            e.preventDefault();
            isDraggingRef.current = true;
            setIsDragging(true);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
    }["ExploreContent.useCallback[handleMouseDown]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            const handleMouseMove = {
                "ExploreContent.useEffect.handleMouseMove": (e)=>{
                    if (!isDraggingRef.current) return;
                    const newWidth = Math.max(300, Math.min(600, e.clientX));
                    setSidebarWidth(newWidth);
                }
            }["ExploreContent.useEffect.handleMouseMove"];
            const handleMouseUp = {
                "ExploreContent.useEffect.handleMouseUp": ()=>{
                    if (!isDraggingRef.current) return;
                    isDraggingRef.current = false;
                    setIsDragging(false);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                    // Persist width to localStorage
                    setSidebarWidth({
                        "ExploreContent.useEffect.handleMouseUp": (latest)=>{
                            try {
                                localStorage.setItem('naqshai_explorer_sidebar_width', String(latest));
                            } catch (_) {}
                            return latest;
                        }
                    }["ExploreContent.useEffect.handleMouseUp"]);
                    // Recalculate Google Maps bounds & viewport
                    if (mapRef.current && window.google?.maps?.event) {
                        window.google.maps.event.trigger(mapRef.current, 'resize');
                    }
                }
            }["ExploreContent.useEffect.handleMouseUp"];
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return ({
                "ExploreContent.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                }
            })["ExploreContent.useEffect"];
        }
    }["ExploreContent.useEffect"], []);
    // Google Places Autocomplete States & Services
    const [placesQuery, setPlacesQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [placesPredictions, setPlacesPredictions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isPlacesDropdownOpen, setIsPlacesDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPlacesLoading, setIsPlacesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchedLocation, setSearchedLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const autocompleteServiceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const placesServiceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const geocoderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const placesSearchContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const searchTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auth session state check
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            let isMounted = true;
            async function fetchSession() {
                try {
                    const { data: { session: activeSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (isMounted) setSession(activeSession);
                } catch (err) {
                    console.error('Session error on Explore page:', err);
                }
            }
            fetchSession();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "ExploreContent.useEffect": (_event, currentSession)=>{
                    if (isMounted) setSession(currentSession);
                }
            }["ExploreContent.useEffect"]);
            return ({
                "ExploreContent.useEffect": ()=>{
                    isMounted = false;
                    subscription?.unsubscribe();
                }
            })["ExploreContent.useEffect"];
        }
    }["ExploreContent.useEffect"], []);
    const handleSignOut = async ()=>{
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        setSession(null);
        router.refresh();
    };
    // Database-backed plot data
    const [plots, setPlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [plotsLoading, setPlotsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [plotsError, setPlotsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const didFitRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const plotParamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(plotParam);
    const clustererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const [reloadKey, setReloadKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            plotParamRef.current = plotParam;
        }
    }["ExploreContent.useEffect"], [
        plotParam
    ]);
    // Data fetching
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            let cancelled = false;
            ({
                "ExploreContent.useEffect": async ()=>{
                    try {
                        const res = await fetch('/api/plots', {
                            cache: 'no-store'
                        });
                        if (!res.ok) throw new Error(`Request failed (${res.status})`);
                        const data = await res.json();
                        if (cancelled) return;
                        const list = Array.isArray(data.plots) ? data.plots : [];
                        setPlots(list);
                        setPlotsError(null);
                        didFitRef.current = false;
                        const param = plotParamRef.current;
                        if (param) {
                            const match = list.find({
                                "ExploreContent.useEffect.match": (p)=>p.id.toLowerCase() === param.toLowerCase()
                            }["ExploreContent.useEffect.match"]);
                            if (match) {
                                setSelectedPlot(match);
                                didFitRef.current = true;
                            }
                        }
                    } catch (err) {
                        if (cancelled) return;
                        console.error('Failed to load registered plots:', err);
                        setPlotsError('We couldn’t load the registered plots. Please try again.');
                        setPlots([]);
                    } finally{
                        if (!cancelled) setPlotsLoading(false);
                    }
                }
            })["ExploreContent.useEffect"]();
            return ({
                "ExploreContent.useEffect": ()=>{
                    cancelled = true;
                }
            })["ExploreContent.useEffect"];
        }
    }["ExploreContent.useEffect"], [
        reloadKey
    ]);
    const handleRetry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleRetry]": ()=>{
            setPlotsLoading(true);
            setPlotsError(null);
            setReloadKey({
                "ExploreContent.useCallback[handleRetry]": (k)=>k + 1
            }["ExploreContent.useCallback[handleRetry]"]);
        }
    }["ExploreContent.useCallback[handleRetry]"], []);
    // Map lifecycle
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[onLoad]": (mapInstance)=>{
            mapRef.current = mapInstance;
            setMap(mapInstance);
        }
    }["ExploreContent.useCallback[onLoad]"], []);
    const onUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[onUnmount]": ()=>{
            setMap(null);
            mapRef.current = null;
        }
    }["ExploreContent.useCallback[onUnmount]"], []);
    const handleZoomChanged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleZoomChanged]": ()=>{
            const z = mapRef.current?.getZoom?.();
            if (typeof z === 'number') setZoom(z);
        }
    }["ExploreContent.useCallback[handleZoomChanged]"], []);
    const fitToPlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[fitToPlots]": (mapInstance, plotList)=>{
            if (!mapInstance || ("TURBOPACK compile-time value", "object") === 'undefined' || !window.google?.maps) return false;
            const withGeo = plotList.filter({
                "ExploreContent.useCallback[fitToPlots].withGeo": (p)=>p.hasGeometry && p.paths.length
            }["ExploreContent.useCallback[fitToPlots].withGeo"]);
            if (!withGeo.length) return false;
            try {
                const bounds = new window.google.maps.LatLngBounds();
                withGeo.forEach({
                    "ExploreContent.useCallback[fitToPlots]": (p)=>p.paths.forEach({
                            "ExploreContent.useCallback[fitToPlots]": (pt)=>bounds.extend(pt)
                        }["ExploreContent.useCallback[fitToPlots]"])
                }["ExploreContent.useCallback[fitToPlots]"]);
                mapInstance.fitBounds(bounds);
                window.google.maps.event.addListenerOnce(mapInstance, 'idle', {
                    "ExploreContent.useCallback[fitToPlots]": ()=>{
                        if (mapInstance.getZoom() > MAX_AUTO_ZOOM) mapInstance.setZoom(MAX_AUTO_ZOOM);
                    }
                }["ExploreContent.useCallback[fitToPlots]"]);
                return true;
            } catch (e) {
                console.warn('fitBounds failed:', e);
                return false;
            }
        }
    }["ExploreContent.useCallback[fitToPlots]"], []);
    // Select plot and focus
    const handleSelectPlot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleSelectPlot]": (plot)=>{
            setSelectedPlot(plot);
            setIs3DMode(false);
        }
    }["ExploreContent.useCallback[handleSelectPlot]"], []);
    // "See on Map" action: pans, zooms, highlights and opens inspector drawer
    const handleSeeOnMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleSeeOnMap]": (plot)=>{
            setSelectedPlot(plot);
            setIs3DMode(false);
            if (plot.center && mapRef.current) {
                mapRef.current.panTo(plot.center);
                mapRef.current.setZoom(17);
            }
        }
    }["ExploreContent.useCallback[handleSeeOnMap]"], []);
    // Auto-fit camera once
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            if (!map || plotsLoading || didFitRef.current || selectedPlot) return;
            if (fitToPlots(map, plots)) {
                didFitRef.current = true;
            }
        }
    }["ExploreContent.useEffect"], [
        map,
        plots,
        plotsLoading,
        selectedPlot,
        fitToPlots
    ]);
    // Pan into selected plot
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            if (selectedPlot?.center && map) {
                map.panTo(selectedPlot.center);
                map.setZoom(MAX_AUTO_ZOOM);
            }
        }
    }["ExploreContent.useEffect"], [
        selectedPlot,
        map
    ]);
    // Availability marker layer
    const showMarkerLayer = zoom < POLYGON_MIN_ZOOM;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            if (!map || ("TURBOPACK compile-time value", "object") === 'undefined' || !window.google?.maps) return undefined;
            if (!showMarkerLayer) return undefined;
            const g = window.google;
            const markerPlots = plots.filter({
                "ExploreContent.useEffect.markerPlots": (p)=>p.center
            }["ExploreContent.useEffect.markerPlots"]);
            if (!markerPlots.length) return undefined;
            const { MarkerClusterer, SuperClusterAlgorithm } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMapsMarkerClusterer"];
            const pinIcon = {
                url: availabilityPinDataUri(),
                scaledSize: new g.maps.Size(36, 47),
                anchor: new g.maps.Point(18, 47),
                labelOrigin: new g.maps.Point(18, 18)
            };
            const markers = markerPlots.map({
                "ExploreContent.useEffect.markers": (plot)=>{
                    const marker = new g.maps.Marker({
                        position: plot.center,
                        icon: pinIcon,
                        title: plot.name
                    });
                    marker.addListener('click', {
                        "ExploreContent.useEffect.markers": ()=>handleSelectPlot(plot)
                    }["ExploreContent.useEffect.markers"]);
                    return marker;
                }
            }["ExploreContent.useEffect.markers"]);
            const renderer = {
                render: {
                    "ExploreContent.useEffect": ({ count, position })=>{
                        const size = count < 10 ? 46 : count < 50 ? 54 : 62;
                        return new g.maps.Marker({
                            position,
                            icon: {
                                url: clusterBubbleDataUri(size),
                                scaledSize: new g.maps.Size(size, size),
                                anchor: new g.maps.Point(size / 2, size / 2),
                                labelOrigin: new g.maps.Point(size / 2, size / 2)
                            },
                            label: {
                                text: String(count),
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: '700'
                            },
                            zIndex: 1000 + count
                        });
                    }
                }["ExploreContent.useEffect"]
            };
            const clusterer = new MarkerClusterer({
                map,
                markers,
                renderer,
                algorithm: new SuperClusterAlgorithm({
                    radius: 130,
                    maxZoom: POLYGON_MIN_ZOOM - 1
                })
            });
            clustererRef.current = clusterer;
            markersRef.current = markers;
            return ({
                "ExploreContent.useEffect": ()=>{
                    try {
                        clusterer.clearMarkers();
                        clusterer.setMap(null);
                    } catch (e) {}
                    markers.forEach({
                        "ExploreContent.useEffect": (m)=>{
                            g.maps.event.clearInstanceListeners(m);
                            m.setMap(null);
                        }
                    }["ExploreContent.useEffect"]);
                    clustererRef.current = null;
                    markersRef.current = [];
                }
            })["ExploreContent.useEffect"];
        }
    }["ExploreContent.useEffect"], [
        map,
        plots,
        showMarkerLayer,
        handleSelectPlot
    ]);
    // Initialize AutocompleteService and PlacesService when map is ready
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === 'undefined' || !window.google?.maps) return;
            if (window.google.maps.places) {
                if (!autocompleteServiceRef.current && window.google.maps.places.AutocompleteService) {
                    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
                }
                if (map && window.google.maps.places.PlacesService) {
                    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
                }
            }
            if (typeof window.google.maps.Geocoder === 'function') {
                geocoderRef.current = new window.google.maps.Geocoder();
            }
        }
    }["ExploreContent.useEffect"], [
        map
    ]);
    // Click-outside listener to dismiss places suggestions dropdown
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExploreContent.useEffect": ()=>{
            const handleClickOutside = {
                "ExploreContent.useEffect.handleClickOutside": (e)=>{
                    if (placesSearchContainerRef.current && !placesSearchContainerRef.current.contains(e.target)) {
                        setIsPlacesDropdownOpen(false);
                    }
                }
            }["ExploreContent.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "ExploreContent.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["ExploreContent.useEffect"];
        }
    }["ExploreContent.useEffect"], []);
    // Handle typing in Google Places search input
    const handlePlacesInputChange = (val)=>{
        setPlacesQuery(val);
        if (!val || val.trim().length < 2) {
            setPlacesPredictions([]);
            setIsPlacesDropdownOpen(false);
            setIsPlacesLoading(false);
            return;
        }
        setIsPlacesLoading(true);
        setIsPlacesDropdownOpen(true);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(()=>{
            if (!autocompleteServiceRef.current && window.google?.maps?.places?.AutocompleteService) {
                autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            }
            if (autocompleteServiceRef.current) {
                autocompleteServiceRef.current.getPlacePredictions({
                    input: val,
                    componentRestrictions: {
                        country: 'pk'
                    }
                }, (results, status)=>{
                    setIsPlacesLoading(false);
                    if (status === 'OK' && Array.isArray(results)) {
                        setPlacesPredictions(results);
                    } else {
                        setPlacesPredictions([]);
                    }
                });
            } else {
                setIsPlacesLoading(false);
            }
        }, 250);
    };
    // Select place prediction from dropdown
    const handleSelectPrediction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ExploreContent.useCallback[handleSelectPrediction]": (prediction)=>{
            const mainTitle = prediction.structured_formatting?.main_text || prediction.description;
            setPlacesQuery(mainTitle);
            setIsPlacesDropdownOpen(false);
            setPlacesPredictions([]);
            const applyLocation = {
                "ExploreContent.useCallback[handleSelectPrediction].applyLocation": (lat, lng, name, address)=>{
                    setSearchedLocation({
                        lat,
                        lng,
                        name,
                        address
                    });
                    if (mapRef.current) {
                        mapRef.current.panTo({
                            lat,
                            lng
                        });
                        mapRef.current.setZoom(15);
                    }
                }
            }["ExploreContent.useCallback[handleSelectPrediction].applyLocation"];
            // 1. Primary: Use PlacesService.getDetails
            if (placesServiceRef.current && prediction.place_id) {
                placesServiceRef.current.getDetails({
                    placeId: prediction.place_id,
                    fields: [
                        'geometry',
                        'name',
                        'formatted_address'
                    ]
                }, {
                    "ExploreContent.useCallback[handleSelectPrediction]": (place, status)=>{
                        if ((status === 'OK' || status === window.google?.maps?.places?.PlacesServiceStatus?.OK) && place?.geometry?.location) {
                            applyLocation(place.geometry.location.lat(), place.geometry.location.lng(), mainTitle, place.formatted_address || mainTitle);
                            return;
                        }
                        fallbackGeocode();
                    }
                }["ExploreContent.useCallback[handleSelectPrediction]"]);
            } else {
                fallbackGeocode();
            }
            function fallbackGeocode() {
                if (!geocoderRef.current && typeof window.google?.maps?.Geocoder === 'function') {
                    geocoderRef.current = new window.google.maps.Geocoder();
                }
                if (geocoderRef.current) {
                    const queryParam = prediction.place_id ? {
                        placeId: prediction.place_id
                    } : {
                        address: prediction.description,
                        componentRestrictions: {
                            country: 'pk'
                        }
                    };
                    geocoderRef.current.geocode(queryParam, {
                        "ExploreContent.useCallback[handleSelectPrediction].fallbackGeocode": (results, status)=>{
                            if (status === 'OK' && results?.[0]?.geometry?.location) {
                                const loc = results[0].geometry.location;
                                applyLocation(loc.lat(), loc.lng(), mainTitle, results[0].formatted_address);
                            }
                        }
                    }["ExploreContent.useCallback[handleSelectPrediction].fallbackGeocode"]);
                }
            }
        }
    }["ExploreContent.useCallback[handleSelectPrediction]"], []);
    // Form submit (Enter key or search click)
    const handlePlacesSearchSubmit = (e)=>{
        e?.preventDefault?.();
        if (!placesQuery.trim()) return;
        // If suggestions exist, pick first
        if (placesPredictions.length > 0) {
            handleSelectPrediction(placesPredictions[0]);
            return;
        }
        const applyLocation = (lat, lng, name, address)=>{
            setSearchedLocation({
                lat,
                lng,
                name,
                address
            });
            setIsPlacesDropdownOpen(false);
            if (mapRef.current) {
                mapRef.current.panTo({
                    lat,
                    lng
                });
                mapRef.current.setZoom(15);
            }
        };
        if (placesServiceRef.current && typeof placesServiceRef.current.findPlaceFromQuery === 'function') {
            setIsPlacesLoading(true);
            placesServiceRef.current.findPlaceFromQuery({
                query: placesQuery,
                fields: [
                    'geometry',
                    'name',
                    'formatted_address'
                ]
            }, (results, status)=>{
                setIsPlacesLoading(false);
                if ((status === 'OK' || status === window.google?.maps?.places?.PlacesServiceStatus?.OK) && results?.[0]?.geometry?.location) {
                    applyLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng(), placesQuery, results[0].formatted_address || placesQuery);
                    return;
                }
                fallbackGeocodeSubmit();
            });
        } else {
            fallbackGeocodeSubmit();
        }
        function fallbackGeocodeSubmit() {
            if (!geocoderRef.current && typeof window.google?.maps?.Geocoder === 'function') {
                geocoderRef.current = new window.google.maps.Geocoder();
            }
            if (geocoderRef.current) {
                setIsPlacesLoading(true);
                geocoderRef.current.geocode({
                    address: placesQuery,
                    componentRestrictions: {
                        country: 'pk'
                    }
                }, (results, status)=>{
                    setIsPlacesLoading(false);
                    if (status === 'OK' && results?.[0]?.geometry?.location) {
                        const loc = results[0].geometry.location;
                        applyLocation(loc.lat(), loc.lng(), placesQuery, results[0].formatted_address);
                    }
                });
            }
        }
    };
    const handleClearPlacesSearch = ()=>{
        setPlacesQuery('');
        setPlacesPredictions([]);
        setIsPlacesDropdownOpen(false);
        setSearchedLocation(null);
    };
    // Sidebar Filter Logic
    const uniqueCities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ExploreContent.useMemo[uniqueCities]": ()=>{
            const set = new Set();
            plots.forEach({
                "ExploreContent.useMemo[uniqueCities]": (p)=>{
                    if (p.city && p.city.trim()) {
                        set.add(p.city.trim());
                    }
                }
            }["ExploreContent.useMemo[uniqueCities]"]);
            return Array.from(set);
        }
    }["ExploreContent.useMemo[uniqueCities]"], [
        plots
    ]);
    const filteredPlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ExploreContent.useMemo[filteredPlots]": ()=>{
            return plots.filter({
                "ExploreContent.useMemo[filteredPlots]": (plot)=>{
                    // City filter
                    if (activeCityFilter !== 'ALL') {
                        const cityMatch = (plot.city || '').trim().toLowerCase() === activeCityFilter.toLowerCase();
                        if (!cityMatch) return false;
                    }
                    // Query filter
                    const q = sidebarSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (plot.name || '').toLowerCase().includes(q) || (plot.society || '').toLowerCase().includes(q) || (plot.id || '').toLowerCase().includes(q) || (plot.city || '').toLowerCase().includes(q) || (plot.price || '').toLowerCase().includes(q) || (plot.details?.size || '').toLowerCase().includes(q) || (plot.details?.floodRisk || '').toLowerCase().includes(q);
                }
            }["ExploreContent.useMemo[filteredPlots]"]);
        }
    }["ExploreContent.useMemo[filteredPlots]"], [
        plots,
        activeCityFilter,
        sidebarSearchQuery
    ]);
    // Group filtered plots by city
    const plotsByCity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ExploreContent.useMemo[plotsByCity]": ()=>{
            const groups = {};
            filteredPlots.forEach({
                "ExploreContent.useMemo[plotsByCity]": (plot)=>{
                    const cityName = plot.city && plot.city.trim() || 'Islamabad';
                    if (!groups[cityName]) groups[cityName] = [];
                    groups[cityName].push(plot);
                }
            }["ExploreContent.useMemo[plotsByCity]"]);
            return groups;
        }
    }["ExploreContent.useMemo[plotsByCity]"], [
        filteredPlots
    ]);
    const showEmptyState = !plotsLoading && !plotsError && plots.length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useGoogleMapsLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMapsSafeLoader"], {
        children: ({ isLoaded, loadError })=>{
            if (loadError) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 text-red-500",
                children: "Error loading maps. Check your API key."
            }, void 0, false, {
                fileName: "[project]/app/explore/page.js",
                lineNumber: 654,
                columnNumber: 31
            }, this);
            if (!isLoaded) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 text-slate-500",
                children: "Loading Map..."
            }, void 0, false, {
                fileName: "[project]/app/explore/page.js",
                lineNumber: 655,
                columnNumber: 31
            }, this);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full h-screen overflow-hidden font-sans bg-slate-100 text-slate-800 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 shadow-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setIsSidebarOpen((prev)=>!prev),
                                        className: "p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold",
                                        title: isSidebarOpen ? 'Collapse plot list to maximize map' : 'Expand plot list',
                                        children: isSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"], {
                                                    className: "w-4 h-4 text-emerald-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 670,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "hidden sm:inline",
                                                    children: "Maximize Map"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 671,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 669,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"], {
                                                    className: "w-4 h-4 text-emerald-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 675,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "hidden sm:inline",
                                                    children: "Show Plots"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 676,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 674,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 662,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 border-l border-slate-200 pl-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: "/explorer.jpeg",
                                                        alt: "NAQSHAI Explorer Logo",
                                                        width: 32,
                                                        height: 32,
                                                        className: "rounded-md object-cover"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 683,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "NAQSHAI Explorer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 690,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 682,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-block",
                                                children: plotsLoading ? 'Loading…' : `${plots.length} Verified Plots`
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 692,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 681,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/explore/page.js",
                                lineNumber: 661,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>router.push('/sell'),
                                        className: "bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition",
                                        children: "List Your Plot"
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 700,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        className: "bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                                className: "w-3.5 h-3.5 text-emerald-700"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 710,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:inline",
                                                children: "Home"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 711,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 706,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>router.push('/recommend'),
                                        className: "bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                className: "w-3.5 h-3.5 text-emerald-700"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 717,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:inline",
                                                children: "AI Advisor"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 718,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 713,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserNav$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        session: session,
                                        onSignOut: handleSignOut
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 721,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/explore/page.js",
                                lineNumber: 699,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/explore/page.js",
                        lineNumber: 660,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex overflow-hidden relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                style: {
                                    width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
                                    transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                },
                                className: "bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3.5 border-b border-slate-200 space-y-3 bg-slate-50/70 shrink-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:border-emerald-500 transition",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                className: "w-4 h-4 text-slate-400 mr-2 shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 743,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                placeholder: "Search by society, size, or plot ID...",
                                                                value: sidebarSearchQuery,
                                                                onChange: (e)=>setSidebarSearchQuery(e.target.value),
                                                                className: "w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 744,
                                                                columnNumber: 23
                                                            }, this),
                                                            sidebarSearchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setSidebarSearchQuery(''),
                                                                className: "text-slate-400 hover:text-slate-600",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    className: "w-3.5 h-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 757,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 752,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 742,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "hidden sm:flex items-center gap-0.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs shrink-0",
                                                        children: [
                                                            {
                                                                label: 'S',
                                                                width: 320,
                                                                title: 'Compact width (320px)'
                                                            },
                                                            {
                                                                label: 'M',
                                                                width: 400,
                                                                title: 'Default width (400px)'
                                                            },
                                                            {
                                                                label: 'L',
                                                                width: 520,
                                                                title: 'Wide width (520px)'
                                                            }
                                                        ].map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>{
                                                                    setSidebarWidth(preset.width);
                                                                    try {
                                                                        localStorage.setItem('naqshai_explorer_sidebar_width', String(preset.width));
                                                                    } catch (_) {}
                                                                    if (mapRef.current && window.google?.maps?.event) {
                                                                        setTimeout(()=>window.google.maps.event.trigger(mapRef.current, 'resize'), 250);
                                                                    }
                                                                },
                                                                className: `w-5 h-6 flex items-center justify-center rounded text-[10px] font-mono font-bold transition ${sidebarWidth === preset.width ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`,
                                                                title: preset.title,
                                                                children: preset.label
                                                            }, preset.label, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 769,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 763,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 741,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setActiveCityFilter('ALL'),
                                                        className: `text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap ${activeCityFilter === 'ALL' ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`,
                                                        children: [
                                                            "All Cities (",
                                                            plots.length,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 796,
                                                        columnNumber: 21
                                                    }, this),
                                                    uniqueCities.map((city)=>{
                                                        const count = plots.filter((p)=>(p.city || '').trim().toLowerCase() === city.toLowerCase()).length;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setActiveCityFilter(city),
                                                            className: `text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap ${activeCityFilter.toLowerCase() === city.toLowerCase() ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`,
                                                            children: [
                                                                city,
                                                                " (",
                                                                count,
                                                                ")"
                                                            ]
                                                        }, city, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 810,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 795,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 739,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 overflow-y-auto p-3.5 space-y-5",
                                        children: plotsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-6 h-6 animate-spin text-emerald-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 831,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium",
                                                    children: "Loading verified properties…"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 832,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 830,
                                            columnNumber: 21
                                        }, this) : plotsError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                                                    className: "w-5 h-5 text-red-600 mx-auto"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 836,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-red-700",
                                                    children: plotsError
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 837,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleRetry,
                                                    className: "text-xs font-semibold text-emerald-700 underline",
                                                    children: "Retry Loading"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 838,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 835,
                                            columnNumber: 21
                                        }, this) : Object.keys(plotsByCity).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "py-12 text-center text-slate-400 text-xs",
                                            children: "No matching plots found for this filter."
                                        }, void 0, false, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 846,
                                            columnNumber: 21
                                        }, this) : Object.entries(plotsByCity).map(([city, cityPlots])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs py-1 z-1 border-b border-slate-100",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                        className: "w-3.5 h-3.5 text-emerald-700"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 855,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    city
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 854,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full",
                                                                children: [
                                                                    cityPlots.length,
                                                                    " ",
                                                                    cityPlots.length === 1 ? 'plot' : 'plots'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 858,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 853,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2.5",
                                                        children: cityPlots.map((plot)=>{
                                                            const isSelected = selectedPlot?.id === plot.id;
                                                            const isLowFlood = plot.details?.floodRisk?.toLowerCase().includes('low');
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `rounded-xl border p-3.5 transition flex flex-col justify-between space-y-2.5 shadow-xs ${isSelected ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start justify-between gap-2",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-1.5",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono",
                                                                                                        children: plot.id
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                                        lineNumber: 882,
                                                                                                        columnNumber: 41
                                                                                                    }, this),
                                                                                                    plot.isVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded",
                                                                                                        children: "Verified"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                                        lineNumber: 886,
                                                                                                        columnNumber: 43
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/explore/page.js",
                                                                                                lineNumber: 881,
                                                                                                columnNumber: 39
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                className: "font-bold text-xs text-slate-900 mt-1 leading-snug",
                                                                                                children: plot.name
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/explore/page.js",
                                                                                                lineNumber: 891,
                                                                                                columnNumber: 39
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                        lineNumber: 880,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-1.5 shrink-0",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-xs font-extrabold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200",
                                                                                                children: plot.price
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/explore/page.js",
                                                                                                lineNumber: 896,
                                                                                                columnNumber: 39
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                                type: "button",
                                                                                                onClick: (e)=>{
                                                                                                    e.stopPropagation();
                                                                                                    toggleFavorite(plot.id, plot);
                                                                                                },
                                                                                                className: "p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer",
                                                                                                title: isFavorite(plot.id) ? 'Remove from favorites' : 'Save to favorites',
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                                                    className: `w-3.5 h-3.5 transition-transform active:scale-125 ${isFavorite(plot.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                                    lineNumber: 908,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/explore/page.js",
                                                                                                lineNumber: 899,
                                                                                                columnNumber: 39
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                        lineNumber: 895,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/explore/page.js",
                                                                                lineNumber: 879,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-[11px] text-slate-500 mt-1 flex items-center gap-1",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                                        className: "w-3 h-3 text-slate-400 shrink-0"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                        lineNumber: 920,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        children: [
                                                                                            plot.society ? `${plot.society}, ` : '',
                                                                                            plot.city
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/explore/page.js",
                                                                                        lineNumber: 921,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/explore/page.js",
                                                                                lineNumber: 919,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 878,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex flex-wrap items-center gap-1.5 text-[10px]",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200",
                                                                                children: plot.details?.size || 'Plot'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/explore/page.js",
                                                                                lineNumber: 929,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `px-2 py-0.5 rounded border font-medium ${isLowFlood ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`,
                                                                                children: [
                                                                                    "Flood: ",
                                                                                    plot.details?.floodRisk || 'N/A'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/explore/page.js",
                                                                                lineNumber: 932,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            plot.details?.elevation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200",
                                                                                children: plot.details.elevation
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/explore/page.js",
                                                                                lineNumber: 942,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 928,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "pt-2 border-t border-slate-100 flex items-center justify-between gap-2",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>handleSeeOnMap(plot),
                                                                            className: `w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${isSelected ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'}`,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                                    className: "w-3.5 h-3.5"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 959,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: isSelected ? 'Viewing on Map' : 'See on Map'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 960,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 950,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 949,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, plot.id, true, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 870,
                                                                columnNumber: 31
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 864,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, city, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 851,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 828,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/explore/page.js",
                                lineNumber: 731,
                                columnNumber: 15
                            }, this),
                            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onMouseDown: handleMouseDown,
                                className: `w-2 hover:w-2.5 bg-slate-200 hover:bg-emerald-500 active:bg-emerald-600 cursor-col-resize z-20 flex items-center justify-center transition-colors relative select-none group shrink-0 ${isDragging ? 'bg-emerald-600 w-2.5 shadow-md' : ''}`,
                                title: "Drag to resize sidebar width (300px - 600px)",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors"
                                }, void 0, false, {
                                    fileName: "[project]/app/explore/page.js",
                                    lineNumber: 982,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/explore/page.js",
                                lineNumber: 975,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                                className: "flex-1 h-full relative overflow-hidden",
                                children: [
                                    !isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setIsSidebarOpen(true),
                                        className: "absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer",
                                        title: "Show plot list",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"], {
                                                className: "w-4 h-4 text-emerald-700"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 996,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden sm:inline",
                                                children: "Plots"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 997,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 990,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-1/2 -translate-x-1/2 top-4 z-10 flex items-center justify-center gap-2 max-w-xs sm:max-w-md md:max-w-lg w-full px-4",
                                        children: isPlacesSearchOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            ref: placesSearchContainerRef,
                                            className: "flex-1 relative w-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                    onSubmit: handlePlacesSearchSubmit,
                                                    className: "bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3.5 py-2 flex items-center gap-2 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                                            className: "w-4 h-4 text-emerald-700 shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1010,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: placesQuery,
                                                            onChange: (e)=>handlePlacesInputChange(e.target.value),
                                                            onFocus: ()=>{
                                                                if (placesPredictions.length > 0) setIsPlacesDropdownOpen(true);
                                                            },
                                                            placeholder: "Search real-world locations, landmarks, cities...",
                                                            className: "w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1011,
                                                            columnNumber: 25
                                                        }, this),
                                                        isPlacesLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                            className: "w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1022,
                                                            columnNumber: 27
                                                        }, this),
                                                        placesQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: handleClearPlacesSearch,
                                                            className: "text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer",
                                                            title: "Clear search",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1031,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1025,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setIsPlacesSearchOpen(false),
                                                            className: "text-slate-400 hover:text-slate-600 p-0.5 rounded border-l border-slate-200 pl-1.5 ml-0.5 cursor-pointer",
                                                            title: "Hide Google Places search bar",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1040,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1034,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1006,
                                                    columnNumber: 23
                                                }, this),
                                                isPlacesDropdownOpen && placesPredictions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-100",
                                                    children: placesPredictions.map((pred)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>handleSelectPrediction(pred),
                                                            className: "w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 transition flex items-start gap-2.5 group cursor-pointer",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                    className: "w-4 h-4 text-emerald-600 group-hover:text-emerald-700 mt-0.5 shrink-0"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1054,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs font-semibold text-slate-800 truncate",
                                                                            children: pred.structured_formatting?.main_text || pred.description
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1056,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-[11px] text-slate-400 truncate",
                                                                            children: pred.structured_formatting?.secondary_text || ''
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1059,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1055,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, pred.place_id, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1048,
                                                            columnNumber: 29
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1046,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 1005,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setIsPlacesSearchOpen(true),
                                            className: "bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 text-slate-700 hover:text-emerald-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm",
                                            title: "Show Google Places search bar",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                                    className: "w-4 h-4 text-emerald-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1075,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Search Places"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1076,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 1069,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1002,
                                        columnNumber: 17
                                    }, this),
                                    searchedLocation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs max-w-xs sm:max-w-md truncate",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "w-3.5 h-3.5 text-emerald-600 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1084,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold text-slate-800 truncate max-w-[220px]",
                                                children: searchedLocation.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1085,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setSearchedLocation(null),
                                                className: "text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer",
                                                title: "Clear location pin",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1094,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1088,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1083,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMap"], {
                                        mapContainerStyle: mapContainerStyle,
                                        center: defaultCenter,
                                        zoom: DEFAULT_ZOOM,
                                        onLoad: onLoad,
                                        onUnmount: onUnmount,
                                        onZoomChanged: handleZoomChanged,
                                        options: {
                                            disableDefaultUI: false,
                                            zoomControl: true,
                                            mapTypeControl: true,
                                            streetViewControl: false,
                                            fullscreenControl: false,
                                            mapTypeId: is3DMode ? 'hybrid' : 'roadmap'
                                        },
                                        children: [
                                            searchedLocation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                                position: {
                                                    lat: searchedLocation.lat,
                                                    lng: searchedLocation.lng
                                                },
                                                title: searchedLocation.name,
                                                zIndex: 999
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1118,
                                                columnNumber: 21
                                            }, this),
                                            !showMarkerLayer && plots.map((plot)=>{
                                                if (!plot.hasGeometry || !plot.paths.length) return null;
                                                const isSelected = selectedPlot?.id === plot.id;
                                                const isHovered = hoveredPlotId === plot.id;
                                                const strokeColor = isSelected ? '#047857' : isHovered ? '#059669' : '#059669';
                                                const fillColor = isSelected ? '#059669' : isHovered ? '#10b981' : '#10b981';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"], {
                                                    paths: plot.paths,
                                                    options: {
                                                        strokeColor,
                                                        strokeOpacity: 0.95,
                                                        strokeWeight: isSelected ? 3 : 2,
                                                        fillColor,
                                                        fillOpacity: isSelected ? 0.45 : isHovered ? 0.35 : 0.22,
                                                        clickable: true,
                                                        zIndex: isSelected ? 100 : isHovered ? 50 : 1
                                                    },
                                                    onClick: ()=>handleSelectPlot(plot),
                                                    onMouseOver: ()=>setHoveredPlotId(plot.id),
                                                    onMouseOut: ()=>setHoveredPlotId(null)
                                                }, plot.id, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1135,
                                                    columnNumber: 25
                                                }, this);
                                            }),
                                            is3DMode && selectedPlot?.center && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StreetViewPanorama"], {
                                                position: selectedPlot.center,
                                                visible: is3DMode,
                                                options: {
                                                    pov: {
                                                        heading: 100,
                                                        pitch: 0
                                                    },
                                                    zoom: 1
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1156,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1100,
                                        columnNumber: 17
                                    }, this),
                                    (plotsLoading || plotsError || showEmptyState) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl px-6 py-5 max-w-sm w-full text-center",
                                            children: plotsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-6 h-6 text-emerald-700 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1173,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-slate-800",
                                                        children: "Loading registered plots…"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1174,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500",
                                                        children: "Fetching the latest properties from the database."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1175,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1172,
                                                columnNumber: 25
                                            }, this) : plotsError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                                                        className: "w-6 h-6 text-red-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1179,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-slate-800",
                                                        children: "Couldn’t load plots"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1180,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500",
                                                        children: plotsError
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1181,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleRetry,
                                                        className: "mt-1 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1186,
                                                                columnNumber: 29
                                                            }, this),
                                                            " Retry"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1182,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1178,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                        className: "w-6 h-6 text-slate-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1191,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-semibold text-slate-800",
                                                        children: "No registered plots found"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1192,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500",
                                                        children: "Once plots are registered, they’ll appear here on the map."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1193,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>router.push('/sell'),
                                                        className: "mt-1 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm",
                                                        children: "List a Plot"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1194,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1190,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 1170,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1169,
                                        columnNumber: 19
                                    }, this),
                                    !plotsLoading && !plotsError && plots.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-2 flex items-center gap-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1209,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "leading-tight",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-semibold text-slate-700",
                                                        children: "Available plots"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1211,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[11px] text-slate-400",
                                                        children: showMarkerLayer ? 'Zoom in to see plot boundaries' : 'Showing plot boundaries'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1212,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/explore/page.js",
                                                lineNumber: 1210,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1208,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `absolute top-0 right-0 h-full w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 z-30 transform transition-transform duration-300 flex flex-col ${selectedPlot ? 'translate-x-0' : 'translate-x-full'}`,
                                        children: selectedPlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 text-xs font-bold",
                                                                    children: selectedPlot.id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1230,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200",
                                                                    children: selectedPlot.price
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1233,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1229,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>toggleFavorite(selectedPlot.id, selectedPlot),
                                                                    className: "p-1.5 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition cursor-pointer",
                                                                    title: isFavorite(selectedPlot.id) ? 'Remove from favorites' : 'Save to favorites',
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                        className: `w-4 h-4 transition-transform active:scale-125 ${isFavorite(selectedPlot.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 1244,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1238,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setSelectedPlot(null),
                                                                    className: "p-1 hover:bg-slate-200/60 rounded-full text-slate-500 transition cursor-pointer",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                        className: "w-5 h-5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 1256,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1252,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1237,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1228,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-5 flex-1 overflow-y-auto space-y-5 text-slate-800",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                    className: "text-lg font-bold text-slate-900 leading-snug",
                                                                    children: selectedPlot.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1265,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-slate-500 mt-1 flex items-center gap-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                            className: "w-3.5 h-3.5 text-emerald-600 shrink-0"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1267,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                selectedPlot.society ? `${selectedPlot.society}, ` : '',
                                                                                selectedPlot.city
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1268,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1266,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1264,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setIs3DMode(!is3DMode),
                                                            disabled: !selectedPlot.center,
                                                            className: "w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition text-xs shadow-xs",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    className: "w-4 h-4 text-emerald-700"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1278,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: !selectedPlot.center ? 'Walkthrough Unavailable (No Boundary)' : is3DMode ? 'Exit 3D Walkthrough' : 'Launch 3D Walkthrough'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1279,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1273,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-slate-400 font-mono",
                                                                    children: "Architectural Breakdown"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1290,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-2 gap-2 text-xs",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "bg-slate-50 p-3 rounded-xl border border-slate-200",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-slate-500 block text-[11px]",
                                                                                    children: "Plot Size"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 1293,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold text-slate-800 mt-0.5 block",
                                                                                    children: selectedPlot.details.size
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 1294,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1292,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "bg-slate-50 p-3 rounded-xl border border-slate-200",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-slate-500 block text-[11px]",
                                                                                    children: "Category"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 1297,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold text-slate-800 mt-0.5 block",
                                                                                    children: selectedPlot.details.category || 'Residential'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 1298,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1296,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1291,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1289,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-slate-400 font-mono",
                                                                    children: "Risk Intelligence Assessment"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1305,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-wrap gap-2 pt-0.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                                                                                    className: "w-3.5 h-3.5 text-emerald-600"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/explore/page.js",
                                                                                    lineNumber: 1308,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                "Flood: ",
                                                                                selectedPlot.details.floodRisk
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1307,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold",
                                                                            children: [
                                                                                "Noise: ",
                                                                                selectedPlot.details.noiseLevel
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1311,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold",
                                                                            children: [
                                                                                "Elevation: ",
                                                                                selectedPlot.details.elevation
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/explore/page.js",
                                                                            lineNumber: 1314,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1306,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1304,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AmenityScoreCard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            plotId: selectedPlot.id,
                                                            lat: selectedPlot.center?.lat,
                                                            lng: selectedPlot.center?.lng
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1321,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-slate-400 font-mono",
                                                                    children: "Landmarks & Proximity"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1329,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed",
                                                                    children: selectedPlot.details.landmarks
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/explore/page.js",
                                                                    lineNumber: 1330,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1328,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "pt-2",
                                                            children: selectedPlot.ownerContact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: `https://wa.me/${selectedPlot.ownerContact.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(selectedPlot.name)}`,
                                                                target: "_blank",
                                                                rel: "noopener noreferrer",
                                                                className: "w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition text-xs shadow-xs",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                        className: "w-3.5 h-3.5 text-emerald-600"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 1344,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Contact Owner via WhatsApp"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/explore/page.js",
                                                                        lineNumber: 1345,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1338,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-full text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl py-2.5",
                                                                children: "Owner contact not available"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1348,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/explore/page.js",
                                                            lineNumber: 1336,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1262,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-4 border-t border-slate-200 bg-white",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>router.push(`/recommend?context=${selectedPlot.id}`),
                                                        className: "bg-emerald-700 hover:bg-emerald-600 text-white w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 text-sm shadow-xs transition",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1361,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Discuss with AI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/explore/page.js",
                                                                lineNumber: 1362,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/explore/page.js",
                                                        lineNumber: 1357,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/explore/page.js",
                                                    lineNumber: 1356,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/explore/page.js",
                                            lineNumber: 1226,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/explore/page.js",
                                        lineNumber: 1220,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/explore/page.js",
                                lineNumber: 987,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/explore/page.js",
                        lineNumber: 729,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/explore/page.js",
                lineNumber: 658,
                columnNumber: 11
            }, this);
        }
    }, void 0, false, {
        fileName: "[project]/app/explore/page.js",
        lineNumber: 652,
        columnNumber: 5
    }, this);
}
_s(ExploreContent, "GK23mbxnm3K/yLRaagB+qQ4frz4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"]
    ];
});
_c = ExploreContent;
function ExplorePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 text-slate-400",
            children: "Loading Map Explorer..."
        }, void 0, false, {
            fileName: "[project]/app/explore/page.js",
            lineNumber: 1379,
            columnNumber: 25
        }, this),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ExploreContent, {}, void 0, false, {
            fileName: "[project]/app/explore/page.js",
            lineNumber: 1380,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/explore/page.js",
        lineNumber: 1379,
        columnNumber: 5
    }, this);
}
_c1 = ExplorePage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ExploreContent");
__turbopack_context__.k.register(_c1, "ExplorePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AmenityScoreCard.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AmenityScoreCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-pulse.mjs [app-client] (ecmascript) <export default as HeartPulse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.mjs [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.mjs [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bus.mjs [app-client] (ecmascript) <export default as Bus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.mjs [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$amenityCalculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/amenityCalculator.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Client-side in-memory cache to guarantee 0ms instant loading for visited plots
const amenityCache = new Map();
const CATEGORY_META = {
    healthcare: {
        label: 'Healthcare',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__["HeartPulse"],
        barColor: 'bg-emerald-600',
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    education: {
        label: 'Education',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"],
        barColor: 'bg-teal-600',
        bgColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    commerce: {
        label: 'Commerce & Retail',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"],
        barColor: 'bg-blue-600',
        bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    transit: {
        label: 'Transit & Arterials',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bus$3e$__["Bus"],
        barColor: 'bg-indigo-600',
        bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
};
function getScoreColorClass(score) {
    if (score >= 80) return {
        text: 'text-emerald-700',
        stroke: '#059669',
        bg: 'bg-emerald-50 border-emerald-200'
    };
    if (score >= 60) return {
        text: 'text-teal-700',
        stroke: '#0d9488',
        bg: 'bg-teal-50 border-teal-200'
    };
    if (score >= 40) return {
        text: 'text-amber-700',
        stroke: '#d97706',
        bg: 'bg-amber-50 border-amber-200'
    };
    return {
        text: 'text-slate-600',
        stroke: '#64748b',
        bg: 'bg-slate-100 border-slate-200'
    };
}
function AmenityScoreCard({ plotId, lat, lng, center, className = '' }) {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const resolvedLat = lat !== undefined && lat !== null ? Number(lat) : center?.lat;
    const resolvedLng = lng !== undefined && lng !== null ? Number(lng) : center?.lng;
    const hasValidCoordinates = typeof resolvedLat === 'number' && typeof resolvedLng === 'number' && !Number.isNaN(resolvedLat) && !Number.isNaN(resolvedLng) && resolvedLat >= -90 && resolvedLat <= 90 && resolvedLng >= -180 && resolvedLng <= 180;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AmenityScoreCard.useEffect": ()=>{
            if (!hasValidCoordinates) {
                setData(null);
                setLoading(false);
                return;
            }
            const cacheKey = plotId ? `${plotId}_${resolvedLat}_${resolvedLng}` : `${resolvedLat}_${resolvedLng}`;
            // 1. Instant Cache Hit
            if (amenityCache.has(cacheKey)) {
                setData(amenityCache.get(cacheKey));
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            // Fast local calculation with graceful fallback
            try {
                const localResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$amenityCalculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateAmenityScores"])(resolvedLat, resolvedLng);
                if (localResult) {
                    amenityCache.set(cacheKey, localResult);
                    setData(localResult);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('[AmenityScoreCard] Local evaluation notice, attempting API fetch:', err);
            }
            // Secondary lazy API fetch if needed
            let isMounted = true;
            async function fetchScores() {
                try {
                    const res = await fetch(`/api/amenities?lat=${resolvedLat}&lng=${resolvedLng}&plotId=${plotId || 'plot'}`);
                    if (!res.ok) throw new Error('Failed to load amenity ratings');
                    const resData = await res.json();
                    if (isMounted) {
                        amenityCache.set(cacheKey, resData);
                        setData(resData);
                    }
                } catch (e) {
                    if (isMounted) setError('Unable to compute neighborhood proximity.');
                } finally{
                    if (isMounted) setLoading(false);
                }
            }
            fetchScores();
            return ({
                "AmenityScoreCard.useEffect": ()=>{
                    isMounted = false;
                }
            })["AmenityScoreCard.useEffect"];
        }
    }["AmenityScoreCard.useEffect"], [
        plotId,
        resolvedLat,
        resolvedLng,
        hasValidCoordinates
    ]);
    // Graceful Fallback Card if coordinates are absent or unmapped
    if (!hasValidCoordinates) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                    className: "w-3.5 h-3.5 text-slate-400"
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Amenity Accessibility"
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-slate-100 text-slate-600 border-slate-200",
                            children: "Survey Pending"
                        }, void 0, false, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                            className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                        }, void 0, false, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-medium text-slate-700",
                                    children: "Geospatial coordinates pending"
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 143,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-slate-500 mt-0.5",
                                    children: "Boundary survey for this plot is being finalized. Proximity scores for healthcare, education, transit, and commerce will display once coordinates are recorded."
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AmenityScoreCard.js",
            lineNumber: 130,
            columnNumber: 7
        }, this);
    }
    // Shimmering Skeleton Loader while fetching/calculating
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 animate-pulse ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-4 bg-slate-200 rounded w-44"
                        }, void 0, false, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 158,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-7 w-16 bg-slate-200 rounded-lg"
                        }, void 0, false, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 159,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 157,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-3",
                    children: [
                        1,
                        2,
                        3,
                        4
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3.5 bg-slate-200 rounded w-28"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AmenityScoreCard.js",
                                            lineNumber: 165,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3.5 bg-slate-200 rounded w-12"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AmenityScoreCard.js",
                                            lineNumber: 166,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-2 bg-slate-100 rounded-full w-full"
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 163,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 161,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AmenityScoreCard.js",
            lineNumber: 156,
            columnNumber: 7
        }, this);
    }
    if (error || !data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2 ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    className: "w-4 h-4 text-slate-400 shrink-0"
                }, void 0, false, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 179,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Neighborhood proximity data is temporarily unavailable."
                }, void 0, false, {
                    fileName: "[project]/components/AmenityScoreCard.js",
                    lineNumber: 180,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AmenityScoreCard.js",
            lineNumber: 178,
            columnNumber: 7
        }, this);
    }
    const scoreMeta = getScoreColorClass(data.overallScore);
    const categories = data.categories || {};
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                        className: "w-3.5 h-3.5 text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 194,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Amenity Accessibility"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 195,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AmenityScoreCard.js",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-slate-500 mt-0.5",
                                children: "Normalized proximity to Islamabad/Rawalpindi hubs"
                            }, void 0, false, {
                                fileName: "[project]/components/AmenityScoreCard.js",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/AmenityScoreCard.js",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex items-center justify-center w-11 h-11",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-11 h-11 transform -rotate-90",
                                    viewBox: "0 0 36 36",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            className: "text-slate-100",
                                            strokeWidth: "3.5",
                                            stroke: "currentColor",
                                            fill: "none",
                                            d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AmenityScoreCard.js",
                                            lineNumber: 206,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            stroke: scoreMeta.stroke,
                                            strokeWidth: "3.5",
                                            strokeDasharray: `${Math.max(5, data.overallScore)}, 100`,
                                            strokeLinecap: "round",
                                            fill: "none",
                                            d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AmenityScoreCard.js",
                                            lineNumber: 213,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 205,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute text-xs font-extrabold text-slate-800",
                                    children: data.overallScore
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 222,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AmenityScoreCard.js",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AmenityScoreCard.js",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AmenityScoreCard.js",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between pt-1 border-t border-slate-100 text-xs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-slate-500 font-medium",
                        children: "Rating Index"
                    }, void 0, false, {
                        fileName: "[project]/components/AmenityScoreCard.js",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `px-2 py-0.5 rounded-md border text-[11px] font-semibold ${data.rating?.badge || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`,
                        children: data.rating?.label || 'High Accessibility'
                    }, void 0, false, {
                        fileName: "[project]/components/AmenityScoreCard.js",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AmenityScoreCard.js",
                lineNumber: 230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 pt-1",
                children: Object.entries(CATEGORY_META).map(([key, meta])=>{
                    const item = categories[key] || {
                        score: 50,
                        distanceKm: 2.5,
                        nearestName: 'Regional Facility'
                    };
                    const Icon = meta.icon;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 font-medium text-slate-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `p-1 rounded-md border ${meta.bgColor}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/AmenityScoreCard.js",
                                                    lineNumber: 248,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/AmenityScoreCard.js",
                                                lineNumber: 247,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: meta.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/AmenityScoreCard.js",
                                                lineNumber: 250,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 246,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px] text-slate-400 font-sans",
                                                children: [
                                                    item.distanceKm,
                                                    " km"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/AmenityScoreCard.js",
                                                lineNumber: 253,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-slate-800 text-[11px]",
                                                children: [
                                                    item.score,
                                                    "/100"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/AmenityScoreCard.js",
                                                lineNumber: 256,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 252,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AmenityScoreCard.js",
                                lineNumber: 245,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full bg-slate-100 rounded-full h-1.5 overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `h-full rounded-full transition-all duration-500 ${meta.barColor}`,
                                    style: {
                                        width: `${Math.max(5, item.score)}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/AmenityScoreCard.js",
                                    lineNumber: 264,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/AmenityScoreCard.js",
                                lineNumber: 263,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-[10px] text-slate-500 truncate pl-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate max-w-[240px]",
                                        title: item.nearestName,
                                        children: item.nearestName
                                    }, void 0, false, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 272,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "shrink-0 text-slate-400 font-medium",
                                        children: item.distanceKm <= 1.5 ? 'Nearby (<1.5km)' : `${item.distanceKm}km away`
                                    }, void 0, false, {
                                        fileName: "[project]/components/AmenityScoreCard.js",
                                        lineNumber: 275,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AmenityScoreCard.js",
                                lineNumber: 271,
                                columnNumber: 15
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/components/AmenityScoreCard.js",
                        lineNumber: 244,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/AmenityScoreCard.js",
                lineNumber: 238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AmenityScoreCard.js",
        lineNumber: 189,
        columnNumber: 5
    }, this);
}
_s(AmenityScoreCard, "RiL7vLwmC7ZWXKL/bXt2EIBjBYk=");
_c = AmenityScoreCard;
var _c;
__turbopack_context__.k.register(_c, "AmenityScoreCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UserAvatar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ProfileContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profileHelper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function UserAvatar({ user, profile: propProfile, className = '' }) {
    _s();
    const { profile: contextProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    if (!user) return null;
    const localCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalCachedProfile"])(user.id);
    const userMeta = user.user_metadata || {};
    const activeProfile = propProfile || contextProfile || localCache;
    const avatarUrl = activeProfile?.avatar_url || userMeta.avatar_url || userMeta.picture || null;
    const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || user.email || 'User';
    const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-2 ${className}`,
        children: [
            avatarUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: avatarUrl,
                alt: displayName,
                title: displayName,
                className: "w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 23,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                title: displayName,
                className: "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center border border-emerald-800 shadow-sm shrink-0",
                children: initial
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 30,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold text-slate-700 hidden lg:inline-block max-w-[120px] truncate",
                children: displayName
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/UserAvatar.js",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(UserAvatar, "HuCLXjc09z3zPzAxOJOWdo/XnWc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"]
    ];
});
_c = UserAvatar;
var _c;
__turbopack_context__.k.register(_c, "UserAvatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UserNav.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserAvatar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserAvatar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.mjs [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.mjs [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ProfileContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/FavoritesContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profileHelper.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function UserNav({ session, onSignOut, className = '' }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isDropdownOpen, setIsDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [signingOut, setSigningOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { user: contextUser, profile: contextProfile, loading: profileLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    const { count: favoritesCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"])();
    const activeUser = session?.user || contextUser;
    // Click-outside listener to close dropdown automatically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserNav.useEffect": ()=>{
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            return ({
                "UserNav.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                    document.removeEventListener('touchstart', handleClickOutside);
                }
            })["UserNav.useEffect"];
        }
    }["UserNav.useEffect"], []);
    const handleSignOutClick = async ()=>{
        setIsDropdownOpen(false);
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
        setSigningOut(true);
        try {
            if (onSignOut) {
                await onSignOut();
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            console.error('Sign out error:', err);
        } finally{
            setSigningOut(false);
        }
    };
    const handleGoToSettings = ()=>{
        setIsDropdownOpen(false);
        router.push('/settings');
    };
    // Loading state skeleton
    if (profileLoading && !session && !contextUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 rounded-full bg-slate-200 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/UserNav.js",
            lineNumber: 69,
            columnNumber: 7
        }, this);
    }
    // -------------------------------------------------------------
    // GUEST STATE (Unauthenticated User)
    // -------------------------------------------------------------
    if (!activeUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login",
                    className: "flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                            className: "w-3.5 h-3.5 text-emerald-700"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Sign In"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/UserNav.js",
                    lineNumber: 81,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login?signup=true",
                    className: "hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl shadow-xs transition",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                            className: "w-3.5 h-3.5 text-emerald-100"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Sign Up"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/UserNav.js",
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/UserNav.js",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    // -------------------------------------------------------------
    // AUTHENTICATED STATE (Logged In User)
    // -------------------------------------------------------------
    const localCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalCachedProfile"])(activeUser.id);
    const userMeta = activeUser.user_metadata || {};
    const activeProfile = contextProfile || localCache;
    const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || activeUser.email || 'Account';
    const phoneNumber = activeProfile?.phone_number || userMeta.phone_number || activeUser.phone;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative inline-block text-left ${className}`,
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setIsDropdownOpen((prev)=>!prev),
                disabled: signingOut,
                className: "flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100/80 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50",
                "aria-expanded": isDropdownOpen,
                "aria-haspopup": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserAvatar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        user: activeUser,
                        profile: activeProfile
                    }, void 0, false, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: `w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`
                    }, void 0, false, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            isDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-slate-900 truncate",
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-slate-500 truncate",
                                children: activeUser.email
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            phoneNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 text-[10px] text-emerald-700 mt-1 font-mono font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                        className: "w-3 h-3 text-emerald-600 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: phoneNumber
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 138,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setIsDropdownOpen(false);
                                    router.push('/favorites');
                                },
                                className: "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                className: "w-4 h-4 text-rose-500 fill-rose-500/20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/UserNav.js",
                                                lineNumber: 154,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "My Favorites"
                                            }, void 0, false, {
                                                fileName: "[project]/components/UserNav.js",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this),
                                    favoritesCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        children: favoritesCount
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleGoToSettings,
                                className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-4 h-4 text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Account Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-slate-100 my-1"
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleSignOutClick,
                                disabled: signingOut,
                                className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50",
                                children: [
                                    signingOut ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-4 h-4 text-slate-400 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-4 h-4 text-red-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 184,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: signingOut ? 'Signing out...' : 'Sign Out'
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 186,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 129,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/UserNav.js",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s(UserNav, "GOqJSExFz4aLnJd+R7Wjaiy31VA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"]
    ];
});
_c = UserNav;
var _c;
__turbopack_context__.k.register(_c, "UserNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/amenityCalculator.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * NAQSHAI Geospatial Neighborhood Amenity Calculation Engine
 * Evaluates coordinates (lat, lng) against regional amenity landmarks
 * across Islamabad & Rawalpindi to produce normalized accessibility scores (0-100).
 */ // Haversine spherical distance formula in kilometers
__turbopack_context__.s([
    "REGIONAL_AMENITIES",
    ()=>REGIONAL_AMENITIES,
    "calculateAmenityScores",
    ()=>calculateAmenityScores,
    "calculateHaversineDistance",
    ()=>calculateHaversineDistance,
    "getAmenityRating",
    ()=>getAmenityRating
]);
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
const REGIONAL_AMENITIES = {
    education: [
        {
            name: 'NUST (National University of Sciences & Technology)',
            lat: 33.6425,
            lng: 72.993
        },
        {
            name: 'FAST-NUCES Islamabad',
            lat: 33.6555,
            lng: 73.0157
        },
        {
            name: 'COMSATS University Islamabad',
            lat: 33.6518,
            lng: 73.1566
        },
        {
            name: 'Quaid-i-Azam University',
            lat: 33.7483,
            lng: 73.1365
        },
        {
            name: 'Roots Millennium School (One World Campus)',
            lat: 33.7145,
            lng: 73.0315
        },
        {
            name: 'Beaconhouse School System (Margalla Campus)',
            lat: 33.6933,
            lng: 73.024
        },
        {
            name: 'Army Public School & College (Westridge)',
            lat: 33.5978,
            lng: 73.0298
        },
        {
            name: 'Roots Millennium School (Capital Campus, G-11)',
            lat: 33.6678,
            lng: 72.9985
        },
        {
            name: 'Froebel’s International School (F-7)',
            lat: 33.722,
            lng: 73.053
        },
        {
            name: 'Bahria University Islamabad',
            lat: 33.7153,
            lng: 73.0289
        },
        {
            name: 'Roots Millennium School (Rivertree Campus, Bahria Town)',
            lat: 33.535,
            lng: 73.109
        }
    ],
    healthcare: [
        {
            name: 'Shifa International Hospital',
            lat: 33.6766,
            lng: 73.0784
        },
        {
            name: 'PIMS Hospital (Pakistan Institute of Medical Sciences)',
            lat: 33.7042,
            lng: 73.054
        },
        {
            name: 'Quaid-e-Azam International Hospital',
            lat: 33.6268,
            lng: 72.9754
        },
        {
            name: 'Kulsum International Hospital (Blue Area)',
            lat: 33.7118,
            lng: 73.0588
        },
        {
            name: 'Benazir Bhutto Hospital (Murree Road, Rawalpindi)',
            lat: 33.6205,
            lng: 73.0712
        },
        {
            name: 'Holy Family Hospital (Satellite Town, Rawalpindi)',
            lat: 33.6335,
            lng: 73.0645
        },
        {
            name: 'Fauji Foundation Hospital',
            lat: 33.5714,
            lng: 73.1328
        },
        {
            name: 'Bahria International Hospital (Phase 8)',
            lat: 33.5187,
            lng: 73.0989
        },
        {
            name: 'Ali Medical Centre (F-8 Markaz)',
            lat: 33.7102,
            lng: 73.038
        },
        {
            name: 'Maroof International Hospital (F-10)',
            lat: 33.6917,
            lng: 73.0118
        }
    ],
    commerce: [
        {
            name: 'The Centaurus Mall (Blue Area/F-8)',
            lat: 33.7077,
            lng: 73.0498
        },
        {
            name: 'Giga Mall (DHA Phase 2 / GT Road)',
            lat: 33.5222,
            lng: 73.1558
        },
        {
            name: 'Safa Gold Mall (F-7 Markaz)',
            lat: 33.7214,
            lng: 73.0558
        },
        {
            name: 'F-6 Super Market',
            lat: 33.7289,
            lng: 73.0772
        },
        {
            name: 'F-10 Markaz Commercial Hub',
            lat: 33.6934,
            lng: 73.0135
        },
        {
            name: 'G-11 Markaz',
            lat: 33.6673,
            lng: 72.9995
        },
        {
            name: 'Gulberg Greens Civic Center / D-Markaz',
            lat: 33.6063,
            lng: 73.1528
        },
        {
            name: 'Bahria Town Civic Center (Phase 4)',
            lat: 33.5518,
            lng: 73.1092
        },
        {
            name: 'Saddar Commercial District Rawalpindi',
            lat: 33.5935,
            lng: 73.0543
        },
        {
            name: 'B-17 Multi Gardens Commercial Square',
            lat: 33.6828,
            lng: 72.8225
        }
    ],
    transit: [
        {
            name: 'Islamabad Expressway (Zero Point Interchange)',
            lat: 33.6922,
            lng: 73.0645
        },
        {
            name: 'Srinagar / Kashmir Highway (G-9 Interchange)',
            lat: 33.6784,
            lng: 73.0232
        },
        {
            name: 'Metro Bus Station (Secretariat Terminal)',
            lat: 33.7383,
            lng: 73.0978
        },
        {
            name: 'Metro Bus Station (Faizabad Interchange)',
            lat: 33.6635,
            lng: 73.0848
        },
        {
            name: 'Metro Bus Station (Saddar Station Rawalpindi)',
            lat: 33.5985,
            lng: 73.0515
        },
        {
            name: 'GT Road (Rawat Junction)',
            lat: 33.4998,
            lng: 73.1932
        },
        {
            name: 'Islamabad International Airport Motorway Link (M-2)',
            lat: 33.5658,
            lng: 72.8465
        },
        {
            name: 'IJP Principal Road (Double Road Junction)',
            lat: 33.6492,
            lng: 73.0673
        },
        {
            name: 'Islamabad Expressway (Koral Interchange)',
            lat: 33.6083,
            lng: 73.1362
        },
        {
            name: 'Rawalpindi Ring Road Junction',
            lat: 33.5358,
            lng: 73.0289
        }
    ]
};
// Proximity scoring configuration
const PROXIMITY_CONFIG = {
    maxScoreRadiusKm: 1.5,
    zeroScoreRadiusKm: 5.0,
    weights: {
        healthcare: 0.30,
        education: 0.25,
        commerce: 0.25,
        transit: 0.20
    }
};
/**
 * Normalizes distance to score (0-100) using linear decay
 */ function distanceToScore(distKm) {
    if (distKm <= PROXIMITY_CONFIG.maxScoreRadiusKm) return 100;
    if (distKm >= PROXIMITY_CONFIG.zeroScoreRadiusKm) return 10; // baseline 10 for accessibility awareness
    const range = PROXIMITY_CONFIG.zeroScoreRadiusKm - PROXIMITY_CONFIG.maxScoreRadiusKm;
    const delta = distKm - PROXIMITY_CONFIG.maxScoreRadiusKm;
    const score = Math.round(100 - delta / range * 90);
    return Math.max(10, Math.min(100, score));
}
function getAmenityRating(score) {
    if (score >= 85) return {
        label: 'Elite Proximity',
        color: 'emerald',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
    if (score >= 70) return {
        label: 'High Accessibility',
        color: 'teal',
        badge: 'bg-teal-50 text-teal-800 border-teal-200'
    };
    if (score >= 50) return {
        label: 'Moderate Convenience',
        color: 'amber',
        badge: 'bg-amber-50 text-amber-800 border-amber-200'
    };
    return {
        label: 'Developing Zone',
        color: 'slate',
        badge: 'bg-slate-100 text-slate-700 border-slate-200'
    };
}
function calculateAmenityScores(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
    }
    const categories = {};
    let weightedSum = 0;
    for (const [catKey, items] of Object.entries(REGIONAL_AMENITIES)){
        let nearest = null;
        let minDistance = Infinity;
        for (const item of items){
            const dist = calculateHaversineDistance(lat, lng, item.lat, item.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = item;
            }
        }
        const roundedDist = Math.round(minDistance * 10) / 10;
        const score = distanceToScore(roundedDist);
        const weight = PROXIMITY_CONFIG.weights[catKey] || 0.25;
        weightedSum += score * weight;
        categories[catKey] = {
            score,
            distanceKm: roundedDist,
            nearestName: nearest ? nearest.name : 'Regional Hub',
            weightPercentage: Math.round(weight * 100)
        };
    }
    const overallScore = Math.round(weightedSum);
    const rating = getAmenityRating(overallScore);
    return {
        overallScore,
        rating,
        categories: {
            healthcare: categories.healthcare,
            education: categories.education,
            commerce: categories.commerce,
            transit: categories.transit
        },
        calculatedAt: new Date().toISOString()
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/useGoogleMapsLoader.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GoogleMapsSafeLoader",
    ()=>GoogleMapsSafeLoader,
    "useGoogleMaps",
    ()=>useGoogleMaps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-google-maps/api/dist/esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const MAP_LIBRARIES = [
    'places'
];
const SCRIPT_ID = 'google-map-script';
function InternalLoader({ children }) {
    _s();
    const { isLoaded, loadError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useJsApiLoader"])({
        id: SCRIPT_ID,
        googleMapsApiKey: ("TURBOPACK compile-time value", "AIzaSyD6Rfqft7eySloxKpKpxX13HulgcmHSahE") || '',
        libraries: MAP_LIBRARIES
    });
    // 3. Error Guard: Return safe error UI if script fails to load
    if (loadError) {
        if (typeof children === 'function') {
            return children({
                isLoaded: false,
                loadError
            });
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-slate-200",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-3 bg-red-50 border border-red-200 rounded-2xl mb-3 text-red-600",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "w-6 h-6"
                    }, void 0, false, {
                        fileName: "[project]/lib/useGoogleMapsLoader.js",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/lib/useGoogleMapsLoader.js",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-base font-bold text-slate-800",
                    children: "Map Script Error"
                }, void 0, false, {
                    fileName: "[project]/lib/useGoogleMapsLoader.js",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-500 max-w-sm mt-1",
                    children: loadError.message || 'Unable to connect to Google Maps service. Please verify your API key or network connection.'
                }, void 0, false, {
                    fileName: "[project]/lib/useGoogleMapsLoader.js",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/lib/useGoogleMapsLoader.js",
            lineNumber: 23,
            columnNumber: 7
        }, this);
    }
    // 2. Load Guard: Check both isLoaded AND window.google.maps.Map constructor
    const isMapConstructorReady = isLoaded && ("TURBOPACK compile-time value", "object") !== 'undefined' && Boolean(window.google?.maps?.Map);
    if (!isMapConstructorReady) {
        if (typeof children === 'function') {
            return children({
                isLoaded: false,
                loadError: null
            });
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-slate-200",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-5 h-5 text-emerald-700 animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/lib/useGoogleMapsLoader.js",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-medium text-slate-700",
                        children: "Loading Map 3D Terrain..."
                    }, void 0, false, {
                        fileName: "[project]/lib/useGoogleMapsLoader.js",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/lib/useGoogleMapsLoader.js",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/lib/useGoogleMapsLoader.js",
            lineNumber: 43,
            columnNumber: 7
        }, this);
    }
    if (typeof children === 'function') {
        return children({
            isLoaded: true,
            loadError: null
        });
    }
    return children;
}
_s(InternalLoader, "ssip+Uy9VcsolHUNjpn9QiG6XKw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useJsApiLoader"]
    ];
});
_c = InternalLoader;
function GoogleMapsSafeLoader({ children }) {
    const isReady = ("TURBOPACK compile-time value", "object") !== 'undefined' && Boolean(window.google?.maps?.Map);
    if (isReady) {
        if (typeof children === 'function') {
            return children({
                isLoaded: true,
                loadError: null
            });
        }
        return children;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InternalLoader, {
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/useGoogleMapsLoader.js",
        lineNumber: 69,
        columnNumber: 10
    }, this);
}
_c1 = GoogleMapsSafeLoader;
function useGoogleMaps() {
    const isAvailable = ("TURBOPACK compile-time value", "object") !== 'undefined' && Boolean(window.google?.maps?.Map);
    if (isAvailable) {
        return {
            isLoaded: true,
            loadError: null
        };
    }
    return {
        isLoaded: false,
        loadError: null
    };
}
var _c, _c1;
__turbopack_context__.k.register(_c, "InternalLoader");
__turbopack_context__.k.register(_c1, "GoogleMapsSafeLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1yox971._.js.map