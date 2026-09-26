// Mock NEET data. Add chapters/questions by appending to the arrays below.

export type SubjectId = "physics" | "chemistry" | "biology";
export type Mode = "mcq" | "fib" | "diagram" | "ar" | "pyq";

export const MODES: { id: Mode; label: string; short: string; desc: string }[] = [
  { id: "mcq", label: "Line-by-Line MCQs", short: "MCQ", desc: "One question per NCERT line" },
  { id: "fib", label: "Fill in the Blanks", short: "FIB", desc: "Recall exact NCERT wording" },
  { id: "diagram", label: "Diagram Recall", short: "Diagram", desc: "Label & identify figures" },
  { id: "ar", label: "Assertion & Reason", short: "A&R", desc: "NEET-style statement logic" },
  { id: "pyq", label: "PYQ Tagged", short: "PYQ", desc: "Previous year NEET questions" },
];

export interface Subject {
  id: SubjectId;
  name: string;
  emoji: string;
}

export const SUBJECTS: Subject[] = [
  { id: "physics", name: "Physics", emoji: "⚛" },
  { id: "chemistry", name: "Chemistry", emoji: "⚗" },
  { id: "biology", name: "Biology", emoji: "🧬" },
];

export interface Chapter {
  id: string;
  subject: SubjectId;
  classLevel: 11 | 12;
  name: string;
  totalLines: number;
}

export const CHAPTERS: Chapter[] = [
  { id: "p11-motion", subject: "physics", classLevel: 11, name: "Motion in a Straight Line", totalLines: 140 },
  { id: "p11-laws", subject: "physics", classLevel: 11, name: "Laws of Motion", totalLines: 180 },
  { id: "p12-electro", subject: "physics", classLevel: 12, name: "Electric Charges and Fields", totalLines: 210 },
  { id: "c11-structure", subject: "chemistry", classLevel: 11, name: "Structure of Atom", totalLines: 230 },
  { id: "c11-bonding", subject: "chemistry", classLevel: 11, name: "Chemical Bonding", totalLines: 260 },
  { id: "c12-solutions", subject: "chemistry", classLevel: 12, name: "Solutions", totalLines: 190 },
  { id: "b11-cell", subject: "biology", classLevel: 11, name: "Cell: The Unit of Life", totalLines: 240 },
  { id: "b11-photo", subject: "biology", classLevel: 11, name: "Photosynthesis in Higher Plants", totalLines: 220 },
  { id: "b12-inheritance", subject: "biology", classLevel: 12, name: "Principles of Inheritance", totalLines: 300 },
];

export interface Citation {
  book: string;
  page: number;
  line: string;
}

export interface Question {
  id: string;
  chapterId: string;
  mode: Mode;
  prompt: string;
  options?: string[]; // omitted for fib (typed/reveal)
  answer: number | string; // option index or text
  difficulty: "easy" | "medium" | "hard";
  pyqYear?: number;
  citation: Citation;
}

const AR_OPTS = [
  "Both A and R are true, R explains A",
  "Both A and R are true, R does not explain A",
  "A is true, R is false",
  "A is false, R is true",
];

