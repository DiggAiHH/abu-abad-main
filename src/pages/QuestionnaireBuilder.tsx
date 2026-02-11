import { ArrowLeft, Copy, Eye, GripVertical, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { InfoTip } from '../components/InfoTip';
import { QuestionnaireFormFields } from '../components/QuestionnaireFormFields';
import { logger } from '../utils/logger';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'number' | 'date' | 'email' | 'tel';
  label: string;
  required: boolean;
  options?: string[]; // Für radio, checkbox, select
  placeholder?: string;
}

interface QuestionnaireTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  timesUsed: number;
  createdAt: string;
}

export default function QuestionnaireBuilder() {
  const { t } = useTranslation(['questionnaires', 'common', 'errors']);
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const previewSchema = useMemo(() => ({ fields, type: 'object', properties: {}, required: [] }), [fields]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/questionnaires/templates');
      const rawTemplates = Array.isArray(response.data?.templates)
        ? response.data.templates
        : Array.isArray(response.data)
          ? response.data
          : [];
      const mapped: QuestionnaireTemplate[] = rawTemplates.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        fields: t.formSchema?.fields || [],
        timesUsed: t.usageCount ?? 0,
        createdAt: t.createdAt,
      }));
      setTemplates(mapped);
    } catch (error: any) {
      logger.error('QuestionnaireBuilder: Error loading templates', error);
      toast.error(t('common:errorLoadingData'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleAddField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: '',
      required: false,
      options: type === 'radio' || type === 'checkbox' || type === 'select' ? [''] : undefined,
    };

    setEditingField(newField);
    setShowFieldEditor(true);
  }, []);

  const handleSaveField = useCallback(() => {
    if (!editingField || !editingField.label.trim()) {
      toast.error(t('common:fillAllFields'));
      return;
    }

    if (editingField.options && editingField.options.some(opt => !opt.trim())) {
      toast.error(t('common:fillAllRequiredFields'));
      return;
    }

    const existingIndex = fields.findIndex(f => f.id === editingField.id);
    if (existingIndex >= 0) {
      const newFields = [...fields];
      newFields[existingIndex] = editingField;
      setFields(newFields);
    } else {
      setFields([...fields, editingField]);
    }

    setShowFieldEditor(false);
    setEditingField(null);
  }, [editingField, fields, t]);

  return (
    // rest of the JSX
  );
}
