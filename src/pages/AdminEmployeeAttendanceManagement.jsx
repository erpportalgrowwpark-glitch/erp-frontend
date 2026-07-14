// frontend/src/pages/AdminEmployeeAttendanceManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEmployeeAttendanceManagement = () => {
    const navigate = useNavigate();

    // Start with current month (YYYY-MM)
    const currentMonth = new Date().toISOString().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [overviewData, setOverviewData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Inline Editing State
    const [editingCell, setEditingCell] = useState(null); // stores record.id
    const [editFormData, setEditFormData] = useState({ in: '', out: '' });

    useEffect(() => {
        fetchOverview(selectedMonth); // Normal fetch with loading screen
    }, [selectedMonth]);

    // THE FIX: Added "isSilent" parameter. If true, it skips the loading screen.
    const fetchOverview = async (month, isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/admin/overview?month=${month}`);
            if (res.ok) {
                const data = await res.json();
                setOverviewData(data);
            }
        } catch (error) {
            console.error("Error fetching overview data:", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const daysInMonth = useMemo(() => {
        const [year, month] = selectedMonth.split('-');
        const numDays = new Date(year, month, 0).getDate();
        return Array.from({ length: numDays }, (_, i) => {
            const day = String(i + 1).padStart(2, '0');
            return `${year}-${month}-${day}`;
        });
    }, [selectedMonth]);

    const extractTimeForInput = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Missed';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getHeaderDate = (dateStr) => {
        const d = new Date(dateStr);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateNum = d.getDate();
        return `${dayName} ${dateNum}`;
    };

    // --- CRUD ACTIONS ---

    const initiateEdit = (session) => {
        setEditingCell(session.id);
        setEditFormData({
            in: extractTimeForInput(session.in),
            out: extractTimeForInput(session.out)
        });
    };

    const handleUpdate = async (recordId) => {
        try {
            const res = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/admin/record/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newInTime: editFormData.in,
                    newOutTime: editFormData.out
                })
            });

            if (res.ok) {
                setEditingCell(null);
                // THE FIX: Pass true for a silent background refresh so the scroll stays put
                fetchOverview(selectedMonth, true);
            } else {
                alert("Failed to update record.");
            }
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm("Are you sure you want to completely delete this attendance log?")) return;

        try {
            const res = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/admin/record/${recordId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // THE FIX: Pass true for a silent background refresh
                fetchOverview(selectedMonth, true);
            } else {
                alert("Failed to delete record.");
            }
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    };

    return (
        <>
            <style>
                {`
          body, html { margin: 0; padding: 0; width: 100%; min-height: 100vh; background-color: #0d1117; }
          .page-wrapper { min-height: 100vh; width: 100vw; background-color: #0d1117; background-image: radial-gradient(circle at 15% 20%, rgba(0, 82, 204, 0.15) 0%, transparent 25%), radial-gradient(circle at 85% 80%, rgba(38, 132, 255, 0.15) 0%, transparent 25%); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #c9d1d9; display: flex; flex-direction: column; align-items: center; padding: 2rem; box-sizing: border-box; }
          
          .header-card { background: rgba(22, 27, 34, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.5rem 2rem; width: 100%; max-width: 1400px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
          .header-card h2 { margin: 0; color: #ffffff; }
          
          .controls { display: flex; gap: 15px; align-items: center; }
          .month-picker { padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1rem; color-scheme: dark; font-family: inherit; cursor: pointer; }
          .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; text-decoration: none; display: inline-block; }
          .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }

          /* Table Wrapper for Horizontal Scrolling */
          .table-container { width: 100%; max-width: 1400px; background: rgba(22, 27, 34, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow-x: auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); padding-bottom: 15px; }
          
          .attendance-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
          
          /* Table Headers */
          .attendance-table th { background: #161b22; color: #e6edf3; padding: 12px 10px; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.05); white-space: nowrap; text-align: center; position: sticky; top: 0; z-index: 5; }
          .attendance-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); min-width: 140px; vertical-align: top; }
          .attendance-table tbody tr:hover td { background: rgba(255,255,255,0.03); }

          /* Sticky First Column */
          .attendance-table th:first-child, .attendance-table td:first-child { position: sticky; left: 0; background: #161b22; z-index: 10; font-weight: bold; font-size: 0.95rem; color: #58a6ff; min-width: 180px; text-align: left; border-right: 2px solid rgba(255,255,255,0.1); }
          .attendance-table th:first-child { z-index: 15; } /* Corner cell above both sticky layers */
          .attendance-table tbody tr:hover td:first-child { background: #21262d; }
          
          /* Cell Content Styling & Hover Interactions */
          .cell-session { position: relative; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 8px; margin-bottom: 6px; display: flex; flex-direction: column; gap: 6px; transition: border 0.2s; }
          .cell-session:hover { border-color: rgba(88, 166, 255, 0.4); }
          .cell-session:last-child { margin-bottom: 0; }
          
          .time-row { display: flex; justify-content: space-between; color: #c9d1d9; align-items: center; }
          .time-label { color: #8b949e; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; width: 30px; }
          .absent-text { color: #8b949e; text-align: center; display: block; width: 100%; font-style: italic; padding: 8px 0; }
          
          /* Editing Overlay UI */
          .edit-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(22, 27, 34, 0.9); backdrop-filter: blur(4px); border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 2; }
          .cell-session:hover .edit-overlay { opacity: 1; pointer-events: auto; }
          
          .icon-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 4px; transition: background 0.2s; }
          .icon-btn.edit:hover { background: rgba(88, 166, 255, 0.2); }
          .icon-btn.delete:hover { background: rgba(248, 81, 73, 0.2); }

          /* Active Editing Mode Form */
          .edit-form { display: flex; flex-direction: column; gap: 6px; background: #1c2128; padding: 8px; border-radius: 6px; border: 1px solid #58a6ff; }
          .edit-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 4px; border-radius: 4px; font-size: 0.8rem; font-family: inherit; box-sizing: border-box; }
          .edit-input:focus { outline: none; border-color: #58a6ff; }
          .btn-apply { background: #3fb950; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.75rem; width: 100%; }
          .btn-cancel { background: transparent; color: #8b949e; border: none; font-size: 0.75rem; cursor: pointer; width: 100%; padding: 4px 0; }

          @media (max-width: 768px) {
            .header-card { flex-direction: column; gap: 1rem; align-items: flex-start; }
            .controls { width: 100%; justify-content: space-between; }
          }
        `}
            </style>

            <div className="page-wrapper">
                <div className="header-card">
                    <div>
                        <h2>Attendance Overview Grid</h2>
                        <p style={{ color: '#8b949e', margin: '5px 0 0 0' }}>Review and modify company-wide log data.</p>
                    </div>

                    <div className="controls">
                        <input
                            type="month"
                            className="month-picker"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                        <button className="btn-secondary" onClick={() => navigate('/admin')}>
                            Back to Admin
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8b949e' }}>Building interactive grid layout...</div>
                    ) : overviewData.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8b949e' }}>No employee records found for this period.</div>
                    ) : (
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Employee Name</th>
                                    {daysInMonth.map(dateStr => (
                                        <th key={dateStr}>{getHeaderDate(dateStr)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {overviewData.map(emp => (
                                    <tr key={emp.employeeId}>
                                        <td>{emp.name}</td>

                                        {daysInMonth.map(dateStr => {
                                            const daySessions = emp.attendance[dateStr] || [];

                                            return (
                                                <td key={dateStr}>
                                                    {daySessions.length === 0 ? (
                                                        <span className="absent-text">-</span>
                                                    ) : (
                                                        daySessions.map((session, idx) => {

                                                            // RENDERING INLINE EDIT MODE
                                                            if (editingCell === session.id) {
                                                                return (
                                                                    <div key={idx} className="edit-form">
                                                                        <div className="time-row">
                                                                            <span className="time-label">In:</span>
                                                                            <input
                                                                                type="time"
                                                                                className="edit-input"
                                                                                value={editFormData.in}
                                                                                onChange={(e) => setEditFormData({ ...editFormData, in: e.target.value })}
                                                                            />
                                                                        </div>
                                                                        <div className="time-row">
                                                                            <span className="time-label">Out:</span>
                                                                            <input
                                                                                type="time"
                                                                                className="edit-input"
                                                                                value={editFormData.out}
                                                                                onChange={(e) => setEditFormData({ ...editFormData, out: e.target.value })}
                                                                            />
                                                                        </div>
                                                                        <button className="btn-apply" onClick={() => handleUpdate(session.id)}>Apply</button>
                                                                        <button className="btn-cancel" onClick={() => setEditingCell(null)}>Cancel</button>
                                                                    </div>
                                                                );
                                                            }

                                                            // RENDERING STANDARD VIEW MODE WITH HOVER ACTIONS
                                                            return (
                                                                <div key={idx} className="cell-session">
                                                                    <div className="time-row">
                                                                        <span className="time-label">In:</span>
                                                                        <span style={{ color: '#3fb950' }}>{formatTime(session.in)}</span>
                                                                    </div>
                                                                    <div className="time-row">
                                                                        <span className="time-label">Out:</span>
                                                                        <span style={!session.out ? { color: '#f85149' } : {}}>{formatTime(session.out)}</span>
                                                                    </div>

                                                                    {/* Hover Actions */}
                                                                    <div className="edit-overlay">
                                                                        <button className="icon-btn edit" title="Edit Log" onClick={() => initiateEdit(session)}>
                                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                        </button>
                                                                        <button className="icon-btn delete" title="Delete Log" onClick={() => handleDelete(session.id)}>
                                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminEmployeeAttendanceManagement;