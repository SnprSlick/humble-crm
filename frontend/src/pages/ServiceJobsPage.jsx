import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import CreateServiceJobModal from "../components/CreateServiceJobModal";
import ServiceJobDetailModal from "../components/ServiceJobDetailModal";

const STATUS_COLORS = {
  quoted: "bg-yellow-600 text-yellow-100",
  approved: "bg-blue-600 text-blue-100",
  in_progress: "bg-orange-600 text-orange-100",
  completed: "bg-green-600 text-green-100",
  delivered: "bg-gray-600 text-gray-100"
};

const PRIORITY_COLORS = {
  low: "bg-gray-500 text-gray-100",
  normal: "bg-blue-500 text-blue-100",
  high: "bg-orange-500 text-orange-100",
  urgent: "bg-red-500 text-red-100"
};

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/service-jobs/`);
      const data = await response.json();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error("Error fetching service jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${job.vehicle_make} ${job.vehicle_model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, statusFilter, searchTerm]);

  useEffect(() => {
    const jobId = searchParams.get("job");
    if (jobId && jobs.length > 0) {
      const found = jobs.find((j) => j.id === parseInt(jobId));
      if (found) {
        setSelectedJob(found);
        setShowDetailModal(true);
      }
    }
  }, [searchParams, jobs]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const handleJobCreated = () => {
    setShowCreateModal(false);
    fetchJobs();
  };

  const handleJobUpdated = () => {
    setShowDetailModal(false);
    fetchJobs();
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`${API_URL}/api/service-jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setFilteredJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error("❌ Failed to delete job", err);
      alert("Failed to delete job.");
    }
  };

  const formatCurrency = (amount) => amount ? `$${amount.toFixed(2)}` : "—";
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "—";

  const getStatusBadge = (status) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[status] || 'bg-gray-600 text-gray-100'}`}>
      {status.replace("_", " ")}
    </span>
  );

  const getPriorityBadge = (priority) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${PRIORITY_COLORS[priority] || 'bg-gray-500 text-gray-100'}`}>
      {priority}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading service jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-accent mb-2">🔧 Service Jobs</h1>
          <p className="text-muted">Manage ongoing service work and customer projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          New Service Job
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs, customers, or job numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="quoted">Quoted</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead className="bg-highlight">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Quoted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-highlight cursor-pointer transition-colors"
                  onClick={() => handleJobClick(job)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text">{job.job_number}</div>
                    <div className="text-sm text-muted truncate max-w-xs">{job.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text">{job.customer?.name || "—"}</div>
                    <div className="text-sm text-muted">{job.customer?.email || "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    {job.vehicle_year && job.vehicle_make && job.vehicle_model
                      ? `${job.vehicle_year} ${job.vehicle_make} ${job.vehicle_model}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                  <td className="px-6 py-4">{getPriorityBadge(job.priority)}</td>
                  <td className="px-6 py-4 text-sm text-text">{formatCurrency(job.quoted_total)}</td>
                  <td className="px-6 py-4 text-sm text-text">{formatDate(job.estimated_completion)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJob(job.id);
                      }}
                      className="text-xs text-red-500 underline hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="border border-border rounded-lg p-4 bg-background shadow-sm cursor-pointer hover:bg-surfaceActive transition"
            >
              <div className="text-xs text-muted uppercase mb-1">{job.job_number}</div>
              <div className="text-lg font-bold text-text">{job.title}</div>
              <div className="text-sm mt-2 text-muted">{job.customer?.name || "—"}</div>
              <div className="text-sm mt-1 text-muted">
                {job.vehicle_year && job.vehicle_make ? `${job.vehicle_year} ${job.vehicle_make} ${job.vehicle_model}` : "—"}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {getStatusBadge(job.status)}
                {getPriorityBadge(job.priority)}
              </div>
              <div className="text-sm mt-2">
                <span className="text-muted">Quoted:</span> {formatCurrency(job.quoted_total)}
              </div>
              <div className="text-sm">
                <span className="text-muted">Due:</span> {formatDate(job.estimated_completion)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteJob(job.id);
                }}
                className="mt-3 text-xs text-red-500 underline hover:text-red-300"
              >
                Delete Job
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <CreateServiceJobModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onJobCreated={handleJobCreated}
        />
      )}

      {showDetailModal && selectedJob && (
        <ServiceJobDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          job={selectedJob}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </div>
  );
}
