import { useState } from 'react';
import { toast } from 'sonner';

// Components
import { Navigation } from './components/shared';
import { Toaster } from './components/ui/sonner';

// Pages - Candidate
import { JobsListPage, ApplyPage, TrackStatusPage, ProfilePage } from './pages/candidate';
import ApplicationHistoryPage from './pages/candidate/ApplicationHistoryPage';

// Pages - HR
import { HRDashboardPage, HRApplicantsPage, ApplicantDetailsPage, JobManagementPage, HRReportsPage } from './pages/hr';

// Pages - Hiring Manager
import { HMReviewPage, HMEvaluationPage, HMDashboardPage, HMNotificationsPage, HMReportsPage } from './pages/hm';

// Pages - Shared
import { LandingPage, LoginPage, AboutSystemPage, NotificationsPage, EmailTestPage } from './pages/shared';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);

    // Navigate based on role
    if (user.role === 'candidate') {
      setCurrentPage('jobs');
    } else if (user.role === 'hr') {
      setCurrentPage('hr-dashboard');
    } else {
      setCurrentPage('hm-dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedJobId(null);
    setSelectedApplicationId(null);
    toast.success('ออกจากระบบเรียบร้อย');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedJobId(null);
    setSelectedApplicationId(null);
  };

  const handleApply = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentPage('apply');
  };

  const handleApplySuccess = () => {
    setCurrentPage('track');
    setSelectedJobId(null);
  };

  const handleApplyCancel = () => {
    setCurrentPage('jobs');
    setSelectedJobId(null);
  };

  const handleViewDetails = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setCurrentPage('applicant-details');
  };

  const handleBackFromDetails = () => {
    setSelectedApplicationId(null);
    setCurrentPage('hr-applicants');
  };

  const handleReview = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setCurrentPage('hm-evaluation');
  };

  const handleBackFromEvaluation = () => {
    setSelectedApplicationId(null);
    setCurrentPage('hm-review');
  };

  const renderPage = () => {
    // Public pages
    if (currentPage === 'landing') {
      return (
        <LandingPage
          onLogin={() => setCurrentPage('login')}
          onRegister={() => setCurrentPage('login')}
          onLearnMore={() => setCurrentPage('about')}
        />
      );
    }
    if (currentPage === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setCurrentPage('landing')}
        />
      );
    }
    if (currentPage === 'about') {
      return (
        <AboutSystemPage
          onBack={() => setCurrentPage('landing')}
          onGetStarted={() => setCurrentPage('login')}
        />
      );
    }
    if (currentPage === 'email-test') {
      return <EmailTestPage />;
    }

    // Protected pages - require authentication
    if (!isAuthenticated || !currentUser) {
      setCurrentPage('landing');
      return null;
    }

    // Profile page (available for all roles)
    if (currentPage === 'profile') {
      return (
        <ProfilePage
          user={currentUser}
          onBack={() => {
            // Navigate back based on role
            if (currentUser.role === 'candidate') {
              setCurrentPage('jobs');
            } else if (currentUser.role === 'hr') {
              setCurrentPage('hr-dashboard');
            } else {
              setCurrentPage('hm-dashboard');
            }
          }}
          onUpdateProfile={handleUpdateProfile}
        />
      );
    }

    // Candidate pages
    if (currentPage === 'jobs') {
      return <JobsListPage onApply={handleApply} />;
    }
    if (currentPage === 'apply' && selectedJobId) {
      return (
        <ApplyPage
          jobId={selectedJobId}
          onCancel={handleApplyCancel}
          onSuccess={handleApplySuccess}
        />
      );
    }
    if (currentPage === 'track') {
      return <TrackStatusPage user={currentUser} onNavigateToNotifications={() => setCurrentPage('notifications')} />;
    }
    if (currentPage === 'notifications') {
      return <NotificationsPage onBack={() => setCurrentPage('track')} />;
    }
    if (currentPage === 'application-history') {
      return <ApplicationHistoryPage user={currentUser} onNavigateToJobs={() => setCurrentPage('jobs')} />;
    }

    // HR pages
    if (currentPage === 'hr-dashboard') {
      return <HRDashboardPage />;
    }
    if (currentPage === 'hr-applicants') {
      return <HRApplicantsPage onViewDetails={handleViewDetails} />;
    }
    if (currentPage === 'applicant-details' && selectedApplicationId) {
      return (
        <ApplicantDetailsPage
          applicationId={selectedApplicationId}
          onBack={handleBackFromDetails}
        />
      );
    }
    if (currentPage === 'hr-jobs') {
      return <JobManagementPage />;
    }
    if (currentPage === 'hr-reports') {
      return <HRReportsPage />;
    }

    // Hiring Manager pages
    if (currentPage === 'hm-dashboard') {
      return <HMDashboardPage onNavigate={handleNavigate} onReview={handleReview} />;
    }
    if (currentPage === 'hm-review') {
      return <HMReviewPage onReview={handleReview} />;
    }
    if (currentPage === 'hm-evaluation' && selectedApplicationId) {
      return (
        <HMEvaluationPage
          applicationId={selectedApplicationId}
          onBack={handleBackFromEvaluation}
        />
      );
    }
    if (currentPage === 'hm-notifications') {
      return <HMNotificationsPage onNavigate={handleNavigate} onReview={handleReview} />;
    }
    if (currentPage === 'hm-reports') {
      return <HMReportsPage />;
    }

    // Fallback - redirect to appropriate page based on role
    if (currentUser.role === 'candidate') {
      return <JobsListPage onApply={handleApply} />;
    } else if (currentUser.role === 'hr') {
      return <HRDashboardPage />;
    } else {
      return <HMDashboardPage onNavigate={handleNavigate} onReview={handleReview} />;
    }
  };

  // Don't show navigation on public pages
  const publicPages = ['landing', 'login', 'about'];
  const showNavigation = isAuthenticated && currentUser && !publicPages.includes(currentPage) && currentPage !== 'apply';
  
  // Don't add container padding on certain pages
  const noContainerPages = ['apply', 'jobs', 'track', 'notifications', 'landing', 'login', 'about'];
  const shouldAddContainer = !noContainerPages.includes(currentPage);

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && currentUser && (
        <Navigation
          user={currentUser}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      
      <main className={shouldAddContainer ? 'container mx-auto px-4 py-8' : ''}>
        {renderPage()}
      </main>

      <Toaster />
    </div>
  );
}
