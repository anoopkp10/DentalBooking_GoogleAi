import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Sparkles,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Layers
} from 'lucide-react';
import { DentalService } from '../../types/database';

interface ServicesTabProps {
  services: DentalService[];
  onCreateService: (service: Omit<DentalService, 'id' | 'created_at'>) => Promise<DentalService>;
  onUpdateService: (id: string, updates: Partial<DentalService>) => Promise<DentalService>;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onToggleActive,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<DentalService | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [price, setPrice] = useState<number>(120);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(45);
    setPrice(120);
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: DentalService) => {
    setEditingService(srv);
    setName(srv.name);
    setDescription(srv.description);
    setDurationMinutes(srv.duration_minutes);
    setPrice(Number(srv.price));
    setIsActive(srv.is_active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Service name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editingService) {
        // Update existing service
        await onUpdateService(editingService.id, {
          name: name.trim(),
          description: description.trim(),
          duration_minutes: Number(durationMinutes),
          price: Number(price),
          is_active: isActive,
        });
      } else {
        // Create new service
        await onCreateService({
          name: name.trim(),
          description: description.trim(),
          duration_minutes: Number(durationMinutes),
          price: Number(price),
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save service:', err);
      setErrorMessage(err?.message || 'Failed to save service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Services & Procedures</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure all bookable treatments, durations, pricing, and patient visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="admin-add-service-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dental Service</span>
        </button>
      </div>

      {/* Services Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            id={`admin-service-card-${service.id}`}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              service.is_active
                ? 'bg-white border-slate-200 shadow-xs hover:border-teal-300'
                : 'bg-slate-50/80 border-slate-200/60 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    service.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {service.is_active ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-600" />
                      Active (Visible to Patients)
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                      Inactive (Hidden from Booking)
                    </>
                  )}
                </span>

                <span className="font-extrabold text-slate-900 text-base">
                  ${Number(service.price).toFixed(0)}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                {service.name}
              </h3>

              <div className="flex items-center text-xs font-semibold text-teal-700 mb-3">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>{service.duration_minutes} minutes duration</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                {service.description || 'No description provided.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onToggleActive(service.id, service.is_active)}
                id={`toggle-active-${service.id}`}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  service.is_active
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {service.is_active ? 'Deactivate' : 'Activate Service'}
              </button>

              <button
                onClick={() => openEditModal(service)}
                id={`edit-service-btn-${service.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-bold uppercase">
                  {editingService ? 'Edit Existing Treatment' : 'New Treatment Setup'}
                </span>
                <h3 className="text-xl font-bold font-display">
                  {editingService ? editingService.name : 'Create Dental Service'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="service-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ultrasonic Dental Cleaning & Fluoride"
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={240}
                    step={5}
                    id="service-duration-input"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Calculates appointment end times</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Price ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    id="service-price-input"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Displayed on public booking</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Description
                </label>
                <textarea
                  rows={3}
                  id="service-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the patient can expect, clinical procedures included, and benefits..."
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Active Service</p>
                    <p className="text-[11px] text-slate-500">
                      When checked, this service is visible and bookable by patients online.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  id="service-save-submit-btn"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  {isSaving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
