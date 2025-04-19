// src/Components/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaEdit } from 'react-icons/fa';

const USERS_API = 'https://mazedakhale.in/api/users/register';
const PASSWORD_API = 'https://mazedakhale.in/api/users/password';
const PROFILE_REQUEST_API = 'https://mazedakhale.in/api/users/request-edit-profile';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [passMode, setPassMode] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    // Load profile
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/Login');
        let decoded;
        try { decoded = jwtDecode(token); }
        catch {
            localStorage.removeItem('token');
            return navigate('/Login');
        }
        (async () => {
            try {
                const { data } = await axios.get(USERS_API);
                const me = data.find(u => u.user_id === decoded.user_id);
                if (!me) throw new Error('Not found');
                setUser(me);
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Could not load profile', 'error');
            }
        })();
    }, [navigate]);

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Loading…</div>;
    }

    // Save new password
    const savePassword = async () => {
        if (!newPass) return Swal.fire('Warning', 'Enter a password', 'warning');
        try {
            await axios.patch(`${PASSWORD_API}/${user.user_id}`, { newPassword: newPass });
            setUser(u => ({ ...u, password: newPass }));
            setPassMode(false);
            setNewPass('');
            Swal.fire('Success', 'Password updated', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to update password', 'error');
        }
    };

    // Request profile edit
    const requestProfileEdit = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Request Profile Edit',
            html:
                `<input id="swal-phone" class="swal2-input" placeholder="Phone" value="${user.phone || ''}">` +
                `<input id="swal-address" class="swal2-input" placeholder="Address" value="${user.address || ''}">` +
                `<input id="swal-shop" class="swal2-input" placeholder="Shop Address" value="${user.shop_address || ''}">` +
                `<input id="swal-district" class="swal2-input" placeholder="District" value="${user.district || ''}">` +
                `<input id="swal-taluka" class="swal2-input" placeholder="Taluka" value="${user.taluka || ''}">`,
            focusConfirm: false,
            preConfirm: () => ({
                phone: document.getElementById('swal-phone').value,
                address: document.getElementById('swal-address').value,
                shop_address: document.getElementById('swal-shop').value,
                district: document.getElementById('swal-district').value,
                taluka: document.getElementById('swal-taluka').value,
            }),
            showCancelButton: true,
        });

        if (formValues) {
            try {
                await axios.post(PROFILE_REQUEST_API, {
                    user_id: user.user_id,
                    requestedChanges: formValues,
                });
                Swal.fire('Requested', 'Your changes have been sent to the admin.', 'success');
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to send request', 'error');
            }
        }
    };

    const {
        name, email, password,
        phone, address, shop_address,
        role, user_login_status, created_at,
        district, taluka, user_documents,
    } = user;

    return (
        <div className="ml-[20%] flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">My Profile</h1>

                {/* Password Row */}
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <span className="font-semibold">Password:</span>{' '}
                        {passMode
                            ? <input
                                type={showPass ? 'text' : 'password'}
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                className="border p-1 rounded"
                            />
                            : <span>{showPass ? password : '•'.repeat(8)}</span>
                        }
                        <button
                            onClick={() => setShowPass(v => !v)}
                            className="ml-2 text-gray-600"
                        >
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {passMode
                        ? <>
                            <button onClick={savePassword} className="text-green-600 mr-2"><FaEdit /> Save</button>
                            <button onClick={() => { setPassMode(false); setNewPass(''); setShowPass(false); }} className="text-red-600">Cancel</button>
                        </>
                        : <button onClick={() => setPassMode(true)} className="text-blue-600"><FaEdit /> Edit Password</button>
                    }
                </div>

                {/* Static Profile Fields */}
                {[
                    ['Name', name],
                    ['Email', email],
                    ['Phone', phone || '—'],
                    ['Address', address || '—'],
                    ['Shop Address', shop_address || '—'],
                    ['Role', role],
                    ['Login Status', user_login_status],
                    ['Joined On', new Date(created_at).toLocaleDateString()],
                    ['District', district || '—'],
                    ['Taluka', taluka || '—'],
                ].map(([label, val]) => (
                    <div key={label} className="mb-2">
                        <span className="font-semibold">{label}:</span> {val}
                    </div>
                ))}

                {/* Request Edit Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={requestProfileEdit}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        Request Profile Edit
                    </button>
                </div>

                {/* Documents */}
                <div className="mt-6">
                    <h2 className="font-semibold mb-2">My Documents</h2>
                    {Array.isArray(user_documents) && user_documents.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {user_documents.map((d, i) => (
                                <li key={i}>
                                    <strong>{d.document_type}</strong>:{' '}
                                    <a href={d.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        View File
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No documents uploaded.</p>}
                </div>

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
