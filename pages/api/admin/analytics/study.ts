import { NextApiRequest, NextApiResponse } from 'next';

// CORS headers
const setCorsHeaders = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { range = '7' } = req.query;
      const days = parseInt(range as string);

      // Mock data for study sessions (would come from study_sessions table in production)
      const labels: string[] = [];
      const sessionValues: number[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        // Mock data: random sessions between 50-150
        sessionValues.push(Math.floor(Math.random() * 100) + 50);
      }

      // Focus session breakdown (donut chart data)
      const focusBreakdown = {
        labels: ['Completed', 'In Progress', 'Abandoned'],
        values: [285, 45, 23], // Mock data
      };

      // Study hours by subject (top 5)
      const subjectLabels = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business'];
      const subjectValues = [124, 98, 87, 76, 54]; // Mock hours

      // Average focus time per session
      const avgFocusTime = 42; // minutes

      // Total study statistics
      const metadata = {
        totalSessions: 353,
        completedSessions: 285,
        totalHours: 439,
        avgSessionDuration: avgFocusTime,
        mostProductiveDay: 'Wednesday',
        range: `${days} days`,
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        sessionsPerDay: {
          labels,
          values: sessionValues,
        },
        focusBreakdown,
        studyBySubject: {
          labels: subjectLabels,
          values: subjectValues,
        },
        metadata,
      });
    } catch (error) {
      console.error('Error fetching study analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch study analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

