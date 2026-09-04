# NAQSHAI Comprehensive UI/UX Audit & Architectural Report

**Auditor:** Senior UI/UX Auditor & Next.js Architect  
**Project:** NAQSHAI — Pakistan Real Estate Intelligence & Geospatial Land Advisory  
**Date:** September 4, 2026  
**Scope:** `app/` and `components/` directory analysis across responsive layout, typography, accessibility (a11y), interactive states, and user flows.

---

## 1. Executive Summary

NAQSHAI presents a modern, feature-rich real estate intelligence portal tailored for Pakistan (Islamabad & Rawalpindi). The platform integrates advanced geospatial tooling, 3D Google Maps terrain rendering, automated amenity calculations, and a multilingual Google Gemini AI Advisor.

### **Frontend Health Rating: 8.2 / 10**

- **Design System Consistency:** High adherence to the "Refined Architectural Light" aesthetic (`bg-slate-100`, `bg-white`, `border-slate-200`, `emerald-700` accents).
- **Core Value Delivery:** Strong interactive features (elevation contours, flood risk indicators, 3D street view).
- **Primary UX Areas Requiring Attention:** Typography font overrides, mobile header navigation overlap, icon-button accessibility (a11y), native browser alert usages, and missing skeleton fallback states.

---

## 2. The Goods (Strengths)

1. **Refined Architectural Light Aesthetic**
   - Clean, consistent color hierarchy across pages ([`app/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/page.js), [`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/explore/page.js), [`app/sell/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/sell/page.js)).
   - Card surfaces use soft borders (`border-slate-200`), rounded corners (`rounded-2xl`), and subtle elevation shadows (`shadow-sm`), creating a professional spatial aesthetic.

2. **Geospatial & Terrain Tooling**
   - Seamless 3D Map Explorer ([`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/explore/page.js)) with interactive camera controls (tilt, rotate, reset bearing), elevation contours, and split-screen plot details.
   - Robust loading fallbacks via `GoogleMapsSafeLoader` to catch API key issues gracefully.

3. **Performance & In-Memory Caching**
   - [`components/AmenityScoreCard.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/AmenityScoreCard.js) implements an in-memory client-side cache (`amenityCache`), providing **0ms instant load times** for revisited plot amenity evaluations.

4. **Multilingual AI Guidance**
   - [`components/GuideChatbot.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/GuideChatbot.js) provides voice synthesis, speech recognition, and built-in quick actions supporting English, Roman Urdu, and Nastaliq script.

5. **Scroll & Progress Feedback**
   - [`components/ScrollProgressBar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/ScrollProgressBar.js) attached to [`components/Navbar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/Navbar.js) gives clear visual scroll depth feedback without jitter.

---

## 3. The Bads (Flaws & Shortcomings)

### **A. Typography & CSS Pipeline Flaws**
- **System Font Override in `globals.css`**:
  - In [`app/globals.css`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/globals.css), `body` explicitly sets `font-family: Arial, Helvetica, sans-serif;`.
  - This overrides the Geist font variables (`--font-geist-sans`) configured in [`app/layout.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/layout.js), preventing modern typography rendering across the app.

### **B. Navigation & Responsive Layout Collisions**
- **Mobile Menu Overlap (`MobileNav.js` vs `Navbar.js`)**:
  - [`components/MobileNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/MobileNav.js) renders a floating hamburger button at `fixed top-3 right-3 z-[60]`.
  - On mobile viewports, this button overlaps directly with [`components/UserNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/UserNav.js) and quick action buttons inside [`components/Navbar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/Navbar.js) (`sticky top-0 z-50`).

### **C. Accessibility (a11y) & Interactive States**
- **Missing `aria-label` on Icon-Only Buttons**:
  - Multiple icon-only buttons in [`components/GuideChatbot.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/GuideChatbot.js) (mic toggle, speech toggle, clear chat, close window) and [`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/explore/page.js) (3D view toggles, sidebar collapse) lack explicit `aria-label` descriptions for screen readers.
- **Image `alt` Attribute Fallbacks**:
  - [`components/UserAvatar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/UserAvatar.js) renders avatar images using `alt="User avatar"` instead of personalized names (`alt={displayName}`).
- **Native Browser Confirm Modals**:
  - Sign-out triggers in [`components/UserNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/UserNav.js) and [`app/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/page.js) rely on blocking `window.confirm('Are you sure you want to sign out?')` dialogs instead of accessible in-app confirmation modals.

### **D. Mobile Drawer & Map UX**
- **Mobile Split-View Constraint in 3D Map**:
  - On mobile screens, the plot list sidebar in [`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/explore/page.js) takes up 100% of the viewport width when opened, completely covering the map without a quick bottom-sheet backdrop toggle.

---

## 4. Actionable Technical Improvements

### **1. Fix Typography Pipeline in `globals.css`**
**Target File:** [`app/globals.css`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/app/globals.css)

**Issue:** System Arial font overrides Geist Sans.  
**Fix:** Remove `font-family: Arial...` and apply `var(--font-geist-sans)`.

```diff
 body {
   background: var(--background);
   color: var(--foreground);
-  font-family: Arial, Helvetica, sans-serif;
+  font-family: var(--font-geist-sans), system-ui, sans-serif;
 }
```

---

### **2. Resolve Mobile Navigation Collision**
**Target File:** [`components/MobileNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/MobileNav.js)

**Issue:** Floating `fixed top-3 right-3` hamburger button overlaps `UserNav` in sticky `Navbar`.  
**Fix:** Restructure mobile nav integration or adjust positioning/visibility so `Navbar.js` manages navigation links on mobile viewports seamlessly without overlap.

```diff
- <div className="md:hidden fixed top-3 right-3 z-[60]">
+ <div className="md:hidden fixed bottom-4 right-4 z-[60]">
```
*(Or delegate mobile dropdown rendering inside [`components/Navbar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/Navbar.js)).*

---

### **3. Comprehensive Icon-Button Accessibility**
**Target File:** [`components/GuideChatbot.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/GuideChatbot.js)

**Issue:** Interactive icon buttons lack accessible text names.  
**Fix:** Add explicit `aria-label` attributes to all action buttons:

```jsx
<button
  type="button"
  onClick={toggleSpeech}
  aria-label={isSpeechEnabled ? "Mute voice assistant" : "Enable voice assistant"}
  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
>
  {isSpeechEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
</button>
```

---

### **4. Accessible Avatar Image Tags**
**Target File:** [`components/UserAvatar.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/UserAvatar.js)

**Issue:** Generic static `alt="User avatar"`.  
**Fix:** Use dynamic user display name for screen reader clarity:

```jsx
<Image
  src={avatarUrl}
  alt={`${displayName}'s profile picture`}
  fill
  className="object-cover"
/>
```

---

### **5. Replace Native `window.confirm` with In-App Confirmation**
**Target File:** [`components/UserNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/naqshai/naqshai/components/UserNav.js)

**Issue:** Native blocking `window.confirm()` breaks custom UI styling.  
**Fix:** Implement an in-app confirmation modal or inline dropdown confirm state for Sign Out actions.

---

## 5. Audit Conclusion

NAQSHAI has established a clean, high-performance architectural foundation. Resolving the typography override, mobile header button collision, and accessibility labels will bring the platform's frontend to **production-grade enterprise standard**.
