import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  User,
  Book,
  BorrowRecord,
  Reservation,
  Category,
  Notification,
  ChatMessage,
  BookRating,
  SystemSettings,
} from '../types';
import { ApiError } from '../services/api';
import {
  getMessages,
  createMessage,
  deleteMessage as deleteMessageRequest,
} from '../services/chat.api';
import { containsProfanity } from '../utils/profanity';
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from '../services/profiles.api';
import {
  getBooks,
  createBook,
  updateBook as updateBookRequest,
  deleteBook as deleteBookRequest,
} from '../services/books.api';
import {
  getBorrows,
  createBorrow,
  updateBorrow,
  deleteBorrow,
} from '../services/borrows.api';
import {
  getReservations,
  createReservation,
  updateReservation,
} from '../services/reservations.api';
import {
  getCategories,
  createCategory as createCategoryRequest,
  updateCategory as updateCategoryRequest,
  deleteCategory as deleteCategoryRequest,
} from '../services/categories.api';
import {
  getNotifications,
  createNotification,
  updateNotification,
} from '../services/notifications.api';
import {
  fetchSettings as fetchSettingsRequest,
  createSettings,
  updateSettings as updateSettingsRequest,
} from '../services/settings.api';
import { demoSettings } from '../data/mockData';
import type { NotificationInput } from '../services/notifications.api';
import {
  getRatings,
  createRating,
  updateRating,
} from '../services/ratings.api';

const MAX_CHAT_MESSAGES = 500;
const CHAT_TRIM_TO = 250;

