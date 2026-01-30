export function getDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'Today':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: now
      };
    
    case 'Yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
      };
    
    case 'This Week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      return {
        start: startOfWeek,
        end: now
      };
    
    case 'Last Week':
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      startOfLastWeek.setHours(0, 0, 0, 0);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return {
        start: startOfLastWeek,
        end: endOfLastWeek
      };
    
    case 'This Month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    
    case 'Last Month':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      };
    
    case 'This Year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      };
    
    case 'Last Year':
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31)
      };
    
    case 'Last 30 days':
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    
    case 'Last 90 days':
      return {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now
      };
    
    case 'All time':
      return {
        start: new Date(2000, 0, 1), // Far back date
        end: now
      };
    
    default:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
  }
}
