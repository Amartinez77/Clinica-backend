export const corsConfig = {
        origin: function (origin, callback) {
        // Permitir orígenes explícitos y llamadas sin origen (server-to-server, curl, Prometheus)
        const whiteList = [
            // URLs de acceso externo (Cloudflare Tunnel)
            'https://clinica.clinica-hia.site',
            
            // URLs de acceso interno (Traefik + Tailscale)
            'https://clinica.tail9fe3bf.ts.net',
            'http://100.65.42.112:8083',
            
            // URLs de desarrollo y localhost
            process.env.FRONTEND_URL, // http://clinica.localhost
            'http://localhost:4200',
            'http://localhost:3000',
            
            // Servicios externos
            'https://www.mercadopago.com.ar',
            'https://sandbox.mercadopago.com.ar',
            process.env.DOC_URL,
            
            // Permitir solicitudes sin cabecera Origin (curl, server-to-server, Prometheus)
            undefined
        ]        // Si no hay cabecera Origin (p.ej., curl o scrapers internos), permitir
        if (!origin) {
            return callback(null, true)
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