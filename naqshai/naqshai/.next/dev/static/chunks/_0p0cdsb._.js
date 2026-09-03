(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/context/FavoritesContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FavoritesProvider",
    ()=>FavoritesProvider,
    "useFavorites",
    ()=>useFavorites
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const FavoritesContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const LOCAL_FAVORITES_KEY = 'naqshai_local_favorites';
function FavoritesProvider({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [favoritePlotIds, setFavoritePlotIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [favoritePlots, setFavoritePlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // 1. Listen to Supabase Auth State
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FavoritesProvider.useEffect": ()=>{
            let isMounted = true;
            async function checkSession() {
                try {
                    const { data: { session: activeSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (isMounted) setSession(activeSession);
                } catch (e) {
                    console.warn('[FavoritesContext] Session check error:', e);
                }
            }
            checkSession();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "FavoritesProvider.useEffect": (_event, currentSession)=>{
                    if (isMounted) setSession(currentSession);
                }
            }["FavoritesProvider.useEffect"]);
            return ({
                "FavoritesProvider.useEffect": ()=>{
                    isMounted = false;
                    subscription?.unsubscribe();
                }
            })["FavoritesProvider.useEffect"];
        }
    }["FavoritesProvider.useEffect"], []);
    // 2. Fetch User Favorites (from server if authenticated, fallback to local storage)
    const fetchFavorites = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FavoritesProvider.useCallback[fetchFavorites]": async ()=>{
            if (!session?.access_token) {
                // Unauthenticated: load from localStorage
                try {
                    const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
                    if (raw) {
                        const ids = JSON.parse(raw);
                        if (Array.isArray(ids)) {
                            setFavoritePlotIds(new Set(ids));
                        }
                    }
                } catch (_) {}
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch('/api/favorites', {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.favorites)) {
                        setFavoritePlotIds(new Set(data.favorites));
                    }
                    if (Array.isArray(data.plots)) {
                        setFavoritePlots(data.plots);
                    }
                }
            } catch (err) {
                console.warn('[FavoritesContext] Failed to load remote favorites:', err);
            } finally{
                setLoading(false);
            }
        }
    }["FavoritesProvider.useCallback[fetchFavorites]"], [
        session?.access_token
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FavoritesProvider.useEffect": ()=>{
            fetchFavorites();
        }
    }["FavoritesProvider.useEffect"], [
        fetchFavorites
    ]);
    // 3. Check if plot is in favorites
    const isFavorite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FavoritesProvider.useCallback[isFavorite]": (plotId)=>{
            if (!plotId) return false;
            return favoritePlotIds.has(plotId);
        }
    }["FavoritesProvider.useCallback[isFavorite]"], [
        favoritePlotIds
    ]);
    // 4. Toggle Favorite (Optimistic UI with 0ms visual response)
    const toggleFavorite = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FavoritesProvider.useCallback[toggleFavorite]": async (plotId, plotData = null)=>{
            if (!plotId) return;
            const wasFavorite = favoritePlotIds.has(plotId);
            const nextIds = new Set(favoritePlotIds);
            if (wasFavorite) {
                nextIds.delete(plotId);
                setFavoritePlotIds(nextIds);
                setFavoritePlots({
                    "FavoritesProvider.useCallback[toggleFavorite]": (prev)=>prev.filter({
                            "FavoritesProvider.useCallback[toggleFavorite]": (p)=>p.id !== plotId
                        }["FavoritesProvider.useCallback[toggleFavorite]"])
                }["FavoritesProvider.useCallback[toggleFavorite]"]);
            } else {
                nextIds.add(plotId);
                setFavoritePlotIds(nextIds);
                if (plotData) {
                    setFavoritePlots({
                        "FavoritesProvider.useCallback[toggleFavorite]": (prev)=>[
                                plotData,
                                ...prev.filter({
                                    "FavoritesProvider.useCallback[toggleFavorite]": (p)=>p.id !== plotId
                                }["FavoritesProvider.useCallback[toggleFavorite]"])
                            ]
                    }["FavoritesProvider.useCallback[toggleFavorite]"]);
                }
            }
            // Persist locally for instant recovery
            try {
                localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(Array.from(nextIds)));
            } catch (_) {}
            // If user is authenticated, sync with database
            if (session?.access_token) {
                try {
                    const res = await fetch('/api/favorites', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({
                            plotId
                        })
                    });
                    if (!res.ok) {
                        // Revert on failure
                        console.warn('[FavoritesContext] Toggle sync failed, reverting optimistic state');
                        fetchFavorites();
                    }
                } catch (e) {
                    console.warn('[FavoritesContext] Network error syncing favorite:', e);
                    fetchFavorites();
                }
            } else {
                // If not authenticated, inform the user they can sign in to sync
                console.log('[FavoritesContext] Saved locally. Sign in to sync across devices.');
            }
        }
    }["FavoritesProvider.useCallback[toggleFavorite]"], [
        favoritePlotIds,
        session?.access_token,
        fetchFavorites
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FavoritesProvider.useMemo[value]": ()=>({
                favoritePlotIds,
                favoritePlots,
                isFavorite,
                toggleFavorite,
                refreshFavorites: fetchFavorites,
                loading,
                count: favoritePlotIds.size
            })
    }["FavoritesProvider.useMemo[value]"], [
        favoritePlotIds,
        favoritePlots,
        isFavorite,
        toggleFavorite,
        fetchFavorites,
        loading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FavoritesContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/context/FavoritesContext.js",
        lineNumber: 163,
        columnNumber: 10
    }, this);
}
_s(FavoritesProvider, "iqokIGqd+UDwBxOy3L8O8BD9B3o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = FavoritesProvider;
function useFavorites() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(FavoritesContext);
    if (!ctx) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return ctx;
}
_s1(useFavorites, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "FavoritesProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/context/ProfileContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileProvider",
    ()=>ProfileProvider,
    "useProfile",
    ()=>useProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profileHelper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const ProfileContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    session: null,
    profile: null,
    loading: true,
    refreshProfile: async ()=>{},
    setProfileState: ()=>{}
});
function ProfileProvider({ children }) {
    _s();
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Database-First fetch using fresh auth user and public.profiles table
    const fetchPersistentProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[fetchPersistentProfile]": async (userId = null)=>{
            try {
                const { user: freshUser, profile: dbProfile } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchLatestUserAndProfile"])(userId);
                if (freshUser) {
                    setUser(freshUser);
                }
                if (dbProfile) {
                    setProfile(dbProfile);
                }
                return dbProfile;
            } catch (err) {
                console.warn('fetchPersistentProfile notice:', err);
                return null;
            }
        }
    }["ProfileProvider.useCallback[fetchPersistentProfile]"], []);
    // Initialize auth & listen for changes/events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfileProvider.useEffect": ()=>{
            let isMounted = true;
            async function initAuth() {
                try {
                    const { data: { session: activeSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (isMounted) {
                        setSession(activeSession);
                        if (activeSession?.user?.id) {
                            await fetchPersistentProfile(activeSession.user.id);
                        }
                    }
                } catch (err) {
                    console.warn('Auth init notice in ProfileContext:', err);
                } finally{
                    if (isMounted) setLoading(false);
                }
            }
            initAuth();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "ProfileProvider.useEffect": async (_event, currentSession)=>{
                    if (isMounted) {
                        setSession(currentSession);
                        if (currentSession?.user?.id) {
                            await fetchPersistentProfile(currentSession.user.id);
                        } else {
                            setUser(null);
                            setProfile(null);
                        }
                    }
                }
            }["ProfileProvider.useEffect"]);
            // Client-Side Event Trigger Listeners:
            // Listen for both 'profile-updated' and 'naqshai:profile-updated'
            const handleStandardProfileUpdated = {
                "ProfileProvider.useEffect.handleStandardProfileUpdated": async ()=>{
                    if (isMounted) {
                        await fetchPersistentProfile();
                    }
                }
            }["ProfileProvider.useEffect.handleStandardProfileUpdated"];
            const handleCustomProfileUpdate = {
                "ProfileProvider.useEffect.handleCustomProfileUpdate": (event)=>{
                    if (isMounted && event.detail) {
                        setProfile({
                            "ProfileProvider.useEffect.handleCustomProfileUpdate": (prev)=>({
                                    ...prev || {},
                                    ...event.detail
                                })
                        }["ProfileProvider.useEffect.handleCustomProfileUpdate"]);
                    }
                }
            }["ProfileProvider.useEffect.handleCustomProfileUpdate"];
            if ("TURBOPACK compile-time truthy", 1) {
                window.addEventListener('profile-updated', handleStandardProfileUpdated);
                window.addEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROFILE_UPDATED_EVENT"], handleCustomProfileUpdate);
            }
            return ({
                "ProfileProvider.useEffect": ()=>{
                    isMounted = false;
                    subscription?.unsubscribe();
                    if ("TURBOPACK compile-time truthy", 1) {
                        window.removeEventListener('profile-updated', handleStandardProfileUpdated);
                        window.removeEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROFILE_UPDATED_EVENT"], handleCustomProfileUpdate);
                    }
                }
            })["ProfileProvider.useEffect"];
        }
    }["ProfileProvider.useEffect"], [
        fetchPersistentProfile
    ]);
    const refreshProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[refreshProfile]": async ()=>{
            return await fetchPersistentProfile();
        }
    }["ProfileProvider.useCallback[refreshProfile]"], [
        fetchPersistentProfile
    ]);
    const setProfileState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProfileProvider.useCallback[setProfileState]": (newProfileData)=>{
            setProfile({
                "ProfileProvider.useCallback[setProfileState]": (prev)=>{
                    const updated = {
                        ...prev || {},
                        ...newProfileData
                    };
                    if ("TURBOPACK compile-time truthy", 1) {
                        window.dispatchEvent(new Event('profile-updated'));
                    }
                    return updated;
                }
            }["ProfileProvider.useCallback[setProfileState]"]);
        }
    }["ProfileProvider.useCallback[setProfileState]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfileContext.Provider, {
        value: {
            user,
            session,
            profile,
            loading,
            refreshProfile,
            setProfileState
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/ProfileContext.js",
        lineNumber: 120,
        columnNumber: 5
    }, this);
}
_s(ProfileProvider, "IQTY4AfSU+RSuILAL6UJjn8QcbY=");
_c = ProfileProvider;
function useProfile() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ProfileContext);
}
_s1(useProfile, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "ProfileProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/profileHelper.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROFILE_UPDATED_EVENT",
    ()=>PROFILE_UPDATED_EVENT,
    "broadcastProfileUpdate",
    ()=>broadcastProfileUpdate,
    "fetchLatestUserAndProfile",
    ()=>fetchLatestUserAndProfile,
    "getLocalCachedProfile",
    ()=>getLocalCachedProfile,
    "getProfile",
    ()=>getProfile,
    "setLocalCachedProfile",
    ()=>setLocalCachedProfile,
    "syncProfile",
    ()=>syncProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
;
const PROFILE_UPDATED_EVENT = 'naqshai:profile-updated';
function getLocalCachedProfile(userId) {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !userId) return null;
    try {
        const raw = localStorage.getItem(`naqshai_profile_${userId}`);
        if (raw) return JSON.parse(raw);
        const globalRaw = localStorage.getItem('naqshai_active_profile');
        if (globalRaw) return JSON.parse(globalRaw);
    } catch (e) {}
    return null;
}
function setLocalCachedProfile(userId, profileData) {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !userId || !profileData) return;
    try {
        const existing = getLocalCachedProfile(userId) || {};
        const merged = {
            ...existing,
            ...profileData,
            id: userId,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(`naqshai_profile_${userId}`, JSON.stringify(merged));
        localStorage.setItem('naqshai_active_profile', JSON.stringify(merged));
    } catch (e) {}
}
function broadcastProfileUpdate(updatedDetails) {
    if ("TURBOPACK compile-time truthy", 1) {
        window.dispatchEvent(new Event('profile-updated'));
        if (updatedDetails) {
            window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
                detail: updatedDetails
            }));
        }
    }
}
async function getProfile(userId) {
    if (!userId) return null;
    const localCache = getLocalCachedProfile(userId);
    try {
        // 1. Try public.profiles table
        const { data: profilesData, error: profilesErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('id, full_name, phone_number, avatar_url, created_at, updated_at').eq('id', userId).maybeSingle();
        if (profilesData && (profilesData.full_name || profilesData.avatar_url || profilesData.phone_number)) {
            const merged = {
                ...localCache,
                ...profilesData
            };
            setLocalCachedProfile(userId, merged);
            return merged;
        }
        // 2. Try public.sellers table
        const { data: sellerData } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sellers').select('full_name, avatar_url').eq('id', userId).maybeSingle();
        if (sellerData && (sellerData.full_name || sellerData.avatar_url)) {
            const merged = {
                ...localCache,
                ...sellerData
            };
            setLocalCachedProfile(userId, merged);
            return merged;
        }
    } catch (err) {
        console.warn('DB profile fetch notice:', err);
    }
    return localCache || null;
}
async function fetchLatestUserAndProfile(providedUserId = null) {
    try {
        const { data: { user: freshUser } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        const userId = providedUserId || freshUser?.id;
        if (!userId) {
            return {
                user: freshUser || null,
                profile: null
            };
        }
        const dbProfile = await getProfile(userId);
        return {
            user: freshUser || null,
            profile: dbProfile
        };
    } catch (err) {
        console.warn('fetchLatestUserAndProfile exception:', err);
        return {
            user: null,
            profile: null
        };
    }
}
async function syncProfile(userId, { full_name, phone_number, avatar_url }) {
    if (!userId) return {
        profile: null,
        authUser: null
    };
    const updateFields = {};
    if (full_name !== undefined) updateFields.full_name = full_name;
    if (phone_number !== undefined) updateFields.phone_number = phone_number;
    if (avatar_url !== undefined) updateFields.avatar_url = avatar_url;
    // 1. Write immediately to localStorage for instant persistence across reloads
    setLocalCachedProfile(userId, updateFields);
    const currentMergedProfile = getLocalCachedProfile(userId);
    // 2. Database Write: public.profiles table
    let dbProfile = currentMergedProfile;
    try {
        const payload = {
            id: userId,
            updated_at: new Date().toISOString(),
            ...updateFields
        };
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('profiles').upsert(payload, {
            onConflict: 'id'
        }).select().maybeSingle();
        if (!error && data) {
            dbProfile = {
                ...currentMergedProfile,
                ...data
            };
            setLocalCachedProfile(userId, dbProfile);
        }
    } catch (err) {
        console.warn('Profiles table upsert notice:', err);
    }
    // Backup sync to public.sellers table
    try {
        const sellerPayload = {
            id: userId,
            updated_at: new Date().toISOString(),
            ...updateFields
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('sellers').upsert(sellerPayload, {
            onConflict: 'id'
        });
    } catch (err) {
    // optional seller sync
    }
    // 3. Dual-Write to supabase.auth.updateUser()
    let authUser = null;
    try {
        const updatePayload = {};
        if (avatar_url !== undefined) {
            updatePayload.avatar_url = avatar_url;
            updatePayload.picture = avatar_url;
        }
        if (full_name !== undefined) {
            updatePayload.full_name = full_name;
        }
        if (phone_number !== undefined) {
            updatePayload.phone_number = phone_number;
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.updateUser({
            data: updatePayload
        });
        if (!error && data?.user) {
            authUser = data.user;
        }
    } catch (err) {
        console.warn('supabase.auth.updateUser notice:', err);
    }
    // 4. Force Session Refresh
    try {
        if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.refreshSession === 'function') {
            const { data: refreshedSession, error: refreshErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.refreshSession();
            if (!refreshErr && refreshedSession?.user) {
                authUser = refreshedSession.user;
            }
        }
    } catch (refreshEx) {
        console.warn('Post-update refreshSession notice:', refreshEx);
    }
    // 5. Client-Side Event Trigger
    broadcastProfileUpdate(dbProfile);
    return {
        profile: dbProfile,
        authUser
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabaseClient.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://zonuspndkqasfzjbvzhj.supabase.co") || '';
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_lXMa2-GNyC4pXv-LBF8iXw_3qEWD1Nz") || '';
const supabaseServiceKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0p0cdsb._.js.map