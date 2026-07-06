export const BDARIJA_SECTIONS = [
  // Chapter 1: Comprehension
  { id: "comprehension", type: "chapter", title: "Comprehension (الفهم)", icon: "fa-brain" },
  { id: "comp-overview", type: "section", title: "Overview & Strategies", parent: "comprehension" },
  { id: "comp-tf", type: "section", title: "True / False + Justify", parent: "comprehension" },
  { id: "comp-questions", type: "section", title: "Answer Open Questions", parent: "comprehension" },
  { id: "comp-complete", type: "section", title: "Complete Sentences", parent: "comprehension" },
  { id: "comp-reference", type: "section", title: "Word Reference", parent: "comprehension" },
  { id: "comp-synonyms", type: "section", title: "Synonyms, Title & More", parent: "comprehension" },

  // Chapter 2: Grammar
  { id: "grammar", type: "chapter", title: "Grammar (القواعد)", icon: "fa-book" },
  { id: "tenses", type: "section", title: "All 8 Tenses", parent: "grammar" },
  { id: "passive", type: "section", title: "Passive Voice", parent: "grammar" },
  { id: "reported", type: "section", title: "Reported Speech", parent: "grammar" },
  { id: "conditionals", type: "section", title: "Conditionals & Wish", parent: "grammar" },
  { id: "modals", type: "section", title: "Modal Verbs", parent: "grammar" },
  { id: "relative", type: "section", title: "Relative Pronouns", parent: "grammar" },
  { id: "purpose", type: "section", title: "Purpose Expressions", parent: "grammar" },
  { id: "gerund", type: "section", title: "Gerund & Infinitive", parent: "grammar" },
  { id: "linking", type: "section", title: "Linking Words", parent: "grammar" },
  { id: "phrasal", type: "section", title: "Phrasal Verbs (43)", parent: "grammar" },
  { id: "functions", type: "section", title: "Language Functions (18)", parent: "grammar" },

  // Chapter 3: Writing
  { id: "writing", type: "chapter", title: "Writing Guide (التعبير)", icon: "fa-pen" },
  { id: "writing-overview", type: "section", title: "Writing Overview", parent: "writing" },
  { id: "writing-causes", type: "section", title: "Causes & Solutions", parent: "writing" },
  { id: "writing-adv", type: "section", title: "Advantages & Disadv.", parent: "writing" },
  { id: "writing-informal", type: "section", title: "Informal Email/Letter", parent: "writing" },
  { id: "writing-formal", type: "section", title: "Formal Email/Letter", parent: "writing" },
  { id: "writing-person", type: "section", title: "Describe a Person", parent: "writing" },
  { id: "writing-place", type: "section", title: "Describe a Place", parent: "writing" },
  { id: "writing-report", type: "section", title: "A Report", parent: "writing" },
  { id: "writing-film", type: "section", title: "Film Review", parent: "writing" },
  { id: "writing-book", type: "section", title: "Book Review", parent: "writing" },

  // Chapter 4: Irregular Verbs
  { id: "verbs", type: "chapter", title: "Irregular Verbs (الأفعال الشاذة)", icon: "fa-table" },
  { id: "irregular-verbs", type: "section", title: "118 Irregular Verbs", parent: "verbs" },
  { id: "flashcards", type: "section", title: "Interactive Flashcards (20)", parent: "verbs" },

  // Chapter 5: Vocabulary
  { id: "vocabulary", type: "chapter", title: "Vocabulary (المفردات)", icon: "fa-font" },
  { id: "vocab-unit1", type: "section", title: "Unit 1: Education", parent: "vocabulary" },
  { id: "vocab-unit2", type: "section", title: "Unit 2: Immigration", parent: "vocabulary" },
  { id: "vocab-unit3", type: "section", title: "Unit 3: Human Rights", parent: "vocabulary" },
  { id: "vocab-unit4", type: "section", title: "Unit 4: Women & Society", parent: "vocabulary" },
  { id: "vocab-unit5", type: "section", title: "Unit 5: Charity & Volunteering", parent: "vocabulary" },
  { id: "vocab-unit6", type: "section", title: "Unit 6: Internet & Technology", parent: "vocabulary" },
  { id: "vocab-unit7", type: "section", title: "Unit 7: Health & Sports", parent: "vocabulary" },
  { id: "vocab-unit8", type: "section", title: "Unit 8: Entertainment", parent: "vocabulary" },
  { id: "vocab-unit9", type: "section", title: "Unit 9: Economy", parent: "vocabulary" },
  { id: "vocab-unit10", type: "section", title: "Unit 10: Citizenship & Environment", parent: "vocabulary" },

  // Chapter 6: Exam Strategy
  { id: "strategy-chapter", type: "chapter", title: "Exam Strategy (الاستراتيجية)", icon: "fa-trophy" },
  { id: "strategy", type: "section", title: "BAC Exam Strategy", parent: "strategy-chapter" },
  { id: "mistakes", type: "section", title: "20 Common Mistakes", parent: "strategy-chapter" },
  { id: "study-plan", type: "section", title: "10-Day Study Plan", parent: "strategy-chapter" },
  { id: "quiz", type: "section", title: "Practice Quiz (10 questions)", parent: "strategy-chapter" },

  // Chapter 7: National Exams
  { id: "exams", type: "chapter", title: "National Exams (الامتحانات)", icon: "fa-file-alt" },
  { id: "corrections", type: "section", title: "Answer Keys & Corrections", parent: "exams" },
  { id: "national-exams", type: "section", title: "National Exam Samples", parent: "exams" },

  // Chapter 8: Bonus
  { id: "bonus", type: "chapter", title: "Bonus (إضافات)", icon: "fa-gem" },
  { id: "proverbs", type: "section", title: "Proverbs, Slang & More", parent: "bonus" },
];

export const BDARIJA_SRC = "./bac-english-complete.html";
