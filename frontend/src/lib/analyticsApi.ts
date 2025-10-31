// Analytics API Client for Admin Dashboard
// Fetches data from /api/admin/analytics/* endpoints

const API_BASE = 'http://localhost:3000/api/admin/analytics';

export interface AnalyticsData {
  labels: string[];
  values: number[];
}

export interface SocialAnalytics {
  messagesPerDay: AnalyticsData;
  pollParticipation: AnalyticsData;
  channelActivity: AnalyticsData;
  metadata: {
    totalMessages: number;
    totalPolls: number;
    totalChannels: number;
    range: string;
    generatedAt: string;
  };
}

export interface StudyAnalytics {
  sessionsPerDay: AnalyticsData;
  focusBreakdown: AnalyticsData;
  studyBySubject: AnalyticsData;
  metadata: {
    totalSessions: number;
    completedSessions: number;
    totalHours: number;
    avgSessionDuration: number;
    mostProductiveDay: string;
    range: string;
  };
}

export interface EventsAnalytics {
  eventsPerDay: AnalyticsData;
  attendancePerDay: AnalyticsData;
  categoryBreakdown: AnalyticsData;
  topEvents: Array<{ name: string; attendance: number }>;
  metadata: {
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalCategories: number;
    avgAttendance: number;
    range: string;
  };
}

export interface RemindersAnalytics {
  statusBreakdown: AnalyticsData;
  remindersPerDay: AnalyticsData;
  sourceBreakdown: AnalyticsData;
  metadata: {
    totalReminders: number;
    completedReminders: number;
    snoozedReminders: number;
    pendingReminders: number;
    completionRate: number;
    range: string;
  };
}

export interface PixiAnalytics {
  topicBreakdown: AnalyticsData;
  interactionsPerDay: AnalyticsData;
  metadata: {
    totalInteractions: number;
    avgResponseTime: number;
    satisfactionScore: number;
    topTopic: string;
    range: string;
  };
}

export interface RetentionAnalytics {
  dau: AnalyticsData;
  wau: AnalyticsData;
  mau: AnalyticsData;
  cohortRetention: Array<{ week: string; retention: number }>;
  engagementTiers: AnalyticsData;
  metadata: {
    currentDAU: number;
    currentWAU: number;
    currentMAU: number;
    stickinessRatio: number;
    growthRate: number;
    avgSessionDuration: number;
    returnRate: number;
  };
}

export interface EQIAnalytics {
  current: {
    score: number;
    factors: {
      eventAttendance: number;
      socialEngagement: number;
      reminderCompletion: number;
      ticketResolution: number;
      activeUsers: number;
    };
  };
  historical: AnalyticsData;
  metadata: {
    currentScore: number;
    grade: string;
    trend: string;
    target: number;
    benchmark: number;
    lastUpdated: string;
  };
}

export interface AISummary {
  success: boolean;
  summary: {
    headline: string;
    keyInsights: string[];
    recommendations: string[];
    concerns: string[];
    nextSteps: string[];
    generatedAt: string;
    generatedBy: string;
  };
}

// Fetch Social Analytics
export const fetchSocialAnalytics = async (range = 7): Promise<SocialAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/social?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch social analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching social analytics:', error);
    throw error;
  }
};

// Fetch Study Analytics
export const fetchStudyAnalytics = async (range = 7): Promise<StudyAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/study?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch study analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching study analytics:', error);
    throw error;
  }
};

// Fetch Events Analytics
export const fetchEventsAnalytics = async (range = 30): Promise<EventsAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/events?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch events analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events analytics:', error);
    throw error;
  }
};

// Fetch Reminders Analytics
export const fetchRemindersAnalytics = async (range = 30): Promise<RemindersAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/reminders?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch reminders analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reminders analytics:', error);
    throw error;
  }
};

// Fetch Pixi Analytics
export const fetchPixiAnalytics = async (range = 30): Promise<PixiAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/pixi?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch pixi analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pixi analytics:', error);
    throw error;
  }
};

// Fetch Retention Analytics
export const fetchRetentionAnalytics = async (): Promise<RetentionAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/retention`);
    if (!response.ok) throw new Error('Failed to fetch retention analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching retention analytics:', error);
    throw error;
  }
};

// Fetch EQI Analytics
export const fetchEQIAnalytics = async (): Promise<EQIAnalytics> => {
  try {
    const response = await fetch(`${API_BASE}/eqi`);
    if (!response.ok) throw new Error('Failed to fetch EQI analytics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching EQI analytics:', error);
    throw error;
  }
};

// Fetch AI Summary
export const fetchAISummary = async (analyticsData: any): Promise<AISummary> => {
  try {
    const response = await fetch(`${API_BASE}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analyticsData }),
    });
    if (!response.ok) throw new Error('Failed to fetch AI summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching AI summary:', error);
    throw error;
  }
};

// Fetch all analytics at once
export const fetchAllAnalytics = async () => {
  try {
    const [social, study, events, reminders, pixi, retention, eqi] = await Promise.all([
      fetchSocialAnalytics(7),
      fetchStudyAnalytics(7),
      fetchEventsAnalytics(30),
      fetchRemindersAnalytics(30),
      fetchPixiAnalytics(30),
      fetchRetentionAnalytics(),
      fetchEQIAnalytics(),
    ]);

    return {
      social,
      study,
      events,
      reminders,
      pixi,
      retention,
      eqi,
    };
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    throw error;
  }
};

