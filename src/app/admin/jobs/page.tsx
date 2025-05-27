'use client';

import { useState, useEffect } from 'react';
import AdminAuth from '@/components/AdminAuth';

interface JobApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_level?: string;
  resume_url?: string;
  cover_letter?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  notes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export default function JobsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, positionFilter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (positionFilter) {
        params.append('position', positionFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch job applications');
      }
    } catch (err) {
      setError('Error fetching job applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string, notes?: string) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, status, notes }),
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApplication(null);
        setNotes('');
      } else {
        setError('Failed to update application status');
      }
    } catch (err) {
      setError('Error updating application status');
      console.error(err);
    }
  };

  const updateApplicationNotes = async (id: string, notes: string) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, notes }),
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApplication(null);
        setNotes('');
      } else {
        setError('Failed to update application notes');
      }
    } catch (err) {
      setError('Error updating application notes');
      console.error(err);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const adminKey = localStorage.getItem('adminKey');
      
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      } else if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const response = await fetch(`/api/jobs?id=${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApplication(null);
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      setError('Error deleting application');
      console.error(err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminAuth>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <button
            onClick={fetchApplications}
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Position
              </label>
              <input
                type="text"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                placeholder="Enter position..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or notes..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No job applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="text-sm text-gray-500">
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.experience_level || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteApplication(application.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Job Application Details</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.first_name} {selectedApplication.last_name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                    </div>

                    {selectedApplication.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.phone}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.position}</p>
                    </div>

                    {selectedApplication.experience_level && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.experience_level}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedApplication.status)}`}>
                        {selectedApplication.status}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Applied</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedApplication.created_at)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedApplication.resume_url && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Resume</label>
                        <a
                          href={selectedApplication.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                        >
                          View Resume
                        </a>
                      </div>
                    )}

                    {selectedApplication.linkedin_url && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                        <a
                          href={selectedApplication.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}

                    {selectedApplication.portfolio_url && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                        <a
                          href={selectedApplication.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                        >
                          View Portfolio
                        </a>
                      </div>
                    )}

                    {selectedApplication.ip_address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IP Address</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.ip_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                )}

                {selectedApplication.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.notes}
                    </p>
                  </div>
                )}

                {/* Add/Update Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={() => updateApplicationNotes(selectedApplication.id, notes)}
                    className="mt-2 btn btn-outline"
                    disabled={!notes.trim()}
                  >
                    Save Notes
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewing')}
                    className="btn btn-outline"
                    disabled={selectedApplication.status === 'reviewing'}
                  >
                    Mark as Reviewing
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'interview', notes)}
                    className="btn btn-outline"
                    disabled={selectedApplication.status === 'interview'}
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'hired', notes)}
                    className="btn btn-primary"
                    disabled={selectedApplication.status === 'hired'}
                  >
                    Hire
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected', notes)}
                    className="btn btn-danger"
                    disabled={selectedApplication.status === 'rejected'}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => deleteApplication(selectedApplication.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuth>
  );
} 