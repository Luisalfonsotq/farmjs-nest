// src/scripts/seed-admin.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RolUsuario, Usuario } from '../usuario/entities/usuario.entity';

async function seedAdmin() {
  console.log(' Iniciando seed de administrador ...');

  // Inicializa el contexto de la aplicación Nest para obtener AppModule, lo que incluye DB y variables de entorno
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));

    const email = 'administrador@herdix.com';
    // Buscar si ya existe un usuario administrador
    const existingAdmin = await usuarioRepo.findOne({
      where: { email: email }
    });

    if (existingAdmin) {
      console.log('El administrador ya existe en la base de datos.');
    } else {
      console.log('Creando el usuario administrador...');
      const password = await bcrypt.hash('Administrador123@', 10);

      const admin = usuarioRepo.create({
        nombre: 'Administrador',
        email: 'administrador@herdix.com',
        password: password,
        rol: RolUsuario.ADMINISTRADOR
      });

      await usuarioRepo.save(admin);
      console.log('Administrador creado exitosamente.');
    }
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  } finally {
    await app.close();
    console.log('Conexión a la base de datos cerrada y app terminada');
  }
}

seedAdmin().catch(error => {
  console.error('❌ Error al crear el usuario administrador:', error);
  process.exit(1);
});