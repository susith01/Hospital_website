import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar, type AppRoute } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { fetchAnnouncements, fetchDepartments, fetchDoctors } from './lib/api';
import { AboutPage } from './pages/AboutPage';
import { AuthPortalPage } from './pages/AuthPortalPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { ContactPage } from './pages/ContactPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import type { Announcement, Department, Doctor } from './types/hospital';

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function HospitalShell() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [doctorSearchInitial, setDoctorSearchInitial] = useState('');
  const [doctorDeptInitial, setDoctorDeptInitial] = useState('all');
  const [bookingPreselectDept, setBookingPreselectDept] = useState<number | null>(null);
  const [bookingPreselectDoc, setBookingPreselectDoc] = useState<number | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchDepartments(), fetchDoctors(), fetchAnnouncements()])
      .then(([deptData, docData, annData]) => {
        if (!cancelled) {
          setDepartments(deptData);
          setDoctors(docData);
          setAnnouncements(annData);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err.message ||
              'Unable to load hospital directory. Please refresh the page.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = useCallback((path: AppRoute) => {
    const normalized = normalizePath(path);
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchDoctors = useCallback(
    (query: string, departmentSlug = 'all') => {
      setDoctorSearchInitial(query);
      setDoctorDeptInitial(departmentSlug);
      navigate('/doctors');
    },
    [navigate]
  );

  const handleBookDoctor = useCallback(
    (doctor: Doctor) => {
      setBookingPreselectDept(doctor.departmentId);
      setBookingPreselectDoc(doctor.id);
      navigate('/appointments');
    },
    [navigate]
  );

  const handleBookDepartment = useCallback(
    (departmentId: number) => {
      setBookingPreselectDept(departmentId);
      setBookingPreselectDoc(null);
      navigate('/appointments');
    },
    [navigate]
  );

  const renderPage = () => {
    if (currentPath.startsWith('/doctors/')) {
      const slug = currentPath.replace('/doctors/', '');
      return (
        <DoctorDetailPage
          slug={slug}
          departments={departments}
          doctors={doctors}
          onBack={() => navigate('/doctors')}
          onViewPortal={() => navigate('/portal')}
        />
      );
    }

    switch (currentPath) {
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/departments':
        return (
          <DepartmentsPage
            departments={departments}
            loading={loading}
            error={loadError}
            onViewDoctors={(slug) => handleSearchDoctors('', slug)}
            onBookDepartment={handleBookDepartment}
          />
        );
      case '/doctors':
        return (
          <DoctorsPage
            key={`${doctorSearchInitial}::${doctorDeptInitial}`}
            departments={departments}
            doctors={doctors}
            loading={loading}
            error={loadError}
            initialSearch={doctorSearchInitial}
            initialDepartment={doctorDeptInitial}
            onViewProfile={(slug) => navigate(`/doctors/${slug}`)}
            onBookDoctor={handleBookDoctor}
          />
        );
      case '/services':
        return <ServicesPage onNavigate={navigate} />;
      case '/emergency':
        return <EmergencyPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/appointments':
        return (
          <BookAppointmentPage
            departments={departments}
            doctors={doctors}
            preselectedDepartmentId={bookingPreselectDept}
            preselectedDoctorId={bookingPreselectDoc}
            onViewPortal={() => navigate('/portal')}
          />
        );
      case '/portal':
        return <AuthPortalPage onNavigate={navigate} />;
      case '/':
      default:
        return (
          <HomePage
            departments={departments}
            doctors={doctors}
            announcements={announcements}
            loading={loading}
            error={loadError}
            onNavigate={navigate}
            onSearchDoctors={handleSearchDoctors}
            onBookDoctor={handleBookDoctor}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <HospitalShell />
      </AuthProvider>
    </MotionConfig>
  );
}
