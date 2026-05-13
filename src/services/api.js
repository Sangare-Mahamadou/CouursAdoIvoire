let envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (envUrl && !envUrl.endsWith('/api')) {
    envUrl = envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
}
const API_URL = envUrl;

export const registerUser = async (userData) => {
    const isFormData = userData instanceof FormData;
    const options = {
        method: 'POST',
        body: isFormData ? userData : JSON.stringify(userData)
    };
    if (!isFormData) {
        options.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await fetch(`${API_URL}/auth/register`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");
    return data;
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur de connexion");
    
    // Sauvegarde en session locale
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

export const getTeachers = async () => {
    const response = await fetch(`${API_URL}/teachers`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur lors de la récupération des enseignants");
    return data;
};

// --- SERVICES AUTHENTIFIES ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const createContract = async (contractData) => {
    const response = await fetch(`${API_URL}/contracts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contractData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur lors de la réservation");
    return data;
};

export const getContracts = async () => {
    const response = await fetch(`${API_URL}/contracts`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur récupération des contrats");
    return data;
};

export const updateContractStatus = async (contractId, status) => {
    const response = await fetch(`${API_URL}/contracts/${contractId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur de mise à jour");
    return data;
};

export const rateContract = async (contractId, rating) => {
    const response = await fetch(`${API_URL}/contracts/${contractId}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur lors de la notation");
    return data;
};

export const updateProfile = async (profileData) => {
    const isFormData = profileData instanceof FormData;
    const headers = isFormData
        ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        : getAuthHeaders();

    const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers,
        body: isFormData ? profileData : JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur de mise à jour du profil");
    return data;
};

export const getAllAdminContracts = async () => {
    const response = await fetch(`${API_URL}/admin/contracts`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const deleteContractByAdmin = async (id) => {
    const response = await fetch(`${API_URL}/admin/contracts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getProfile = async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur récupération du profil");
    return data;
};

export const getTeacherById = async (id) => {
    const response = await fetch(`${API_URL}/teachers/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getTeacherReviews = async (teacherId) => {
    const response = await fetch(`${API_URL}/teachers/${teacherId}/reviews`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const addReview = async (teacherId, reviewData) => {
    const response = await fetch(`${API_URL}/teachers/${teacherId}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};
