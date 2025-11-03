// validaciones mediandte express-validator

/**
 * @fileoverview Middleware para manejar y formatear los errores de validación de `express-validator`.
 * Este middleware se utiliza después de definir las reglas de validación con `express-validator`.
 * Si existen errores de validación en la petición, los captura, los formatea en un objeto legible
 * y envía una respuesta 400 (Bad Request) con los detalles de los errores.
 * Si no hay errores, permite que la petición continúe hacia el siguiente middleware o controlador.
 */

import { validationResult } from 'express-validator'

export const handleInputErrors = (req, res, next) => {
	let errors = validationResult(req)
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() })
		return
	}
	next()
}
