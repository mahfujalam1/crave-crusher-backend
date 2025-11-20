import { z } from "zod";

// Define the schema
const UserValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, { message: 'full Name is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['admin', 'user'], { message: 'Role must be either admin or user' }),
  }),
});

export default UserValidationSchema;

