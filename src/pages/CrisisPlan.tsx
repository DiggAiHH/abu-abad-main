import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  Phone,
  Plus,
  Save,
  Shield,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { t } = useTranslation(['crisis', 'common']);

  const [plan, setPlan] = useState<CrisisPlan>(EMPTY_PLAN);
  const [defaults, setDefaults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['hotlines', 'contacts'])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [planRes, defaultsRes] = await Promise.all([
        api.get('/crisis-plan'),
        api.get('/crisis-plan/defaults'),
      ]);

      const dRes = defaultsRes.data ?? {};
      setDefaults(dRes);

      const planData = planRes.data ?? {};
      if (planData.exists && planData.plan) {
        setPlan({ ...EMPTY_PLAN, ...planData.plan });
      } else if (
        planData.warningSignals ||
        planData.copingStrategies ||
        planData.emergencyContacts
      ) {
        // Demo-Modus: Daten kommen direkt ohne Wrapper
        setPlan({ ...EMPTY_PLAN, ...planData });
      } else {
        // Pre-fill with default hotlines
        setPlan({
          ...EMPTY_PLAN,
          crisisHotlines: dRes.crisisHotlines || [],
        });
      }
    } catch (error) {
      logger.error('CrisisPlan: Fehler beim Laden', error);
      toast.error(t('crisis:errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      await api.post('/crisis-plan', plan);
      toast.success(t('crisis:saved'));
    } catch (error) {
      toast.error(t('crisis:errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addToArray = (field: keyof CrisisPlan, value: any) => {
    setPlan(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), value],
    }));
  };

  const removeFromArray = (field: keyof CrisisPlan, index: number) => {
    setPlan(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: keyof CrisisPlan, index: number, key: string, value: any) => {
    setPlan(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='spinner' />
      </div>
    );
  }

  // Component content stays unchanged
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Component JSX code here */}
    </div>
  );
}
