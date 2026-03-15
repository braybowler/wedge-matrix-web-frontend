<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing-page">
    <section class="hero">
      <h1 class="hero-title">Wedge Matrix</h1>
      <p class="hero-tagline">Dial in your short game</p>
      <p class="hero-description">
        Build a personalized yardage chart for your wedges. Know exactly how far you hit every club
        at every swing percentage so you can attack pins with confidence.
      </p>
      <div class="hero-ctas">
        <RouterLink to="/register" class="cta-primary" data-test-id="get-started-button">
          Get Started
        </RouterLink>
        <RouterLink to="/login" class="cta-secondary" data-test-id="login-button">
          Login
        </RouterLink>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <h3 class="feature-title">Personalized Yardage Chart</h3>
        <p class="feature-description">
          Configure your clubs, swing percentages, and choose between carry and total distances to
          build a matrix tailored to your game.
        </p>
      </div>
      <div class="feature-card">
        <h3 class="feature-title">Built-in Tutorial</h3>
        <p class="feature-description">
          A step-by-step guided setup walks you through configuring your matrix in under a minute.
          No guesswork required.
        </p>
      </div>
      <div class="feature-card">
        <h3 class="feature-title">Calibrate on the Range</h3>
        <p class="feature-description">
          Record real shots to dial in your yardages. Track multiple attempts and let your actual
          data refine your distances.
        </p>
      </div>
      <div class="feature-card">
        <h3 class="feature-title">Practice Sessions</h3>
        <p class="feature-description">
          Test your short game with Gauntlet mode for random targets or Drill mode to sharpen
          specific club and swing combos. Track your dispersion over time.
        </p>
      </div>
    </section>

    <section class="bottom-cta">
      <RouterLink to="/register" class="cta-primary" data-test-id="create-account-button">
        Create Your Free Account
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.landing-page {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.hero {
  text-align: center;
  max-width: 600px;
  padding-top: 4rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #f3f4f6;
  margin-bottom: 0.5rem;
}

.hero-tagline {
  font-size: 1.25rem;
  color: #818cf8;
  font-weight: 500;
  margin-bottom: 1rem;
}

.hero-description {
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-primary {
  background-color: #818cf8;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.cta-primary:hover {
  background-color: #6366f1;
}

.cta-secondary {
  border: 1px solid #4b5563;
  color: #f3f4f6;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.cta-secondary:hover {
  background-color: #1f2937;
  border-color: #6b7280;
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 900px;
  width: 100%;
}

.feature-card {
  background-color: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
}

.feature-title {
  color: #f3f4f6;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-description {
  color: #9ca3af;
  line-height: 1.5;
}

.bottom-cta {
  padding-bottom: 4rem;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4rem;
  }

  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
