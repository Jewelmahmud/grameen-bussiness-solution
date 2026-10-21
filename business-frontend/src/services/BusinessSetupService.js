import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const baseUrl = getApiBaseUrl();

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const BusinessSetupService = {
  // Get business types
  getBusinessTypes: async () => {
    const response = await axios.get(`${baseUrl}/business-types`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Get locations
  getCountries: async () => {
    const response = await axios.get(`${baseUrl}/locations/countries`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getDivisions: async (country = 'Bangladesh') => {
    const response = await axios.get(`${baseUrl}/locations/divisions`, {
      params: { country: country },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getDistricts: async (divisionUuid) => {
    const response = await axios.get(`${baseUrl}/locations/districts`, {
      params: { division_uuid: divisionUuid },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUpazilas: async (districtUuid) => {
    const response = await axios.get(`${baseUrl}/locations/upazilas`, {
      params: { district_uuid: districtUuid },
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Save business setup data
  saveBusinessSetup: async (data) => {
    const response = await axios.post(`${baseUrl}/business/setup`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Check if business setup is complete
  checkSetupStatus: async () => {
    const response = await axios.get(`${baseUrl}/business/setup/status`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default BusinessSetupService;

