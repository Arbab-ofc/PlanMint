
import api from "./api";


export const createContact = (payload) =>
  api.post("/contacts", payload); 

export const listContacts = (params = {}) =>
  api.get("/contacts", { params }); 
export const getContact = (contactId) =>
  api.get(`/contacts/${contactId}`);

export const updateContact = (contactId, payload) =>
  api.put(`/contacts/${contactId}`, payload);

export const deleteContact = (contactId) =>
  api.delete(`/contacts/${contactId}`);


export const listProjectContacts = (projectId, params = {}) =>
  api.get(`/projects/${projectId}/contacts`, { params });

export const linkContactToProject = (contactId, projectId) =>
  api.post(`/contacts/${contactId}/link-project`, { projectId });

export const unlinkContactFromProject = (contactId, projectId) =>
  api.delete(`/contacts/${contactId}/projects/${projectId}`);

export const updateContactTags = (contactId, tags = []) =>
  api.patch(`/contacts/${contactId}/tags`, { tags });