interface AppContextValue {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  books: Book[];
  users: User[];
  borrows: BorrowRecord[];
  reservations: Reservation[];
  categories: Category[];
  notifications: Notification[];
  messages: ChatMessage[];
  ratings: BookRating[];
  settings: SystemSettings;
  addBook: (data: Omit<Book, 'id' | 'inventoryNumber' | 'qrCode'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  issueBook: (
    book: Book,
    student: User,
    issuedBy: string
  ) => Promise<{ success: boolean; message: string }>;
  returnBook: (borrowId: string) => Promise<void>;
  addStudent: (data: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addReservation: (book: Book, student: User) => Promise<Reservation | null>;
  approveReservation: (id: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  fulfillReservation: (id: string) => Promise<void>;
  addNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendMessage: (data: Omit<ChatMessage, 'id' | 'createdAt'>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  reloadChat: () => Promise<void>;
  rateBook: (
    bookId: string,
    score: number,
    byUser: Pick<User, 'id' | 'firstName' | 'lastName'>
  ) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  addCategory: (name: string, description: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function messageOf(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Server bilan bog'lanib bo'lmadi";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ratings, setRatings] = useState<BookRating[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(demoSettings);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeBook = (b: Book): Book => ({
    ...b,
    grade: Array.isArray(b.grade) ? b.grade : [],
  });

  const normalizeBorrow = (b: BorrowRecord): BorrowRecord => ({
    ...b,
    id: String(b.id),
    bookId: String(b.bookId),
    studentId: String(b.studentId),
  });

  const normalizeReservation = (r: Reservation): Reservation => ({
    ...r,
    id: String(r.id),
    bookId: String(r.bookId),
    studentId: String(r.studentId),
  });

  const normalizeNotification = (n: Notification): Notification => ({
    ...n,
    id: String(n.id),
    userId: String(n.userId),
  });

  const normalizeChatMessage = (m: ChatMessage): ChatMessage => ({
    ...m,
    id: String(m.id),
    userId: String(m.userId),
    bookId: m.bookId ? String(m.bookId) : undefined,
  });

  const normalizeRating = (r: BookRating): BookRating => ({
    ...r,
    id: String(r.id),
    bookId: String(r.bookId),
    userId: String(r.userId),
  });

  const messagesRef = useRef<ChatMessage[]>([]);

  const applyMessages = useCallback((next: ChatMessage[]) => {
    let trimmed = next;
    if (trimmed.length > MAX_CHAT_MESSAGES) {
      const sorted = [...trimmed].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const toRemove = sorted.slice(0, sorted.length - CHAT_TRIM_TO);
      void Promise.allSettled(toRemove.map((m) => deleteMessageRequest(m.id)));
      trimmed = sorted.slice(sorted.length - CHAT_TRIM_TO);
    }
    messagesRef.current = trimmed;
    setMessages(trimmed);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const results = await Promise.allSettled([
      getBooks(),
      getProfiles(),
      getBorrows(),
      getReservations(),
      getCategories(),
      getNotifications(),
      getMessages(),
      getRatings(),
      fetchSettingsRequest(),
    ]);

    const [booksS, usersS, borrowsS, reservationsS, categoriesS, notificationsS, chatS, ratingsS, settingsS] =
      results;

    if (booksS.status === 'fulfilled') setBooks(booksS.value.map(normalizeBook));
    else setError(messageOf(booksS.reason));

    if (usersS.status === 'fulfilled') setUsers(usersS.value);
    else setError((prev) => prev ?? messageOf(usersS.reason));

    if (borrowsS.status === 'fulfilled')
      setBorrows(borrowsS.value.map(normalizeBorrow));
    else setError((prev) => prev ?? messageOf(borrowsS.reason));

    if (reservationsS.status === 'fulfilled')
      setReservations(reservationsS.value.map(normalizeReservation));
    else setError((prev) => prev ?? messageOf(reservationsS.reason));

    if (categoriesS.status === 'fulfilled') setCategories(categoriesS.value);
    else setError((prev) => prev ?? messageOf(categoriesS.reason));

    if (notificationsS.status === 'fulfilled')
      setNotifications(notificationsS.value.map(normalizeNotification));
    else setError((prev) => prev ?? messageOf(notificationsS.reason));

    if (chatS.status === 'fulfilled')
      applyMessages(chatS.value.map(normalizeChatMessage));
    else setError((prev) => prev ?? messageOf(chatS.reason));

    if (ratingsS.status === 'fulfilled') setRatings(ratingsS.value.map(normalizeRating));
    else setError((prev) => prev ?? messageOf(ratingsS.reason));

    if (settingsS.status === 'fulfilled') {
      setSettings(settingsS.value.settings);
      setSettingsId(settingsS.value.id);
    } else {
      setError((prev) => prev ?? messageOf(settingsS.reason));
    }

    setLoading(false);
  }, [applyMessages]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const notify = async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const full: NotificationInput = {
      ...data,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const notif = await createNotification(full);
    setNotifications((prev) => [normalizeNotification(notif), ...prev]);
    return notif;
  };

  const addBook = async (
    data: Omit<Book, 'id' | 'inventoryNumber' | 'qrCode'>
  ): Promise<Book> => {
    const nextNumber = books.length + 1;
    const inventoryNumber = `LIB-${String(nextNumber).padStart(6, '0')}`;
    const book = await createBook({
      ...data,
      inventoryNumber,
      qrCode: inventoryNumber,
    });
    setBooks((prev) => [normalizeBook(book), ...prev]);

    try {
      const existing = categories.find((c) => c.name === data.category);
      if (existing) {
        const updated = await updateCategoryRequest(existing.id, {
          ...existing,
          bookCount: existing.bookCount + 1,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await createCategoryRequest({
          name: data.category,
          description: '',
          bookCount: 1,
        });
        setCategories((prev) => [created, ...prev]);
      }
    } catch {
      /* kategoriya xatosi asosiy jarayonni to'xtatmaydi */
    }

    try {
      const admin = users.find((u) => u.role === 'admin');
      if (admin) {
        await notify({
          userId: admin.id,
          title: 'Yangi kitob qo\'shildi',
          message: `"${book.title}" kitobi kutubxona fondiga qo'shildi.`,
          type: 'success',
          link: `/books/${book.id}`,
        });
      }
    } catch {
      /* bildirishnoma xatosi asosiy jarayonni to'xtatmaydi */
    }

    return book;
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const updated = await updateBookRequest(id, updates);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? normalizeBook(updated) : b)));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const activeBorrows = borrows.filter(
        (b) => b.bookId === id && b.status === 'active'
      );
      await Promise.allSettled(activeBorrows.map((b) => deleteBorrow(b.id)));
      await deleteBookRequest(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setBorrows((prev) => prev.filter((b) => b.bookId !== id || b.status !== 'active'));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const issueBook = async (book: Book, student: User, issuedBy: string) => {
    const activeBorrows = borrows.filter(
      (b) => b.studentId === student.id && b.status === 'active'
    ).length;

    if (activeBorrows >= settings.maxBooksPerStudent) {
      return {
        success: false,
        message: `O'quvchi maksimal ${settings.maxBooksPerStudent} tadan ortiq kitob ololmaydi`,
      };
    }
    if (book.availableCopies < 1) {
      return { success: false, message: "Bu kitobdan mavjud nusxalar yo'q" };
    }

    try {
      const issuedDate = new Date();
      const dueDate = new Date(issuedDate);
      dueDate.setDate(dueDate.getDate() + settings.maxBorrowDays);

      const updatedBook = await updateBookRequest(book.id, {
        availableCopies: book.availableCopies - 1,
        status: book.availableCopies - 1 <= 0 ? 'borrowed' : book.status,
      });

      const record = await createBorrow({
        bookId: book.id,
        bookTitle: book.title,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        issuedBy,
        issuedDate: issuedDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'active',
      });

      setBooks((prev) =>
        prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
      );
      setBorrows((prev) => [normalizeBorrow(record), ...prev]);

      const dueText = `${dueDate.getDate()}.${dueDate.getMonth() + 1}.${dueDate.getFullYear()}`;
      try {
        await notify({
          userId: student.id,
          title: 'Kitob berildi',
          message: `"${book.title}" kitobini ${issuedBy} Sizga topshirdi. Qaytarish muddati: ${dueText}`,
          type: 'info',
          link: '/my-books',
        });
      } catch {
        /* bildirishnoma xatosi asosiy jarayonni to'xtatmaydi */
      }

      return {
        success: true,
        message: `${book.title} — ${student.firstName} ${student.lastName}ga berildi`,
      };
    } catch (err) {
      return { success: false, message: messageOf(err) };
    }
  };

  const returnBook = async (borrowId: string) => {
    try {
      const borrow = borrows.find((b) => b.id === borrowId);
      if (!borrow) return;

      const returnDate = new Date().toISOString();
      const wasOverdue = new Date(returnDate) > new Date(borrow.dueDate);

      const updatedBorrow = await updateBorrow(borrowId, {
        status: 'returned',
        returnDate,
        notes: wasOverdue ? 'Kechikish bilan qaytarildi' : borrow.notes,
      });
      setBorrows((prev) =>
        prev.map((b) => (b.id === borrowId ? normalizeBorrow(updatedBorrow) : b))
      );

      const currentBook = books.find((b) => b.id === borrow.bookId);
      if (currentBook) {
        const updatedBook = await updateBookRequest(currentBook.id, {
          availableCopies: currentBook.availableCopies + 1,
          status: 'available',
        });
        setBooks((prev) =>
          prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
        );
      }

      const nextReservation = reservations.find(
        (r) =>
          r.bookId === borrow.bookId &&
          (r.status === 'pending' || r.status === 'approved')
      );
      if (nextReservation) {
        try {
          await notify({
            userId: nextReservation.studentId,
            title: 'Sizning navbatingiz',
            message: `"${borrow.bookTitle}" kitobi qaytarildi. Endi kitobni olishingiz mumkin.`,
            type: 'success',
            link: '/reservations',
          });
        } catch {
          /* bildirishnoma xatosi asosiy jarayonni to'xtatmaydi */
        }
      }
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const addStudent = async (
    data: Omit<User, 'id' | 'createdAt'>
  ): Promise<User> => {
    const studentNumber = users.filter((u) => u.role === 'student').length + 1;
    const student = await createProfile({
      ...data,
      role: data.role ?? 'student',
      createdAt: new Date().toISOString(),
      qrCode: `STU-${String(studentNumber).padStart(6, '0')}`,
    });
    setUsers((prev) => [...prev, student]);
    return student;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updated = await updateProfile(id, updates);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const active = borrows.find((b) => b.studentId === id && b.status === 'active');
      if (active) {
        setError("Foydalanuvchida faol qarz bor, o'chirib bo'lmaydi");
        return;
      }
      await deleteProfile(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const addReservation = async (book: Book, student: User) => {
    try {
      const existing = reservations.find(
        (r) =>
          r.bookId === book.id &&
          r.studentId === student.id &&
          (r.status === 'pending' || r.status === 'approved')
      );
      if (existing) return existing;

      const reservation = await createReservation({
        bookId: book.id,
        bookTitle: book.title,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        reservedDate: new Date().toISOString(),
        status: 'pending',
      });
      setReservations((prev) => [normalizeReservation(reservation), ...prev]);

      if (book.availableCopies > 0 && book.status !== 'reserved') {
        try {
          const updatedBook = await updateBookRequest(book.id, {
            ...book,
            status: 'reserved',
          });
          setBooks((prev) =>
            prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
          );
        } catch {
          /* holat xatosi bronni bekor qilmaydi */
        }
      }

      try {
        await notify({
          userId: student.id,
          title: 'Bron yaratildi',
          message: `"${book.title}" kitobiga bron qilindingiz.`,
          type: 'info',
          link: '/reservations',
        });
      } catch {
        /* bildirishnoma xatosi asosiy jarayonni to'xtatmaydi */
      }

      return reservation;
    } catch (err) {
      setError(messageOf(err));
      return null;
    }
  };

  const approveReservation = async (id: string) => {
    try {
      const updated = await updateReservation(id, { status: 'approved' });
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? normalizeReservation(updated) : r))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const reservation = reservations.find((r) => r.id === id);
      if (reservation && reservation.status === 'pending') {
        const hasOtherPending = reservations.some(
          (r) =>
            r.bookId === reservation.bookId &&
            r.id !== id &&
            r.status === 'pending'
        );
        if (!hasOtherPending) {
          const book = books.find((b) => b.id === reservation.bookId);
          if (book && book.availableCopies > 0 && book.status === 'reserved') {
            try {
              const updatedBook = await updateBookRequest(book.id, {
                ...book,
                status: 'available',
              });
              setBooks((prev) =>
                prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
              );
            } catch {
              /* holat xatosi bekor qilishni to'xtatmaydi */
            }
          }
        }
      }
      const updated = await updateReservation(id, { status: 'cancelled' });
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? normalizeReservation(updated) : r))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const fulfillReservation = async (id: string) => {
    try {
      const updated = await updateReservation(id, { status: 'fulfilled' });
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? normalizeReservation(updated) : r))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const addNotification = async (
    data: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => {
    try {
      await notify(data);
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const updated = await updateNotification(id, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? normalizeNotification(updated) : n))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      const updatedList = await Promise.all(
        unread.map((n) => updateNotification(n.id, { read: true }))
      );
      const updatedMap = new Map(
        updatedList.map((n) => [n.id, normalizeNotification(n)])
      );
      setNotifications((prev) => prev.map((n) => updatedMap.get(n.id) ?? n));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const sendMessage = async (data: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    if (containsProfanity(data.text)) {
      throw new Error('Qo\'pol so\'z yuborish mumkin emas.');
    }
    try {
      const message = await createMessage({
        ...data,
        createdAt: new Date().toISOString(),
      });
      applyMessages([...messagesRef.current, normalizeChatMessage(message)]);
    } catch (err) {
      setError(messageOf(err));
      throw err;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageRequest(id);
      applyMessages(messagesRef.current.filter((m) => m.id !== id));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const reloadChat = useCallback(async () => {
    try {
      const list = await getMessages();
      applyMessages(list.map(normalizeChatMessage));
    } catch (err) {
      setError(messageOf(err));
    }
  }, [applyMessages]);

  const rateBook = async (
    bookId: string,
    score: number,
    byUser: Pick<User, 'id' | 'firstName' | 'lastName'>
  ) => {
    try {
      const existing = ratings.find(
        (r) => r.bookId === bookId && r.userId === byUser.id
      );
      const userName = `${byUser.firstName} ${byUser.lastName}`.trim();
      if (existing) {
        const updated = await updateRating(existing.id, score);
        setRatings((prev) => prev.map((r) => (r.id === existing.id ? normalizeRating(updated) : r)));
      } else {
        const created = await createRating({
          bookId,
          bookTitle: books.find((b) => b.id === bookId)?.title ?? '',
          userId: byUser.id,
          userName,
          score,
        });
        setRatings((prev) => [...prev, normalizeRating(created)]);
      }
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      if (settingsId) {
        await updateSettingsRequest(settingsId, updates);
        setSettings((prev) => ({ ...prev, ...updates }));
      } else {
        const next = { ...demoSettings, ...updates };
        const { id } = await createSettings(next);
        setSettings(next);
        setSettingsId(id);
      }
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const addCategory = async (name: string, description: string) => {
    try {
      const created = await createCategoryRequest({ name, description, bookCount: 0 });
      setCategories((prev) => [created, ...prev]);
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updated = await updateCategoryRequest(id, updates);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryRequest(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        error,
        refresh: loadAll,
        books,
        users,
        borrows,
        reservations,
        categories,
        notifications,
        settings,
        addBook,
        updateBook,
        deleteBook,
        issueBook,
        returnBook,
        addStudent,
        updateUser,
        deleteUser,
        addReservation,
        approveReservation,
        cancelReservation,
        fulfillReservation,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        messages,
        sendMessage,
        deleteMessage,
        reloadChat,
        ratings,
        rateBook,
        updateSettings,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}