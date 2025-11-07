import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tester l'application
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Exécuter les tests en parallèle */
  fullyParallel: true,
  
  /* Échouer le build sur CI si vous avez accidentellement laissé test.only */
  forbidOnly: !!process.env.CI,
  
  /* Réessayer sur CI uniquement */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter à utiliser */
  reporter: 'html',
  
  /* Paramètres partagés pour tous les projets ci-dessous */
  use: {
    /* URL de base à utiliser dans les actions comme `await page.goto('/')` */
    baseURL: 'http://localhost:8080',
    
    /* Collecter les traces lors de la première tentative échouée */
    trace: 'on-first-retry',
    
    /* Capturer des screenshots lors des échecs */
    screenshot: 'only-on-failure',
  },

  /* Configurer les projets pour les principaux navigateurs */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Démarrer le serveur de développement avant de lancer les tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

