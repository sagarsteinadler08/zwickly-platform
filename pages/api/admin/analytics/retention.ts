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
      // Mock retention data (would come from user_sessions table in production)
      
      // Daily Active Users (DAU) for last 7 days
      const dauLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dauValues = [687, 723, 756, 798, 834, 645, 512]; // Mock data

      // Weekly Active Users (WAU) for last 8 weeks
      const wauLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
      const wauValues = [789, 812, 845, 876, 893, 901, 913, 925]; // Mock data

      // Monthly Active Users (MAU) for last 6 months
      const mauLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const mauValues = [654, 701, 756, 798, 845, 913]; // Mock data

      // Cohort retention (% of users from each week still active)
      const cohortLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const cohortData = [
        { week: 'Week 1', retention: 100 },
        { week: 'Week 2', retention: 87 },
        { week: 'Week 3', retention: 78 },
        { week: 'Week 4', retention: 72 },
      ];

      // User engagement tiers
      const engagementTiers = {
        labels: ['Power Users', 'Regular Users', 'Casual Users', 'Inactive'],
        values: [156, 423, 298, 36], // out of 913 total
      };

      // Stickiness (DAU/MAU ratio)
      const currentDAU = dauValues[dauValues.length - 1];
      const currentMAU = mauValues[mauValues.length - 1];
      const stickinessRatio = ((currentDAU / currentMAU) * 100).toFixed(1);

      const metadata = {
        currentDAU,
        currentWAU: wauValues[wauValues.length - 1],
        currentMAU,
        stickinessRatio: parseFloat(stickinessRatio),
        growthRate: 2.8, // % growth from last month
        avgSessionDuration: 28, // minutes
        returnRate: 84.3, // % of users who return next day
        generatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        dau: {
          labels: dauLabels,
          values: dauValues,
        },
        wau: {
          labels: wauLabels,
          values: wauValues,
        },
        mau: {
          labels: mauLabels,
          values: mauValues,
        },
        cohortRetention: cohortData,
        engagementTiers,
        metadata,
      });
    } catch (error) {
      console.error('Error fetching retention analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch retention analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

