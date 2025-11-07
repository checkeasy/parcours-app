/**
 * Types TypeScript pour le système de scraping Airbnb
 */

/**
 * Réponse de l'endpoint POST /api/extract
 */
export interface ExtractionStartResponse {
  extraction_id: string;
  status: 'started';
  message: string;
}

/**
 * Réponse de l'endpoint GET /api/status/{extraction_id}
 */
export interface ExtractionStatusResponse {
  status: 'started' | 'completed' | 'error';
  progress: number;
  message: string;
  data?: any;
}

/**
 * Événement SSE - Metadata
 */
export interface SSEMetadataEvent {
  type: 'metadata';
  data: {
    extraction_id: string;
    timestamp: string;
    user_type: 'menage' | 'voyageur';
  };
}

/**
 * Événement SSE - Property Info
 */
export interface SSEPropertyInfoEvent {
  type: 'property_info';
  data: {
    name: string;
    title: string;
    html_saved: string;
    html_size: number;
    total_images?: number;
  };
}

/**
 * Événement SSE - Stats
 */
export interface SSEStatsEvent {
  type: 'stats';
  data: {
    total_images: number;
    rooms_found: number;
    ai_used: boolean;
    extraction_method: string;
  };
}

/**
 * Image d'une pièce
 */
export interface RoomImage {
  filename: string;
  url: string;
  room_type: string;
  alt_text?: string;
  room_title?: string;
}

/**
 * Événement SSE - Room
 */
export interface SSERoomEvent {
  type: 'room';
  room_type: string;
  data: {
    room_type: string;
    images: RoomImage[];
    images_count: number;
    progress: {
      current: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * Tâche générée par l'IA
 */
export interface AIGeneratedTask {
  title: string;
  description: string;
  photo_required: boolean;
}

/**
 * Tâche présélectionnée
 */
export interface PreselectedTask {
  title: string;
  selected: boolean;
}

/**
 * Événement SSE - Tasks
 */
export interface SSETasksEvent {
  type: 'tasks';
  room_type: string;
  data: {
    room_type: string;
    ai_generated_tasks: AIGeneratedTask[];
    preselected_tasks: PreselectedTask[];
    total_tasks: number;
  };
}

/**
 * Événement SSE - Complete
 */
export interface SSECompleteEvent {
  type: 'complete';
  summary: {
    total_rooms: number;
    extraction_id: string;
    completed_at: string;
  };
}

/**
 * Événement SSE - Error
 */
export interface SSEErrorEvent {
  type: 'error';
  error: string;
}

/**
 * Union de tous les types d'événements SSE
 */
export type SSEEvent =
  | SSEMetadataEvent
  | SSEPropertyInfoEvent
  | SSEStatsEvent
  | SSERoomEvent
  | SSETasksEvent
  | SSECompleteEvent
  | SSEErrorEvent;

/**
 * Données collectées depuis le stream SSE
 */
export interface CollectedStreamData {
  metadata: SSEMetadataEvent['data'] | null;
  propertyInfo: SSEPropertyInfoEvent['data'] | null;
  stats: SSEStatsEvent['data'] | null;
  rooms: Record<string, SSERoomEvent['data']>;
  tasks: Record<string, SSETasksEvent['data']>;
}

/**
 * Résultat du scraping complet
 */
export interface ScrapingResult {
  extractionId: string;
  parcoursType: 'menage' | 'voyageur';
  propertyInfo: {
    name: string;
    title: string;
    totalImages: number;
  };
  pieces: Array<{
    nom: string;
    quantite: number;
    tasks: Array<{
      emoji: string;
      titre: string;
      description: string;
      photoObligatoire: boolean;
    }>;
    photos: Array<{
      url: string;
      filename: string;
      alt_text?: string;
    }>;
  }>;
  stats: {
    totalRooms: number;
    totalTasks: number;
    totalImages: number;
  };
}

/**
 * Payload pour l'endpoint de scraping
 */
export interface ScrapeAndCreateParcoursPayload {
  url: string;
  conciergerieID: string;
  userID: string;
  isTestMode: boolean;
  parcoursType?: 'menage' | 'voyageur'; // Optionnel, sera déterminé automatiquement si non fourni
}

/**
 * Réponse de l'endpoint de scraping
 */
export interface ScrapeAndCreateParcoursResponse {
  success: boolean;
  extractionId: string;
  parcoursType: 'menage' | 'voyageur'; // ÉTAPE 2 OBLIGATOIRE
  message: string;
  data: ScrapingResult;
}

