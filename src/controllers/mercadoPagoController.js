import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { getModels } from '../config/sequelize.js'
const client = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN, //acces token de maurisio
})
const paymentClient = new Payment(client) // Para consultar pagos
//685ddb0bf8efec2d6f164433
const preferenceClient = new Preference(client)
const createPreference = async (req, res) => {
	try {
		const { idDoctor, idTurno } = req.params // obtenemos el id del doctor desde los parametros de la ruta
		const { Doctor, Turno } = getModels()
		const doctor = await Doctor.findByPk(idDoctor) // buscamos el doctor en la base de datos
		const turno = await Turno.findByPk(idTurno) // buscamos el turno en la base de datos
		const preference = {
			items: [
				{
					title: 'Producto de ejemplo', //tittulo del pago
					quantity: 1, // cantidad del producto
					unit_price: doctor.precioConsulta, // precio del producto, lo obtenemos del doctor
					//unit_price: 100, // precio del producto por defecto para pruebas
					currency_id: 'ARS',
				},
			],
			back_urls: {
				success: `${process.env.URL_FRONTEND_DEPLOY}/paciente/${turno.paciente}`, // deber ser https para que funcione, debemos desplegar el frontend
				failure: `${process.env.URL_FRONTEND_DEPLOY}`,
				pending: `${process.env.URL_FRONTEND_DEPLOY}`,
			},
			auto_return: 'approved',
			//cambiar cuando se haya desployado
			// notification_url: 'https://7133-181-10-181-75.ngrok-free.app/api/mercadoPago/webhook', // URL del webhook, debe ser https y estar expuesto a internet
			notification_url: `${process.env.URL_BACKEND_DEPLOY}/api/mercadoPago/webhook`, // URL del webhook, debe ser https y estar expuesto a internet
			external_reference: idTurno,
		}

		const response = await preferenceClient.create({ body: preference }) // crea la preferencia de mercado pago

		res.json({ init_point: response.init_point }) // esto nos dirigirar a la pagina de mercado pago
		//y si lo prbamos desde postman, nos devolvera el linkque nos lleva a mercado pago
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al crear preferencia' })
	}
}
const recibirPago = async (req, res) => {
	try {
		const paymentId = req.query['data.id']
		if (!paymentId) return res.status(400).json({ error: 'ID de pago no proporcionado' })

		// 1. Obtener detalles del pago desde MercadoPago
		const payment = await paymentClient.get({ id: paymentId })
		const { status, id, external_reference, transaction_amount } = payment
		const { Pago, Turno } = getModels()
		if (status === 'approved') {
			const turno = await Turno.findByPk(external_reference)

			// 2. Guardar el pago en la base de datos
			const nuevoPago = await Pago.create({
				monto: transaction_amount,
				metodoPago: 'mercadopago',
				turnoId: turno ? turno.id : null,
				estado: 'completado', // Estado del pago
				paymentIdMp: id, // ID del pago en MercadoPago
			})
			// 3. Actualizar el turno
			if (turno) {
				turno.estado = 'confirmado' // Actualizamos el estado del turno
				turno.expireAt = null // Eliminamos la expiración del turno
				await turno.save()
				console.log('✅ Turno actualizado:', turno)
			} else {
				console.error('❌ Turno no encontrado con ID:', external_reference)
			}

			console.log('✅ Pago guardado:', nuevoPago)
		} else if (status === 'rejected') {
			//se elimina el turno
			const turno = await Turno.findByPk(external_reference)
			if (turno) {
				await Turno.destroy({ where: { id: external_reference } })
				console.log('❌ Turno eliminado:', turno)
			}
		}
		res.status(200).send('OK')
	} catch (error) {
		console.error('❌ Error en webhook:', error)
		res.status(500).json({ error: 'Error interno' })
	}
}

export default { createPreference, recibirPago }
