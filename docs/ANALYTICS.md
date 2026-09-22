# DREAMOGON Analytics & GA4 Event Taxonomy

## Environment Variables
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`).

## Strict Privacy Rules
1. **Zero PII & Zero Dream Text**: Personal journal descriptions, audio transcriptions, and private reflections are NEVER transmitted to analytics platforms.
2. **Telemetry Only**: Only anonymous product funnel metrics and conversion events are captured.

## Funnel Event Map

| Event Name | Trigger | Parameters | Purpose |
|------------|---------|------------|---------|
| `dream_world_interaction` | User interacts with 3D Landing/Canvas | `feature` | Measures hero engagement |
| `explore_dream_clicked` | User clicks sample dream exploration | `symbol` | Tracks curiosity in dream topics |
| `dream_decoder_started` | User tests interactive dream decoder | - | Evaluates top-of-funnel conversion |
| `dream_decoder_completed`| Decoder completes analysis | `symbol_count` | Pre-signup product value signal |
| `sign_up` | User registers account | `method` | Key acquisition event |
| `login` | User authenticates | `method` | Retention & session start |
| `dream_create_started` | User opens `/dream/new` | - | Intent to record |
| `dream_created` | User saves dream to database | `dream_count`, `has_voice` | Core product activation milestone |
| `dream_analysis_completed` | AI analysis finishes entity extraction | `dream_count`, `entity_count` | AI value delivery |
| `dream_world_opened` | User opens `/world` | `artifact_count`, `dream_count` | Primary retention loop engagement |
| `artifact_viewed` | User inspects an artifact in world/archive | `artifact_type`, `appearance_count` | Symbol exploration depth |
| `insight_viewed` | User views a cross-dream pattern | `insight_type`, `is_locked` | Pattern discovery engagement |
| `dream_profile_viewed` | User unlocks 5-Dream Profile | `dream_count` | Free milestone completion |
| `upgrade_viewed` | User views DREAMOGON Pro upgrade modal | `trigger`, `dream_count` | Monetization intent |
| `begin_checkout` | User initiates subscription checkout | `plan`, `value`, `currency` | Pre-purchase conversion step |
| `purchase` | User completes Pro subscription | `transaction_id`, `value`, `plan` | Primary revenue conversion |
