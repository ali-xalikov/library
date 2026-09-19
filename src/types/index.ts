export type Role = 'admin' | 'librarian' | 'student';

export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost';

export type Language = 'O\'zbek' | 'Rus' | 'Ingliz';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Subject =
  | 'Matematika' | 'Informatika' | 'Fizika' | 'Kimyo' | 'Biologiya'
  | 'Tarix' | 'Geografiya' | 'Ona tili' | 'Adabiyot' | 'Ingliz tili' | 'Rus tili';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar?: string;
  grade?: Grade;
  className?: string;
  qrCode?: string;
  phone?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  inventoryNumber: string;
  title: string;
  author: string;
  subject: Subject;
  category: string;
  grade: Grade[];
  language: Language;
  publisher: string;
  publishYear: number;
  isbn: string;
  pages: number;
  coverImage: string;
  pdfUrl?: string;
  totalCopies: number;
  availableCopies: number;
  shelfNumber: string;
  qrCode: string;
  status: BookStatus;
  description?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  className?: string;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  reservedDate: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  bookCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  avatar?: string;
  grade?: Grade;
  text: string;
  createdAt: string;
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
}

export interface BookRating {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  score: number;
  createdAt: string;
}

export interface SystemSettings {
  schoolName: string;
  schoolAddress: string;
  maxBorrowDays: number;
  maxBooksPerStudent: number;
  allowReservation: boolean;
  overdueFinePerDay: number;
  libraryOpenTime: string;
  libraryCloseTime: string;
  libraryPhone: string;
  libraryEmail: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalStudents: number;
  dueToday: number;
}

export interface MonthlyStats {
  month: string;
  issued: number;
  returned: number;
}

export interface SubjectStats {
  subject: string;
  count: number;
}

export interface GradeStats {
  grade: string;
  count: number;
}
