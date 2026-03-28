import axios from 'axios';

const API_URL = '/api/patients';
const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const fetchPatients = async () => (await axios.get(API_URL, getConfig())).data;
export const fetchMyRecord = async () => (await axios.get(`${API_URL}/my`, getConfig())).data;
export const fetchDepartments = async () => (await axios.get(`${API_URL}/departments`, getConfig())).data;
export const fetchLabs = async () => (await axios.get(`${API_URL}/labs`, getConfig())).data;

export const updatePatientStatus = async ({ id, status }) =>
    (await axios.patch(`${API_URL}/${id}/status`, { status }, getConfig())).data;

export const updateLabStatus = async ({ id, testStatus }) =>
    (await axios.patch(`${API_URL}/${id}/lab-status`, { testStatus }, getConfig())).data;

export const updatePatientReport = async ({ id, report }) =>
    (await axios.patch(`${API_URL}/${id}/report`, { report }, getConfig())).data;
