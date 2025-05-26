import { Role } from '../user.entity';

export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: Role; // Opcional, por si no lo envías y quieres usar el default
}
