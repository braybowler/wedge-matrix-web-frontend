<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

type Mode = 'carry' | 'total'

interface ClubRow {
  club: string
  loft: string
  carry: [number, number, number, number]
  total: [number, number, number, number]
}

const SWING_LABELS = ['½', '¾', '⅞', 'Full']

const CLUBS: ClubRow[] = [
  { club: 'PW', loft: '46°', carry: [70, 90, 108, 124], total: [74, 96, 115, 132] },
  { club: 'GW', loft: '50°', carry: [60, 80, 96, 110], total: [63, 85, 102, 117] },
  { club: 'SW', loft: '54°', carry: [50, 68, 84, 96], total: [52, 72, 89, 102] },
  { club: 'LW', loft: '58°', carry: [38, 54, 70, 82], total: [40, 57, 74, 87] },
]

const mode = ref<Mode>('carry')
const selectedRow = ref(2)
const selectedCol = ref(1)

const selectedClub = computed<ClubRow>(() => CLUBS[selectedRow.value]!)
const selectedValue = computed(() => selectedClub.value[mode.value][selectedCol.value])
const readoutCaption = computed(
  () => `${selectedClub.value.club} · ${SWING_LABELS[selectedCol.value]} swing · ${mode.value}`,
)

function selectCell(r: number, c: number) {
  selectedRow.value = r
  selectedCol.value = c
}
</script>

