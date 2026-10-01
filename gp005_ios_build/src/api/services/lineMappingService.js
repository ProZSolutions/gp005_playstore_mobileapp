// services/lineMappingService.js

import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';

 
export const lineList = async () => {
  try {
    const result = await apiRequest({
      method: 'GET',
      endpoint: ENDPOINTS.TLSLINE.LINES, 
    });
    
    if (!result.success) {
       return { success: false, data: [], message: result.error };
    }

    // API returns: { success, message, data: [ {...}, {...} ] }
    return {
      success: true,
      data: result.data ?? [],
      message: result.data?.message ?? '',
    };
  } catch (e) {
    console.warn('lineList error:', e.message);
    return { success: false, data: [], message: e.message };
  }
};
 
 export const orderList = async (lineid =null) => {
  try {
    const result =
      await apiRequest({
        method: 'GET',
        endpoint:
          `${ENDPOINTS.TLSLINE.ORDERLIST}?line_id=${lineid}`,
      });

    if (
      !result.success
    ) {
       return {
        success: false,
        data: [],
        message:
          result.error,
      };
    } 
      return {
      success: true,
      data:result?.data?.records ?? [],
      message: result?.data?.message ?? '',
    };
  } catch (e) {
    console.warn(
      'orderList error:',
      e.message,
    );

    return {
      success: false,
      data: [],
      message:
        e.message,
    };
  }
};
 
export const styleList = async () => {
  try {
    const result = await apiRequest({
      method: 'GET',
      endpoint: ENDPOINTS.TLSLINE.STYLELIST,
    });

    if (!result.success) {
      console.warn('styleList error:', result.error);
      return { success: false, data: [], message: result.error };
    }

    return {
      success: true,
      data: result.data ?? [],
      message: result.message ?? '',
    };
  } catch (e) {
    console.warn('styleList error:', e.message);
    return { success: false, data: [], message: e.message };
  }
};
 
export const machineList = async () => {
  try {
    const result = await apiRequest({
      method: 'GET',
      endpoint: ENDPOINTS.TLSLINE.MACHINELIST,
    });

    if (!result.success) {
      console.warn('machineList error:', result.error);
      return { success: false, data: [], message: result.error };
    }

    // Normalise type_name → machine_name so the modal labelKey works as-is
    const raw = result.data?? [];
    const data = raw.map(item => ({
      ...item,
      machine_name: item.type_name ?? item.machine_name ?? '',
    }));

    return {
      success: true,
      data,
      message: result.message ?? '',
    };
  } catch (e) {
    console.warn('machineList error:', e.message);
    return { success: false, data: [], message: e.message };
  }
};

 
 export const colorList =
  async order_id => {
    try {
      const result =
        await apiRequest({
          method: 'GET',
          endpoint:
            ENDPOINTS.TLSLINE
              .COLORLIST,
          body: { order_id },
        });

      if (!result.success) {
        console.warn(
          'colorList error:',
          result.error,
        );

        return {
          success: false,
          data: [],
          message:
            result.error,
        };
      }
 
      // API returns colors as strings
      const raw =
        result.data?.colors ?? [];

      // Convert for picker
      const data =
        raw.map(color => ({
          id: color,
          colour_name:color,
        }));

      return {
        success: true,
        data,
        message:
          result.message ??
          '',
      };
    } catch (e) {
      console.warn(
        'colorList error:',
        e.message,
      );

      return {
        success: false,
        data: [],
        message:
          e.message,
      };
    }
  };
 
export const workStationList =  async (lineid =null)  => {
  try {
    const result = await apiRequest({
      method: 'GET',
      endpoint: ENDPOINTS.TLSLINE.WORKSTATION,
        body: {
            line_id:lineid,
          },
    });
  
    if (!result.success) {
       return { success: false, data: [], message: result.error };
    }
     return {
      success: true,
      data: result.data ?? [],
      message: result.message ?? '',
    };
  } catch (e) {
    console.warn('workStationList error:', e.message);
    return { success: false, data: [], message: e.message };
  }
};
 
export const getLineMappingList = async (filters = {}) => {
  console.log("filters "+JSON.stringify(filters));
  const formattedDate = new Date().toISOString().split('T')[0];

  try {
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.LINEMAPPING.LIST,
      body: {
        line_id:  filters.line_id  ?? '',
        order_id: filters.order_id ?? '',
        search:   filters.search   ?? '',
        date:formattedDate
      },
    });
    console.log("in app device list "+JSON.stringify(result));
    if (!result.success) {
      console.warn('getLineMappingList error:', result.message);
      return { success: false, data: [], message: result.message };
    }
     return {
      success: true,
      data:    result.data?.data ?? [],        // list is nested under data.data.data
      pagination: result.data?.data?.pagination ?? null,
      message: result.data?.message ?? '',
    };
  } catch (e) {
    console.warn('getLineMappingList error:', e.message);
    return { success: false, data: [], message: e.message };
  }
};

 
export const createLineMapping = async (payload) => {
  try {
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.LINEMAPPING.CREATE,
      body: payload,
    });

    if (!result.success) {
      console.warn('createLineMapping error:', result.error);
      return { success: false, message: result.message, data:  result.data ?? result.message };
    }

    return {
      success: true,
      message: result.message ?? 'Line mapping created successfully',
      data:    result.data     ?? result.message,
    };
  } catch (e) {
    console.warn('createLineMapping error:', e.message);
    return { success: false, message: e.message, data: null };
  }
};
 
export const updateLineMapping = async (uuid, tls_id) => {
  try {
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.LINEMAPPING.UPDATE,
      body: { uuid, tls_id },   // ✅ was { id, tls_id }
    });

    if (!result.success) {
          return {
      success: true,
      message: result.message ?? 'Line mapping updated successfully',
      data:    result.data     ?? result.message,
    };
    }

    return {
      success: true,
      message: result.data?.message ?? 'TLS updated successfully',
      data:    result.data?.data    ?? null,
    };
  } catch (e) {
    console.warn('updateLineMapping error:', e.message);
    return { success: false, message: e.message, data: null };
  }
};

 
export const deleteLineMapping = async (uuid) => {
  try {
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.LINEMAPPING.DELETE,
      body: { uuid:uuid },    
    });
    console.log("delete api response "+JSON.stringify(result));

    if (!result.success) {
      console.warn('deleteLineMapping error:', result.error);
      return { success: false, message: result.error };
    }

    return {
      success: true,
      message: result.data?.message ?? 'Deleted successfully',
    };
  } catch (e) {
    console.warn('deleteLineMapping error:', e.message);
    return { success: false, message: e.message };
  }
};

export const tlsList = async (
  status = 'active',
  search = '',
) => {
  try {
    const result =
      await apiRequest({
        method: 'GET',
        endpoint:
          ENDPOINTS
            .DEVICES.LIST,
        body: {
          status:'active',
        },
      });

    if (!result.success) {
      console.warn(
        'tlsList error:',
        result.error,
      );

      return {
        success: false,
        data: [],
        message:
          result.error,
      };
    }

    return {
      success: true,
      data:
        result.data
          ?.tlsMaster ?? [],
      message:
        result.message ??
        '',
    };
  } catch (e) {
    console.warn(
      'tlsList error:',
      e.message,
    );

    return {
      success: false,
      data: [],
      message:
        e.message,
    };
  }
};