// ================================================
// Knell — ADMIN / Logger & Telemetry
// ------------------------------------------------
// Hooks into Dojo.Bus and runtime error handlers to
// capture an audit trail of events, financial changes,
// quiz results, and exceptions.
// Zero external dependencies.
// ================================================

(() => {
  window.Dojo = window.Dojo || {};

  const MAX_LOGS = 1000;
  const STORAGE_KEY = "unit6-dojo-logs";
  const logBuffer = [];
  const subscribers = new Set();

  // Load any previously persisted session logs if available
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        logBuffer.push(...parsed.slice(-MAX_LOGS));
      }
    }
  } catch (e) {
    // Ignore storage parse issues
  }

  function persistSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logBuffer.slice(-200)));
    } catch (e) {
      // Storage quota or private mode
    }
  }

  function addEntry(level, tag, message, data = null) {
    const entry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      time: new Date().toISOString(),
      timestamp: Date.now(),
      level: level.toUpperCase(), // "INFO" | "WARN" | "ERROR" | "EVENT"
      tag: tag || "SYSTEM",
      message: typeof message === "string" ? message : JSON.stringify(message),
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      profile: (typeof DB !== "undefined" && DB.getActiveProfile) ? (DB.getActiveProfile() ? DB.getActiveProfile().name : "None") : "Unknown"
    };

    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOGS) {
      logBuffer.shift();
    }

    persistSession();

    // Notify live listeners (e.g., active Admin Logger tab)
    subscribers.forEach(cb => {
      try { cb(entry); } catch (err) { console.error("[Logger Subscriber Error]", err); }
    });

    return entry;
  }

  const Logger = {
    info(tag, msg, data) {
      return addEntry("INFO", tag, msg, data);
    },
    warn(tag, msg, data) {
      return addEntry("WARN", tag, msg, data);
    },
    error(tag, msg, data) {
      return addEntry("ERROR", tag, msg, data);
    },
    event(tag, msg, data) {
      return addEntry("EVENT", tag, msg, data);
    },
    getLogs(filter = {}) {
      let list = logBuffer.slice();
      if (filter.level && filter.level !== "ALL") {
        list = list.filter(l => l.level === filter.level);
      }
      if (filter.tag) {
        const query = filter.tag.toLowerCase();
        list = list.filter(l => l.tag.toLowerCase().includes(query));
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(l =>
          l.message.toLowerCase().includes(q) ||
          l.tag.toLowerCase().includes(q) ||
          (l.profile && l.profile.toLowerCase().includes(q))
        );
      }
      return list;
    },
    clear() {
      logBuffer.length = 0;
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
      subscribers.forEach(cb => {
        try { cb({ type: "clear" }); } catch (err) {}
      });
    },
    subscribe(cb) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    exportLogs() {
      const payload = {
        exportedAt: new Date().toISOString(),
        totalLogs: logBuffer.length,
        logs: logBuffer
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dojo-logs-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  // ---- Hook into Dojo.Bus ----
  function hookBus() {
    if (Dojo.Bus && Dojo.Bus.emit && !Dojo.Bus._loggerHooked) {
      const originalEmit = Dojo.Bus.emit;
      Dojo.Bus.emit = function (event, payload) {
        Logger.event(`Bus:${event}`, `Event: ${event}`, payload);
        return originalEmit.apply(this, arguments);
      };
      Dojo.Bus._loggerHooked = true;
    }
  }
  hookBus();
  const checkBus = setInterval(() => {
    if (Dojo.Bus && Dojo.Bus.emit && !Dojo.Bus._loggerHooked) {
      hookBus();
      clearInterval(checkBus);
    }
  }, 100);

  // ---- Global Error Handlers ----
  window.addEventListener("error", (e) => {
    Logger.error("Window:Error", e.message || "Unknown error", {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error ? e.error.stack : null
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    Logger.error("Promise:Unhandled", e.reason ? (e.reason.message || String(e.reason)) : "Unhandled Promise rejection", {
      reason: e.reason
    });
  });

  Logger.info("System", "Logger initialized and telemetry active.");

  Object.assign(Dojo, { Logger });
})();
