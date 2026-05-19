let envUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
if (envUrl && !envUrl.endsWith('/api')) {
    envUrl = envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
}
const API_URL = envUrl;
let currentUser = null;

const readResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : {};
};

const apiFetch = async (path, options) => {
    try {
        const response = await fetch(`${API_URL}${path}`, options);
        const data = await readResponse(response);
        return { response, data };
    } catch (error) {
        console.error('Erreur reseau API:', error);
        throw new Error("Impossible de contacter le serveur. Vérifiez que l'API est déployée et que les variables d'environnement sont configurées.");
    }
};

const notifyAuthChange = () => {
    window.dispatchEvent(new Event('auth-changed'));
};

export const hasAuthToken = () => Boolean(localStorage.getItem('token'));

export const registerUser = async (userData) => {
    const isFormData = userData instanceof FormData;
    const options = {
        method: 'POST',
        body: isFormData ? userData : JSON.stringify(userData)
    };
    if (!isFormData) {
        options.headers = { 'Content-Type': 'application/json' };
    }
    
    const { response, data } = await apiFetch('/auth/register', options);
    if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");
    return data;
};

export const loginUser = async (credentials) => {
    const { response, data } = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error(data.message || "Erreur de connexion");
    
    // Le navigateur conserve uniquement le token. Le role est relu depuis l'API.
    localStorage.removeItem('user');
    localStorage.setItem('token', data.token);
    currentUser = data.user || await getProfile();
    notifyAuthChange();
    return { ...data, user: currentUser };
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    notifyAuthChange();
};

export const getCurrentUser = () => {
    return currentUser;
};

export const loadCurrentUser = async () => {
    if (!hasAuthToken()) {
        currentUser = null;
        return null;
    }

    try {
        currentUser = await getProfile();
        notifyAuthChange();
        return currentUser;
    } catch (error) {
        logoutUser();
        throw error;
    }
};

export const getTeachers = async () => {
    const { response, data } = await apiFetch('/teachers');
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
    const { response, data } = await apiFetch('/contracts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contractData)
    });
    if (!response.ok) throw new Error(data.message || "Erreur lors de la réservation");
    return data;
};

export const getContracts = async () => {
    const { response, data } = await apiFetch('/contracts', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur récupération des contrats");
    return data;
};

export const updateContractStatus = async (contractId, status) => {
    const { response, data } = await apiFetch(`/contracts/${contractId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error(data.message || "Erreur de mise à jour");
    return data;
};

export const rateContract = async (contractId, rating) => {
    const { response, data } = await apiFetch(`/contracts/${contractId}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating })
    });
    if (!response.ok) throw new Error(data.message || "Erreur lors de la notation");
    return data;
};

export const updateProfile = async (profileData) => {
    const isFormData = profileData instanceof FormData;
    const headers = isFormData
        ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        : getAuthHeaders();

    const { response, data } = await apiFetch('/users/profile', {
        method: 'PUT',
        headers,
        body: isFormData ? profileData : JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error(data.message || "Erreur de mise à jour du profil");
    return data;
};

export const getAllAdminContracts = async () => {
    const { response, data } = await apiFetch('/admin/contracts', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getAdminUsers = async () => {
    const { response, data } = await apiFetch('/admin/users', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const deleteAdminUser = async (id) => {
    const { response, data } = await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const deleteContractByAdmin = async (id, motive) => {
    const { response, data } = await apiFetch(`/admin/contracts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ motive })
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getPlatformReviews = async () => {
    const { response, data } = await apiFetch('/platform-reviews');
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const addPlatformReview = async (reviewData) => {
    const { response, data } = await apiFetch('/platform-reviews', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const deletePlatformReviewAdmin = async (id) => {
    const { response, data } = await apiFetch(`/admin/platform-reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getUserNotifications = async () => {
    const { response, data } = await apiFetch('/users/notifications', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const deleteNotification = async (notifId) => {
    const { response, data } = await apiFetch(`/users/notifications/${notifId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getProfile = async () => {
    const { response, data } = await apiFetch('/users/profile', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur récupération du profil");
    return data;
};

export const getTeacherById = async (id) => {
    const { response, data } = await apiFetch(`/teachers/${id}`);
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getTeacherReviews = async (teacherId) => {
    const { response, data } = await apiFetch(`/teachers/${teacherId}/reviews`);
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const addReview = async (teacherId, reviewData) => {
    const { response, data } = await apiFetch(`/teachers/${teacherId}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const checkContractStatus = async (teacherId) => {
    const { response, data } = await apiFetch(`/contracts/check/${teacherId}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

// --- MESSAGERIE ---
export const getContacts = async () => {
    const { response, data } = await apiFetch('/messages/contacts', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getMessages = async (userId) => {
    const { response, data } = await apiFetch(`/messages/${userId}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const sendMessage = async (receiverId, content) => {
    const { response, data } = await apiFetch('/messages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ receiverId, content })
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const getUnreadCount = async () => {
    const { response, data } = await apiFetch('/messages/unread', {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};

export const sendGlobalMessageAdmin = async (message) => {
    const { response, data } = await apiFetch('/admin/global-message', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error(data.message || "Erreur");
    return data;
};
