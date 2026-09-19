import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type RouteConfig = {
  name: string;
  path: string;
  role: "all" | "admin";
  element: LazyExoticComponent<ComponentType>;
};

const Categories = lazy(() => import("../pages/Categories"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AddBook = lazy(() => import("../pages/AddBook"));
const BookDetail = lazy(() => import("../pages/BookDetail"));
const Books = lazy(() => import("../pages/Books"));
const History = lazy(() => import("../pages/History"));
const IssueBook = lazy(() => import("../pages/IssueBook"));
const Librarians = lazy(() => import("../pages/Librarians"));
const MyBooks = lazy(() => import("../pages/MyBooks"));
const Notifications = lazy(() => import("../pages/Notifications"));
const OnlineLibrary = lazy(() => import("../pages/OnlineLibrary"));
const OnlineReader = lazy(() =>
  import("../pages/OnlineLibrary").then((m) => ({
    default: m.OnlineReader,
  }))
);
const Register = lazy(() => {
  return import("../pages/Register");
});
const Overdue = lazy(() => import("../pages/Overdue"));
const Profile = lazy(() => import("../pages/Profile"));
const Reports = lazy(() => import("../pages/Reports"));
const Reservations = lazy(() => import("../pages/Reservations"));
const ReturnBook = lazy(() => import("../pages/ReturnBook"));
const Settings = lazy(() => import("../pages/Settings"));
const StudentProfile = lazy(() => import("../pages/StudentProfile"));
const Students = lazy(() => import("../pages/Students"));
const Users = lazy(() => import("../pages/Users"));

export const routes: RouteConfig[] = [
  {
    name: "Dashboard",
    path: "/",
    role: "all",
    element: Dashboard,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    role: "all",
    element: Dashboard,
  },
  {
    name: "AddBook",
    path: "/books/new",
    role: "admin",
    element: AddBook,
  },
  {
    name: "AddBook",
    path: "/books/:id/edit",
    role: "admin",
    element: AddBook,
  },
  {
    name: "BookDetail",
    path: "/books/:id",
    role: "all",
    element: BookDetail,
  },
  {
    name: "Books",
    path: "/books",
    role: "all",
    element: Books,
  },
  {
    name: "History",
    path: "/history",
    role: "all",
    element: History,
  },
  {
    name: "IssueBook",
    path: "/issue-book",
    role: "all",
    element: IssueBook,
  },
  {
    name: "Librarians",
    path: "/librarians",
    role: "admin",
    element: Librarians,
  },
  {
    name: "Categories",
    path: "/categories",
    role: "admin",
    element: Categories,
  },
  {
    name: "MyBooks",
    path: "/my-books",
    role: "all",
    element: MyBooks,
  },
  {
    name: "Notifications",
    path: "/notifications",
    role: "all",
    element: Notifications,
  },
  {
    name: "OnlineLibrary",
    path: "/online-library",
    role: "all",
    element: OnlineLibrary,
  },
  {
    name: "OnlineReader",
    path: "/online-reader/:bookId",
    role: "all",
    element: OnlineReader,
  },
  {
    name: "Overdue",
    path: "/overdue",
    role: "all",
    element: Overdue,
  },
  {
    name: "Profile",
    path: "/profile",
    role: "all",
    element: Profile,
  },
  {
    name: "Reports",
    path: "/reports",
    role: "admin",
    element: Reports,
  },
  {
    name: "Reservations",
    path: "/reservations",
    role: "all",
    element: Reservations,
  },
  {
    name: "ReturnBook",
    path: "/return-book",
    role: "all",
    element: ReturnBook,
  },
  {
    name: "Settings",
    path: "/settings",
    role: "admin",
    element: Settings,
  },
  {
    name: "StudentProfile",
    path: "/students/:id",
    role: "all",
    element: StudentProfile,
  },
  {
    name: "Students",
    path: "/students",
    role: "all",
    element: Students,
  },
  {
    name: "Users",
    path: "/users",
    role: "admin",
    element: Users,
  },
];