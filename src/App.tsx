import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/AddBook';
import OnlineLibrary, { OnlineReader } from './pages/OnlineLibrary';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import MyBooks from './pages/MyBooks';
import Profile from './pages/Profile';
import IssueBook from './pages/IssueBook';
import ReturnBook from './pages/ReturnBook';
import Reservations from './pages/Reservations';
import History from './pages/History';
import Overdue from './pages/Overdue';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Librarians from './pages/Librarians';
import Categories from './pages/Categories';
import Chat from './pages/Chat';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/new" element={<AddBook />} />
                <Route path="/books/:id/edit" element={<AddBook />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/online-library" element={<OnlineLibrary />} />
                <Route path="/online-reader/:bookId" element={<OnlineReader />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentProfile />} />
                <Route path="/my-books" element={<MyBooks />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/issue-book" element={<IssueBook />} />
                <Route path="/return-book" element={<ReturnBook />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/history" element={<History />} />
                <Route path="/overdue" element={<Overdue />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<Users />} />
                <Route path="/librarians" element={<Librarians />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}