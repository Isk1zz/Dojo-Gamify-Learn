// ================================================
// Knell — EARN
// ------------------------------------------------
// The single road from "a person finished something" to "the server
// paid for it". Nothing else in the app may add XP, $ or Tokens.
//
// Why this file exists at all: rewards used to be written straight into
// localStorage by whichever screen noticed the work. That was wrong in
// both directions at once. A cheat could mint XP from the console, and
// an honest learner LOST every reward, because core/sync.js pulls the
// economy row down and overwrites the local one on every sync — a
// reward the server never heard of vanished seconds after it landed.
//
// So: the client reports WHICH PIECE OF WORK finished. The server
// decides what it is worth, whether it was already paid, whether it
// came too fast, and whether the day's ceiling is reached. See
// supabase/migrations/0012 for the four defences and why they are in
// that order.
//
// Emits: charge:changed, wallet:changed, tokens:changed
// ================================================

(() => {
  const Bus = Dojo.Bus;

  // Queued claims, kept in localStorage so closing the tab does not
  // lose them. Studying on a train must still pay when the train comes
  // out of the tunnel — the alternative is that offline study earns
  // nothing, which would be a worse bug than the one this replaces.
  const QUEUE_KEY = "knell-earn-queue";

  // A claim is worth retrying for a while, but not forever: an item id
  // that no longer exists in the catalogue will never succeed, and a
  // queue that grows without limit is its own problem.
  const MAX_QUEUE = 200;
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;   // a month

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
    catch (e) { return []; }
  }

  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }
    catch (e) { /* private mode, or full — a lost queue is not fatal */ }
  }

  function enqueue(itemId, scorePct) {
    const q = readQueue();
    // Same piece of work twice in the queue is pointless: the server
    // pays once regardless, so the second call can only ever come back
    // "already paid".
    if (q.some(c => c.item === itemId)) return;
    q.push({ item: itemId, score: scorePct ?? null, at: Date.now() });
    writeQueue(q.slice(-MAX_QUEUE));
  }

  // ---- Applying what the server actually paid ------------------------
  // Note this writes the numbers the SERVER returned, never the ones the
  // caller hoped for. If the two disagree the server is right, and the
  // display follows it rather than the other way round.
  function apply(paid) {
    if (!paid || paid.status !== "paid") return paid;
    const xp = paid.xp || 0, money = paid.money || 0, tokens = paid.tokens || 0;

    if (xp)     { DB.addXpRaw(xp);      Bus.emit("charge:changed", { delta: xp, reason: "earn" }); }
    if (money)  { DB.addMoney(money);   Bus.emit("wallet:changed", { delta: money, reason: "earn" }); }
    if (tokens) { DB.addTokens(tokens); Bus.emit("tokens:changed", { delta: tokens, reason: "earn" }); }
    return paid;
  }

  // ---- The one entry point -------------------------------------------
  // Returns the server's answer, or a local stand-in when there is no
  // server to ask. Never throws: a refusal ("already paid", "too fast")
  // is an ordinary answer, and a caller should not have to tell those
  // apart from a dropped connection.
  async function claim(itemId, scorePct) {
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) {
      // No backend configured at all — the offline-only build. Nothing
      // to queue for, and nothing can be paid.
      return { status: "no_backend", xp: 0, money: 0, tokens: 0 };
    }

    let session = null;
    try { session = await Dojo.Cloud.getSession(); } catch (e) { /* offline */ }
    if (!session) {
      enqueue(itemId, scorePct);
      return { status: "queued", xp: 0, money: 0, tokens: 0 };
    }

    try {
      return apply(await Dojo.Cloud.claimEarning(itemId, scorePct));
    } catch (e) {
      // A network failure is worth retrying. A refusal is not — but
      // refusals come back as data, not as an exception, so anything
      // landing here is a transport problem.
      enqueue(itemId, scorePct);
      console.info("[earn] queued for later:", itemId, e.message);
      return { status: "queued", xp: 0, money: 0, tokens: 0 };
    }
  }

  // ---- Draining ------------------------------------------------------
  // Runs on sign-in and whenever a sync succeeds, since a working sync
  // is proof the network is back.
  let draining = false;

  async function drain() {
    if (draining) return { status: "busy" };
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) return { status: "skipped" };

    let session = null;
    try { session = await Dojo.Cloud.getSession(); } catch (e) { /* still offline */ }
    if (!session) return { status: "skipped", reason: "no session" };

    const q = readQueue();
    if (!q.length) return { status: "empty" };

    draining = true;
    const cutoff = Date.now() - MAX_AGE_MS;
    const left = [];
    let paid = 0, refused = 0;

    try {
      for (let i = 0; i < q.length; i++) {
        const c = q[i];
        if (c.at < cutoff) continue;             // too old to keep trying
        try {
          const r = apply(await Dojo.Cloud.claimEarning(c.item, c.score));
          if (r && r.status === "paid") { paid++; continue; }

          // "too_fast" is NOT a settled answer, and dropping it here was
          // a bug: the work stays unclaimed on the server, so discarding
          // the queue entry loses it for good.
          //
          // It is also the NORMAL answer when a queue drains. Ten chunks
          // studied on a plane arrive in one burst, and the server's
          // pace check measures the gap since the last payment — which
          // inside a burst is zero. It would pay the first and refuse
          // the other nine.
          //
          // So a refused-on-pace claim goes back in the queue, and the
          // loop STOPS: everything after it would be refused for the
          // same reason, and hammering the server to be told so nine
          // times is pointless. The rest ride the next sync.
          //
          // This does mean offline study trickles in rather than landing
          // at once. That is the honest trade — the alternative is
          // trusting a client-supplied "I earned this an hour ago",
          // which is the exact thing being designed out. Nothing is
          // lost, only delayed, and defence 1 still caps the total at
          // the amount of work the app contains.
          // Everything from here on is still owed, including this one.
          if (r && r.status === "too_fast") { left.push(...q.slice(i)); break; }

          // "already_paid" and "no such item" are genuinely settled.
          refused++;
        } catch (e) {
          left.push(c);                          // network again — keep it
        }
      }
    } finally {
      draining = false;
      writeQueue(left);
    }
    return { status: "drained", paid, refused, left: left.length };
  }

  // A successful sync means the network is back AND a session exists,
  // which is exactly the moment a queued claim can land.
  //
  // Sign-in is the other moment, and it is NOT covered by this: core/
  // auth.js pulls the economy on sign-in but does not run a full sync,
  // so no "sync" event fires. It calls Earn.drain() directly instead —
  // without that, someone who studied offline and then signed in would
  // wait until their next study session to be paid.
  //
  // There is deliberately no timer. A queue that retries on a schedule
  // hammers a server that is down; this one moves only on evidence the
  // network works.
  if (Bus) {
    Bus.on("progress:changed", e => { if (e && e.reason === "sync") drain(); });
  }

  Dojo.Earn = {
    claim, drain,
    queued: () => readQueue().length,
    // Ids the server knows. Built here so no caller hand-assembles one
    // and quietly misses a payment by getting the shape wrong.
    id: {
      chunk:  (topicId, i) => `chunk:${topicId}:${i}`,
      topic:  topicId      => `topic:${topicId}`,
      unit:   unitNumber   => `unit:${unitNumber}`,
      course: courseId     => `course:${courseId}`
    }
  };
})();
