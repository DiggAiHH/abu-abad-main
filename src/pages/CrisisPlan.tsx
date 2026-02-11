import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { logger } from '../utils/logger';

// ===== TYPES =====
interface CrisisPlanProps {}

interface CopingStrategy {
  strategy: string;
  category: string;
  effectiveness?: number;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  availableWhen?: string;
}

interface ProfessionalContact {
  name: string;
  role: string;
  phone: string;
  organization?: string;
}

interface CrisisHotline {
  name: string;
  phone: string;
  available?: string;
}

interface CrisisPlan {
  warningSignsThoughts: string[];
  warningSignsBehaviors: string[];
  warningSignsPhysical: string[];
  warningSignsEmotional: string[];
  copingStrategies: CopingStrategy[];
  safeEnvironmentSteps: string[];
  itemsToRemove: string[];
  safePlace: string;
  emergencyContacts: EmergencyContact[];
  professionalContacts: ProfessionalContact[];
  reasonsToLive: string[];
  crisisHotlines: CrisisHotline[];
  additionalNotes: string;
}

const EMPTY_PLAN: CrisisPlan = {
  warningSignsThoughts: [],
  warningSignsBehaviors: [],
  warningSignsPhysical: [],
  warningSignsEmotional: [],
  copingStrategies: [],
  safeEnvironmentSteps: [],
  itemsToRemove: [],
  safePlace: '',
  emergencyContacts: [],
  professionalContacts: [],
  reasonsToLive: [],
  crisisHotlines: [],
  additionalNotes: '',
};

// ===== MAIN COMPONENT =====
export default function CrisisPlan({}: CrisisPlanProps) {
  const { t } = useTranslation(['crisis', 'common']);

  const [plan, setPlan] = useState<CrisisPlan>(EMPTY_PLAN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planRes] = await Promise.all([
        api.get('/crisis-plan'),
      ]);

      const planData = planRes.data ?? {};

      if (planData.exists && planData.plan) {
        setPlan({ ...EMPTY_PLAN, ...planData.plan });
      } else setPlan(EMPTY_PLAN)
    }catch{
        postAPI
}

return"ALS ...
      ---UID .q Layout. truncated IOException vacature
    