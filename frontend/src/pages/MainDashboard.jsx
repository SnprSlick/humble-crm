import React, { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import CreateAppointmentModal from "../components/CreateAppointmentModal";
import ServiceJobDetailModal from "../components/ServiceJobDetailModal";

const STATUS_COLORS = {
  quoted: "bg-yellow-600 text-yellow-100",
  approved: "bg-blue-600 text-blue-100",
  in_progress: "bg-orange-600 text-orange-100",
  completed: "bg-green-600 text-green-100",
  delivered: "bg-gray-600 text-gray-100",
};

const PRIORITY_COLORS = {
  low: "bg-gray-500 text-gray-100",
  normal: "bg-blue-500 text-blue-100",
  high: "bg-orange-500 text-orange-100",
  urgent: "bg-red-500 text-red-100",
};

export default function MainDashboard() {
  const [reminders, setReminders] = useState([]);
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [serviceJobs, setServiceJobs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropShipPreview, setDropShipPreview] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/reminders`).then(res => res.json()).then(setReminders).catch(() => setReminders([]));
    fetch(`${API_URL}/api/appointments/today`).then(res => res.json()).then(setAppointmentsToday).catch(() => setAppointmentsToday([]));
    fetch(`${API_URL}/api/service-jobs/active-and-quoted`).then(res => res.json()).then(setServiceJobs).catch(() => setServiceJobs([]));
    fetch(`${API_URL}/api/drop_ship_orders/summary`).then(res => res.json()).then(setDropShipPreview).catch(() => setDropShipPreview([]));
  }, []);

  const openJobModal = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  return (
    <div className="w-full h-full text-text font-sans tracking-wide px-0 py-0">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-header font-bold text-text tracking-wide select-none">
          DASHBOARD
        </h1>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Service Jobs */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 pt-4">
            <h2 className="text-xl font-header font-bold text-text uppercase">SERVICE JOBS (ACTIVE & QUOTED)</h2>
          </div>
          {serviceJobs.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full text-xs">
                  <thead className="bg-highlight text-muted text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Vehicle</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-left">Due</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {serviceJobs.map((job, i) => (
                      <tr
                        key={job.id}
                        onClick={() => openJobModal(job)}
                        className={`hover:bg-surfaceActive hover:text-white transition cursor-pointer group ${
                          i % 2 === 0 ? "bg-surfaceLight" : "bg-background"
                        }`}
                      >
                        <td className="px-4 py-3">{job.customer?.name || "—"}</td>
                        <td className="px-4 py-3">
                          {job.vehicle_year && job.vehicle_make
                            ? `${job.vehicle_year} ${job.vehicle_make} ${job.vehicle_model}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[job.status]}`}>
                            {job.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${PRIORITY_COLORS[job.priority]}`}>
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {job.estimated_completion
                            ? new Date(job.estimated_completion).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {job.customer?.email && (
                              <a
                                href={`mailto:${job.customer.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-white"
                                title="Email"
                              >
                                <Mail size={14} />
                              </a>
                            )}
                            {job.customer?.phone && (
                              <>
                                <a
                                  href={`tel:${job.customer.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-white"
                                  title="Call"
                                >
                                  <Phone size={14} />
                                </a>
                                <a
                                  href={`sms:${job.customer.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-white"
                                  title="Text"
                                >
                                  <MessageSquare size={14} />
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden p-3 space-y-3">
                {serviceJobs.map((job, i) => (
                  <div
                    key={job.id}
                    onClick={() => openJobModal(job)}
                    className={`rounded-md p-3 ${i % 2 === 0 ? "bg-surfaceLight" : "bg-background"} hover:bg-surfaceActive transition group`}
                  >
                    <div className="font-bold text-sm">{job.customer?.name || "—"}</div>
                    <div className="text-xs text-muted">
                      {job.vehicle_year && job.vehicle_make
                        ? `${job.vehicle_year} ${job.vehicle_make} ${job.vehicle_model}`
                        : "—"}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[job.status]}`}>
                        {job.status.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${PRIORITY_COLORS[job.priority]}`}>
                        {job.priority}
                      </span>
                    </div>
                    <div className="text-xs mt-2 text-muted">
                      Due:{" "}
                      {job.estimated_completion
                        ? new Date(job.estimated_completion).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {job.customer?.email && (
                        <a
                          href={`mailto:${job.customer.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-white"
                          title="Email"
                        >
                          <Mail size={14} />
                        </a>
                      )}
                      {job.customer?.phone && (
                        <>
                          <a
                            href={`tel:${job.customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white"
                            title="Call"
                          >
                            <Phone size={14} />
                          </a>
                          <a
                            href={`sms:${job.customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white"
                            title="Text"
                          >
                            <MessageSquare size={14} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm italic px-4 py-4">No quoted or active jobs.</p>
          )}
        </div>

        {/* Reminders */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="text-xl font-header font-bold text-text uppercase">DAILY REMINDERS</h2>
          {reminders.map((r, i) => (
            <div key={i} className="text-sm mt-1">
              • {r}
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-header font-bold text-text uppercase">TODAY'S APPOINTMENTS</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
            >
              + Create
            </button>
          </div>
          {appointmentsToday.length > 0 ? (
            <ul className="text-sm space-y-1 mt-2">
              {appointmentsToday.map((appt, i) => (
                <li key={i}>
                  {appt.time} - {appt.customer} ({appt.type})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic mt-2">No appointments today.</p>
          )}
        </div>

        {/* Drop Ship Summary */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="text-xl font-header font-bold text-text uppercase">DROP SHIP SUMMARY</h2>
          {dropShipPreview.length === 0 ? (
            <p className="text-sm italic mt-2">No active drop ships.</p>
          ) : (
            <ul className="text-sm space-y-1 mt-2">
              {dropShipPreview.map((entry, i) => (
                <li key={i}>
                  {entry.customer} — {entry.item} ({entry.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showDetailModal && selectedJob && (
        <ServiceJobDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          job={selectedJob}
          onJobUpdated={() => {
            setShowDetailModal(false);
            fetch(`${API_URL}/api/service-jobs/active-and-quoted`)
              .then((res) => res.json())
              .then(setServiceJobs);
          }}
        />
      )}

      <CreateAppointmentModal
        isOpen={showCreateModal}
        setIsOpen={setShowCreateModal}
        prefillDate={new Date()}
      />
    </div>
  );
}
