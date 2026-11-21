# Knell — interview cheat sheet

Every fact here was checked in the code. I designed Knell and directed it; the code was written with AI assistance (Claude).

**1. How SM-2 schedules reviews, and what failing does**

Passing a topic's exam doesn't finish it. It goes into review. The first review is a day later, the second six days after that, and from then on each interval is the last one multiplied by an "ease" number that starts at 2.5. How well you do moves the ease: a perfect review raises it, a shaky one lowers it. Get less than half right and it counts as a lapse: back to one day, the count starts over, and the ease drops (never below 1.3). I changed one constant from textbook SM-2. In the original, scraping through didn't lower the ease at all, so someone who barely passed every review got the same intervals as someone perfect. Now that learner's sixth review comes at 153 days instead of 238, and a perfect learner is unchanged.

**2. Why questions are reshuffled on every attempt**

So that a retry tests what you know, not where the answer was. Without it, the second attempt is passed from "it was the second one". Question order and answer order are both shuffled every time, including when a missed question is asked again. There's also a second reason I found in our own content: answer keys written by hand drift. In one module the right answer was option B in 10 of 11 questions.

**3. Why rewards are decided by the server, not the browser**

An early security audit found that everything lived in the browser's storage, so anyone could open devtools and unlock every course. Now the browser only reports "this piece of work is finished". The server decides what it's worth: is it a real item, was it already paid, did it come too fast, is today's limit reached. Then it pays from its own ledger. In testing, the old endpoint that let the client name an amount paid 800 XP in four calls, and I had it removed. Money, XP and reputation can't be written by the client at all.

**4. Why sync merges field by field instead of "latest save wins"**

Last write wins means a phone with old data can wipe a week of reviews done on a laptop, and the review schedule is the one thing you can't get back by studying again. So each field has its own rule. Finished topics are combined. Each topic's schedule keeps whichever device is further ahead. Counters take the higher number rather than the sum, so if a sync runs twice, nothing gets inflated. The economy isn't synced at all, only read from the server, so a devtools edit can't turn into a real balance.

**5. Three honest weaknesses, and what I'd do next**

- **The exam is a weak gate.** Five questions, straight after reading. Someone who really knows 70% passes within two tries 78% of the time, and it measures short-term memory. Next: ten questions, and a short check a day or two later before a topic counts.
- **Flashcard reviews are self-graded.** You see the answer, then rate yourself, and that rating drives the schedule. Next: type the answer first and tick the key points, and let the machine mark multiple-choice cards.
- **The server still trusts your own progress row.** It has to, because that's what syncs, and the garden's weight is computed from it, so it can be forged. Damage is capped at five reputation points a day. Next: check progress on the server against the ledger of work it actually paid for.
