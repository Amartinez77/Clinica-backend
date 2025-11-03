// src/models/Administrador.js (legacy)
import Usuario from './Usuario.js'; // Importa el modelo base Usuario
import mongoose from 'mongoose';

const AdministradorSchema = new mongoose.Schema({});
const Administrador = Usuario.discriminator('admin', AdministradorSchema);
export default Administrador;
