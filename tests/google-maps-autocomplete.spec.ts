import { test, expect } from '@playwright/test';

/**
 * Test de l'autocomplétion Google Maps dans le formulaire d'ajout de logement
 */
test.describe('Google Maps Autocomplete', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviguer vers l'application avec les paramètres nécessaires
    await page.goto('/api/send-webhook?version-test=true&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&viewmode=full');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
  });

  test('devrait charger l\'API Google Maps correctement', async ({ page }) => {
    // Vérifier que l'API Google Maps est chargée
    const isGoogleMapsLoaded = await page.evaluate(() => {
      return typeof window.google !== 'undefined' 
        && typeof window.google.maps !== 'undefined'
        && typeof window.google.maps.places !== 'undefined';
    });
    
    expect(isGoogleMapsLoaded).toBeTruthy();
    
    // Vérifier dans la console qu'il n'y a pas d'erreur Google Maps
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Google')) {
        consoleErrors.push(msg.text());
      }
    });
    
    // Attendre un peu pour capturer les erreurs éventuelles
    await page.waitForTimeout(2000);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('devrait ouvrir le dialogue d\'ajout de logement et afficher le champ d\'adresse', async ({ page }) => {
    // Chercher et cliquer sur le bouton pour ajouter un logement
    // Note: Vous devrez adapter le sélecteur selon votre interface
    const addButton = page.getByRole('button', { name: /ajouter.*logement/i });
    
    // Vérifier si le bouton existe
    const buttonExists = await addButton.count() > 0;
    
    if (buttonExists) {
      await addButton.click();
      
      // Attendre que le dialogue s'ouvre
      await page.waitForTimeout(500);
      
      // Vérifier que le champ d'adresse est présent
      const addressInput = page.locator('#adresse');
      await expect(addressInput).toBeVisible();
    } else {
      console.log('⚠️ Bouton d\'ajout de logement non trouvé - test ignoré');
      test.skip();
    }
  });

  test('devrait permettre de saisir une adresse avec autocomplétion', async ({ page }) => {
    // Ouvrir le dialogue d'ajout de logement
    const addButton = page.getByRole('button', { name: /ajouter.*logement/i });
    const buttonExists = await addButton.count() > 0;
    
    if (!buttonExists) {
      console.log('⚠️ Bouton d\'ajout de logement non trouvé - test ignoré');
      test.skip();
      return;
    }
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Remplir le nom du logement (obligatoire)
    const nomInput = page.locator('#nom');
    await nomInput.fill('Test Appartement');
    
    // Attendre que Google Maps soit chargé
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' 
        && typeof window.google.maps !== 'undefined'
        && typeof window.google.maps.places !== 'undefined';
    }, { timeout: 10000 });
    
    // Trouver le champ d'adresse
    const addressInput = page.locator('#adresse');
    await expect(addressInput).toBeVisible();
    
    // Taper une adresse
    await addressInput.click();
    await addressInput.fill('15 Rue de la Paix, Paris');
    
    // Attendre que les suggestions apparaissent
    // Les suggestions de Google Maps apparaissent dans un élément avec la classe .pac-container
    await page.waitForSelector('.pac-container', { timeout: 5000 });
    
    // Vérifier que des suggestions sont affichées
    const suggestions = page.locator('.pac-container .pac-item');
    const suggestionCount = await suggestions.count();
    
    expect(suggestionCount).toBeGreaterThan(0);
    
    console.log(`✅ ${suggestionCount} suggestions trouvées`);
  });

  test('devrait sélectionner une adresse depuis les suggestions', async ({ page }) => {
    // Ouvrir le dialogue d'ajout de logement
    const addButton = page.getByRole('button', { name: /ajouter.*logement/i });
    const buttonExists = await addButton.count() > 0;
    
    if (!buttonExists) {
      console.log('⚠️ Bouton d\'ajout de logement non trouvé - test ignoré');
      test.skip();
      return;
    }
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Remplir le nom du logement
    const nomInput = page.locator('#nom');
    await nomInput.fill('Test Appartement');
    
    // Attendre que Google Maps soit chargé
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' 
        && typeof window.google.maps !== 'undefined'
        && typeof window.google.maps.places !== 'undefined';
    }, { timeout: 10000 });
    
    // Capturer les logs de la console pour vérifier l'événement place_changed
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Adresse sélectionnée') || msg.text().includes('Place sélectionné')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Trouver le champ d'adresse et taper
    const addressInput = page.locator('#adresse');
    await addressInput.click();
    await addressInput.fill('Tour Eiffel, Paris');
    
    // Attendre les suggestions
    await page.waitForSelector('.pac-container .pac-item', { timeout: 5000 });
    
    // Cliquer sur la première suggestion
    const firstSuggestion = page.locator('.pac-container .pac-item').first();
    await firstSuggestion.click();
    
    // Attendre un peu pour que l'événement se déclenche
    await page.waitForTimeout(1000);
    
    // Vérifier que la valeur du champ a été mise à jour
    const addressValue = await addressInput.inputValue();
    expect(addressValue).toBeTruthy();
    expect(addressValue.length).toBeGreaterThan(0);
    
    console.log(`✅ Adresse sélectionnée: ${addressValue}`);
    
    // Vérifier que l'événement a été capturé dans les logs
    expect(consoleLogs.length).toBeGreaterThan(0);
  });

  test('devrait gérer les erreurs de l\'API Google Maps', async ({ page }) => {
    // Capturer les erreurs de la console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Vérifier qu'il n'y a pas d'erreur ApiNotActivatedMapError
    await page.waitForTimeout(3000);
    
    const hasApiError = consoleErrors.some(error => 
      error.includes('ApiNotActivatedMapError') || 
      error.includes('Google Maps API error')
    );
    
    expect(hasApiError).toBeFalsy();
    
    if (hasApiError) {
      console.error('❌ Erreurs Google Maps détectées:', consoleErrors);
    } else {
      console.log('✅ Aucune erreur Google Maps détectée');
    }
  });

  test('devrait vérifier que la clé API est configurée', async ({ page }) => {
    // Vérifier que la clé API est présente dans l'environnement
    const apiKey = await page.evaluate(() => {
      return (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;
    });
    
    expect(apiKey).toBeTruthy();
    expect(apiKey).not.toBe('');
    expect(apiKey).not.toBe('your_google_maps_api_key_here');
    
    console.log('✅ Clé API Google Maps configurée');
  });

  test('devrait charger le script Google Maps avec les bonnes bibliothèques', async ({ page }) => {
    // Vérifier que le script Google Maps est chargé avec la bibliothèque places
    const scripts = await page.evaluate(() => {
      const scriptElements = Array.from(document.querySelectorAll('script'));
      return scriptElements
        .map(script => script.src)
        .filter(src => src.includes('maps.googleapis.com'));
    });
    
    expect(scripts.length).toBeGreaterThan(0);
    
    const mapsScript = scripts[0];
    expect(mapsScript).toContain('maps.googleapis.com');
    expect(mapsScript).toContain('libraries=places');
    
    console.log('✅ Script Google Maps chargé:', mapsScript);
  });
});

