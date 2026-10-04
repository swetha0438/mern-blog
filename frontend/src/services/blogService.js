import api from "./api";

const progress = (cb) =>
  cb
    ? { onUploadProgress: (e) => cb(e.total ? Math.round((e.loaded * 100) / e.total) : 0), timeout: 0 }
    : {};

export const getPosts = (params) => api.get("/posts", { params }).then((r) => r.data);
export const getMyPosts = (params) => api.get("/posts/mine", { params }).then((r) => r.data);
export const getPost = (id) => api.get(`/posts/${id}`).then((r) => r.data);

export const createPost = (formData, onProgress) =>
  api.post("/posts", formData, progress(onProgress)).then((r) => r.data.post);

export const updatePost = (id, formData, onProgress) =>
  api.put(`/posts/${id}`, formData, progress(onProgress)).then((r) => r.data.post);

export const deletePost = (id) => api.delete(`/posts/${id}`).then((r) => r.data);

export const addComment = (postId, content) =>
  api.post(`/posts/${postId}/comments`, { content }).then((r) => r.data.comment);

export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`).then((r) => r.data);