export const QUESTIONS: Question[] = [
  // Biology – Cell
  { id: "q1", chapterId: "b11-cell", mode: "mcq", prompt: "Who first saw and described a live cell?", options: ["Robert Hooke", "Anton Von Leeuwenhoek", "Robert Brown", "Schleiden"], answer: 1, difficulty: "easy", citation: { book: "NCERT Biology XI", page: 126, line: "Anton Von Leeuwenhoek first saw and described a live cell." } },
  { id: "q2", chapterId: "b11-cell", mode: "fib", prompt: "Robert Brown later discovered the ______.", answer: "nucleus", difficulty: "easy", citation: { book: "NCERT Biology XI", page: 126, line: "Robert Brown later discovered the nucleus." } },
  { id: "q3", chapterId: "b11-cell", mode: "ar", prompt: "A: Mitochondria are called the powerhouse of the cell.\nR: They are the sites of aerobic respiration.", options: AR_OPTS, answer: 0, difficulty: "medium", citation: { book: "NCERT Biology XI", page: 136, line: "Mitochondria are the sites of aerobic respiration. They produce cellular energy in the form of ATP, hence they are called 'power houses' of the cell." } },
  { id: "q4", chapterId: "b11-cell", mode: "diagram", prompt: "In the fluid mosaic model figure, the quasi-fluid nature allows lateral movement of which component?", options: ["Carbohydrates", "Proteins", "Cholesterol only", "Nucleic acids"], answer: 1, difficulty: "medium", citation: { book: "NCERT Biology XI", page: 131, line: "The quasi-fluid nature of lipid enables lateral movement of proteins within the overall bilayer." } },
  { id: "q5", chapterId: "b11-cell", mode: "pyq", pyqYear: 2021, prompt: "Which of the following is not a membrane-bound organelle?", options: ["Lysosome", "Ribosome", "Golgi body", "Vacuole"], answer: 1, difficulty: "easy", citation: { book: "NCERT Biology XI", page: 134, line: "Ribosomes are the granular structures ... not surrounded by any membrane." } },
  // Biology – Photosynthesis
  { id: "q6", chapterId: "b11-photo", mode: "mcq", prompt: "The first stable product of C3 cycle is:", options: ["OAA", "PGA", "RuBP", "PEP"], answer: 1, difficulty: "easy", citation: { book: "NCERT Biology XI", page: 217, line: "The first CO2 fixation product was a 3-carbon organic acid (3-phosphoglyceric acid) or in short PGA." } },
  { id: "q7", chapterId: "b11-photo", mode: "fib", prompt: "The most abundant enzyme in the world is ______.", answer: "RuBisCO", difficulty: "medium", citation: { book: "NCERT Biology XI", page: 219, line: "RuBisCO ... is the most abundant enzyme in the world." } },
  { id: "q8", chapterId: "b11-photo", mode: "pyq", pyqYear: 2019, prompt: "Kranz anatomy is found in:", options: ["C3 plants", "C4 plants", "CAM plants", "Algae"], answer: 1, difficulty: "medium", citation: { book: "NCERT Biology XI", page: 221, line: "This anatomy ... in C4 plants is called 'Kranz' anatomy." } },
  // Biology – Inheritance
  { id: "q9", chapterId: "b12-inheritance", mode: "mcq", prompt: "Mendel's monohybrid F2 phenotypic ratio is:", options: ["1:2:1", "3:1", "9:3:3:1", "1:1"], answer: 1, difficulty: "easy", citation: { book: "NCERT Biology XII", page: 74, line: "The phenotypic ratio of 3:1 ... in the F2 generation." } },
  { id: "q10", chapterId: "b12-inheritance", mode: "ar", prompt: "A: ABO blood grouping shows co-dominance.\nR: IA and IB both express when present together.", options: AR_OPTS, answer: 0, difficulty: "hard", citation: { book: "NCERT Biology XII", page: 78, line: "IA and IB ... when present together they both express their own types of sugars: this is because of co-dominance." } },
  // Chemistry
  { id: "q11", chapterId: "c11-structure", mode: "mcq", prompt: "Who discovered the neutron?", options: ["Rutherford", "Chadwick", "Thomson", "Bohr"], answer: 1, difficulty: "easy", citation: { book: "NCERT Chemistry XI Part I", page: 33, line: "These were discovered by Chadwick (1932) ... called neutrons." } },
  { id: "q12", chapterId: "c11-structure", mode: "fib", prompt: "The number of orbitals in a subshell is given by ______.", answer: "2l+1", difficulty: "medium", citation: { book: "NCERT Chemistry XI Part I", page: 59, line: "The number of orbitals in a subshell = 2l + 1." } },
  { id: "q13", chapterId: "c11-bonding", mode: "pyq", pyqYear: 2020, prompt: "Shape of SF4 molecule is:", options: ["Tetrahedral", "See-saw", "Square planar", "Trigonal pyramidal"], answer: 1, difficulty: "hard", citation: { book: "NCERT Chemistry XI Part I", page: 111, line: "SF4 ... the shape is described as a see-saw." } },
  { id: "q14", chapterId: "c12-solutions", mode: "mcq", prompt: "Henry's law constant KH increases with:", options: ["Decrease in temperature", "Increase in temperature", "Increase in pressure", "None"], answer: 1, difficulty: "medium", citation: { book: "NCERT Chemistry XII Part I", page: 8, line: "KH values for both N2 and O2 increase with increase of temperature." } },
  // Physics
  { id: "q15", chapterId: "p11-motion", mode: "mcq", prompt: "Area under velocity-time graph gives:", options: ["Acceleration", "Displacement", "Jerk", "Force"], answer: 1, difficulty: "easy", citation: { book: "NCERT Physics XI Part I", page: 45, line: "The area under the velocity-time curve equals the displacement over a given time interval." } },
  { id: "q16", chapterId: "p11-laws", mode: "ar", prompt: "A: A body at rest has no force acting on it.\nR: Net external force on a body at rest is zero.", options: AR_OPTS, answer: 3, difficulty: "medium", citation: { book: "NCERT Physics XI Part I", page: 95, line: "If the net external force on a body is zero, its acceleration is zero." } },
  { id: "q17", chapterId: "p12-electro", mode: "pyq", pyqYear: 2022, prompt: "SI unit of electric flux is:", options: ["N/C", "N m²/C", "C/m²", "V/m"], answer: 1, difficulty: "easy", citation: { book: "NCERT Physics XII Part I", page: 25, line: "The unit of electric flux is N C–1 m2." } },
  { id: "q18", chapterId: "p12-electro", mode: "fib", prompt: "Charge is ______ — it exists as integral multiples of e.", answer: "quantised", difficulty: "easy", citation: { book: "NCERT Physics XII Part I", page: 7, line: "The fact that electric charge is always an integral multiple of e is termed as quantisation of charge." } },
];

export const SRS_INTERVALS = [1, 3, 7, 30]; // days

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);
export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id);
