import express, { Request, Response } from 'express';
import { sendWebhookToBubble, sendModeleWebhookToBubble, sendDeleteModeleWebhookToBubble } from '../services/webhookService';

export const webhookRouter = express.Router();

// Endpoint to send webhook
webhookRouter.post('/send-webhook', async (req: Request, res: Response) => {
  try {
    const {
      conciergerieID,
      userID,
      isTestMode,
      logementData,
    } = req.body;

    // Validate required fields
    if (!logementData || !logementData.nom) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: logementData.nom',
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 WEBHOOK REQUEST RECEIVED`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   🏠 Logement: ${logementData.nom}`);
    console.log(`   🔧 isTestMode (raw): ${JSON.stringify(isTestMode)}`);
    console.log(`   🔧 isTestMode (type): ${typeof isTestMode}`);
    console.log(`   🔧 isTestMode (boolean): ${Boolean(isTestMode)}`);
    console.log(`   🔧 isTestMode === true: ${isTestMode === true}`);
    console.log(`   🔧 isTestMode === false: ${isTestMode === false}`);
    console.log(`   🔧 Test mode: ${isTestMode ? 'YES (version-test)' : 'NO (version-live)'}`);
    console.log(`   🏢 ConciergerieID: ${conciergerieID}`);
    console.log(`   👤 UserID: ${userID}`);
    console.log(`${'='.repeat(60)}\n`);

    // Send webhook asynchronously (non-blocking)
    // The response is sent immediately, webhook continues in background
    sendWebhookToBubble({
      conciergerieID,
      userID,
      isTestMode,
      logementData,
    }).catch((error) => {
      console.error('❌ Webhook failed:', error);
    });

    // Respond immediately to the frontend
    res.json({
      success: true,
      message: 'Webhook request accepted and processing in background',
      logementId: logementData.logementId,
    });

  } catch (error) {
    console.error('❌ Error processing webhook request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Endpoint to get webhook status (optional, for future use)
webhookRouter.get('/webhook-status/:logementId', async (req: Request, res: Response) => {
  const { logementId } = req.params;

  // TODO: Implement webhook status tracking if needed
  res.json({
    logementId,
    status: 'unknown',
    message: 'Status tracking not yet implemented',
  });
});

// Endpoint to send modele webhook
webhookRouter.post('/send-modele-webhook', async (req: Request, res: Response) => {
  try {
    const {
      conciergerieID,
      userID,
      isTestMode,
      modeleData,
    } = req.body;

    // Validate required fields
    if (!modeleData || !modeleData.nom) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: modeleData.nom',
      });
    }

    console.log(`📨 Received modele webhook request for: ${modeleData.nom}`);
    console.log(`   - Test mode: ${isTestMode ? 'YES' : 'NO'}`);
    console.log(`   - ConciergerieID: ${conciergerieID}`);
    console.log(`   - UserID: ${userID}`);
    console.log(`   - Type: ${modeleData.type}`);

    // Send webhook asynchronously (non-blocking)
    sendModeleWebhookToBubble({
      conciergerieID,
      userID,
      isTestMode,
      modeleData,
    }).catch((error) => {
      console.error('❌ Modele webhook failed:', error);
    });

    // Respond immediately to the frontend
    res.json({
      success: true,
      message: 'Modele webhook request accepted and processing in background',
      modeleId: modeleData.id,
    });

  } catch (error) {
    console.error('❌ Error processing modele webhook request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Endpoint to send delete modele webhook
webhookRouter.post('/delete-modele-webhook', async (req: Request, res: Response) => {
  try {
    const {
      conciergerieID,
      userID,
      isTestMode,
      modeleId,
    } = req.body;

    // Validate required fields
    if (!modeleId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: modeleId',
      });
    }

    console.log(`📨 Received delete modele webhook request for ID: ${modeleId}`);
    console.log(`   - Test mode: ${isTestMode ? 'YES' : 'NO'}`);
    console.log(`   - ConciergerieID: ${conciergerieID}`);
    console.log(`   - UserID: ${userID}`);

    // Send webhook asynchronously (non-blocking)
    sendDeleteModeleWebhookToBubble({
      conciergerieID,
      userID,
      isTestMode,
      modeleId,
    }).catch((error) => {
      console.error('❌ Delete modele webhook failed:', error);
    });

    // Respond immediately to the frontend
    res.json({
      success: true,
      message: 'Delete modele webhook request accepted and processing in background',
      modeleId,
    });

  } catch (error) {
    console.error('❌ Error processing delete modele webhook request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

