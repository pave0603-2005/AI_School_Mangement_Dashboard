export const SUBJECTS = [
  { name: "Mathematics", credits: 4 },
  { name: "Physics", credits: 4 },
  { name: "Chemistry", credits: 3 },
  { name: "English", credits: 3 },
  { name: "Computer Science", credits: 3 },
  { name: "History", credits: 2 },
];

const mk = (id, name, cls, gender, dob, guardian, phone, bus, attendance, scores) => ({
  id,
  name,
  cls,
  gender,
  dob,
  email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@edusphere.school",
  guardian,
  phone,
  bus,
  attendance,
  grades: Object.fromEntries(SUBJECTS.map((s, i) => [s.name, scores[i]])),
});

export const SEED_STUDENTS = [
  mk("S1001", "Aarav Sharma", "10-A", "Male", "2009-03-12", "Rakesh Sharma", "+91 98100 11001", "BUS-1", 96, [94, 91, 88, 85, 97, 90]),
  mk("S1002", "Priya Nair", "10-A", "Female", "2009-07-25", "Suresh Nair", "+91 98100 11002", "BUS-2", 98, [98, 96, 94, 92, 90, 95]),
  mk("S1003", "Rohan Mehta", "10-A", "Male", "2009-01-30", "Anil Mehta", "+91 98100 11003", "BUS-3", 88, [72, 68, 75, 80, 85, 78]),
  mk("S1004", "Ananya Iyer", "10-B", "Female", "2009-11-02", "Ramesh Iyer", "+91 98100 11004", "BUS-1", 93, [88, 84, 90, 93, 82, 87]),
  mk("S1005", "Kabir Singh", "10-B", "Male", "2009-05-18", "Harpreet Singh", "+91 98100 11005", "BUS-2", 79, [58, 62, 55, 70, 74, 66]),
  mk("S1006", "Meera Reddy", "10-B", "Female", "2009-09-09", "Venkat Reddy", "+91 98100 11006", "BUS-3", 95, [91, 89, 93, 87, 95, 92]),
  mk("S1007", "Arjun Patel", "9-A", "Male", "2010-02-14", "Kiran Patel", "+91 98100 11007", "BUS-1", 91, [81, 79, 83, 76, 88, 80]),
  mk("S1008", "Sara Khan", "9-A", "Female", "2010-06-21", "Imran Khan", "+91 98100 11008", "BUS-2", 97, [95, 92, 90, 96, 93, 94]),
  mk("S1009", "Vihaan Gupta", "9-B", "Male", "2010-04-04", "Manoj Gupta", "+91 98100 11009", "BUS-3", 84, [67, 71, 64, 69, 78, 73]),
  mk("S1010", "Isha Verma", "9-B", "Female", "2010-12-11", "Deepak Verma", "+91 98100 11010", "BUS-1", 92, [86, 85, 82, 90, 84, 88]),
  mk("S1011", "Neha Joshi", "8-A", "Female", "2011-08-19", "Prakash Joshi", "+91 98100 11011", "BUS-2", 89, [77, 74, 80, 83, 79, 85]),
  mk("S1012", "Dev Malhotra", "8-A", "Male", "2011-10-27", "Sanjay Malhotra", "+91 98100 11012", "BUS-3", 72, [49, 52, 45, 60, 63, 55]),
];

export const SEED_STAFF = [
  { id: "T01", name: "Dr. Sunita Rao", role: "Principal", department: "Administration", email: "sunita.rao@edusphere.school", phone: "+91 98200 20001", room: "Admin Block - 101", hours: "Mon-Fri 9:00-11:00" },
  { id: "T02", name: "Mr. Rajesh Kumar", role: "Head of Department", department: "Mathematics", email: "rajesh.kumar@edusphere.school", phone: "+91 98200 20002", room: "Room 204", hours: "Mon-Thu 2:00-4:00" },
  { id: "T03", name: "Ms. Kavita Menon", role: "Senior Teacher", department: "Physics", email: "kavita.menon@edusphere.school", phone: "+91 98200 20003", room: "Physics Lab 1", hours: "Tue-Fri 1:00-3:00" },
  { id: "T04", name: "Mr. Anil Deshmukh", role: "Teacher", department: "Chemistry", email: "anil.deshmukh@edusphere.school", phone: "+91 98200 20004", room: "Chemistry Lab 2", hours: "Mon-Wed 12:30-2:30" },
  { id: "T05", name: "Ms. Emily Thomas", role: "Head of Department", department: "English", email: "emily.thomas@edusphere.school", phone: "+91 98200 20005", room: "Room 110", hours: "Mon-Fri 10:00-12:00" },
  { id: "T06", name: "Mr. Farhan Ali", role: "Teacher", department: "Computer Science", email: "farhan.ali@edusphere.school", phone: "+91 98200 20006", room: "Computer Lab", hours: "Mon-Fri 3:00-4:30" },
  { id: "T07", name: "Mrs. Lakshmi Pillai", role: "Teacher", department: "History", email: "lakshmi.pillai@edusphere.school", phone: "+91 98200 20007", room: "Room 305", hours: "Wed-Fri 11:00-1:00" },
  { id: "T08", name: "Mr. Suresh Babu", role: "Transport Manager", department: "Transport", email: "suresh.babu@edusphere.school", phone: "+91 98200 20008", room: "Transport Office", hours: "Mon-Sat 7:00-5:00" },
  { id: "T09", name: "Ms. Pooja Bansal", role: "Registrar", department: "Administration", email: "pooja.bansal@edusphere.school", phone: "+91 98200 20009", room: "Admin Block - 104", hours: "Mon-Fri 9:00-4:00" },
];

export const ANNOUNCEMENTS = [
  { id: 1, title: "Mid-term exams begin Monday", tag: "Exams", when: "Today" },
  { id: 2, title: "Parent-teacher meeting on Saturday, 10 AM", tag: "Event", when: "Tomorrow" },
  { id: 3, title: "Route BUS-2 timing revised by 10 min", tag: "Transport", when: "2 days ago" },
  { id: 4, title: "Science fair registrations are open", tag: "Event", when: "3 days ago" },
];
