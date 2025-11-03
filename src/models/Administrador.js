// src/models/Administrador.js
import Usuario from './Usuario.js'; // Importa el modelo base Usuario
import mongoose from 'mongoose';

// El esquema de Administrador no necesita campos adicionales por ahora,
// ya que hereda todo lo necesario (DNI, password, nombre, apellido, rol) de Usuario.
const AdministradorSchema = new mongoose.Schema({});

// Crear el discriminador 'admin' para el modelo Usuario
// Mongoose añade automáticamente el campo '_rol' con el valor 'admin'
const Administrador = Usuario.discriminator('admin', AdministradorSchema);

export default Administrador;