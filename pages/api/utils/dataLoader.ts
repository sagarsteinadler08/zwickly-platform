import fs from 'fs';
import path from 'path';

const EXPORT_DIR = path.join(process.cwd(), 'supabase_export_20251028_150354');

// Cache for loaded data
const dataCache: Record<string, any> = {};

/**
 * Load JSON data from Supabase export files
 */
export function loadJsonData(tableName: string): any[] {
  // Check cache first
  if (dataCache[tableName]) {
    return dataCache[tableName];
  }

  // Map table names to file names
  const fileMap: Record<string, string> = {
    events: 'events.json',
    exams: 'exams.json',
    timetable: 'timetable.json',
    mensa_menu: 'mensa_menu.json',
    whz_news: 'whz_news.json',
    news: 'whz_news.json',
    german_culture_interactions: 'german_culture_interactions.json',
    german: 'german_culture_interactions.json',
  };

  const fileName = fileMap[tableName.toLowerCase()] || `${tableName}.json`;
  const filePath = path.join(EXPORT_DIR, fileName);

  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Data file not found: ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Cache the data
    dataCache[tableName] = Array.isArray(data) ? data : [];
    return dataCache[tableName];
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

/**
 * Filter data based on query parameters (mimicking Supabase filtering)
 */
export function filterData(data: any[], query: Record<string, string | string[] | undefined>): any[] {
  let filtered = [...data];

  // Handle eq (equals) filter - skip 'order' and 'orderAsc' as they're handled separately
  Object.entries(query).forEach(([key, value]) => {
    if (key !== 'order' && key !== 'orderAsc' && value !== undefined && value !== null && value !== '') {
      const val = Array.isArray(value) ? value[0] : value;
      filtered = filtered.filter(item => {
        // Handle nested properties (e.g., "sem_group")
        return String(item[key]) === String(val);
      });
    }
  });

  // Handle ordering
  const orderColumn = query.order as string | undefined;
  const orderAsc = query.orderAsc === 'true' || query.orderAsc === undefined;

  if (orderColumn) {
    filtered.sort((a, b) => {
      const aVal = a[orderColumn];
      const bVal = b[orderColumn];

      // Handle dates
      if (aVal && bVal && (orderColumn.includes('date') || orderColumn.includes('created_at') || orderColumn.includes('updated_at'))) {
        // Handle German date format (DD.MM.YYYY) for exam dates
        let dateA: Date, dateB: Date;

        if (typeof aVal === 'string' && aVal.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          // German format: DD.MM.YYYY
          const [dayA, monthA, yearA] = aVal.split('.').map(Number);
          dateA = new Date(yearA, monthA - 1, dayA);
        } else {
          dateA = new Date(aVal);
        }

        if (typeof bVal === 'string' && bVal.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          // German format: DD.MM.YYYY
          const [dayB, monthB, yearB] = bVal.split('.').map(Number);
          dateB = new Date(yearB, monthB - 1, dayB);
        } else {
          dateB = new Date(bVal);
        }

        const timeA = dateA.getTime();
        const timeB = dateB.getTime();
        return orderAsc ? timeA - timeB : timeB - timeA;
      }

      // Handle strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return orderAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return orderAsc ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }

  return filtered;
}

/**
 * Select specific columns from data
 */
export function selectColumns(data: any[], columns?: string): any[] {
  if (!columns || columns === '*') {
    return data;
  }

  const cols = columns.split(',').map(c => c.trim());
  return data.map(item => {
    const selected: any = {};
    cols.forEach(col => {
      if (item.hasOwnProperty(col)) {
        selected[col] = item[col];
      }
    });
    return selected;
  });
}

