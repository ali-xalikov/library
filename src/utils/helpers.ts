import type {
  Book,
  BorrowRecord,
  DashboardStats,
  MonthlyStats,
  SubjectStats,
  GradeStats,
  User,
} from '../types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function getRelativeDays(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDaysRemainingText(dueDate: string): string {
  const days = getRelativeDays(dueDate);
  if (days === 0) return 'Bugun';
  if (days < 0) return `${Math.abs(days)} kun o'tdi`;
  return `${days} kun qoldi`;
}

export function calculateDueDate(issuedDate: string, days: number): string {
  const date = new Date(issuedDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getBookStatusColor(status: string): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    available: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    borrowed: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
    },
    reserved: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
    },
    maintenance: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
    },
    lost: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
    },
  };
  return colors[status] ?? colors.available;
}

export function getBookStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Mavjud',
    borrowed: "O'quvchida",
    reserved: 'Band',
    maintenance: "Ta'mirda",
    lost: "Yo'qolgan",
  };
  return labels[status] ?? status;
}

export function getSubjectIcon(subject: string): string {
  const icons: Record<string, string> = {
    Matematika: '📐',
    Fizika: '⚛️',
    Kimyo: '🧪',
    Biologiya: '🧬',
    Tarix: '📜',
    Geografiya: '🌍',
    Adabiyot: '📖',
    'Ingliz tili': '🇬🇧',
    'Rus tili': '🇷🇺',
    Informatika: '💻',
    'Ona tili': '📚',
    Texnologiya: '🔧',
    Musiqa: '🎵',
    Rasm: '🎨',
    Jismoniy_tarbiya: '⚽',
    Huquq: '⚖️',
    Filosofiya: '🧠',
  };
  return icons[subject] ?? '📚';
}

export function generateInventoryNumber(index: number): string {
  return `LIB-${String(index).padStart(6, '0')}`;
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'id-';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function filterBooks(
  books: Book[],
  filters: {
    search: string;
    subject: string;
    grade: string;
    language: string;
    status: string;
  }
): Book[] {
  return books.filter((book) => {
    if (filters.subject && book.subject !== filters.subject) return false;
    if (filters.grade && !book.grade.includes(Number(filters.grade) as any)) return false;
    if (filters.language && book.language !== filters.language) return false;
    if (filters.status && book.status !== filters.status) return false;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      const searchable = [
        book.title,
        book.author,
        book.isbn,
        book.inventoryNumber,
        book.subject,
        book.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

export function getDashboardStats(
  books: Book[],
  borrows: BorrowRecord[],
  students: User[]
): DashboardStats {
  const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalStudents = students.filter((s) => s.role === 'student').length;
  const borrowedBooks = borrows.filter((b) => b.status === 'active').length;
  const overdueBooks = borrows.filter(
    (b) => b.status === 'active' && getRelativeDays(b.dueDate) < 0
  ).length;
  const availableBooks = books.reduce((sum, b) => sum + b.availableCopies, 0);

  const today = new Date().toISOString().split('T')[0];
  const dueToday = borrows.filter(
    (b) => b.status === 'active' && b.dueDate.startsWith(today)
  ).length;

  return {
    totalBooks,
    availableBooks,
    borrowedBooks,
    overdueBooks,
    totalStudents,
    dueToday,
  };
}

const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export function getMonthlyStats(borrows: BorrowRecord[]): MonthlyStats[] {
  const now = new Date();
  const months: MonthlyStats[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const issuedCount = borrows.filter((b) => {
      const issued = new Date(b.issuedDate);
      return issued >= monthStart && issued <= monthEnd;
    }).length;

    const returnedCount = borrows.filter((b) => {
      if (!b.returnDate) return false;
      const returned = new Date(b.returnDate);
      return returned >= monthStart && returned <= monthEnd;
    }).length;

    months.push({
      month: UZ_MONTHS[month],
      issued: issuedCount,
      returned: returnedCount,
    });
  }

  return months;
}

export function getSubjectStats(books: Book[]): SubjectStats[] {
  const counts: Record<string, number> = {};

  for (const book of books) {
    counts[book.subject] = (counts[book.subject] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGradeStats(borrows: BorrowRecord[], students: User[]): GradeStats[] {
  const counts: Record<string, number> = {};
  const studentGrades: Record<string, number> = {};
  for (const s of students) {
    if (s.grade) studentGrades[s.id] = s.grade;
  }

  for (const borrow of borrows) {
    const grade = studentGrades[borrow.studentId];
    if (grade) {
      const key = `${grade}-sinf`;
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => a.grade.localeCompare(b.grade));
}

export function getTopBooks(
  borrows: BorrowRecord[],
  limit = 5
): { title: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const borrow of borrows) {
    counts[borrow.bookTitle] = (counts[borrow.bookTitle] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getActiveStudents(
  borrows: BorrowRecord[],
  limit = 5
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const borrow of borrows) {
    counts[borrow.studentName] = (counts[borrow.studentName] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  const escapeCell = (value: unknown): string => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => escapeCell(row[h])).join(',')
    ),
  ];

  const csvContent = csvLines.join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