<template>
  <div class="wm-landing">
    <header class="wm-nav">
      <div class="wm-nav-inner">
        <div class="wm-brand">
          <div class="wm-brand-mark"><div class="wm-brand-dot"></div></div>
          <span class="wm-brand-name">Wedge Matrix</span>
        </div>
        <nav class="wm-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#practice">Practice</a>
        </nav>
        <div class="wm-nav-cta">
          <RouterLink to="/login" class="wm-nav-login" data-test-id="login-button">
            Login
          </RouterLink>
          <RouterLink to="/register" class="wm-btn wm-btn-primary wm-btn-sm">
            Get Started
          </RouterLink>
        </div>
      </div>
    </header>

    <section class="wm-hero">
      <div class="wm-hero-glow" aria-hidden="true"></div>
      <div class="wm-hero-grid">
        <div class="wm-hero-copy">
          <div class="wm-eyebrow">Precision short game</div>
          <h1 class="wm-hero-title">Know your number<br />on every wedge shot.</h1>
          <p class="wm-hero-sub">
            Build a personalized yardage chart for every wedge and swing length. Step up to any
            number inside 130 yards and know exactly which club, which swing — then commit.
          </p>
          <div class="wm-hero-ctas">
            <RouterLink
              to="/register"
              class="wm-btn wm-btn-primary"
              data-test-id="get-started-button"
            >
              Build your matrix free
            </RouterLink>
            <a href="#how" class="wm-btn wm-btn-ghost">See how it works</a>
          </div>
          <div class="wm-stats">
            <div class="wm-stat">
              <div class="wm-stat-val">32</div>
              <div class="wm-stat-label">distance data points</div>
            </div>
            <div class="wm-stat-divider"></div>
            <div class="wm-stat">
              <div class="wm-stat-val">4&times;4</div>
              <div class="wm-stat-label">wedges &times; swings</div>
            </div>
            <div class="wm-stat-divider"></div>
            <div class="wm-stat">
              <div class="wm-stat-val">2</div>
              <div class="wm-stat-label">carry &amp; total</div>
            </div>
          </div>
        </div>

        <div class="wm-matrix-card">
          <div class="wm-matrix-header">
            <span class="wm-matrix-eyebrow">Your matrix</span>
            <div class="wm-mode-toggle" role="group" aria-label="Distance mode">
              <button
                type="button"
                class="wm-mode-btn"
                :class="{ 'wm-mode-active': mode === 'carry' }"
                @click="mode = 'carry'"
              >
                Carry
              </button>
              <button
                type="button"
                class="wm-mode-btn"
                :class="{ 'wm-mode-active': mode === 'total' }"
                @click="mode = 'total'"
              >
                Total
              </button>
            </div>
          </div>

          <div class="wm-readout">
            <span class="wm-readout-val">{{ selectedValue }}</span>
            <span class="wm-readout-unit">yds</span>
            <span class="wm-readout-caption">{{ readoutCaption }}</span>
          </div>

          <div class="wm-grid">
            <div class="wm-grid-corner">SWING&nbsp;&rarr;</div>
            <div v-for="label in SWING_LABELS" :key="label" class="wm-grid-col-header">
              {{ label }}
            </div>

            <template v-for="(row, rIdx) in CLUBS" :key="row.club">
              <div class="wm-grid-row-header">
                <span class="wm-row-club">{{ row.club }}</span>
                <span class="wm-row-loft">{{ row.loft }}</span>
              </div>
              <button
                v-for="(value, cIdx) in row[mode]"
                :key="`${rIdx}-${cIdx}`"
                type="button"
                class="wm-cell"
                :class="{ 'wm-cell-active': rIdx === selectedRow && cIdx === selectedCol }"
                @mouseenter="selectCell(rIdx, cIdx)"
                @focus="selectCell(rIdx, cIdx)"
              >
                {{ value }}
              </button>
            </template>
          </div>

          <div class="wm-matrix-foot">HOVER A CELL TO SET YOUR NUMBER &middot; YDS</div>
        </div>
      </div>

      <div class="wm-loft-band">
        <div class="wm-loft-inner">
          <span class="wm-loft-label">Built for every wedge in the bag</span>
          <div class="wm-loft-chips">
            <span class="wm-chip">PW &middot; 46&deg;</span>
            <span class="wm-chip">GW &middot; 50&deg;</span>
            <span class="wm-chip">SW &middot; 54&deg;</span>
            <span class="wm-chip">LW &middot; 58&deg;</span>
          </div>
        </div>
      </div>
    </section>

    <section id="how" class="wm-section wm-how">
      <div class="wm-how-head">
        <div>
          <div class="wm-eyebrow">How it works</div>
          <h2 class="wm-h2">Three steps from guesswork to dead aim.</h2>
        </div>
        <p class="wm-how-sub">
          No spreadsheets, no batteries on the course. Set it once, calibrate over time, and read
          your number when it counts.
        </p>
      </div>
      <div class="wm-steps">
        <div class="wm-step">
          <div class="wm-step-num">01</div>
          <h3 class="wm-step-title">Configure</h3>
          <p class="wm-step-body">
            Add your wedges and swing lengths, pick carry or total, and your matrix is ready in
            under a minute.
          </p>
        </div>
        <div class="wm-step">
          <div class="wm-step-num">02</div>
          <h3 class="wm-step-title">Calibrate</h3>
          <p class="wm-step-body">
            Hit shots on the range and log them. Real data dials every cell to your actual game, not
            an average.
          </p>
        </div>
        <div class="wm-step">
          <div class="wm-step-num">03</div>
          <h3 class="wm-step-title">Take dead aim</h3>
          <p class="wm-step-body">
            On the course, read your number, pick the cell, and swing with total commitment. No
            second-guessing.
          </p>
        </div>
      </div>
    </section>

    <section id="features" class="wm-features">
      <div class="wm-features-inner">
        <h2 class="wm-h2 wm-features-title">Everything you need to own the scoring zone.</h2>
        <div class="wm-feat-grid">
          <div class="wm-feat">
            <h3 class="wm-feat-title">Personalized yardage chart</h3>
            <p class="wm-feat-body">
              Configure your clubs, swing lengths, and carry-vs-total preference to build a matrix
              tailored to your exact game.
            </p>
          </div>
          <div class="wm-feat">
            <h3 class="wm-feat-title">Built-in tutorial</h3>
            <p class="wm-feat-body">
              A guided setup walks you through your first matrix in under a minute. No spreadsheets,
              no guesswork required.
            </p>
          </div>
          <div class="wm-feat">
            <h3 class="wm-feat-title">Calibrate on the range</h3>
            <p class="wm-feat-body">
              Log real shots and let your actual data refine every number. Track attempts and watch
              your dispersion tighten.
            </p>
          </div>
          <div class="wm-feat">
            <h3 class="wm-feat-title">Always in your pocket</h3>
            <p class="wm-feat-body">
              Your numbers stay with you, stored on your device. Dark-mode-first design stays
              readable in bright sun.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="practice" class="wm-section wm-practice-section">
      <div class="wm-eyebrow">Practice sessions</div>
      <h2 class="wm-h2">Pressure-test your short game — then prove it.</h2>
      <div class="wm-practice-grid">
        <div class="wm-practice-card">
          <div class="wm-practice-eyebrow">RANDOM &middot; SCORED</div>
          <h3 class="wm-practice-title">Gauntlet</h3>
          <p class="wm-practice-body">
            Random targets inside 130 yards. Pick your club and swing, commit to the number, and
            score how close you finish.
          </p>
          <div class="wm-practice-tags">
            <span class="wm-practice-tag">87 yds</span>
            <span class="wm-practice-tag">112 yds</span>
            <span class="wm-practice-tag">64 yds</span>
          </div>
        </div>
        <div class="wm-practice-card">
          <div class="wm-practice-eyebrow">FOCUSED &middot; REPS</div>
          <h3 class="wm-practice-title">Drill</h3>
          <p class="wm-practice-body">
            Hammer a specific club-and-swing combo until it's automatic. Track dispersion shot over
            shot and tighten the pattern.
          </p>
          <div class="wm-practice-tags">
            <span class="wm-practice-tag">SW &middot; &frac34;</span>
            <span class="wm-practice-tag">&times;25 reps</span>
            <span class="wm-practice-tag wm-practice-tag-accent">&plusmn;3.2 yds</span>
          </div>
        </div>
      </div>
    </section>

    <section class="wm-cta">
      <div class="wm-cta-inner">
        <h2 class="wm-cta-title">Take dead aim.</h2>
        <p class="wm-cta-sub">
          Build your matrix free and carry it in your pocket for every wedge shot inside 130 yards.
        </p>
        <div class="wm-cta-buttons">
          <RouterLink
            to="/register"
            class="wm-btn wm-btn-primary"
            data-test-id="create-account-button"
          >
            Get Started
          </RouterLink>
        </div>
      </div>
    </section>

    <footer class="wm-footer">
      <div class="wm-footer-inner">
        <div class="wm-brand wm-brand-sm">
          <div class="wm-brand-mark wm-brand-mark-sm"><div class="wm-brand-dot"></div></div>
          <span class="wm-brand-name">Wedge Matrix</span>
        </div>
        <div class="wm-footer-links">
          <RouterLink to="/login">Login</RouterLink>
        </div>
        <div class="wm-footer-copy">&copy; 2026 Wedge Matrix</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.wm-landing {
  --wm-bg: #090d18;
  --wm-bg-2: #0a0e1a;
  --wm-panel: #10162a;
  --wm-card: #0f1525;
  --wm-text: #f4f6fb;
  --wm-text-mute: #aab2c5;
  --wm-text-dim: #828aa0;
  --wm-text-faint: #6c7488;
  --wm-text-faintest: #5b6276;
  --wm-border: rgba(255, 255, 255, 0.07);
  --wm-border-2: rgba(255, 255, 255, 0.09);
  --wm-accent: #8b8cf6;
  font-family: 'Archivo', system-ui, sans-serif;
  background: var(--wm-bg);
  color: var(--wm-text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.wm-landing a {
  color: inherit;
  text-decoration: none;
}

.wm-landing ::selection {
  background: rgba(139, 140, 246, 0.35);
}

@keyframes wmRise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wm-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(9, 13, 24, 0.74);
  border-bottom: 1px solid var(--wm-border);
}

.wm-nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 15px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.wm-brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.wm-brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--wm-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wm-brand-mark-sm {
  width: 24px;
  height: 24px;
  border-radius: 7px;
}

.wm-brand-dot {
  width: 13px;
  height: 13px;
  border: 2.5px solid var(--wm-bg-2);
  border-radius: 50%;
}

.wm-brand-mark-sm .wm-brand-dot {
  width: 10px;
  height: 10px;
  border-width: 2px;
}

.wm-brand-name {
  font-weight: 800;
  letter-spacing: -0.015em;
  font-size: 17px;
}

.wm-brand-sm .wm-brand-name {
  font-weight: 700;
  font-size: 15px;
}

.wm-nav-links {
  display: flex;
  gap: 32px;
  font-size: 14.5px;
  color: var(--wm-text-mute);
  font-weight: 500;
}

.wm-nav-links a {
  transition: color 0.15s;
  white-space: nowrap;
}

.wm-nav-links a:hover {
  color: var(--wm-text);
}

.wm-nav-cta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wm-nav-login {
  color: #cdd3e0;
  font-weight: 600;
  font-size: 14.5px;
}

.wm-btn {
  display: inline-block;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  padding: 15px 28px;
  white-space: nowrap;
  transition:
    transform 0.15s,
    border-color 0.15s,
    background 0.15s;
  border: 1px solid transparent;
}

.wm-btn-sm {
  font-size: 14.5px;
  padding: 10px 18px;
  border-radius: 10px;
}

.wm-btn-primary {
  background: var(--wm-accent);
  color: var(--wm-bg-2);
}

.wm-btn-primary:hover {
  transform: translateY(-2px);
}

.wm-btn-ghost {
  border-color: rgba(255, 255, 255, 0.16);
  color: var(--wm-text);
  font-weight: 600;
  padding: 15px 26px;
}

.wm-btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
}

