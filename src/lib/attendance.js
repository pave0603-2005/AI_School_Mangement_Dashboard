
const STORAGE_KEY = "edusphere_attendance";

export const getAttendanceRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveAttendanceRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getStudentAttendance = (records, studentId) => {
  const days = Object.values(records).filter(
    (day) => day[String(studentId)] !== undefined
  );

  if (days.length === 0) {
    return {
      present: 0,
      absent: 0,
      total: 0,
      percentage: 0,
    };
  }

  const present = days.filter(
    (day) => day[String(studentId)] === true
  ).length;

  const absent = days.length - present;

  return {
    present,
    absent,
    total: days.length,
    percentage: Math.round((present / days.length) * 100),
  };
};
      