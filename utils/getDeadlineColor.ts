export const getDeadlineColor = (daysLeft: number): string => {
  if (daysLeft <= 2) {
    return '#FF3434';
  }
  if (daysLeft <= 7) {
    return '#F5A000';
  }
  return '#00A448';
};
