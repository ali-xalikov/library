import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Send, ShieldBan, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import { useTranslation } from "../i18n/LanguageContext";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";
import { containsProfanity } from "../utils/profanity";
import type { Book, ChatMessage } from "../types";

const MAX_LENGTH = 500;

function formatTime(dateString: string, t: (key: string) => string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return t("time.justNow");
  if (minutes < 60) return `${minutes}${t("time.minutesAgo")}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t("time.hoursAgo")}`;

  const days = Math.floor(hours / 24);
  return `${days}${t("time.daysAgo")}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${(parts[0]?.[0] ?? "").toUpperCase()}${(
    parts[parts.length - 1]?.[0] ?? ""
  ).toUpperCase()}`;
}

export default function Chat() {
  const { user } = useAuth();
  const { books, messages, loading, sendMessage, deleteMessage, reloadChat } =
    useApp();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const roleLabel: Record<string, string> = {
    student: "O'quvchi",
    teacher: "O'qituvchi",
    librarian: "Kutubxonachi",
    admin: "Admin",
  };
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const booksFiltered = books
    .filter(
      (b) =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase())
    )
    .slice(0, 12);

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sorted.length]);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      void reloadChat();
    }, 4000);
    return () => clearInterval(timer);
  }, [user, reloadChat]);

  if (!user) return null;

  const canDelete = (m: ChatMessage): boolean =>
    user.role !== "student" || m.userId === user.id;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    if (text.length > MAX_LENGTH) {
      showToast(`Xabar ${MAX_LENGTH} belgidan oshmasligi kerak`, "error");
      return;
    }
    if (containsProfanity(text)) {
      showToast("Bunday xabarni yuborish mumkin emas.", "error");
      return;
    }

    setSending(true);
    try {
      await sendMessage({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        userRole: user.role,
        avatar: user.avatar,
        grade: user.grade,
        text,
        bookId: book?.id,
        bookTitle: book?.title,
        bookAuthor: book?.author,
        bookCover: book?.coverImage || undefined,
      });
      setInput("");
      setBook(null);
      setPickerOpen(false);
    } catch {
      showToast("Xabar yuborilmadi. Qayta urinib ko'ring.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (m: ChatMessage) => {
    await deleteMessage(m.id);
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] flex-col overflow-hidden">
      {/* Title - faqat desktopda */}
      <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in mb-4 px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chat
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            O'quvchilar va kutubxona xodimlari uchun umumiy suhbat. Qo'pol so'z
            yuborish taqiqlanadi.
          </p>
        </div>
      </div>

      {/* Chat container - to‘liq balandlik */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none sm:rounded-xl border-0 sm:border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-3 sm:p-4 dark:bg-slate-950/40"
        >
          {loading && sorted.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Xabarlar yuklanmoqda"
              description="Biroz kuting..."
            />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Hozircha xabarlar yo'q"
              description="Birinchi bo'lib salomlashing!"
            />
          ) : (
            sorted.map((m) => {
              const own = m.userId === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2.5 ${
                    own ? "flex-row-reverse" : ""
                  }`}
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {getInitials(m.userName)}
                    </span>
                  )}
                  <div
                    className={`group max-w-[80%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      own
                        ? "rounded-br-sm bg-primary-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {!own && (
                      <p className="mb-0.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {m.userName}
                        <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">
                          {roleLabel[m.userRole] ?? m.userRole}
                          {m.userRole === "student" && m.grade
                            ? ` · ${m.grade}-sinf`
                            : ""}
                        </span>
                      </p>
                    )}
                    {m.bookId && m.bookTitle && (
                      <div
                        className={`mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                          own
                            ? "bg-white/15 text-white"
                            : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            own
                              ? "bg-primary-100/20"
                              : "bg-primary-100 dark:bg-primary-900/40"
                          }`}
                        >
                          {m.bookCover ? (
                            <img
                              src={m.bookCover}
                              alt=""
                              className="h-full w-full rounded-md object-cover"
                            />
                          ) : (
                            <BookMarked
                              className={`h-4 w-4 ${
                                own
                                  ? "text-white"
                                  : "text-primary-600 dark:text-primary-400"
                              }`}
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <Link
                            to={`/books/${m.bookId}`}
                            className="block truncate hover:underline"
                          >
                            {m.bookTitle}
                          </Link>
                          {m.bookAuthor && (
                            <span className="block truncate opacity-80">
                              {m.bookAuthor}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {m.text}
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1.5 text-[11px] ${
                        own
                          ? "text-primary-100"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {formatTime(m.createdAt, t)}
                      {canDelete(m) && (
                        <button
                          type="button"
                          title="O'chirish"
                          onClick={() => handleDelete(m)}
                          className="opacity-0 transition-opacity focus:outline-none group-hover:opacity-100"
                        >
                          <Trash2
                            className={`h-3.5 w-3.5 ${
                              own
                                ? "text-primary-100 hover:text-white"
                                : "text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                            }`}
                          />
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          {pickerOpen && (
            <div className="mb-2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="p-2">
                <SearchInput
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Kitob nomi yoki muallif..."
                  autoFocus
                />
              </div>
              <div className="max-h-40 sm:max-h-48 overflow-y-auto">
                {booksFiltered.length === 0 ? (
                  <p className="px-3 py-3 text-center text-xs text-slate-400">
                    Kitob topilmadi
                  </p>
                ) : (
                  booksFiltered.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBook(b);
                        setPickerOpen(false);
                        setBookSearch("");
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors last:border-t hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-200">
                        {b.title}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {b.author}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                pickerOpen
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <BookMarked className="h-3.5 w-3.5" />
              Kitob belgilash
            </button>
            {book && (
              <span className="inline-flex max-w-[60%] items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <BookMarked className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{book.title}</span>
                <button
                  type="button"
                  onClick={() => setBook(null)}
                  className="ml-0.5 rounded p-0.5 hover:bg-primary-100 dark:hover:bg-primary-800"
                  aria-label="Kitobni olib tashlash"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              maxLength={MAX_LENGTH}
              rows={1}
              placeholder="Xabaringizni yozing..."
              className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
            <Button
              onClick={() => void handleSend()}
              loading={sending}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Yuborish</span>
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <ShieldBan className="h-3.5 w-3.5" />
            Qo'pol so'zlar filtrlangan — yuborish mumkin emas.
          </p>
        </div>
      </div>
    </div>
  );
}
