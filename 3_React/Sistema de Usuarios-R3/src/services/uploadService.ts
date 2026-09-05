import api from './api';

export const uploadService = {
  /**
   * Sube una imagen de mascota o usuario al backend.
   * Valida en el servidor formato (JPG, PNG, WEBP) y tamaño máximo (5 MB).
   * Devuelve la URL relativa del archivo guardado (ej: /uploads/mascotas/xyz.jpg).
   */
  uploadImage: async (file: File, type: 'mascota' | 'usuario'): Promise<string> => {
    const formData = new FormData();
    formData.append('imagen', file);

    const { data } = await api.post<{ url: string; message: string }>(
      `/uploads/${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return data.url;
  },
};
