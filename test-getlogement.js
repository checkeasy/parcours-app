/**
 * Script de test pour l'endpoint getlogement de Bubble.io
 *
 * Méthode: GET
 * Query param: logementid
 *
 * Usage:
 *   node test-getlogement.js <logementid> [test|production]
 *
 * Exemples:
 *   node test-getlogement.js 1762768573904x510316102867504260
 *   node test-getlogement.js 1762768573904x510316102867504260 test
 *   node test-getlogement.js 1762768573904x510316102867504260 production
 */

const ENDPOINTS = {
  test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/getlogement',
  production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/getlogement',
};

async function testGetLogement(logementId, mode = 'test') {
  const endpoint = ENDPOINTS[mode];
  const url = `${endpoint}?logementid=${encodeURIComponent(logementId)}`;

  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST DE L\'ENDPOINT GETLOGEMENT');
  console.log('='.repeat(80));
  console.log(`📋 Logement ID: ${logementId}`);
  console.log(`🔧 Mode: ${mode.toUpperCase()}`);
  console.log(`🌐 Endpoint: ${endpoint}`);
  console.log(`📍 URL complète: ${url}`);
  console.log('='.repeat(80));

  try {
    console.log('\n⏳ Envoi de la requête GET...\n');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('='.repeat(80));
    console.log('📡 RÉPONSE HTTP');
    console.log('='.repeat(80));
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`);
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('='.repeat(80));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ ERREUR HTTP');
      console.error('='.repeat(80));
      console.error(`Status: ${response.status}`);
      console.error(`Message: ${response.statusText}`);
      console.error(`Body: ${errorText}`);
      console.error('='.repeat(80));
      return;
    }

    const data = await response.json();

    console.log('\n' + '='.repeat(80));
    console.log('✅ DONNÉES REÇUES');
    console.log('='.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));

    // Analyse de la structure
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ANALYSE DE LA STRUCTURE');
    console.log('='.repeat(80));
    console.log(`Type de données: ${typeof data}`);
    console.log(`Est un objet: ${typeof data === 'object' && data !== null}`);
    console.log(`Est un tableau: ${Array.isArray(data)}`);
    
    if (typeof data === 'object' && data !== null) {
      console.log(`\nClés principales:`);
      Object.keys(data).forEach(key => {
        const value = data[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  - ${key}: ${type}`);
        
        if (Array.isArray(value)) {
          console.log(`    Nombre d'éléments: ${value.length}`);
          if (value.length > 0) {
            console.log(`    Premier élément:`, JSON.stringify(value[0], null, 6));
          }
        } else if (typeof value === 'object' && value !== null) {
          console.log(`    Sous-clés:`, Object.keys(value).join(', '));
        }
      });
    }
    console.log('='.repeat(80));

    console.log('\n✅ Test terminé avec succès!\n');

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERREUR LORS DE LA REQUÊTE');
    console.error('='.repeat(80));
    console.error(error);
    console.error('='.repeat(80));
    console.error('\n');
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('\n❌ Erreur: Vous devez fournir un logementid\n');
  console.log('Usage:');
  console.log('  node test-getlogement.js <logementid> [test|production]\n');
  console.log('Exemples:');
  console.log('  node test-getlogement.js 1762768573904x510316102867504260');
  console.log('  node test-getlogement.js 1762768573904x510316102867504260 test');
  console.log('  node test-getlogement.js 1762768573904x510316102867504260 production\n');
  process.exit(1);
}

const logementId = args[0];
const mode = args[1] || 'test';

if (!['test', 'production'].includes(mode)) {
  console.error(`\n❌ Erreur: Mode invalide "${mode}". Utilisez "test" ou "production"\n`);
  process.exit(1);
}

// Exécuter le test
testGetLogement(logementId, mode);

