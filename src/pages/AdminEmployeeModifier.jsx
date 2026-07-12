// frontend/src/pages/AdminEmployeeModifier.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEmployeeModifier = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Edit State
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [message, setMessage] = useState('');

    // Form State (Same 60+ fields as Creator)
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', empId: '', title: '', firstName: '', middleName: '', lastName: '',
        workEmail: '', gender: '', dateOfBirth: '', maritalStatus: '', marriageDate: '', fatherHusbandName: '',
        startDate: '', reportsTo: '', reportsToEffectiveDate: '', jobRole: '', grade: '', jobRoleEffectiveDate: '',
        jobRoleReason: '', company: '', companyEffectiveDate: '', location: '', locationEffectiveDate: '',
        department: '', departmentEffectiveDate: '', aadharNumber: '', nameAsPerAadhar: '', panNumber: '',
        nameAsPerPan: '', nationality: '', employmentType: '', employmentTypeEffectiveDate: '', annualLeaveEntitlement: '',
        earnedLeaveBalanceThisYear: '', earnedLeaveAddedNextYear: '', entitlementType: '', currentAddressLine1: '',
        currentAddressLine2: '', currentAddressLine3: '', currentState: '', currentCountry: '', currentPostCode: '',
        permanentAddressLine1: '', permanentAddressLine2: '', permanentAddressLine3: '', permanentState: '',
        permanentCountry: '', permanentPostCode: '', personalPhoneNumber: '', leavingDate: '', leaveReason: '',
        probationEndDate: '', noticePeriod: '', workPhone: '', personalEmail: '', mobile: '', nextReviewDate: '',
        fixedTermEndDate: '', biometricId: '', workPatternName: '', effectiveDate: '', currentWeek: ''
    });

    // Fetch all employees on page load
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('https://erp-backend-421d.onrender.com/api/admin/employees');
            if (response.ok) {
                const data = await response.json();
                // Filter out HR admins if you only want to show employees, or leave as is to show everyone.
                setEmployees(data.filter(emp => emp.role === 'employee'));
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        // Strict browser confirmation to prevent accidental clicks
        if (!window.confirm(`⚠️ CRITICAL WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete the account for "${name}"?\n\nThis will destroy their login credentials, biometric vault data, and all ledger history.`)) {
            return;
        }

        try {
            const response = await fetch(`https://erp-backend-421d.onrender.com/api/admin/employees/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Remove from UI instantly without needing a page refresh
                setEmployees(employees.filter(emp => emp._id !== id));
            } else {
                alert("Failed to delete employee.");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const handleEditClick = (emp) => {
        setMessage('');
        setActiveSection(null);
        setEditingEmployee(emp);

        // Pre-fill the form with the employee's existing data. 
        // Password is set to empty intentionally so it doesn't overwrite unless typed.
        setFormData({
            name: emp.name || '', email: emp.email || '', password: '',
            empId: emp.empId || '', title: emp.title || '', firstName: emp.firstName || '',
            middleName: emp.middleName || '', lastName: emp.lastName || '', workEmail: emp.workEmail || '',
            gender: emp.gender || '', dateOfBirth: emp.dateOfBirth || '', maritalStatus: emp.maritalStatus || '',
            marriageDate: emp.marriageDate || '', fatherHusbandName: emp.fatherHusbandName || '',
            startDate: emp.startDate || '', reportsTo: emp.reportsTo || '', reportsToEffectiveDate: emp.reportsToEffectiveDate || '',
            jobRole: emp.jobRole || '', grade: emp.grade || '', jobRoleEffectiveDate: emp.jobRoleEffectiveDate || '',
            jobRoleReason: emp.jobRoleReason || '', company: emp.company || '', companyEffectiveDate: emp.companyEffectiveDate || '',
            location: emp.location || '', locationEffectiveDate: emp.locationEffectiveDate || '', department: emp.department || '',
            departmentEffectiveDate: emp.departmentEffectiveDate || '', aadharNumber: emp.aadharNumber || '',
            nameAsPerAadhar: emp.nameAsPerAadhar || '', panNumber: emp.panNumber || '', nameAsPerPan: emp.nameAsPerPan || '',
            nationality: emp.nationality || '', employmentType: emp.employmentType || '', employmentTypeEffectiveDate: emp.employmentTypeEffectiveDate || '',
            annualLeaveEntitlement: emp.annualLeaveEntitlement || '', earnedLeaveBalanceThisYear: emp.earnedLeaveBalanceThisYear || '',
            earnedLeaveAddedNextYear: emp.earnedLeaveAddedNextYear || '', entitlementType: emp.entitlementType || '',
            currentAddressLine1: emp.currentAddressLine1 || '', currentAddressLine2: emp.currentAddressLine2 || '',
            currentAddressLine3: emp.currentAddressLine3 || '', currentState: emp.currentState || '',
            currentCountry: emp.currentCountry || '', currentPostCode: emp.currentPostCode || '',
            permanentAddressLine1: emp.permanentAddressLine1 || '', permanentAddressLine2: emp.permanentAddressLine2 || '',
            permanentAddressLine3: emp.permanentAddressLine3 || '', permanentState: emp.permanentState || '',
            permanentCountry: emp.permanentCountry || '', permanentPostCode: emp.permanentPostCode || '',
            personalPhoneNumber: emp.personalPhoneNumber || '', leavingDate: emp.leavingDate || '',
            leaveReason: emp.leaveReason || '', probationEndDate: emp.probationEndDate || '',
            noticePeriod: emp.noticePeriod || '', workPhone: emp.workPhone || '', personalEmail: emp.personalEmail || '',
            mobile: emp.mobile || '', nextReviewDate: emp.nextReviewDate || '', fixedTermEndDate: emp.fixedTermEndDate || '',
            biometricId: emp.biometricId || '', workPatternName: emp.workPatternName || '', effectiveDate: emp.effectiveDate || '',
            currentWeek: emp.currentWeek || ''
        });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('Saving changes...');

        try {
            const response = await fetch(`https://erp-backend-421d.onrender.com/api/admin/employees/${editingEmployee._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('');
                setEditingEmployee(null);
                fetchEmployees(); // Refresh the list
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessage('Server error. Could not connect.');
        }
    };

    // --- ACCORDION CONFIGURATION ---
    const accordionSections = [
        {
            title: "Personal & Contact Information", id: "personal",
            fields: [
                { label: 'Employee ID', name: 'empId' }, { label: 'Title', name: 'title' },
                { label: 'First Name', name: 'firstName' }, { label: 'Middle Name', name: 'middleName' },
                { label: 'Last Name', name: 'lastName' }, { label: 'Gender', name: 'gender' },
                { label: 'Date of Birth (YYYY-MM-DD)', name: 'dateOfBirth', type: 'date' }, { label: 'Nationality', name: 'nationality' },
                { label: 'Marital Status', name: 'maritalStatus' }, { label: 'Marriage Date', name: 'marriageDate', type: 'date' },
                { label: 'Father/Husband Name', name: 'fatherHusbandName' }, { label: 'Work Email', name: 'workEmail' },
                { label: 'Personal Email', name: 'personalEmail' }, { label: 'Work Phone', name: 'workPhone' },
                { label: 'Personal Phone', name: 'personalPhoneNumber' }, { label: 'Mobile', name: 'mobile' }
            ]
        },
        {
            title: "Identity & Verification", id: "identity",
            fields: [
                { label: 'Aadhar Number', name: 'aadharNumber' }, { label: 'Name as per Aadhar', name: 'nameAsPerAadhar' },
                { label: 'PAN Number', name: 'panNumber' }, { label: 'Name as per PAN', name: 'nameAsPerPan' }
            ]
        },
        {
            title: "Employment Details", id: "employment",
            fields: [
                { label: 'Start Date', name: 'startDate', type: 'date' }, { label: 'Company', name: 'company' },
                { label: 'Company Effective Date', name: 'companyEffectiveDate', type: 'date' }, { label: 'Department', name: 'department' },
                { label: 'Department Effective Date', name: 'departmentEffectiveDate', type: 'date' }, { label: 'Job Role', name: 'jobRole' },
                { label: 'Grade', name: 'grade' }, { label: 'Job Role Effective Date', name: 'jobRoleEffectiveDate', type: 'date' },
                { label: 'Job Role Reason', name: 'jobRoleReason' }, { label: 'Reports To', name: 'reportsTo' },
                { label: 'Reports To Effective Date', name: 'reportsToEffectiveDate', type: 'date' }, { label: 'Location', name: 'location' },
                { label: 'Location Effective Date', name: 'locationEffectiveDate', type: 'date' }, { label: 'Employment Type', name: 'employmentType' },
                { label: 'Employment Type Effective Date', name: 'employmentTypeEffectiveDate', type: 'date' }, { label: 'Probation End Date', name: 'probationEndDate', type: 'date' },
                { label: 'Notice Period', name: 'noticePeriod' }, { label: 'Fixed Term End Date', name: 'fixedTermEndDate', type: 'date' },
                { label: 'Next Review Date', name: 'nextReviewDate', type: 'date' }, { label: 'Leaving Date', name: 'leavingDate', type: 'date' },
                { label: 'Leave Reason', name: 'leaveReason' }
            ]
        },
        {
            title: "Leave & Attendance Settings", id: "leave",
            fields: [
                { label: 'Annual Leave Entitlement', name: 'annualLeaveEntitlement' }, { label: 'Earned Leave This Year', name: 'earnedLeaveBalanceThisYear' },
                { label: 'Earned Leave Next Year', name: 'earnedLeaveAddedNextYear' }, { label: 'Entitlement Type', name: 'entitlementType' },
                { label: 'Biometric ID', name: 'biometricId' }, { label: 'Work Pattern Name', name: 'workPatternName' },
                { label: 'Effective Date', name: 'effectiveDate', type: 'date' }, { label: 'Current Week', name: 'currentWeek' }
            ]
        },
        {
            title: "Address Information", id: "address",
            fields: [
                { label: 'Current Address 1', name: 'currentAddressLine1' }, { label: 'Current Address 2', name: 'currentAddressLine2' },
                { label: 'Current Address 3', name: 'currentAddressLine3' }, { label: 'Current State', name: 'currentState' },
                { label: 'Current Country', name: 'currentCountry' }, { label: 'Current PostCode', name: 'currentPostCode' },
                { label: 'Permanent Address 1', name: 'permanentAddressLine1' }, { label: 'Permanent Address 2', name: 'permanentAddressLine2' },
                { label: 'Permanent Address 3', name: 'permanentAddressLine3' }, { label: 'Permanent State', name: 'permanentState' },
                { label: 'Permanent Country', name: 'permanentCountry' }, { label: 'Permanent PostCode', name: 'permanentPostCode' }
            ]
        }
    ];

    const renderFields = (fields) => (
        <div className="grid-form">
            {fields.map(f => (
                <div key={f.name} className="input-group">
                    <label>{f.label}</label>
                    <input className="glass-input" type={f.type || 'text'} name={f.name} value={formData[f.name]} onChange={handleInputChange} />
                </div>
            ))}
        </div>
    );

    return (
        <>
            <style>
                {`
          body, html { margin: 0; padding: 0; width: 100%; min-height: 100vh; background-color: #0d1117; }
          .page-wrapper { min-height: 100vh; width: 100vw; background-color: #0d1117; background-image: radial-gradient(circle at 15% 20%, rgba(0, 82, 204, 0.15) 0%, transparent 25%), radial-gradient(circle at 85% 80%, rgba(38, 132, 255, 0.15) 0%, transparent 25%); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #c9d1d9; display: flex; flex-direction: column; align-items: center; padding: 2rem; box-sizing: border-box; }
          
          .glass-card { background: rgba(22, 27, 34, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2rem; width: 100%; max-width: 900px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
          
          .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; text-decoration: none; display: inline-block; }
          .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }
          
          .list-container { display: flex; flex-direction: column; gap: 10px; margin-top: 1.5rem; }
          .list-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; transition: background 0.2s; }
          .list-item:hover { background: rgba(255,255,255,0.06); }
          .item-info h4 { margin: 0 0 5px 0; color: #ffffff; font-size: 1.1rem; }
          .item-info p { margin: 0; color: #8b949e; font-size: 0.9rem; }
          
          .actions { display: flex; gap: 10px; }
          .btn-edit { background: #0052CC; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
          .btn-edit:hover { background: #2684FF; box-shadow: 0 4px 10px rgba(38, 132, 255, 0.3); }
          .btn-delete { background: transparent; color: #f85149; border: 1px solid rgba(248, 81, 73, 0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
          .btn-delete:hover { background: rgba(248, 81, 73, 0.1); border-color: #f85149; }

          /* Overlay Modal */
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(13, 17, 23, 0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: flex-start; z-index: 1000; overflow-y: auto; padding: 2rem; box-sizing: border-box; }
          .modal-content { background: rgba(22, 27, 34, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; width: 100%; max-width: 800px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); margin: auto; }
          
          .section-title { font-size: 1.2rem; color: #ffffff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; }
          @media (max-width: 600px) { .grid-form { grid-template-columns: 1fr; } .list-item { flex-direction: column; align-items: flex-start; gap: 15px; } .actions { width: 100%; justify-content: space-between; } .actions button { flex: 1; } }
          
          .input-group { display: flex; flex-direction: column; gap: 5px; }
          .input-group label { font-size: 0.85rem; color: #8b949e; font-weight: 500; }
          
          .glass-input { width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #ffffff; font-size: 0.95rem; font-family: inherit; box-sizing: border-box; transition: all 0.2s ease; }
          .glass-input:focus { outline: none; border-color: #0052CC; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.25); }
          
          .accordion-item { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 1rem; background: rgba(0,0,0,0.1); overflow: hidden; }
          .accordion-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); transition: background 0.2s; font-weight: 600; color: #e6edf3; user-select: none; }
          .accordion-header:hover { background: rgba(255,255,255,0.05); }
          .accordion-body { padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
          
          .btn-primary { width: 100%; padding: 15px; font-size: 1.1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background-color: #3fb950; color: white; border: none; margin-top: 1rem; }
          .btn-primary:hover { background-color: #2ea043; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(46, 160, 67, 0.4); }
        `}
            </style>

            <div className="page-wrapper">
                <h2 style={{ color: '#ffffff', marginBottom: '2rem' }}>Employee Directory & Modifier</h2>

                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#e6edf3' }}>Active Roster</h3>
                        <button className="btn-secondary" onClick={() => navigate('/admin/create-accounts')}>
                            + Add New Account
                        </button>
                    </div>

                    {loading ? (
                        <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem' }}>Loading database records...</p>
                    ) : employees.length === 0 ? (
                        <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem' }}>No employees found in the system.</p>
                    ) : (
                        <div className="list-container">
                            {employees.map((emp) => (
                                <div key={emp._id} className="list-item">
                                    <div className="item-info">
                                        <h4>{emp.name}</h4>
                                        <p>{emp.email} | {emp.department || 'Unassigned Dept'}</p>
                                    </div>
                                    <div className="actions">
                                        <button className="btn-edit" onClick={() => handleEditClick(emp)}>Edit Record</button>
                                        <button className="btn-delete" onClick={() => handleDelete(emp._id, emp.name)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="btn-secondary" style={{ marginTop: '2rem', border: 'none' }} onClick={() => navigate('/admin')}>
                    ← Return to Command Center
                </button>
            </div>

            {/* EDIT MODAL */}
            {editingEmployee && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, color: '#ffffff' }}>Modifying: {editingEmployee.name}</h2>
                            <button onClick={() => setEditingEmployee(null)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <h3 className="section-title">Core Credentials</h3>
                            <div className="grid-form">
                                <div className="input-group">
                                    <label>Display Name</label>
                                    <input className="glass-input" type="text" name="name" required value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="input-group">
                                    <label>Login Email</label>
                                    <input className="glass-input" type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="input-group">
                                    <label>Update Password (Leave blank to keep current)</label>
                                    <input className="glass-input" type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" />
                                </div>
                            </div>

                            <h3 className="section-title" style={{ marginTop: '2rem' }}>Extended Profile Data</h3>
                            {accordionSections.map((section) => (
                                <div key={section.id} className="accordion-item">
                                    <div className="accordion-header" onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
                                        {section.title}
                                        <span>{activeSection === section.id ? '▲' : '▼'}</span>
                                    </div>
                                    {activeSection === section.id && (
                                        <div className="accordion-body">
                                            {renderFields(section.fields)}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {message && (
                                <div style={{ padding: '10px', marginTop: '1rem', color: '#58a6ff', textAlign: 'center', fontWeight: 'bold' }}>
                                    {message}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                                <button type="submit" className="btn-primary">Save Changes to Vault</button>
                                <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }} onClick={() => setEditingEmployee(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminEmployeeModifier;