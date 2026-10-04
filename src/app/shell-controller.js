import {
  APP_SURFACES,
  isMassCoreRoute,
  normalizeAppSurface,
} from "./contracts.js";

function result(ok, surface, extra = {}) {
  return Object.freeze({ ok, surface, ...extra });
}

export function createAppShellController({ host, initialSurface = "home" } = {}) {
  if (!host) throw new TypeError("createAppShellController requires a host adapter");

  let active = normalizeAppSurface(initialSurface) ?? "home";
  let disposed = false;
  const listeners = new Set();

  function emit() {
    for (const listener of listeners) listener(active);
  }

  function setActive(surface) {
    const normalized = normalizeAppSurface(surface);
    if (!normalized || normalized === active) return false;
    active = normalized;
    emit();
    return true;
  }

  function syncCoreRoute(route) {
    if (isMassCoreRoute(route)) setActive("mass");
    return active;
  }

  const unsubscribeCore = host.subscribeCoreRoute?.(syncCoreRoute) ?? (() => {});
  syncCoreRoute(host.currentCoreRoute?.());

  async function go(surface) {
    if (disposed) return result(false, active, { reason: "DISPOSED" });
    const target = normalizeAppSurface(surface);
    if (!target) return result(false, active, { reason: "UNKNOWN_SURFACE" });

    // Settings is a top-level overlay and may be opened over an active Mass.
    // The locked donor deliberately handled it before the live-Mass leave guard.
    if (target === "settings") {
      const opened = Boolean(await host.openSettings?.());
      if (opened) setActive("settings");
      return result(opened, opened ? "settings" : active, {
        reason: opened ? null : "SETTINGS_OWNER_UNAVAILABLE",
      });
    }

    host.dismissSettings?.();
    const route = host.currentCoreRoute?.();
    const liveMass = route === "live" || Boolean(host.liveMassActive?.());

    // Preserve the field-proven live-session guard: changing app domains while
    // LIVE requires an explicit leave decision, while tapping Mass is a no-op.
    // Native-reader ownership is authoritative even if the historical route
    // store has already reset to Home (for example after a reload/resume).
    if (liveMass) {
      if (target === "mass") {
        setActive("mass");
        return result(true, "mass", { retainedLiveMass: true });
      }
      const leave = Boolean(await host.confirmLeaveLiveMass?.());
      if (!leave) {
        setActive("mass");
        return result(false, "mass", { reason: "LIVE_MASS_LEAVE_CANCELLED" });
      }
      const exited = await host.leaveLiveMass?.();
      if (exited === false) {
        setActive("mass");
        return result(false, "mass", { reason: "LIVE_MASS_EXIT_FAILED" });
      }
    }

    if (target === "home") {
      const opened = Boolean(await host.hardHome?.());
      if (!opened) return result(false, active, { reason: "HOME_OWNER_UNAVAILABLE" });
      setActive("home");
      host.restoreSettingsHome?.();
      return result(true, "home");
    }

    // All non-Home destinations start from the canonical hard-Home reset so
    // hidden sheets and superseded domain overlays cannot survive underneath.
    const reset = Boolean(await host.hardHome?.());
    if (!reset) return result(false, active, { reason: "HOME_OWNER_UNAVAILABLE" });

    let opened = false;
    if (target === "calendar") {
      opened = Boolean(
        await (host.defer?.(() => host.openCalendar?.()) ?? host.openCalendar?.()),
      );
    } else {
      opened = Boolean(
        await (host.defer?.(() => host.openDomain?.(target)) ?? host.openDomain?.(target)),
      );
    }

    if (!opened) {
      setActive("home");
      return result(false, "home", {
        reason: target === "calendar" ? "CALENDAR_OWNER_UNAVAILABLE" : "DOMAIN_OWNER_UNAVAILABLE",
      });
    }

    setActive(target);
    return result(true, target);
  }

  return Object.freeze({
    surfaces: APP_SURFACES,
    go,
    setActive,
    syncCoreRoute,
    getActive: () => active,
    subscribe(listener) {
      if (typeof listener !== "function") throw new TypeError("listener must be a function");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      try { unsubscribeCore(); } catch {}
      listeners.clear();
    },
  });
}
