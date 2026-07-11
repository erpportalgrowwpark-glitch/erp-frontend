// frontend/src/pages/EmployeeDetailedDaysReport.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDetailedDaysReport = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const parsedEmployee = JSON.parse(storedEmployee);
            setEmployee(parsedEmployee);
            fetchHistory(parsedEmployee.id);
        } else {
            navigate('/employee-login');
        }
    }, [navigate]);

    const fetchHistory = async (empId) => {
        try {
            const res = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/history/${empId}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- THE LUNCH-BREAK SHIFT LOGIC (Unchanged) ---
    const evaluateSession = (tapIn, tapOut) => {
        if (!tapIn || !tapOut) return false;

        const inDate = new Date(tapIn);
        const outDate = new Date(tapOut);

        const inMins = (inDate.getHours() * 60) + inDate.getMinutes();
        const outMins = (outDate.getHours() * 60) + outDate.getMinutes();

        const isValidTapIn = inMins <= 575 || (inMins >= 780 && inMins <= 840);
        const isValidTapOut = (outMins >= 780 && outMins <= 840) || outMins >= 1110;

        return isValidTapIn && isValidTapOut;
    };

    // --- HELPER MATH FUNCTIONS ---
    const formatTime = (isoString) => {
        if (!isoString) return 'Missing / In Progress';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getDurationString = (tapIn, tapOut) => {
        if (!tapIn || !tapOut) return 'In Progress';
        const diffMs = new Date(tapOut) - new Date(tapIn);
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHrs}h ${diffMins}m`;
    };

    const getDayTotalDuration = (sessions) => {
        let totalMs = 0;
        sessions.forEach(session => {
            if (session.tapInTime && session.tapOutTime) {
                totalMs += (new Date(session.tapOutTime) - new Date(session.tapInTime));
            }
        });
        const totalHrs = Math.floor(totalMs / (1000 * 60 * 60));
        const totalMins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${totalHrs}h ${totalMins}m`;
    };

    // --- DATA GROUPING LOGIC ---
    const groupedHistory = useMemo(() => {
        const groups = history.reduce((acc, record) => {
            if (!acc[record.date]) acc[record.date] = [];
            acc[record.date].push(record);
            return acc;
        }, {});

        return Object.keys(groups)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({
                date,
                sessions: groups[date]
            }));
    }, [history]);

    if (loading) return <div style={{ padding: '2rem', color: '#c9d1d9', backgroundColor: '#0d1117', height: '100vh' }}>Loading Report...</div>;

    return (
        <>
            <style>
                {`
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            background-color: #0d1117;
          }

          .page-wrapper {
            min-height: 100vh;
            width: 100vw;
            background-color: #0d1117;
            background-image: 
              radial-gradient(circle at 15% 20%, rgba(0, 82, 204, 0.15) 0%, transparent 25%),
              radial-gradient(circle at 85% 80%, rgba(38, 132, 255, 0.15) 0%, transparent 25%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #c9d1d9;
            display: flex;
            justify-content: center;
            padding: 2rem;
            box-sizing: border-box;
            overflow-y: auto;
          }

          .content-container {
            width: 100%;
            max-width: 850px;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .glass-card {
            background: rgba(22, 27, 34, 0.4); 
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-row h2 {
            color: #ffffff;
            margin: 0 0 0.5rem 0;
          }

          .header-row p {
            color: #8b949e;
            margin: 0;
          }

          .btn-secondary {
            background-color: rgba(255, 255, 255, 0.05);
            color: #c9d1d9;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.2s;
            font-family: inherit;
          }

          .btn-secondary:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.2);
          }

          .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 1rem;
            margin-bottom: 1rem;
          }

          .day-title {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 600;
            color: #ffffff;
          }

          .day-total {
            margin: 0;
            font-size: 1rem;
            color: #8b949e;
            font-weight: 600;
          }

          .highlight-blue {
            color: #58a6ff;
          }

          .session-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .session-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 1.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid transparent;
            transition: background 0.2s;
          }

          .session-card:hover {
            background: rgba(255, 255, 255, 0.06);
          }

          /* Contextual border colors for status */
          .session-good {
            border-left: 5px solid #3fb950;
          }

          .session-bad {
            border-left: 5px solid #f85149;
          }

          .time-data {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .time-text {
            margin: 0;
            font-size: 1rem;
            color: #e6edf3;
          }

          .time-text strong {
            color: #8b949e;
          }

          .duration-text {
            margin: 0;
            font-size: 0.9rem;
            color: #8b949e;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .badge-good {
            background: rgba(63, 185, 80, 0.1);
            color: #3fb950;
            border: 1px solid rgba(63, 185, 80, 0.2);
          }

          .badge-bad {
            background: rgba(248, 81, 73, 0.1);
            color: #f85149;
            border: 1px solid rgba(248, 81, 73, 0.2);
          }

          @media (max-width: 600px) {
            .header-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
            .session-card {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
            .day-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
          }
        `}
            </style>

            <div className="page-wrapper">
                <div className="content-container">

                    {/* Header Card */}
                    <div className="glass-card header-row">
                        <div>
                            <h2>Detailed Days Report</h2>
                            <p>Attendance history & log variations for {employee?.name}</p>
                        </div>
                        <button className="btn-secondary" onClick={() => navigate('/employee-dashboard')}>
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Data Rendering */}
                    {groupedHistory.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <p style={{ color: '#8b949e', fontSize: '1.1rem', margin: 0 }}>No attendance records found in the system.</p>
                        </div>
                    ) : (
                        groupedHistory.map((dayGroup) => (

                            // Big Day Container
                            <div key={dayGroup.date} className="glass-card">

                                <div className="day-header">
                                    <h3 className="day-title">{formatDate(dayGroup.date)}</h3>
                                    <p className="day-total">
                                        Total Hours: <span className="highlight-blue">{getDayTotalDuration(dayGroup.sessions)}</span>
                                        &nbsp;&nbsp;|&nbsp;&nbsp; Taps: {dayGroup.sessions.length}
                                    </p>
                                </div>

                                <ul className="session-list">
                                    {dayGroup.sessions.map((session) => {
                                        const isGoodSession = evaluateSession(session.tapInTime, session.tapOutTime);

                                        return (
                                            <li key={session._id} className={`session-card ${isGoodSession ? 'session-good' : 'session-bad'}`}>

                                                <div className="time-data">
                                                    <p className="time-text">
                                                        <strong>Tap In:</strong> {formatTime(session.tapInTime)}
                                                        &nbsp;&nbsp;➔&nbsp;&nbsp;
                                                        <strong>Tap Out:</strong> {formatTime(session.tapOutTime)}
                                                    </p>
                                                    <p className="duration-text">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                        Session Duration: {getDurationString(session.tapInTime, session.tapOutTime)}
                                                    </p>
                                                </div>

                                                <div className={`badge ${isGoodSession ? 'badge-good' : 'badge-bad'}`}>
                                                    {isGoodSession ? 'Shift Rules Met' : 'Shift Rules Missed'}
                                                </div>

                                            </li>
                                        );
                                    })}
                                </ul>

                            </div>
                        ))
                    )}

                </div>
            </div>
        </>
    );
};

export default EmployeeDetailedDaysReport;