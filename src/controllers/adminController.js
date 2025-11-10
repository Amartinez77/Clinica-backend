// src/controllers/adminController.js
import bcrypt from 'bcryptjs'
import colors from 'colors'
import { getModels } from '../config/sequelize.js'

// Registrar un nuevo administrador
// Esta ruta debe estar fuertemente protegida.
// La primera vez, se puede crear un admin manualmente en DB o deshabilitar temporalmente la protección para un setup inicial.
export const registrarAdmin = async (req, res) => {
	try {
		// Desestructurar los campos que vienen del body, heredados del modelo Usuario
		const { dni, email, password, nombre, apellido } = req.body

		console.log(colors.cyan(`[ADMIN_CTRL] Intentando registrar admin con DNI: ${dni}`))

		const { Administrador } = getModels()
		// 1. Verificar si el DNI ya existe
		let adminExistente = await Administrador.findOne({ where: { dni } })
		if (adminExistente) {
			console.log(colors.red(`[ADMIN_CTRL] Error: DNI ya registrado para un administrador: ${dni}`))
			return res.status(400).json({ msg: 'El DNI ya está registrado para un administrador.' })
		}

		// Opcional: Verificar si el email ya existe (si el email también es un identificador único importante)
		if (email) {
			adminExistente = await Administrador.findOne({ where: { email } })
			if (adminExistente) {
				console.log(colors.red(`[ADMIN_CTRL] Error: Email ya registrado para un administrador: ${email}`))
				return res.status(400).json({ msg: 'El email ya está registrado para un administrador.' })
			}
		}

		// 2. Hashear la contraseña
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		// 3. Crear una nueva instancia de Administrador
		const admin = await Administrador.create({
			dni,
			email, // El email puede ser opcional si el DNI es el identificador principal
			password: hashedPassword,
			nombre,
			apellido,
		})

		console.log(colors.green(`[ADMIN_CTRL] Administrador registrado exitosamente con ID: ${admin.id}`))
		res.status(201).json({ msg: 'Administrador registrado exitosamente', adminId: admin.id })
	} catch (error) {
		console.error(colors.red('[ADMIN_CTRL] Error al registrar administrador (catch):'), error.message)
		if (error.name === 'ValidationError') {
			let errors = {}
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message
			})
			return res.status(400).json({ errors })
		}
		// Manejo de errores de duplicado de MongoDB (código 11000)
		if (error.code === 11000) {
			const field = Object.keys(error.keyValue)[0]
			const value = error.keyValue[field]
			return res.status(400).json({ msg: `El ${field} '${value}' ya está registrado.` })
		}
		res.status(500).send('Error del servidor')
	}
}

// Obtener todos los administradores (solo para administradores de alto nivel o para depuración)
export const getAdmins = async (req, res) => {
	try {
		// .select('-password') para no enviar las contraseñas
		console.log(colors.cyan('[ADMIN_CTRL] Obteniendo todos los administradores...'))
		const { Administrador } = getModels()
		const admins = await Administrador.findAll({ attributes: { exclude: ['password'] } })
		res.json(admins)
	} catch (error) {
		console.error(colors.red('[ADMIN_CTRL] Error al obtener administradores:'), error.message)
		res.status(500).send('Error del servidor')
	}
}

// Puedes añadir más funciones como actualizarAdmin, eliminarAdmin, etc.,
// siguiendo la misma lógica de protección por rol.
