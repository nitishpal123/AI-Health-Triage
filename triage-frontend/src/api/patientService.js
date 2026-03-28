import axios from 'axios';

const API_URL = '/api/patients';

// Helper to get token if using auth
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchPatients = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

export const updatePatientStatus = async ({ id, status }) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, getConfig());
    return response.data;
};

export const updatePatientReport = async ({ id, report }) => {
    const response = await axios.patch(`${API_URL}/${id}/report`, { report }, getConfig());
    return response.data;
};
