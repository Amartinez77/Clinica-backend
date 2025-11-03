export const corsConfig = {
	origin: function (origin, callback) {
		const whiteList = [process.env.FRONTEND_URL,'https://www.mercadopago.com.ar','https://sandbox.mercadopago.com.ar', process.env.DOC_URL
			
		]

		if (process.argv[2] === '--api') {
			whiteList.push(undefined)
		}

		if (whiteList.includes(origin)) {
			callback(null, true)
		} else {
			callback(new Error('Error de CORS'))
		}
	},
}
// Configuración especial solo para webhook
export const corsWebhookConfig = {
    origin: function (origin, callback) {
        const whiteList = [
            process.env.FRONTEND_URL,
            'https://www.mercadopago.com.ar',
            'https://sandbox.mercadopago.com.ar',
            undefined // solo aquí permitimos undefined
        ]

        if (whiteList.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    },
    methods: ['POST']
}