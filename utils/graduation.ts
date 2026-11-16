export const GRADUATION_RETENTION_DAYS = 30;

export const getAccountDeletionDate = (graduatedAt?: string | null) => {
  if (!graduatedAt) {
    return null;
  }
  const date = new Date(graduatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setDate(date.getDate() + GRADUATION_RETENTION_DAYS);
  return date;
};
