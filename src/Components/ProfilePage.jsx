import React, { useEffect, useState } from 'react';
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
        aadharCard: null,
        panCard: null,
        existingAadharPath: '',
        existingPanPath: '',
        errors: { aadharCard: '', panCard: '' },
    });

    const navigate = useNavigate();

    // 1) fetchProfile does your GET + state setup
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/Login');

        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            localStorage.removeItem('token');
            return navigate('/Login');
        }

        try {
            const resp = await axios.get(`${USER_API_BASE}/${decoded.user_id}`);
            // if your API returns { user: { … } }, do resp.data.user instead
            const data = resp.data.user || resp.data;

            setUser(data);

            const docs = data.user_documents || [];
            const aDoc = docs.find(d => d.document_type === 'Aadhar Card');
            const pDoc = docs.find(d => d.document_type === 'PAN Card');

            setFormValues({
                phone: data.phone || '',
                address: data.address || '',
                shopAddress: data.shop_address || '',
                district: data.district || '',
                taluka: data.taluka || '',
                aadharCard: null,
                panCard: null,
                existingAadharPath: aDoc?.file_path || '',
                existingPanPath: pDoc?.file_path || '',
                errors: { aadharCard: '', panCard: '' },
            });
        } catch {
            Swal.fire('Error', 'Could not load profile', 'error');
        }
    };

    // call once on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen">Loading…</div>;
    }

    // password update (unchanged)
    const savePassword = async () => {
        if (!newPass) return Swal.fire('Warning', 'Enter a password', 'warning');
        try {
            await axios.patch(`${PASSWORD_API}/${user.user_id}`, { newPassword: newPass });
            setUser(u => ({ ...u, password: newPass }));
            setPassMode(false); setNewPass(''); setShowPass(false);
            Swal.fire('Success', 'Password updated', 'success');
        } catch {
            Swal.fire('Error', 'Failed to update password', 'error');
        }
    };

    const requestProfileEdit = async () => {
        try {
            await axios.post(`${USER_API_BASE}/request-edit/${user.user_id}`);
            setUser(u => ({ ...u, edit_request_status: 'Pending' }));
            Swal.fire('Requested!', 'Edit request sent.', 'success');
        } catch {
            Swal.fire('Error', 'Request failed', 'error');
        }
    };

    // file inputs
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) {
            return setFormValues(fv => ({
                ...fv,
                errors: { ...fv.errors, [field]: 'Unsupported format.' }
            }));
        }
        if (file.size > 500 * 1024) {
            return setFormValues(fv => ({
                ...fv,
                errors: { ...fv.errors, [field]: 'Max 500KB.' }
            }));
        }
        setFormValues(fv => ({
            ...fv,
            [field]: file,
            errors: { ...fv.errors, [field]: '' }
        }));
    };

    // helper to wrap existing URL in a File
    const fetchAsFile = async url => {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const name = url.split('/').pop();
        return new File([blob], name, { type: blob.type });
    };

    // 2) saveProfile now re-calls fetchProfile on success
    const saveProfile = async () => {
        // require aadhar+pan
        if (!formValues.existingAadharPath && !formValues.aadharCard) {
            return setFormValues(fv => ({
                ...fv,
                errors: { ...fv.errors, aadharCard: 'Aadhar required' }
            }));
        }
        if (!formValues.existingPanPath && !formValues.panCard) {
            return setFormValues(fv => ({
                ...fv,
                errors: { ...fv.errors, panCard: 'PAN required' }
            }));
        }

        const fd = new FormData();
        // scalars
        fd.append('name', user.name);
        fd.append('email', user.email);
        fd.append('phone', formValues.phone);
        fd.append('address', formValues.address);
        fd.append('shop_address', formValues.shopAddress);
        fd.append('district', formValues.district);
        fd.append('taluka', formValues.taluka);
        fd.append('user_login_status', 'Active');

        // Aadhar
        let aFile = formValues.aadharCard;
        if (!aFile && formValues.existingAadharPath) {
            aFile = await fetchAsFile(formValues.existingAadharPath);
        }
        if (aFile) {
            fd.append('files', aFile);
            fd.append('documentTypes', 'Aadhar Card');
        }

        // PAN
        let pFile = formValues.panCard;
        if (!pFile && formValues.existingPanPath) {
            pFile = await fetchAsFile(formValues.existingPanPath);
        }
        if (pFile) {
            fd.append('files', pFile);
            fd.append('documentTypes', 'PAN Card');
        }

        // debug
        for (let [k, v] of fd.entries()) console.log('→', k, v);

        try {
            await axios.put(
                `${USER_API_BASE}/update/${user.user_id}`,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            // re-fetch so UI shows new file URLs immediately
            await fetchProfile();
            setEditMode(false);
            Swal.fire('Success', 'Profile updated', 'success');
        } catch (err) {
            console.error('Server error:', err.response?.data);
            Swal.fire(
                'Error',
                err.response?.data?.message ||
                JSON.stringify(err.response?.data, null, 2),
                'error'
            );
        }
    };

    const canEdit = user.edit_request_status === 'Approved';

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white p-6 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">My Profile</h1>

                {/* Password */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">Password:</span>
                        {passMode ? (
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="border p-1 rounded w-48"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                            />
                        ) : (
                            <span>{showPass ? user.password : '•'.repeat(8)}</span>
                        )}
                        <button onClick={() => setShowPass(s => !s)} className="ml-2 text-gray-600">
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {passMode ? (
                        <>
                            <button onClick={savePassword} className="text-green-600 mr-2">
                                <FaSave /> Save
                            </button>
                            <button
                                onClick={() => { setPassMode(false); setNewPass(''); setShowPass(false) }}
                                className="text-red-600"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setPassMode(true)} className="text-blue-600">
                            <FaEdit /> Edit Password
                        </button>
                    )}
                </div>

                {/* Edit Status */}
                {user.edit_request_status && (
                    <p className="text-sm mb-3 text-center">
                        Edit Status:{' '}
                        <strong className={
                            user.edit_request_status === 'Approved' ? 'text-green-600' :
                                user.edit_request_status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'
                        }>
                            {user.edit_request_status}
                        </strong>
                    </p>
                )}

                {/* Edit / Request */}
                {!editMode && (
                    <div className="text-center mb-4">
                        {canEdit ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-2 bg-orange-500 text-white rounded"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={requestProfileEdit}
                                disabled={user.edit_request_status === 'Pending'}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Request Edit
                            </button>
                        )}
                    </div>
                )}

                {/* Fields */}
                <div>
                    {/* Name & Email */}
                    <div className="mb-2 flex items-center">
                        <span className="w-32 font-semibold">Name:</span>
                        <span className="flex-1">{user.name}</span>
                    </div>
                    <div className="mb-2 flex items-center">
                        <span className="w-32 font-semibold">Email:</span>
                        <span className="flex-1">{user.email}</span>
                    </div>

                    {/* phone, address, shopAddress, district, taluka */}
                    {['phone', 'address', 'shopAddress', 'district', 'taluka'].map(f => (
                        <div key={f} className="mb-2 flex items-center">
                            <span className="w-32 font-semibold">
                                {f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                            </span>
                            {editMode ? (
                                <input
                                    className="border p-1 rounded flex-1"
                                    value={formValues[f]}
                                    onChange={e =>
                                        setFormValues(v => ({ ...v, [f]: e.target.value }))
                                    }
                                />
                            ) : (
                                <span className="flex-1">
                                    {f === 'shopAddress' ? user.shop_address || '—' : user[f] || '—'}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Aadhar */}
                    <div className="mb-4 flex items-center">
                        <span className="w-32 font-semibold">Aadhar Card:</span>
                        {formValues.existingAadharPath ? (
                            <a
                                href={formValues.existingAadharPath}
                                target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 mr-4"
                            >
                                View
                            </a>
                        ) : <span className="mr-4">No file</span>}
                        {editMode && (
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileChange(e, 'aadharCard')}
                            />
                        )}
                        {formValues.errors.aadharCard && (
                            <p className="text-red-500 text-xs">
                                {formValues.errors.aadharCard}
                            </p>
                        )}
                    </div>

                    {/* PAN */}
                    <div className="mb-4 flex items-center">
                        <span className="w-32 font-semibold">PAN Card:</span>
                        {formValues.existingPanPath ? (
                            <a
                                href={formValues.existingPanPath}
                                target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 mr-4"
                            >
                                View
                            </a>
                        ) : <span className="mr-4">No file</span>}
                        {editMode && (
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileChange(e, 'panCard')}
                            />
                        )}
                        {formValues.errors.panCard && (
                            <p className="text-red-500 text-xs">
                                {formValues.errors.panCard}
                            </p>
                        )}
                    </div>

                    {/* Save / Cancel */}
                    {editMode && (
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={saveProfile}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                <FaSave /> Save Profile
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 block mx-auto text-gray-600 hover:underline"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