.wm-hero {
  position: relative;
  overflow: hidden;
  background: radial-gradient(960px 540px at 80% 4%, rgba(139, 140, 246, 0.12), transparent 58%);
}

.wm-hero-glow {
  position: absolute;
  top: -150px;
  right: -180px;
  width: 720px;
  height: 720px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    transparent 0 46px,
    rgba(139, 140, 246, 0.07) 46px 47px
  );
  -webkit-mask: radial-gradient(circle, #000 28%, transparent 72%);
  mask: radial-gradient(circle, #000 28%, transparent 72%);
  pointer-events: none;
}

.wm-hero-grid {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 84px 32px 72px;
  display: grid;
  grid-template-columns: 1.04fr 1fr;
  gap: 60px;
  align-items: center;
}

.wm-hero-copy {
  animation: wmRise 0.6s ease both;
}

.wm-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--wm-accent);
  font-weight: 500;
  margin-bottom: 22px;
}

.wm-hero-title {
  font-size: clamp(42px, 5.4vw, 72px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  font-weight: 800;
  margin: 0 0 22px;
}

.wm-hero-sub {
  font-size: 19px;
  line-height: 1.6;
  color: var(--wm-text-mute);
  max-width: 30em;
  margin: 0 0 32px;
}

.wm-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 40px;
}

