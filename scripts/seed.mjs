const BASE = process.env.MOKKY_BASE_URL ?? 'https://1a40451337cdbc1f.mokky.dev';
const PASSWORD = 'demo123';

async function req(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

const log = (msg) => console.log(`[seed] ${msg}`);

const isoDaysAgo = (days, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const isoDaysAhead = (days, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const accounts = [
  {
    fullName: 'Administrator',
    email: 'admin@school.uz',
    profile: { firstName: 'Direktor', lastName: 'Direktor', role: 'admin' },
  },
  {
    fullName: 'Nodira Karimova',
    email: 'nodira.karimova@school.uz',
    profile: { firstName: 'Nodira', lastName: 'Karimova', role: 'librarian', phone: '+998 90 123 45 67' },
  },
  {
    fullName: 'Aziz Rahimov',
    email: 'aziz.rahimov@student.school.uz',
    profile: { firstName: 'Aziz', lastName: 'Rahimov', role: 'student', grade: 9 },
  },
  {
    fullName: 'Malika Yusupova',
    email: 'malika.yusupova@student.school.uz',
    profile: { firstName: 'Malika', lastName: 'Yusupova', role: 'student', grade: 7 },
  },
  {
    fullName: 'Jasur Toshmatov',
    email: 'jasur.toshmatov@student.school.uz',
    profile: { firstName: 'Jasur', lastName: 'Toshmatov', role: 'student', grade: 8 },
  },
  {
    fullName: 'Dilnoza Karimova',
    email: 'dilnoza.karimova@student.school.uz',
    profile: { firstName: 'Dilnoza', lastName: 'Karimova', role: 'student', grade: 10 },
  },
  {
    fullName: 'Sardor Aliqulov',
    email: 'sardor.aliqulov@student.school.uz',
    profile: { firstName: 'Sardor', lastName: 'Aliqulov', role: 'student', grade: 6 },
  },
];

const categories = [
  { name: 'Adabiyot', description: 'Badiiy adabiyot va mumtoz asarlar' },
  { name: 'Matematika', description: 'Matematika va geometriya fanlari' },
  { name: 'Fizika', description: 'Fizika bo\'yicha darslik va qo\'llanmalar' },
  { name: 'Informatika', description: 'Dasturlash va kompyuter fanlari' },
  { name: 'Ingliz tili', description: 'Ingliz tili o\'quv materiallari' },
];

const COVER_COLORS = {
  'otkan-kunlar': '#1e3a5f',
  'mehrobdan-chayon': '#2c1810',
  'kichkina-shahzoda': '#4a6fa5',
  'algebra-7': '#1e40af',
  'geometriya-8': '#3730a3',
  'fizika-9': '#7c3aed',
  'fizika-masalalar': '#6d28d9',
  'informatika-10': '#334155',
  'python-asoslari': '#1d4ed8',
  'english-grammar': '#b91c1c',
  'english-8': '#be123c',
  'bolalik': '#7e22ce',
};

const EBOOK_KEYS = ['kichkina-shahzoda', 'english-grammar', 'python-asoslari', 'bolalik'];

function coverUrl(title, author, color) {
  const text = `${encodeURIComponent(title)}%0A%0A${encodeURIComponent(author)}`;
  return `https://placehold.co/400x560/${color}/ffffff?text=${text}&font=roboto`;
}

const books = [
  {
    title: 'O\'tkan kunlar',
    author: 'Abdulla Qodiriy',
    subject: 'Adabiyot',
    books_id_key: 'otkan-kunlar',
    category: 'Adabiyot',
    grades: [8, 9, 10, 11],
    language: 'O\'zbek',
    publisher: 'Sharq',
    publishYear: 2019,
    isbn: '978-9943-24-455-8',
    pages: 512,
    totalCopies: 5,
    availableCopies: 4,
    shelfNumber: 'AB-01',
    description: 'O\'zbek mumtoz adabiyotining durdonasi.',
  },
  {
    title: 'Mehrobdan chayon',
    author: 'Abdulla Qodiriy',
    subject: 'Adabiyot',
    books_id_key: 'mehrobdan-chayon',
    category: 'Adabiyot',
    grades: [9, 10, 11],
    language: 'O\'zbek',
    publisher: 'Sharq',
    publishYear: 2018,
    isbn: '978-9943-24-456-5',
    pages: 480,
    totalCopies: 3,
    availableCopies: 3,
    shelfNumber: 'AB-02',
    description: 'Qodiriy ijodining yana bir mashhur asari.',
  },
  {
    title: 'Kichkina shahzoda',
    author: 'Antuan de Sent-Ekzyuperi',
    subject: 'Adabiyot',
    books_id_key: 'kichkina-shahzoda',
    category: 'Adabiyot',
    grades: [4, 5, 6, 7, 8],
    language: 'O\'zbek',
    publisher: 'Yangi asr avlodi',
    publishYear: 2020,
    isbn: '978-9943-20-123-5',
    pages: 128,
    totalCopies: 8,
    availableCopies: 6,
    shelfNumber: 'AB-03',
    description: 'Bolalar va kattalar uchun faylasufona ertak.',
  },
  {
    title: 'Algebra 7-sinf',
    author: 'Sh. Alimov',
    subject: 'Matematika',
    books_id_key: 'algebra-7',
    category: 'Matematika',
    grades: [7],
    language: 'O\'zbek',
    publisher: 'O\'qituvchi',
    publishYear: 2021,
    isbn: '978-9943-22-110-8',
    pages: 320,
    totalCopies: 20,
    availableCopies: 15,
    shelfNumber: 'M-01',
    description: 'Umumta\'lim maktablarining 7-sinfi uchun darslik.',
  },
  {
    title: 'Geometriya 8-sinf',
    author: 'L. S. Atanasyan',
    subject: 'Matematika',
    books_id_key: 'geometriya-8',
    category: 'Matematika',
    grades: [8],
    language: 'O\'zbek',
    publisher: 'O\'qituvchi',
    publishYear: 2021,
    isbn: '978-9943-22-111-5',
    pages: 288,
    totalCopies: 15,
    availableCopies: 10,
    shelfNumber: 'M-02',
    description: '8-sinf uchun geometriya darsligi.',
  },
  {
    title: 'Fizika 9-sinf',
    author: 'N. Sharifova',
    subject: 'Fizika',
    books_id_key: 'fizika-9',
    category: 'Fizika',
    grades: [9],
    language: 'O\'zbek',
    publisher: 'Tafakkur',
    publishYear: 2020,
    isbn: '978-9943-25-330-2',
    pages: 352,
    totalCopies: 12,
    availableCopies: 8,
    shelfNumber: 'F-01',
    description: '9-sinf uchun fizika darsligi.',
  },
  {
    title: 'Fizikadan masalalar to\'plami',
    author: 'A. Rahimov',
    subject: 'Fizika',
    books_id_key: 'fizika-masalalar',
    category: 'Fizika',
    grades: [8, 9, 10],
    language: 'O\'zbek',
    publisher: 'O\'qituvchi',
    publishYear: 2019,
    isbn: '978-9943-25-331-9',
    pages: 240,
    totalCopies: 6,
    availableCopies: 1,
    shelfNumber: 'F-02',
    description: 'Fizika fanidan masalalar va ularning yechimlari.',
  },
  {
    title: 'Informatika 10-sinf',
    author: 'M. Aliyev',
    subject: 'Informatika',
    books_id_key: 'informatika-10',
    category: 'Informatika',
    grades: [10],
    language: 'O\'zbek',
    publisher: 'Tafakkur',
    publishYear: 2022,
    isbn: '978-9943-26-440-1',
    pages: 300,
    totalCopies: 10,
    availableCopies: 7,
    shelfNumber: 'I-01',
    description: '10-sinf uchun informatika darsligi.',
  },
  {
    title: 'Python dasturlash asoslari',
    author: 'J. Xolmatov',
    subject: 'Informatika',
    books_id_key: 'python-asoslari',
    category: 'Informatika',
    grades: [9, 10, 11],
    language: 'O\'zbek',
    publisher: 'IT Akademiya',
    publishYear: 2023,
    isbn: '978-9943-26-441-8',
    pages: 420,
    totalCopies: 4,
    availableCopies: 4,
    shelfNumber: 'I-02',
    description: 'Python tilida dasturlashni noldan o\'rganuvchilar uchun.',
  },
  {
    title: 'Essential English Grammar',
    author: 'Raymond Murphy',
    subject: 'Ingliz tili',
    books_id_key: 'english-grammar',
    category: 'Ingliz tili',
    grades: [5, 6, 7, 8, 9, 10, 11],
    language: 'Ingliz',
    publisher: 'Cambridge University Press',
    publishYear: 2015,
    isbn: '978-0-521-67543-7',
    pages: 380,
    totalCopies: 7,
    availableCopies: 5,
    shelfNumber: 'EN-01',
    description: 'Ingliz tilini o\'rganuvchilar uchun mashhur grammatika darsligi.',
  },
  {
    title: 'Ingliz tili 8-sinf',
    author: 'D. Madvaliyev',
    subject: 'Ingliz tili',
    books_id_key: 'english-8',
    category: 'Ingliz tili',
    grades: [8],
    language: 'Ingliz',
    publisher: 'O\'qituvchi',
    publishYear: 2021,
    isbn: '978-9943-27-520-1',
    pages: 264,
    totalCopies: 18,
    availableCopies: 12,
    shelfNumber: 'EN-02',
    description: '8-sinf uchun ingliz tili darsligi.',
  },
  {
    title: 'Bolalik',
    author: 'Ulug\'bek Hamdam',
    subject: 'Adabiyot',
    books_id_key: 'bolalik',
    category: 'Adabiyot',
    grades: [9, 10, 11],
    language: 'O\'zbek',
    publisher: 'Sharq',
    publishYear: 2020,
    isbn: '978-9943-28-330-9',
    pages: 320,
    totalCopies: 5,
    availableCopies: 5,
    shelfNumber: 'AB-04',
    description: 'Zamonaviy o\'zbek romani.',
  },
];

const settings = {
  schoolName: 'Toshkent shahar 45-maktab',
  schoolAddress: 'Toshkent sh., Yunusobod tumani, 45-maktab',
  maxBorrowDays: 14,
  maxBooksPerStudent: 3,
  allowReservation: true,
  overdueFinePerDay: 1000,
  libraryOpenTime: '08:00',
  libraryCloseTime: '17:00',
  libraryPhone: '+998 71 200 45 45',
  libraryEmail: 'library@45-maktab.uz',
};

async function main() {
  log(`Base URL: ${BASE}`);
  log(`Parol (barcha hisoblar uchun): ${PASSWORD}\n`);

  let registrationDisabled = false;

  const profilesByEmail = {};
  const profileList = await req('/profiles');
  for (const p of profileList.data ?? []) {
    if (!profilesByEmail[p.email]) profilesByEmail[p.email] = p;
  }

  for (let i = 0; i < accounts.length; i++) {
    const a = accounts[i];
    const reg = await req('/register', {
      method: 'POST',
      body: { fullName: a.fullName, email: a.email, password: PASSWORD },
    });

    if (reg.data && reg.data.message === 'RESOURCE_REGISTRATION_DISABLED') {
      registrationDisabled = true;
    }

    let profile = profilesByEmail[a.email];
    if (!profile) {
      const qrCode = `STU-${String(i + 1).padStart(6, '0')}`;
      const payload = {
        ...a.profile,
        email: a.email,
        createdAt: new Date().toISOString(),
        qrCode,
      };
      const created = await req('/profiles', { method: 'POST', body: payload });
      if (created.ok) {
        profile = created.data;
        profilesByEmail[a.email] = profile;
      } else {
        log(`  ⚠ ${a.email} profil yaratilmadi (${created.data?.message ?? created.status})`);
      }
    }
    log(`${reg.ok ? '✓' : '•'} ${a.email}  (rol: ${a.profile.role})`);
  }

  if (registrationDisabled) {
    console.warn(
      `\n⚠ DIQQAT: mokky.dev dashboard > Proyekt sozlamalari > Authentication > "Регистрация" (Registration)`
    );
    console.warn(`  yoqilmagan. "/auth" ishlashi uchun ushbu kalitni yoqish shart!`);
    console.warn(`  Buni yoqmasdan turib login ishlamaydi.\n`);
    process.exitCode = 1;
  }

  log('\nKategoriyalar...');
  const existingCategories = (await req('/categories')).data ?? [];
  for (const c of categories) {
    if (existingCategories.some((x) => x.name === c.name)) continue;
    const r = await req('/categories', { method: 'POST', body: c });
    log(`  ${r.ok ? '✓' : '⚠'} ${c.name}`);
  }

log('\nKitoblar...');
  const bookById = {};
  const existingBooks = (await req('/books')).data ?? [];
  let bookIndex = existingBooks.length;
  for (const b of books) {
    const existing = existingBooks.find(
      (y) =>
        y.books_id_key === b.books_id_key ||
        (y.title === b.title && y.author === b.author)
    );
    if (existing) {
      const patchBody = {};

      if (!existing.coverImage) {
        patchBody.coverImage = coverUrl(
          b.title,
          b.author,
          COVER_COLORS[b.books_id_key] ?? '#475569'
        );
      }
      if (!existing.pdfUrl && EBOOK_KEYS.includes(b.books_id_key)) {
        patchBody.pdfUrl = '/pdfs/placeholder.pdf';
      }
      if (Object.keys(patchBody).length > 0) {
        const patch = await req(`/books/${existing.id}`, {
          method: 'PATCH',
          body: patchBody,
        });
        if (patch.ok) {
          log(`  ✓ ${b.title} — muqova/e-kitob qo'shildi`);
          existing.coverImage = patch.data.coverImage;
          existing.pdfUrl = patch.data.pdfUrl;
        }
      }
      bookById[b.books_id_key] = existing;
      continue;
    }
    const invNumber = `LIB-${String(++bookIndex).padStart(6, '0')}`;
    const payload = {
      inventoryNumber: invNumber,
      qrCode: invNumber,
      title: b.title,
      author: b.author,
      subject: b.subject,
      category: b.category,
      grade: b.grades,
      grades: b.grades,
      language: b.language,
      publisher: b.publisher,
      publishYear: b.publishYear,
      isbn: b.isbn,
      pages: b.pages,
      coverImage: coverUrl(b.title, b.author, COVER_COLORS[b.books_id_key] ?? '#475569'),
      pdfUrl: EBOOK_KEYS.includes(b.books_id_key) ? '/pdfs/placeholder.pdf' : '',
      books_id_key: b.books_id_key,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      shelfNumber: b.shelfNumber,
      status: b.availableCopies > 0 ? 'available' : 'borrowed',
      description: b.description,
    };
    const r = await req('/books', { method: 'POST', body: payload });
    if (r.ok) bookById[b.books_id_key] = r.data;
    else log(`  ⚠ ${b.title} (${r.data?.message ?? r.status})`);
  }
  const createdCount = Object.keys(bookById).length;
  log(`  ${createdCount} ta kitob ro'yxatda`);

  log('\nSozlamalar...');
  const settingsList = (await req('/settings')).data ?? [];
  if (settingsList.length === 0) {
    const r = await req('/settings', { method: 'POST', body: settings });
    log(`  ${r.ok ? '✓' : '⚠'} maktab sozlamalari yaratildi`);
  } else {
    log('  mavjud');
  }

  log('\nBerilgan kitoblar tarixi...');
  const borrowList = (await req('/borrows')).data ?? [];
  const aziz = profilesByEmail['aziz.rahimov@student.school.uz'];
  const malika = profilesByEmail['malika.yusupova@student.school.uz'];
  const jasur = profilesByEmail['jasur.toshmatov@student.school.uz'];
  const dilnoza = profilesByEmail['dilnoza.karimova@student.school.uz'];
  const nodira = profilesByEmail['nodira.karimova@school.uz'];

  const borrowTemplates = [];
  if (aziz && bookById['otkan-kunlar']) {
    borrowTemplates.push({
      student: aziz,
      book: bookById['otkan-kunlar'],
      daysAgo: 3,
      daysAhead: 11,
      status: 'active',
      issuedBy: 'Nodira Karimova',
    });
  }
  if (aziz && bookById['kichkina-shahzoda']) {
    borrowTemplates.push({
      student: aziz,
      book: bookById['kichkina-shahzoda'],
      daysAgo: 12,
      daysAhead: 2,
      status: 'active',
      issuedBy: 'Nodira Karimova',
    });
  }
  if (malika && bookById['algebra-7']) {
    borrowTemplates.push({
      student: malika,
      book: bookById['algebra-7'],
      daysAgo: 10,
      daysAhead: 4,
      status: 'active',
      issuedBy: 'Nodira Karimova',
    });
  }
  if (jasur && bookById['informatika-10']) {
    borrowTemplates.push({
      student: jasur,
      book: bookById['informatika-10'],
      daysAgo: 20,
      daysAhead: -6,
      status: 'overdue',
      issuedBy: 'Administrator',
    });
  }
  if (dilnoza && bookById['english-grammar']) {
    borrowTemplates.push({
      student: dilnoza,
      book: bookById['english-grammar'],
      daysAgo: 30,
      daysAhead: -20,
      status: 'returned',
      issuedBy: 'Nodira Karimova',
    });
  }
  if (aziz && bookById['fizika-masalalar']) {
    borrowTemplates.push({
      student: aziz,
      book: bookById['fizika-masalalar'],
      daysAgo: 40,
      daysAhead: -26,
      status: 'returned',
      issuedBy: 'Nodira Karimova',
    });
  }
  if (malika && bookById['bolalik']) {
    borrowTemplates.push({
      student: malika,
      book: bookById['bolalik'],
      daysAgo: 15,
      daysAhead: -1,
      status: 'overdue',
      issuedBy: 'Nodira Karimova',
    });
  }

  let borrowCount = 0;
  for (const t of borrowTemplates) {
    const already = borrowList.some(
      (b) =>
        b.studentId === t.student.id &&
        b.bookId === t.book.id &&
        b.status === t.status
    );
    if (already) {
      borrowCount++;
      continue;
    }
    const issuedDate = isoDaysAgo(t.daysAgo);
    const dueDate = isoDaysAhead(t.daysAhead);
    const payload = {
      bookId: t.book.id,
      bookTitle: t.book.title,
      studentId: t.student.id,
      studentName: `${t.student.firstName} ${t.student.lastName}`,
      issuedBy: t.issuedBy,
      issuedDate,
      dueDate,
      status: t.status,
      ...(t.status === 'returned' ? { returnDate: isoDaysAgo(t.daysAgo + 5), notes: 'O\'z vaqtida qaytarildi' } : {}),
    };
    const r = await req('/borrows', { method: 'POST', body: payload });
    if (r.ok) borrowCount++;
  }
  log(`  ${borrowCount} ta qarz yozuvi`);

  log('\nBronlar...');
  const reservationList = (await req('/reservations')).data ?? [];
  const reservationTemplates = [];
  if (aziz && bookById['english-8']) {
    reservationTemplates.push({
      student: aziz,
      book: bookById['english-8'],
      status: 'pending',
    });
  }
  if (malika && bookById['python-asoslari']) {
    reservationTemplates.push({
      student: malika,
      book: bookById['python-asoslari'],
      status: 'approved',
    });
  }
  for (const t of reservationTemplates) {
    const already = reservationList.some(
      (r) => r.studentId === t.student.id && r.bookId === t.book.id
    );
    if (already) continue;
    const payload = {
      bookId: t.book.id,
      bookTitle: t.book.title,
      studentId: t.student.id,
      studentName: `${t.student.firstName} ${t.student.lastName}`,
      reservedDate: isoDaysAgo(1),
      status: t.status,
    };
    const r = await req('/reservations', { method: 'POST', body: payload });
    log(`  ${r.ok ? '✓' : '⚠'} ${t.book.title} — ${t.student.firstName} ${t.student.lastName}`);
  }

  log('\nBildirishnomalar...');
  const notificationList = (await req('/notifications')).data ?? [];
  const notifications = [];
  if (aziz) {
    notifications.push({
      userId: aziz.id,
      title: 'Kitob berildi',
      message: '"O\'tkan kunlar" kitobi qo\'lingizga topshirildi.',
      type: 'info',
      read: false,
      createdAt: isoDaysAgo(3),
      link: '/my-books',
    });
    notifications.push({
      userId: aziz.id,
      title: 'Bron yaratildi',
      message: '"Ingliz tili 8-sinf" kitobiga bron qilindingiz.',
      type: 'info',
      read: false,
      createdAt: isoDaysAgo(1),
      link: '/reservations',
    });
  }
  if (nodira) {
    notifications.push({
      userId: nodira.id,
      title: 'Muddat o\'tgan qarzlar',
      message: 'Bir nechta o\'quvchida muddati o\'tgan kitoblar mavjud. Tekshirib chiqing.',
      type: 'warning',
      read: false,
      createdAt: isoDaysAgo(0, 8),
      link: '/overdue',
    });
  }
  for (const n of notifications) {
    const exists = notificationList.some(
      (x) =>
        x.userId === n.userId && x.title === n.title && x.message === n.message
    );
    if (exists) continue;
    const r = await req('/notifications', { method: 'POST', body: n });
    log(`  ${r.ok ? '✓' : '⚠'} "${n.title}" → ${n.userId}`);
  }

  log('\nChat xabarlari...');
  const chatList = (await req('/chat')).data ?? [];
  const chatTemplates = [];
  if (aziz && bookById['bolalik']) {
    chatTemplates.push({
      userId: aziz.id,
      userName: `${aziz.firstName} ${aziz.lastName}`,
      userRole: aziz.role,
      avatar: aziz.avatar,
      grade: aziz.grade,
      text: '"Bolalik" juda zo\'r kitob! Hammaga maslahat beraman.',
      createdAt: isoDaysAgo(2, 14),
      bookId: bookById['bolalik'].id,
      bookTitle: 'Bolalik',
      bookAuthor: 'Cholpon',
      bookCover: '',
    });
  }
  if (nodira) {
    chatTemplates.push({
      userId: nodira.id,
      userName: `${nodira.firstName} ${nodira.lastName}`,
      userRole: nodira.role,
      avatar: nodira.avatar,
      text: 'Assalomu alaykum! Kutubxonaga yangi kitoblar kelib qoldi, bemalol olishingiz mumkin.',
      createdAt: isoDaysAgo(1, 10),
    });
  }
  for (const c of chatTemplates) {
    if (chatList.some((x) => x.userId === c.userId && x.text === c.text)) continue;
    const r = await req('/chat', { method: 'POST', body: c });
    log(`  ${r.ok ? '✓' : '⚠'} ${c.userName}`);
  }
  if (chatList.length === 0 && chatTemplates.length > 0) {
    const r = await req('/chat', { method: 'GET' });
    if (!r.ok) log('  ⚠ /chat resursi mavjud emas — mokky dashboardda yarating');
  }

  log('\nReytinglar...');
  const ratingList = (await req('/ratings')).data ?? [];
  const ratingTemplates = [];
  if (aziz && bookById['bolalik']) {
    ratingTemplates.push({
      bookId: bookById['bolalik'].id,
      bookTitle: 'Bolalik',
      userId: aziz.id,
      userName: `${aziz.firstName} ${aziz.lastName}`,
      score: 5,
      createdAt: isoDaysAgo(2, 14),
    });
  }
  if (malika && bookById['python-asoslari']) {
    ratingTemplates.push({
      bookId: bookById['python-asoslari'].id,
      bookTitle: 'Python asoslari',
      userId: malika.id,
      userName: `${malika.firstName} ${malika.lastName}`,
      score: 4,
      createdAt: isoDaysAgo(1, 12),
    });
  }
  if (malika && bookById['bolalik']) {
    ratingTemplates.push({
      bookId: bookById['bolalik'].id,
      bookTitle: 'Bolalik',
      userId: malika.id,
      userName: `${malika.firstName} ${malika.lastName}`,
      score: 4,
      createdAt: isoDaysAgo(1, 13),
    });
  }
  for (const r of ratingTemplates) {
    if (ratingList.some((x) => x.bookId === r.bookId && x.userId === r.userId)) continue;
    const res = await req('/ratings', { method: 'POST', body: r });
    log(`  ${res.ok ? '✓' : '⚠'} ${r.bookTitle} ← ${r.userName} (${r.score})`);
  }

  log('\n══════════════════════════════════════════════');
  log('Seed tugadi ✅');
  log('Login qilish uchun hisoblar:');
  log('  admin@school.uz               (Administrator)');
  log('  nodira.karimova@school.uz     (Kutubxonachi)');
  log('  aziz.rahimov@student.school.uz (O\'quvchi)');
  log(`  Parol: ${PASSWORD}`);
  log('══════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('[seed] XATOLIK:', err);
  process.exit(1);
});