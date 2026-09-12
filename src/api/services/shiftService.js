 import apiClient from '../apiClient'; 
 
export const getShiftList = async () => {
  try {
    const response = await apiClient.get('/dropdown/shiftList');
    return response.data;  
  } catch (error) {
    console.error('getShiftList error:', error);
    return { success: false, message: error.message, data: [] };
  }
};