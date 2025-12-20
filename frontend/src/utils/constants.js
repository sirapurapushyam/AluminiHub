export const USER_ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  FACULTY: 'faculty',
  COLLEGE_ADMIN: 'college_admin',
  SUPER_ADMIN: 'super_admin',
}

export const EVENT_TYPES = {
  SEMINAR: 'seminar',
  WORKSHOP: 'workshop',
  REUNION: 'reunion',
  NETWORKING: 'networking',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  OTHER: 'other',
}

export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
}

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
}

export const MENTORSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
}

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
}

export const ACCEPTED_FILE_TYPES = {
  IMAGE: 'image/jpeg,image/jpg,image/png,image/gif',
  DOCUMENT: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}