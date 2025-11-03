// Proxy: este script redirige a la versión legacy ubicada en
// `scripts/legacy_mongoose/generateTestData.js`.
// Ejecuta:
//   node scripts/generateTestData.js
// y en realidad correrá el script legacy.

import './legacy_mongoose/generateTestData.js'

// Nota: la implementación real se encuentra en scripts/legacy_mongoose/

// Encapsular la ejecución en una función async para que los await y el try/catch sean válidos.
async function generateTestData() {
	try {
		await mongoose.connect(process.env.DB_URL)
		console.log(colors.cyan('Conectado a MongoDB'))

		// Limpiar datos existentes (solo para datos de prueba)
		console.log(colors.yellow('Limpiando datos existentes...'))
		// await Turno.deleteMany({})
		// await Doctor.deleteMany({})
		// await Paciente.deleteMany({})
		// await Especialidad.deleteMany({})

		// Crear especialidades
		console.log(colors.blue('Creando especialidades...'))
		const especialidades = [
			{ nombre: 'Cardiología', descripcion: 'Especialidad del corazón' },
			{ nombre: 'Dermatología', descripcion: 'Especialidad de la piel' },
			{ nombre: 'Neurología', descripcion: 'Especialidad del sistema nervioso' },
			{ nombre: 'Pediatría', descripcion: 'Especialidad en niños' },
			{ nombre: 'Traumatología', descripcion: 'Especialidad en huesos y articulaciones' },
		]

		const especialidadesCreadas = []
		for (let esp of especialidades) {
			const existeEspecialidad = await Especialidad.findOne({ nombre: esp.nombre })
			if (!existeEspecialidad) {
				const nuevaEspecialidad = await Especialidad.create(esp)
				especialidadesCreadas.push(nuevaEspecialidad)
			} else {
				especialidadesCreadas.push(existeEspecialidad)
			}
		}

		// Crear doctores
		console.log(colors.blue('Creando doctores...'))
		const doctoresData = [
			{
				dni: '12345678',
				email: 'dr.perez@ejemplo.com',
				nombre: 'Juan',
				apellido: 'Pérez',
				matricula: 'MP12345',
				especialidad: especialidadesCreadas[0]._id, // Cardiología
				precioConsulta: 1500,
				telefono: '1234567890',
			},
			{
				dni: '23456789',
				email: 'dra.garcia@ejemplo.com',
				nombre: 'María',
				apellido: 'García',
				matricula: 'MP23456',
				especialidad: especialidadesCreadas[1]._id, // Dermatología
				precioConsulta: 1200,
				telefono: '2345678901',
			},
			{
				dni: '34567890',
				email: 'dr.lopez@ejemplo.com',
				nombre: 'Carlos',
				apellido: 'López',
				matricula: 'MP34567',
				especialidad: especialidadesCreadas[2]._id, // Neurología
				precioConsulta: 1800,
				telefono: '3456789012',
			},
			{
				dni: '45678901',
				email: 'dra.martinez@ejemplo.com',
				nombre: 'Ana',
				apellido: 'Martínez',
				matricula: 'MP45678',
				especialidad: especialidadesCreadas[3]._id, // Pediatría
				precioConsulta: 1300,
				telefono: '4567890123',
			},
		]

		const doctoresCreados = []
		for (let doctorData of doctoresData) {
			const existeDoctor = await Doctor.findOne({ dni: doctorData.dni })
			if (!existeDoctor) {
				const hashedPassword = await bcrypt.hash('123456', 10)
				const nuevoDoctor = await Doctor.create({
					...doctorData,
					password: hashedPassword,
					rol: 'doctor',
				})
				doctoresCreados.push(nuevoDoctor)
			} else {
				doctoresCreados.push(existeDoctor)
			}
		}

		// Crear pacientes
		console.log(colors.blue('Creando pacientes...'))
		const pacientesData = [
			{
				dni: '87654321',
				email: 'paciente1@ejemplo.com',
				nombre: 'Luis',
				apellido: 'Rodríguez',
				telefono: '8765432109',
				fechaNacimiento: '1990-01-15',
			},
			{
				dni: '76543210',
				email: 'paciente2@ejemplo.com',
				nombre: 'Sofia',
				apellido: 'González',
				telefono: '7654321098',
				fechaNacimiento: '1985-05-20',
			},
			{
				dni: '65432109',
				email: 'paciente3@ejemplo.com',
				nombre: 'Miguel',
				apellido: 'Fernández',
				telefono: '6543210987',
				fechaNacimiento: '1992-08-10',
			},
		]

		const pacientesCreados = []
		for (let pacienteData of pacientesData) {
			const existePaciente = await Paciente.findOne({ dni: pacienteData.dni })
			if (!existePaciente) {
				const hashedPassword = await bcrypt.hash('123456', 10)
				const nuevoPaciente = await Paciente.create({
					...pacienteData,
					password: hashedPassword,
					rol: 'paciente',
				})
				pacientesCreados.push(nuevoPaciente)
			} else {
				pacientesCreados.push(existePaciente)
			}
		}

		// Crear turnos de prueba
		console.log(colors.blue('Creando turnos de prueba...'))
		const fechasBase = ['1/7/2025', '2/7/2025', '3/7/2025', '4/7/2025', '5/7/2025', '8/7/2025', '9/7/2025']
		const horasDisponibles = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
		const estados = ['pendiente', 'realizado', 'cancelado']

		// Generar turnos variados
		const turnosACrear = []

		// Turnos por cada doctor
		for (let doctor of doctoresCreados) {
			for (let i = 0; i < 8; i++) {
				const fecha = fechasBase[Math.floor(Math.random() * fechasBase.length)]
				const hora = horasDisponibles[Math.floor(Math.random() * horasDisponibles.length)]
				const paciente = pacientesCreados[Math.floor(Math.random() * pacientesCreados.length)]
				const estado = estados[Math.floor(Math.random() * estados.length)]

				turnosACrear.push({
					fecha,
					hora,
					paciente: paciente._id,
					doctor: doctor._id,
					estado,
					observaciones: `Turno de prueba para ${doctor.nombre} ${doctor.apellido}`,
				})
			}
		}

		// Crear algunos turnos adicionales para ciertas especialidades populares
		for (let i = 0; i < 20; i++) {
			const doctorIndex = Math.floor(Math.random() * 2) // Más turnos para cardiología y dermatología
			const doctor = doctoresCreados[doctorIndex]
			const fecha = fechasBase[Math.floor(Math.random() * fechasBase.length)]
			const hora = horasDisponibles[Math.floor(Math.random() * horasDisponibles.length)]
			const paciente = pacientesCreados[Math.floor(Math.random() * pacientesCreados.length)]
			const estado = Math.random() > 0.3 ? 'realizado' : Math.random() > 0.5 ? 'pendiente' : 'cancelado'

			turnosACrear.push({
				fecha,
				hora,
				paciente: paciente._id,
				doctor: doctor._id,
				estado,
				observaciones: `Turno adicional de prueba`,
			})
		}

		// Insertar turnos
		for (let turnoData of turnosACrear) {
			const existeTurno = await Turno.findOne({
				fecha: turnoData.fecha,
				hora: turnoData.hora,
				doctor: turnoData.doctor,
			})

			if (!existeTurno) {
				await Turno.create(turnoData)
			}
		}

		console.log(colors.green('✅ Datos de prueba creados exitosamente!'))
		console.log(colors.cyan(`📊 Especialidades: ${especialidadesCreadas.length}`))
		console.log(colors.cyan(`👨‍⚕️ Doctores: ${doctoresCreados.length}`))
		console.log(colors.cyan(`👤 Pacientes: ${pacientesCreados.length}`))

		const totalTurnos = await Turno.countDocuments()
		console.log(colors.cyan(`📅 Total de turnos: ${totalTurnos}`))

		// Mostrar estadísticas básicas
		const turnosPorEstado = await Turno.aggregate([
			{
				$group: {
					_id: '$estado',
					cantidad: { $sum: 1 },
				},
			},
		])

		console.log(colors.magenta('\n📈 Distribución por estado:'))
		turnosPorEstado.forEach(estado => {
			console.log(colors.white(`   ${estado._id}: ${estado.cantidad}`))
		})

		process.exit(0)
	} catch (error) {
		console.error(colors.red('Error generando datos de prueba:'), error)
		process.exit(1)
	}
}

generateTestData()