.wm-stats {
  display: flex;
  gap: 34px;
}

.wm-stat-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.wm-stat-label {
  font-size: 13px;
  color: var(--wm-text-faint);
  margin-top: 3px;
}

.wm-stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.09);
}

.wm-matrix-card {
  animation: wmRise 0.7s ease 0.08s both;
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid var(--wm-border-2);
  border-radius: 22px;
  padding: 22px;
  box-shadow:
    0 40px 90px -30px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.wm-matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.wm-matrix-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--wm-text-dim);
}

.wm-mode-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}

.wm-mode-btn {
  background: transparent;
  color: var(--wm-text-mute);
  border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 7px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.15s;
}

.wm-mode-active {
  background: var(--wm-accent);
  color: var(--wm-bg-2);
}

.wm-readout {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 6px 4px 20px;
  border-bottom: 1px solid var(--wm-border);
  margin-bottom: 18px;
}

.wm-readout-val {
  font-family: 'Archivo', sans-serif;
  font-size: 62px;
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -0.04em;
}

.wm-readout-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: var(--wm-text-dim);
  font-weight: 500;
  padding-bottom: 6px;
}

.wm-readout-caption {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  color: var(--wm-accent);
  padding-bottom: 9px;
  letter-spacing: 0.04em;
}

.wm-grid {
  display: grid;
  grid-template-columns: auto repeat(4, 1fr);
  gap: 7px;
}

.wm-grid-corner {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--wm-text-faintest);
  display: flex;
  align-items: flex-end;
  padding: 0 4px 7px;
  letter-spacing: 0.05em;
}

.wm-grid-col-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--wm-text-dim);
  text-align: center;
  padding: 7px 0;
  font-weight: 500;
}

.wm-grid-row-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px 0 4px;
}

