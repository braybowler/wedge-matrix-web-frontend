<script setup lang="ts">
interface Stat {
  value: string
  label: string
}

defineProps<{
  eyebrow: string
  headline: string
  body: string
  thirdStat: Stat
}>()
</script>

<template>
  <aside class="wm-brandside">
    <div class="wm-brandside-rings" aria-hidden="true"></div>

    <div class="wm-brand">
      <div class="wm-brand-mark"><div class="wm-brand-dot"></div></div>
      <span class="wm-brand-name">Wedge Matrix</span>
    </div>

    <div class="wm-brandside-copy">
      <div class="wm-eyebrow">{{ eyebrow }}</div>
      <h2 class="wm-headline">{{ headline }}</h2>
      <p class="wm-body">{{ body }}</p>
    </div>

    <div class="wm-stats">
      <div class="wm-stat">
        <div class="wm-stat-val">32</div>
        <div class="wm-stat-label">data points</div>
      </div>
      <div class="wm-stat-divider"></div>
      <div class="wm-stat">
        <div class="wm-stat-val">4&times;4</div>
        <div class="wm-stat-label">wedges &times; swings</div>
      </div>
      <div class="wm-stat-divider"></div>
      <div class="wm-stat">
        <div class="wm-stat-val" v-html="thirdStat.value"></div>
        <div class="wm-stat-label">{{ thirdStat.label }}</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@reference "tailwindcss";

.wm-brandside {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #0e1426, #0a0e1a);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 52px;
  min-height: 100vh;
}

.wm-brandside-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 760px;
  height: 760px;
  transform: translate(-46%, -50%);
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    transparent 0 58px,
    rgba(139, 140, 246, 0.08) 58px 59px
  );
  -webkit-mask: radial-gradient(circle, #000 26%, transparent 70%);
  mask: radial-gradient(circle, #000 26%, transparent 70%);
  pointer-events: none;
}

.wm-brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
}

.wm-brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: #8b8cf6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wm-brand-dot {
  width: 13px;
  height: 13px;
  border: 2.5px solid #0a0e1a;
  border-radius: 50%;
}

.wm-brand-name {
  font-weight: 800;
  letter-spacing: -0.015em;
  font-size: 17px;
  color: #f4f6fb;
}

.wm-brandside-copy {
  position: relative;
  animation: wmRise 0.6s ease both;
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

.wm-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #8b8cf6;
  font-weight: 500;
  margin-bottom: 20px;
}

.wm-headline {
  font-size: clamp(30px, 3.4vw, 42px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: #f4f6fb;
  margin: 0 0 18px;
  max-width: 11em;
}

.wm-body {
  font-size: 16px;
  line-height: 1.6;
  color: #aab2c5;
  max-width: 26em;
  margin: 0;
}

.wm-stats {
  position: relative;
  display: flex;
  gap: 30px;
}

.wm-stat-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f4f6fb;
}

.wm-stat-label {
  font-size: 12.5px;
  color: #6c7488;
  margin-top: 2px;
}

.wm-stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.09);
}
</style>
