/**
 * Document Requests Component
 * Therapeuten fordern Dokumente an (Scans, Laborbefunde, Rezepte)
 * Patienten laden angeforderte Dokumente hoch
 */

import { Check, Clock, FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

interface DocumentRequest {
  id: string;
  patientId?: string;
  patientName?: string;
  documentType: 'medical_scan' | 'lab_results' | 'prescription' | 'referral' | 'insurance' | 'other';
  description: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'uploaded' | 'reviewed' | 'rejected';
  uploadedFileId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function DocumentRequests() {
  const { t } = useTranslation(['documents', 'common']);
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Request Modal (Therapist)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentRequest['documentType']>('medical_scan');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NonNullable<DocumentRequest['priority']>>('normal');

  // Upload Modal (Patient)
  const [uploadingRequest, setUploadingRequest] = useState<DocumentRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Review Modal (Therapist)
  const [reviewingRequest, setReviewingRequest] = useState<DocumentRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await apiClient.get('/document-requests');
      const data = response.data;
      setRequests(Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : []);
    } catch (error: any) {
      logger.error('DocumentRequests: Error loading requests', error);
      toast.error(t('common:errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedPatientId || !description.trim()) {
      toast.error(t('common:fillAllFields'));
      return;
    }

    try {
      await apiClient.post('/document-requests', {
        patientId: selectedPatientId,
        title: getDocumentTypeLabel(documentType),
        documentType,
        description,
        // priority ist im Backend-Schema für document_requests aktuell nicht vorhanden
      });

      toast.success(t('documents:requestCreated'));
      setShowCreateModal(false);
      setSelectedPatientId('');
      setDescription('');
      await loadRequests();
    } catch (error: any) {
      logger.error('DocumentRequests: Error creating request', error);
      toast.error(t('common:errorSaving'));
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadingRequest || !selectedFile) {
      toast.error(t('documents:selectFile'));
      return;
    }

    // First upload file to patient-materials
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('materialType', 'document');

    try {
      const uploadResponse = await apiClient.post('/patient-materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileId = uploadResponse.data.id;

      // Link file to request
      await apiClient.patch(`/document-requests/${uploadingRequest.id}/upload`, {
        uploadedFileId: fileId
      });

      toast.success(t('documents:documentUploaded'));
      setUploadingRequest(null);
      setSelectedFile(null);
      await loadRequests();
    } catch (error: any) {
      logger.error('DocumentRequests: Error uploading document', error);
      toast.error(t('common:errorUploading'));
    } finally {
      setUploading(false);
    }
  };

  const handleReviewDocument = async (accepted: boolean) => {
    if (!reviewingRequest) return;

    try {
      await apiClient.patch(`/document-requests/${reviewingRequest.id}/review`, {
        status: accepted ? 'reviewed' : 'rejected',
        rejectionReason: !accepted ? (reviewNotes.trim() || 'Abgelehnt') : undefined
      });

      toast.success(accepted ? t('documents:approved') : t('documents:rejected'));
      setReviewingRequest(null);
      setReviewNotes('');
      await loadRequests();
    } catch (error: any) {
      logger.error('DocumentRequests: Error reviewing document', error);
      toast.error(t('common:errorSaving'));
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      medical_scan: t('documents:typeMedicalScan'),
      lab_results: t('documents:typeLabResults'),
      prescription: t('documents:typePrescription'),
      referral: t('documents:typeReferral'),
      insurance: t('documents:typeInsuranceCard'),
      other: t('documents:typeOther')
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      case 'uploaded': return <Upload className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('documents:title')}
          </h1>
          
          {user?.role === 'therapist' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              {t('documents:createRequest')}
            </button>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{t('documents:noRequests')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getDocumentTypeLabel(request.documentType)}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority === 'urgent' || request.priority === 'high' ? t('documents:priorityUrgent') : 
                         request.priority === 'normal' ? t('documents:priorityNormal') : t('documents:priorityLow')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>

                    {request.patientName && user?.role === 'therapist' && (
                      <p className="text-xs text-gray-500">Patient: {request.patientName}</p>
                    )}

                    {request.rejectionReason && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <strong>{t('documents:reject')}:</strong> {request.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {user?.role === 'patient' && request.status === 'pending' && (
                      <button
                        onClick={() => setUploadingRequest(request)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t('documents:uploadDocument')}
                      </button>
                    )}

                    {user?.role === 'therapist' && request.status === 'uploaded' && (
                      <button
                        onClick={() => setReviewingRequest(request)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {t('documents:reviewDocument')}
                      </button>
                    )}

                    {request.status === 'reviewed' && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm text-center">
                        {t('common:completed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{t('documents:createRequest')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common:patient')} *
                </label>
                <input
                  type="text"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder={t('common:patient')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common:type')} *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentRequest['documentType'])}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="medical_scan">{t('documents:typeMedicalScan')}</option>
                  <option value="lab_results">{t('documents:typeLabResults')}</option>
                  <option value="prescription">{t('documents:typePrescription')}</option>
                  <option value="referral">{t('documents:typeReferral')}</option>
                  <option value="insurance">{t('documents:typeInsuranceCard')}</option>
                  <option value="other">{t('documents:typeOther')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common:description')} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder={t('common:description')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common:status')}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NonNullable<DocumentRequest['priority']>)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">{t('documents:priorityLow')}</option>
                  <option value="medium">{t('documents:priorityNormal')}</option>
                  <option value="high">{t('documents:priorityHigh')}</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleCreateRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('common:create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{t('documents:uploadDocument')}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>{t('documents:createRequest')}:</strong> {getDocumentTypeLabel(uploadingRequest.documentType)}
              </p>
              <p className="text-sm text-gray-600">{uploadingRequest.description}</p>
            </div>

            <div className="mb-6">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  {t('common:select')}: {selectedFile.name}
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setUploadingRequest(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? t('common:uploading') : t('common:upload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{t('documents:reviewDocument')}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>{t('common:type')}:</strong> {getDocumentTypeLabel(reviewingRequest.documentType)}
              </p>
              <p className="text-sm text-gray-600 mb-4">{reviewingRequest.description}</p>
              
              <p className="text-sm text-blue-600 mb-2">
                ✓ {t('documents:documentUploaded')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('documents:reviewNotes')}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder={t('documents:reviewNotes')}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewingRequest(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={() => handleReviewDocument(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('documents:reject')}
              </button>
              <button
                onClick={() => handleReviewDocument(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t('documents:approve')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
