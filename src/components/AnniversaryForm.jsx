import React, { useState, useEffect } from 'react';
import { createAnniversary, updateAnniversary } from '../models/Anniversary';
import './AnniversaryForm.css';

function AnniversaryForm({ anniversary, onSave, onCancel }) {
  const isEdit = !!anniversary;

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    category: 'birthday',
    reminderSettings: {
      enabled: true,
      timings: [0, 1, 7],
      timeOfDay: '09:00'
    }
  });

  const [errors, setErrors] = useState({});

  // Load existing anniversary data if editing
  useEffect(() => {
    if (anniversary) {
      setFormData({
        title: anniversary.title || '',
        date: anniversary.date ? anniversary.date.split('T')[0] : '',
        description: anniversary.description || '',
        category: anniversary.category || 'birthday',
        reminderSettings: anniversary.reminderSettings || {
          enabled: true,
          timings: [0, 1, 7],
          timeOfDay: '09:00'
        }
      });
    }
  }, [anniversary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleReminderChange = (timing) => {
    setFormData(prev => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        timings: prev.reminderSettings.timings.includes(timing)
          ? prev.reminderSettings.timings.filter(t => t !== timing)
          : [...prev.reminderSettings.timings, timing].sort((a, b) => a - b)
      }
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      let savedAnniversary;

      if (isEdit) {
        // Update existing
        savedAnniversary = updateAnniversary(anniversary, formData);
      } else {
        // Create new
        savedAnniversary = createAnniversary(formData);
      }

      onSave(savedAnniversary);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {isEdit ? 'Edit Anniversary' : 'Add New Anniversary'}
          </h2>
          <button className="form-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {errors.submit && (
            <div className="form-error-banner">{errors.submit}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title <span className="form-required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mom's Birthday"
              maxLength={100}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date">
              Date <span className="form-required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className={`form-input ${errors.date ? 'form-input-error' : ''}`}
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="birthday">🎂 Birthday</option>
              <option value="wedding">💒 Wedding</option>
              <option value="work">💼 Work</option>
              <option value="other">🎈 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-input form-textarea ${errors.description ? 'form-input-error' : ''}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any notes or details..."
              rows={3}
              maxLength={500}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Reminder Settings</label>
            <div className="form-checkboxes">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.reminderSettings.timings.includes(0)}
                  onChange={() => handleReminderChange(0)}
                />
                <span>On the day</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.reminderSettings.timings.includes(1)}
                  onChange={() => handleReminderChange(1)}
                />
                <span>1 day before</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.reminderSettings.timings.includes(7)}
                  onChange={() => handleReminderChange(7)}
                />
                <span>1 week before</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Anniversary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnniversaryForm;