.wm-row-club {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.wm-row-loft {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: var(--wm-text-faintest);
}

.wm-cell {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 13px 0;
  border-radius: 9px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  color: #e9ecf5;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  border: none;
  transition: transform 0.12s;
}

.wm-cell-active {
  background: var(--wm-accent);
  color: var(--wm-bg-2);
  box-shadow: inset 0 0 0 1px var(--wm-accent);
}

.wm-matrix-foot {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: var(--wm-text-faintest);
  letter-spacing: 0.04em;
}

.wm-loft-band {
  position: relative;
  border-top: 1px solid var(--wm-border);
  border-bottom: 1px solid var(--wm-border);
  background: rgba(255, 255, 255, 0.012);
}

.wm-loft-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 28px;
}

.wm-loft-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--wm-text-faint);
}

.wm-loft-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
}

.wm-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  color: #cdd3e0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 6px 14px;
  white-space: nowrap;
}

.wm-section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 32px 80px;
}

.wm-h2 {
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 800;
  margin: 0;
  max-width: 14em;
}

.wm-how-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.wm-how-sub {
  font-size: 16px;
  color: var(--wm-text-mute);
  line-height: 1.6;
  max-width: 24em;
  margin: 0;
}

.wm-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.wm-step {
  background: var(--wm-card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 28px;
}

.wm-step-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--wm-accent);
  margin-bottom: 46px;
}

.wm-step-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}

.wm-step-body {
  font-size: 15.5px;
  color: var(--wm-text-mute);
  line-height: 1.62;
  margin: 0;
}

.wm-features {
  background: #0b1020;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.wm-features-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 88px 32px;
}

.wm-features-title {
  font-size: clamp(30px, 3.6vw, 44px);
  margin: 0 0 44px;
  max-width: 16em;
}

.wm-feat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.wm-feat {
  background: var(--wm-panel);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 30px;
  transition: border-color 0.18s;
}

.wm-feat:hover {
  border-color: rgba(139, 140, 246, 0.5);
}

.wm-feat-title {
  font-size: 21px;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.wm-feat-body {
  font-size: 16px;
  color: var(--wm-text-mute);
  line-height: 1.62;
  margin: 0;
}

.wm-practice-section {
  padding-bottom: 96px;
}

.wm-practice-section .wm-h2 {
  font-size: clamp(30px, 3.6vw, 44px);
  max-width: 15em;
  margin: 0 0 44px;
}

.wm-practice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.wm-practice-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #141a30, #0d1222);
  border: 1px solid var(--wm-border-2);
  border-radius: 20px;
  padding: 34px;
}

.wm-practice-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--wm-accent);
  margin-bottom: 18px;
}

.wm-practice-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.wm-practice-body {
  font-size: 16px;
  color: var(--wm-text-mute);
  line-height: 1.62;
  margin: 0 0 24px;
  max-width: 26em;
}

.wm-practice-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--wm-text-dim);
}

.wm-practice-tag {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 7px 12px;
}

.wm-practice-tag-accent {
  border-color: rgba(139, 140, 246, 0.3);
  color: var(--wm-accent);
}

.wm-cta {
  position: relative;
  overflow: hidden;
  background: radial-gradient(800px 400px at 50% 120%, rgba(139, 140, 246, 0.16), transparent 60%);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.wm-cta-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 104px 32px;
  text-align: center;
}

.wm-cta-title {
  font-size: clamp(40px, 6vw, 76px);
  line-height: 0.96;
  letter-spacing: -0.04em;
  font-weight: 900;
  margin: 0 0 20px;
}

.wm-cta-sub {
  font-size: 18px;
  color: var(--wm-text-mute);
  line-height: 1.6;
  max-width: 30em;
  margin: 0 auto 34px;
}

.wm-cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
}

.wm-footer {
  border-top: 1px solid var(--wm-border);
  background: var(--wm-bg-2);
}

.wm-footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 34px 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.wm-footer-links {
  display: flex;
  gap: 26px;
  font-size: 14px;
  color: var(--wm-text-dim);
}

.wm-footer-links a {
  white-space: nowrap;
  transition: color 0.15s;
}

.wm-footer-links a:hover {
  color: var(--wm-text);
}

.wm-footer-copy {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--wm-text-faintest);
}

@media (max-width: 1000px) {
  .wm-hero-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .wm-nav-links {
    display: none;
  }

  .wm-feat-grid,
  .wm-steps,
  .wm-practice-grid {
    grid-template-columns: 1fr;
  }

  .wm-stats {
    flex-wrap: wrap;
  }
}
</style>
