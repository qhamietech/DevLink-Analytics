// src/lib/analytics.ts
import { format, subDays, isSameDay, getHours } from 'date-fns';

export const getAnalyticsData = (clicks: any[]) => {
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  // 1. Group by Day for your Bar Graph
  const chartData = lastSevenDays.map((day) => {
    const dailyClicks = clicks.filter((click) => {
      const clickDate = click.createdAt?.toDate ? click.createdAt.toDate() : new Date(click.createdAt);
      return isSameDay(clickDate, day);
    });

    return {
      date: format(day, 'MMM dd'),
      count: dailyClicks.length,
    };
  });

  // 2. Find Highest and Lowest Day
  const counts = chartData.map(d => d.count);
  const highestDay = chartData.find(d => d.count === Math.max(...counts));
  const lowestDay = chartData.find(d => d.count === Math.min(...counts));

  // 3. Find Most Active Hour (Peak Time)
  const hours = new Array(24).fill(0);
  clicks.forEach(click => {
    const clickDate = click.createdAt?.toDate ? click.createdAt.toDate() : new Date(click.createdAt);
    const hour = getHours(clickDate);
    hours[hour]++;
  });
  const peakHour = hours.indexOf(Math.max(...hours));

  return { 
    chartData, 
    highestDay: highestDay?.date, 
    lowestDay: lowestDay?.date,
    peakTime: `${peakHour}:00` 
  };
};