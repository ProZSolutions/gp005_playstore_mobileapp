// ─── api/services/operationBulletinService.js ────────────────────────────────

import apiRequest from '../apiRequest';
import ENDPOINTS  from '../endpoints';

export const createOperationBulletin = (payload) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.CREATE, body: payload });

export const updateOperationBulletin = (payload) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.UPDATE, body: payload });

export const deleteOperationBulletin = (uuid) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.DELETE, body: { uuid } });

export const getOperationBulletinById = (uuid) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.GET_BY_ID, body: { uuid } });

export const listOperationBulletins = (filters = {}) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.LIST, body: filters });

export const fetchOperationBulletinDropdown = (filters = {}) =>
  apiRequest({ method: 'POST', endpoint: ENDPOINTS.OPERATION_BULLETIN.DROPDOWN, body: filters });

export const fetchStyleWithSam = () =>
  apiRequest({ method: 'GET', endpoint: ENDPOINTS.OPERATION_BULLETIN.STYLE_SAM });