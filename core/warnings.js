// ================================================
// CS Dojo — CORE / administrative notices
// ------------------------------------------------
// The delivery half of the warning system. admin/admin.js has always
// been able to ISSUE warnings (DB.addWarning) and ADMIN.md has always
// described "the next time the user enters, an Administrative Notice
// modal displays the warning with an acknowledgment button" — but
// nothing ever showed them, so every warning sat at `read: false`
// forever and moderation had no effect the user could see.
//
// ---- Why this is its own file ----
// It hangs off profile:changed like the theme/vitals repaints in
// core/boot.js do, but it isn't a repaint — it's a one-shot gate with
// its own state (what's unread) and its own dismissal rule. Folding it
// into boot.js's reaction block would put a modal lifecycle inside a
// list of one-line paint calls.
// ================================================

(() => {
  // Rendered as text, never as HTML: the message is typed by an admin
  // into a prompt(), and the one thing you must never do with operator
  // input is hand it to innerHTML. textContent on a per-item node keeps
  // a warning that contains "<script>" a warning that contains
  // "<script>", not a script.
  function itemNode(w) {
    const row = document.createElement("div");
    row.className = "warning-item";

    const msg = document.createElement("div");
    msg.className = "warning-item-msg";
    msg.textContent = w.message;

    const when = document.createElement("div");
    when.className = "warning-item-date";
    const d = new Date(w.issuedAt);
    when.textContent = isNaN(d) ? "" : d.toLocaleString();

    row.appendChild(msg);
    row.appendChild(when);
    return row;
  }

  function show(warnings) {
    const modal = document.getElementById("warning-modal");
    const list = document.getElementById("warning-modal-list");
    const desc = document.getElementById("warning-modal-desc");
    const btn = document.getElementById("btn-warning-ack");
    if (!modal || !list || !btn) return;

    list.innerHTML = "";
    warnings.forEach(w => list.appendChild(itemNode(w)));
    if (desc) {
      desc.textContent = warnings.length === 1
        ? "You have received a warning from a moderator."
        : `You have received ${warnings.length} warnings from a moderator.`;
    }

    modal.style.display = "flex";

    // Acknowledge marks them read but does NOT delete them — the
    // moderation trail has to survive being read. Bound fresh each time
    // via onclick rather than addEventListener so repeat showings can't
    // stack handlers and double-acknowledge.
    btn.onclick = () => {
      DB.acknowledgeWarnings();
      modal.style.display = "none";
    };
  }

  // Called on entry. Returns whether anything was shown, so a caller
  // could gate on it later; nothing needs that yet.
  function checkWarnings() {
    if (!DB.getUnreadWarnings) return false;
    const unread = DB.getUnreadWarnings();
    if (!unread.length) return false;
    show(unread);
    return true;
  }

  Object.assign(Dojo, { checkWarnings });
})();
