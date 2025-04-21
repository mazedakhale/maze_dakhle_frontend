import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const USER_API_BASE = 'https://mazedakhale.in/api/users';
const PASSWORD_API = `${USER_API_BASE}/password`;

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [passMode, setPassMode] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formValues, setFormValues] = useState({
        phone: '',
        address: '',
        shopAddress: '',
        district: '',
        taluka: '',
        documents: []
    });

    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/Login');
        let decoded;
        try { decoded = jwtDecode(token); }
        catch {
            localStorage.removeItem('token');
            return navigate('/Login');
        }

        axios.get(`${USER_API_BASE}/${decoded.user_id}`)
            .then(({ data }) => {
                setUser(data);
                setFormValues({
                    phone: data.phone || '',
                    address: data.address || '',
                    shopAddress: data.shop_address || '',
                    district: data.district || '',
                    taluka: data.taluka || '',
                    documents: (data.user_documents || []).map(doc => ({
                        document_type: doc.document_type,
                        existingPath: doc.file_path,
                        file: null
                    }))
                });
            })
            .catch(err => {
                console.error(err);
                Swal.fire('Error', 'Could not load profile', 'error');
            });
    }, [navigate]);

    if (!user) return <div className="flex justify-center min-h-screen">Loading…</div>;

    const savePassword = async () => {
        if (!newPass) return Swal.fire('Warning', 'Enter a password', 'warning');
        try {
            await axios.patch(`${PASSWORD_API}/${user.user_id}`, { newPassword: newPass });
            setUser(u => ({ ...u, password: newPass }));
            setPassMode(false);
            setNewPass('');
            setShowPass(false);
            Swal.fire('Success', 'Password updated', 'success');
        } catch {
            Swal.fire('Error', 'Failed to update password', 'error');
        }
    };

    const saveProfile = async () => {
        const fd = new FormData(formRef.current);
        try {
            const { data } = await axios.put(`${USER_API_BASE}/update/${user.user_id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updated = data.user;
            setUser(updated);
            setEditMode(false);
            setFormValues(fv => ({
                ...fv,
                documents: fv.documents.map(d => {
                    const saved = (updated.user_documents || []).find(x => x.document_type === d.document_type);
                    return { ...d, existingPath: saved ? saved.file_path : d.existingPath, file: null };
                })
            }));
            Swal.fire('Success', 'Profile updated', 'success');
        } catch (err) {
            console.error('Update failed', err);
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    const requestProfileEdit = async () => {
        try {
            await axios.post(`${USER_API_BASE}/request-edit/${user.user_id}`);
            Swal.fire('Requested!', 'Your edit request has been sent to admin.', 'success');
            setUser(u => ({ ...u, edit_request_status: 'Pending' }));
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to send request', 'error');
        }
    };

    const Row = ({ label, value, name, editable }) => (
        <div className="mb-2 flex items-center">
            <span className="w-32 font-semibold">{label}:</span>
            {editMode && editable
                ? <input name={name} className="border p-1 rounded flex-1" value={formValues[name]} onChange={e => setFormValues(fv => ({ ...fv, [name]: e.target.value }))} />
                : <span className="flex-1">{value || '—'}</span>}
        </div>
    );

    const canEdit = user.edit_request_status === 'Approved';

    return (
        <div className="ml-[20%] flex justify-center items-start min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white p-6 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">My Profile</h1>

                {/* Password Section */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">Password:</span>
                        {passMode ? (
                            <input type={showPass ? 'text' : 'password'} className="border p-1 rounded w-48" value={newPass} onChange={e => setNewPass(e.target.value)} />
                        ) : (
                            <span>{showPass ? user.password : '•'.repeat(8)}</span>
                        )}
                        <button className="ml-2 text-gray-600" onClick={() => setShowPass(s => !s)}>
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {passMode ? (
                        <>
                            <button onClick={savePassword} className="text-green-600 mr-2"><FaSave /> Save</button>
                            <button onClick={() => { setPassMode(false); setNewPass(''); setShowPass(false); }} className="text-red-600"><FaTimes /> Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setPassMode(true)} className="text-blue-600"><FaEdit /> Edit Password</button>
                    )}
                </div>

                {/* Edit Request Status */}
                {user.edit_request_status && (
                    <p className="text-sm mb-3 text-center">
                        Edit Request Status: <strong className={user.edit_request_status === 'Approved' ? 'text-green-600' : user.edit_request_status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}>{user.edit_request_status}</strong>
                    </p>
                )}

                {/* Request Edit or Enable Edit Mode */}
                {!editMode && (
                    canEdit ? (
                        <div className="text-center mb-4">
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"><FaEdit /> Edit Profile</button>
                        </div>
                    ) : (
                        <div className="text-center mb-4">
                            <button onClick={requestProfileEdit} disabled={user.edit_request_status === 'Pending'} className={`px-4 py-2 rounded text-white ${user.edit_request_status === 'Pending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                Request Profile Edit
                            </button>
                        </div>
                    )
                )}

                {/* Editable Form */}
                <form ref={formRef}>
                    <Row label="Name" value={user.name} />
                    <Row label="Email" value={user.email} />
                    <Row label="Phone" value={user.phone} name="phone" editable />
                    <Row label="Address" value={user.address} name="address" editable />
                    <Row label="Shop Address" value={user.shop_address} name="shop_address" editable />
                    <Row label="District" value={user.district} name="district" editable />
                    <Row label="Taluka" value={user.taluka} name="taluka" editable />

                    {formValues.documents.map((doc, idx) => (
                        <div key={idx} className="mb-4 flex items-center">
                            <span className="w-32 font-semibold">{doc.document_type}:</span>
                            <input type="hidden" name="documentTypes" value={doc.document_type} />
                            {doc.existingPath ? (
                                <a href={doc.existingPath} target="_blank" rel="noopener noreferrer" className="text-blue-600 mr-4">View</a>
                            ) : (
                                <span className="mr-4">No file</span>
                            )}
                            {editMode && (
                                <input name="files" type="file" onChange={e => {
                                    const f = e.target.files?.[0] || null;
                                    setFormValues(fv => {
                                        const arr = [...fv.documents];
                                        arr[idx] = { ...arr[idx], file: f };
                                        return { ...fv, documents: arr };
                                    });
                                }} />
                            )}
                        </div>
                    ))}

                    {editMode && (
                        <div className="flex justify-center gap-4 mt-4">
                            <button type="button" onClick={saveProfile} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"><FaSave /> Save Profile</button>
                            <button type="button" onClick={() => {
                                setEditMode(false);
                                setFormValues(fv => ({ ...fv, documents: fv.documents.map(d => ({ ...d, file: null })) }));
                            }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"><FaTimes /> Cancel</button>
                        </div>
                    )}
                </form>

                <div className="mt-6">
                    <h2 className="font-semibold mb-2">My Documents</h2>
                    {user.user_documents?.length ? (
                        <ul className="list-disc pl-5">
                            {user.user_documents.map((d, i) => (
                                <li key={i}><strong>{d.document_type}</strong>: <a href={d.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a></li>
                            ))}
                        </ul>
                    ) : (
                        <p>No documents uploaded.</p>
                    )}
                </div>

                <button onClick={() => navigate(-1)} className="mt-6 block mx-auto text-gray-600 hover:underline">Back</button>
            </div>
        </div>
    );
}
