# Supabase Local Setup - Complete

## Overview
This project has been configured to work **without a live Supabase connection**. Instead, all data is served from JSON export files stored locally in `supabase_export_20251028_150354/`.

## What Was Changed

### 1. Supabase Shim (`frontend/src/lib/supabase-shim.ts`)
- Updated to return Supabase-compatible `{ data, error }` format
- Added `.order()` method support
- Routes all Supabase calls to local Next.js API endpoints

### 2. Data Loader Utility (`pages/api/utils/dataLoader.ts`)
- Created utility to load data from JSON export files
- Handles filtering (`.eq()` queries)
- Handles sorting/ordering (`.order()` queries)
- Supports column selection
- Handles German date format parsing (DD.MM.YYYY) for exam dates

### 3. API Endpoints Updated
All API endpoints now serve data from JSON exports instead of Prisma/Supabase:

- **`/api/events`** - Serves from `events.json`
- **`/api/exams`** - Serves from `exams.json` (with `sem_group` filtering)
- **`/api/timetable`** - Serves from `timetable.json` (with `sem_group` and `day_name` filtering)
- **`/api/mensa`** - Serves from `mensa_menu.json`
- **`/api/news`** - Serves from `whz_news.json`
- **`/api/german`** - Serves from `german_culture_interactions.json`

## Supported Features

### ✅ Query Methods
- `.from('tableName')` - Select table
- `.select('columns')` - Select specific columns
- `.eq('column', 'value')` - Filter by equality
- `.order('column', { ascending: true/false })` - Sort results

### ✅ Data Sources
All data comes from:
- `supabase_export_20251028_150354/events.json`
- `supabase_export_20251028_150354/exams.json`
- `supabase_export_20251028_150354/timetable.json`
- `supabase_export_20251028_150354/mensa_menu.json`
- `supabase_export_20251028_150354/whz_news.json`
- `supabase_export_20251028_150354/german_culture_interactions.json`

## How It Works

1. **Frontend** calls `supabase.from('events').select('*')`
2. **Shim** intercepts the call and routes to `/api/events`
3. **API Endpoint** loads data from JSON file
4. **Data Loader** applies filters and sorting
5. **Response** returns `{ data: [...], error: null }` format

## Example Usage

```typescript
// This works exactly like real Supabase!
const { data, error } = await supabase
  .from('exams')
  .select('course, space, lecturer, date, period')
  .eq('sem_group', '252035')
  .order('date', { ascending: true });

if (error) {
  console.error(error);
} else {
  console.log(data); // Array of exam entries
}
```

## Benefits

✅ **No Supabase Account Required** - Works completely offline
✅ **No API Keys Needed** - All data is local
✅ **Fast Development** - No network latency
✅ **Same API** - Frontend code doesn't need to change
✅ **Data Persistence** - Data from your export is preserved

## Notes

- **Read-Only**: Writes (POST, PUT, DELETE) are simulated but don't persist
- **Caching**: Data is loaded once and cached in memory
- **Date Formats**: Automatically handles German date format (DD.MM.YYYY) for exam dates

## Running the Application

Simply start your Next.js development server:

```bash
npm run dev
```

All Supabase calls will automatically route to local JSON data!

