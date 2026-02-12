import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { logger } from '../utils/logger';

interface User {
  firstName: string;
  lastName: string;
  id: string;
}

interface PatientDashboardProps {
  user: User;
}

export default function PatientDashboard({
  user,
}: PatientDashboardProps): JSX.Element {
  const { t } = useTranslation(['dashboard', 'nav', 'common', 'appointments', 'auth']);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      logger.warn('PatientDashboard: no user found, redirecting to login');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          api.get('/appointments'),
          api.get('/appointments/available'),
          api.get('/messages'),
        ]);
      } catch (error) {
        logger.error('Error loading dashboard data', error);
        toast.error(t('common:errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div>/* Dashboard JSX content remains unchanged here */</div>
  );
}