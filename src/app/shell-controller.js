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
  let pendingTarget = null, pendingToken = 0;
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

  async function go(surface, {resume=false,restorePrayer=false}={}) {
    if (disposed) return result(false, active, { reason: "DISPOSED" });
    const target = normalizeAppSurface(surface);
    if (!target) return result(false, active, { reason: "UNKNOWN_SURFACE" });
    if (resume&&target!=="mass") return result(false,active,{reason:"RESUME_MASS_ONLY"});
    const token=++pendingToken;
    pendingTarget=target;
    try {

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

    // A saved session must never hijack ordinary Mass entry. This was
    // bypassing every celebration/Proper/form/reader choice on the home screen.
    // Resuming is an explicit action only, with no silent fresh-session fallback.
    if (target === "mass" && resume) {
      if (!Boolean(host.hasResumableMass?.()))
        return result(false,active,{reason:"NO_RESUMABLE_MASS"});
      const opened=Boolean(
        await (host.defer?.(()=>host.openDomain?.("mass",{resume:true})) ??
          host.openDomain?.("mass",{resume:true}))
      );
      if(!opened)return result(false,active,{reason:"MASS_RESUME_UNAVAILABLE"});
      setActive("mass");
      return result(true,"mass",{resumedMass:true});
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
        await (host.defer?.(() => host.openDomain?.(target,{restorePrayer:target==="pray"&&restorePrayer===true})) ?? host.openDomain?.(target,{restorePrayer:target==="pray"&&restorePrayer===true})),
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
    } finally {
      if(token===pendingToken)pendingTarget=null;
    }
  }

  return Object.freeze({
    surfaces: APP_SURFACES,
    go,
    setActive,
    syncCoreRoute,
    getActive: () => active,
    getPendingTarget: () => pendingTarget,
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
