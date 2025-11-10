const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(5, 'El nombre de usuario debe tener al menos 5 caracteres'),
  name: z.string().max(50).optional(),
  lastname: z.string().max(50).optional(),
  age: z.number().int().positive().max(100).optional(),
  gender: z.string().max(1).optional(),
  email: z.string().z.email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  id_estado: z.number().int().optional(),
  id_municipio: z.number().int().optional(),
  id_localidad: z.number().int().optional(),
});

function validateRegister(data) {
  return registerSchema.parse(data);
}

module.exports = { validateRegister };
