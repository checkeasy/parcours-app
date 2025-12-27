/**
 * Script de test pour vérifier si l'endpoint createfileap fonctionne en version-live
 * 
 * Usage: node test-createfile-endpoint.js
 */

// Petite image base64 de test (1x1 pixel rouge)
const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

const endpoints = {
  test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createfileap',
  production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createfileap',
};

async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Test de l'endpoint ${name.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 URL: ${url}`);
  
  try {
    console.log(`📤 Envoi de la requête...`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: testBase64,
      }),
    });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Temps de réponse: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ERREUR HTTP`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Message: ${response.statusText}`);
      console.error(`   Corps: ${errorText.substring(0, 500)}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ SUCCÈS`);
    console.log(`   Réponse:`, JSON.stringify(data, null, 2));
    
    if (data.imgUrl) {
      console.log(`   🖼️  URL de l'image: ${data.imgUrl}`);
      return true;
    } else {
      console.warn(`   ⚠️  Pas d'imgUrl dans la réponse`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ERREUR RÉSEAU`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    return false;
  }
}

async function main() {
  console.log(`\n🔬 TEST DES ENDPOINTS BUBBLE.IO - createfileap`);
  console.log(`📅 ${new Date().toISOString()}`);
  
  // Test version-test
  const testResult = await testEndpoint('test', endpoints.test);
  
  // Test version-live
  const prodResult = await testEndpoint('production', endpoints.production);
  
  // Résumé
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 RÉSUMÉ`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Version TEST: ${testResult ? '✅ Fonctionne' : '❌ Ne fonctionne pas'}`);
  console.log(`   Version LIVE: ${prodResult ? '✅ Fonctionne' : '❌ Ne fonctionne pas'}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (!prodResult && testResult) {
    console.log(`\n⚠️  DIAGNOSTIC:`);
    console.log(`   L'endpoint fonctionne en TEST mais PAS en LIVE.`);
    console.log(`   Cela explique pourquoi la création de logement échoue en version-live.`);
    console.log(`\n💡 SOLUTION:`);
    console.log(`   1. Vérifier que le workflow "createfileap" existe dans Bubble en version-live`);
    console.log(`   2. Vérifier que le workflow est bien publié (Deploy to live)`);
    console.log(`   3. Vérifier les permissions du workflow en version-live`);
  }
}

main().catch(console.error);

