/**
 * Questionnaire Builder Component (Therapeut)
 * Ermöglicht Therapeuten, dynamische Fragebögen zu erstellen
 * Feldtypen: Text, Textarea, Radio, Checkbox, Select, Number, Date, Email, Tel
 */

import { ArrowLeft, Copy, Eye, GripVertical, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

  // Builder State
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);

  // Field Editor Modal
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  // PDF Import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const previewSchema = useMemo(() => ({ fields }), [fields]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
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
  };

  const handleAddField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: '',
      required: false,
      options: type === 'radio' || type === 'checkbox' || type === 'select' ? [''] : undefined,
    };

    setEditingField(newField);
    setShowFieldEditor(true);
  };

  const handleSaveField = () => {
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
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleSaveTemplate = async () => {
    if (!title.trim()) {
      toast.error(t('common:fillAllFields'));
      return;
    }

    if (fields.length === 0) {
      toast.error(t('questionnaires:addFieldsPrompt'));
      return;
    }

    try {
      const formSchema = { fields };

      if (editingTemplate) {
        await apiClient.put(`/questionnaires/templates/${editingTemplate.id}`, {
          title,
          description,
          formSchema,
        });
        toast.success(t('questionnaires:templateSaved'));
      } else {
        await apiClient.post('/questionnaires/templates', {
          title,
          description,
          formSchema,
        });
        toast.success(t('questionnaires:templateSaved'));
      }

      setShowBuilder(false);
      resetBuilder();
      await loadTemplates();
    } catch (error: any) {
      logger.error('QuestionnaireBuilder: Error saving template', error);
      toast.error(t('common:errorSaving'));
    }
  };

  const handleEditTemplate = (template: QuestionnaireTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setFields(template.fields);
    setShowBuilder(true);
  };

  const handleDuplicateTemplate = async (template: QuestionnaireTemplate) => {
    setTitle(`${template.title} (${t('common:copy')})`);
    setDescription(template.description);
    setFields(template.fields.map(f => ({ ...f, id: `field-${Date.now()}-${f.id}` })));
    setShowBuilder(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm(t('common:confirmDelete'))) {
      return;
    }

    try {
      await apiClient.delete(`/questionnaires/templates/${templateId}`);
      toast.success(t('questionnaires:templateDeleted'));
      await loadTemplates();
    } catch (error: any) {
      logger.error('QuestionnaireBuilder: Error deleting template', error);
      toast.error(t('common:errorDeleting'));
    }
  };

  const resetBuilder = () => {
    setEditingTemplate(null);
    setTitle('');
    setDescription('');
    setFields([]);
    setShowPreview(false);
    setPreviewResponses({});
  };

  const handleImportPdfClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportPdfSelected = async (file: File | null) => {
    if (!file) return;
    if (importing) return;
    setImporting(true);
    setImportStatus(t('questionnaires:importing'));

    const toastId = toast.loading(t('questionnaires:importing'));

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await apiClient.post('/questionnaires/templates/import-pdf', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      });

      const suggested = res.data?.suggested;
      const suggestedFields = suggested?.formSchema?.fields;

      if (!Array.isArray(suggestedFields) || suggestedFields.length === 0) {
        toast.error(t('questionnaires:importFailed'), { id: toastId });
        resetBuilder();
        setShowBuilder(true);

        if (typeof res.data?.warning === 'string' && res.data.warning.trim()) {
          toast(res.data.warning);
        }
        setImportStatus(t('questionnaires:importFailed'));
        return;
      }

      resetBuilder();
      setTitle(suggested?.title || file.name.replace(/\.[^.]+$/, ''));
      setDescription(suggested?.description || t('questionnaires:importSuccess'));
      setFields(suggestedFields);
      setShowBuilder(true);

      const usedOcr = Boolean(res.data?.meta?.usedOcr);

      if (typeof res.data?.warning === 'string' && res.data.warning.trim()) {
        if (usedOcr) {
          toast.success(t('questionnaires:importSuccess'), { id: toastId });
          setImportStatus(t('questionnaires:importSuccess'));
        } else {
          toast.success(t('questionnaires:importSuccess'), { id: toastId });
          setImportStatus(t('questionnaires:importSuccess'));
        }
        toast(res.data.warning);
      } else {
        toast.success(t('questionnaires:importSuccess'), {
          id: toastId,
        });
        setImportStatus(t('questionnaires:importSuccess'));
      }
    } catch (error: any) {
      logger.error('QuestionnaireBuilder: PDF import failed', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        t('questionnaires:importFailed');
      toast.error(String(msg), { id: toastId });
      setImportStatus(String(msg));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      window.setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const getFieldTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      text: t('questionnaires:fieldTypeText'),
      textarea: t('questionnaires:fieldTypeTextarea'),
      radio: t('questionnaires:fieldTypeRadio'),
      checkbox: t('questionnaires:fieldTypeCheckbox'),
      select: t('questionnaires:fieldTypeSelect'),
      number: t('questionnaires:fieldTypeNumber'),
      date: t('questionnaires:fieldTypeDate'),
      email: t('common:email'),
      tel: t('common:phone'),
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/dashboard')}
              className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50'
              title={t('errors:backToDashboard')}
            >
              <ArrowLeft className='w-4 h-4 rtl:flip' />
              Dashboard
            </button>

            <h1 className='text-2xl font-bold text-gray-900'>{t('questionnaires:builder')}</h1>
            <InfoTip label={t('questionnaires:builder')} title={t('questionnaires:builder')}>
              {t('questionnaires:builderSubtitle')}
            </InfoTip>
          </div>

          <div className='flex items-center gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='application/pdf'
              className='hidden'
              onChange={e => void handleImportPdfSelected(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={handleImportPdfClick}
              disabled={importing}
              className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              title={t('questionnaires:importFromPdf')}
            >
              <Upload className='w-4 h-4' />
              {importing ? t('questionnaires:importing') : t('questionnaires:importFromPdf')}
            </button>
            {importStatus && <span className='text-xs text-gray-500'>{importStatus}</span>}
            <button
              onClick={() => {
                resetBuilder();
                setShowBuilder(true);
              }}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              <Plus className='w-4 h-4' />
              {t('questionnaires:createTemplate')}
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <p>{t('questionnaires:noTemplates')}</p>
            <p className='text-sm'>{t('questionnaires:createFirst')}</p>
          </div>
        ) : (
          <div className='grid gap-4'>
            {templates.map(template => (
              <div
                key={template.id}
                className='p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900'>{template.title}</h3>
                    <p className='text-sm text-gray-600 mt-1'>{template.description}</p>
                    <p className='text-xs text-gray-500 mt-2'>
                      {template.fields.length} {t('questionnaires:addField')} •{' '}
                      {t('questionnaires:timesUsed', { count: template.timesUsed })}
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg'
                      title={t('common:copy')}
                    >
                      <Copy className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className='p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg'
                      title={t('common:edit')}
                    >
                      <Eye className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg'
                      title={t('common:delete')}
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder Modal */}
      {showBuilder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200 sticky top-0 bg-white'>
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-xl font-bold'>
                  {editingTemplate
                    ? t('questionnaires:editTemplate')
                    : t('questionnaires:createTemplate')}
                </h2>
                <button
                  onClick={() => setShowPreview(v => !v)}
                  className='inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50'
                  title={t('common:preview')}
                >
                  <Eye className='w-4 h-4' />
                  {t('common:preview')}
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              {/* Template Info */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {t('questionnaires:templateTitle')} *
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder={t('questionnaires:templateTitlePlaceholder')}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {t('questionnaires:templateDescription')}
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  rows={2}
                  placeholder={t('questionnaires:templateDescriptionPlaceholder')}
                />
              </div>

              {/* Fields */}
              <div>
                <div className='flex justify-between items-center mb-4'>
                  <label className='block text-sm font-medium text-gray-700'>
                    {t('questionnaires:addField')} ({fields.length})
                  </label>
                  <InfoTip
                    label={t('questionnaires:addField')}
                    title={t('questionnaires:addField')}
                  >
                    {t('questionnaires:addFieldsPrompt')}
                  </InfoTip>

                  <div className='flex gap-2 flex-wrap'>
                    {(
                      ['text', 'textarea', 'radio', 'checkbox', 'select', 'number', 'date'] as const
                    ).map(type => (
                      <button
                        key={type}
                        onClick={() => handleAddField(type)}
                        className='px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200'
                      >
                        + {getFieldTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                    <p className='text-gray-500'>{t('questionnaires:noFields')}</p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {/* HISTORY-AWARE: Verwende field.id als Key, index wird nicht benötigt */}
                    {fields.map(field => (
                      <div
                        key={field.id}
                        className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200'
                      >
                        <GripVertical className='w-4 h-4 text-gray-400' />

                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-gray-900'>{field.label}</span>
                            {field.required && (
                              <span className='px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded'>
                                {t('questionnaires:fieldRequired')}
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-gray-600'>{getFieldTypeLabel(field.type)}</p>
                        </div>

                        <button
                          onClick={() => {
                            setEditingField(field);
                            setShowFieldEditor(true);
                          }}
                          className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg'
                        >
                          <Eye className='w-4 h-4' />
                        </button>

                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showPreview && (
                <div className='border-t border-gray-200 pt-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>{t('common:preview')}</h3>
                    <InfoTip label={t('common:preview')} title={t('common:preview')}>
                      {t('questionnaires:builderSubtitle')}
                    </InfoTip>
                  </div>
                  <div className='bg-gray-50 rounded-lg border border-gray-200 p-4'>
                    {fields.length === 0 ? (
                      <div className='text-sm text-gray-600'>{t('questionnaires:noFields')}</div>
                    ) : (
                      <QuestionnaireFormFields
                        formSchema={previewSchema}
                        responses={previewResponses}
                        onResponsesChange={setPreviewResponses}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className='p-6 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white'>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  resetBuilder();
                }}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleSaveTemplate}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                <Save className='w-4 h-4' />
                {t('common:save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Editor Modal */}
      {showFieldEditor && editingField && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4'>
          <div className='bg-white rounded-lg w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-bold'>{t('questionnaires:editField')}</h3>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {t('questionnaires:fieldLabel')} *
                </label>
                <input
                  type='text'
                  value={editingField.label}
                  onChange={e => setEditingField({ ...editingField, label: e.target.value })}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder={t('questionnaires:fieldLabelPlaceholder')}
                />
              </div>

              <div>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={editingField.required}
                    onChange={e => setEditingField({ ...editingField, required: e.target.checked })}
                    className='rounded'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    {t('questionnaires:fieldRequired')}
                  </span>
                </label>
              </div>

              {/* Options for radio/checkbox/select */}
              {(editingField.type === 'radio' ||
                editingField.type === 'checkbox' ||
                editingField.type === 'select') && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t('questionnaires:fieldOptions')}
                  </label>
                  {editingField.options?.map((option, index) => (
                    <div key={index} className='flex gap-2 mb-2'>
                      <input
                        type='text'
                        value={option}
                        onChange={e => {
                          const newOptions = [...(editingField.options || [])];
                          newOptions[index] = e.target.value;
                          setEditingField({ ...editingField, options: newOptions });
                        }}
                        className='flex-1 p-2 border border-gray-300 rounded-lg'
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = editingField.options?.filter((_, i) => i !== index);
                          setEditingField({ ...editingField, options: newOptions });
                        }}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditingField({
                        ...editingField,
                        options: [...(editingField.options || []), ''],
                      });
                    }}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    + {t('questionnaires:addOption')}
                  </button>
                </div>
              )}
            </div>

            <div className='p-6 border-t border-gray-200 flex justify-end gap-2'>
              <button
                onClick={() => {
                  setShowFieldEditor(false);
                  setEditingField(null);
                }}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleSaveField}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                {t('common:save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
