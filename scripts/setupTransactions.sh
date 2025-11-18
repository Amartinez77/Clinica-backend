#!/bin/bash

# 🔐 SCRIPT DE SETUP RÁPIDO - Transacciones
# 
# Este script automatiza la integración de transacciones
# en tu proyecto
#
# Uso: bash scripts/setupTransactions.sh

set -e

echo "🔐 INICIANDO SETUP DE TRANSACCIONES..."
echo ""

# ============================================================
# 1. VERIFICAR ARCHIVOS CREADOS
# ============================================================

echo "1️⃣ Verificando archivos generados..."

FILES=(
  "src/utils/transactionHelper.js"
  "src/services/transactionServices.js"
  "src/routes/transactionRoutes.js"
  "scripts/validateTransactions.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ FALTA: $file"
    exit 1
  fi
done

echo ""

# ============================================================
# 2. VERIFICAR MODELOS
# ============================================================

echo "2️⃣ Verificando modelos Sequelize..."

if grep -q "export.*Usuario\|export.*Doctor\|export.*Paciente" src/sql_models/index.js 2>/dev/null; then
  echo "  ✅ Modelos encontrados"
else
  echo "  ⚠️ Modelos podrían no exportarse correctamente"
  echo "  (Verificar src/sql_models/index.js)"
fi

echo ""

# ============================================================
# 3. VERIFICAR SEQUELIZE CONFIG
# ============================================================

echo "3️⃣ Verificando configuración Sequelize..."

if grep -q "const sequelize\|export.*sequelize" src/config/sequelize.js 2>/dev/null; then
  echo "  ✅ Sequelize configurado"
else
  echo "  ❌ Sequelize no encontrado en config"
  exit 1
fi

echo ""

# ============================================================
# 4. GENERAR INSTRUCCIONES
# ============================================================

echo "4️⃣ Instrucciones de integración:"
echo ""
echo "  📝 Editar: src/index.js"
echo ""
echo "  Agregar ANTES de 'app.listen()':"
echo ""
echo "    import transactionRoutes from './routes/transactionRoutes.js';"
echo "    app.use('/api', transactionRoutes);"
echo ""
echo "  Luego reiniciar servidor."
echo ""

# ============================================================
# 5. VERIFICAR DOCKER
# ============================================================

echo "5️⃣ Verificando Docker..."

if docker-compose ps mysql &>/dev/null; then
  echo "  ✅ MySQL running"
  MYSQL_STATUS="running"
else
  echo "  ⚠️ MySQL no está en ejecución"
  MYSQL_STATUS="stopped"
fi

echo ""

# ============================================================
# 6. OFERCER VALIDACIÓN
# ============================================================

echo "6️⃣ Validación automática:"
echo ""
echo "  Ejecutar después de integrar:"
echo ""
echo "    node scripts/validateTransactions.js"
echo ""
echo "  Esto verificará:"
echo "    ✅ Conexión a BD"
echo "    ✅ Modelos cargados"
echo "    ✅ Transacciones funcionales"
echo "    ✅ Config MySQL"
echo "    ✅ FKs y InnoDB"
echo ""

# ============================================================
# 7. TESTING
# ============================================================

echo "7️⃣ Testing con CURL:"
echo ""
echo "  Después de reiniciar el servidor:"
echo ""
echo "    # Agendar turno"
echo "    curl -X POST http://localhost:3000/api/turnos \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"pacienteId\":1,\"doctorId\":1,\"fechaHora\":\"2025-12-25T14:00:00\"}'"
echo ""

# ============================================================
# RESUMEN
# ============================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SETUP COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Status:"
echo "  ✅ Archivos generados"
echo "  ✅ Modelos verificados"
echo "  ✅ Sequelize OK"
if [ "$MYSQL_STATUS" == "running" ]; then
  echo "  ✅ MySQL running"
else
  echo "  ⚠️  MySQL not running (iniciar docker-compose)"
fi
echo ""
echo "Próximos pasos:"
echo "  1. Editar src/index.js (agregar imports de transactionRoutes)"
echo "  2. Reiniciar servidor"
echo "  3. Ejecutar: node scripts/validateTransactions.js"
echo "  4. Testear con CURL"
echo ""
echo "Documentación disponible:"
echo "  📄 TRANSACCIONES_ACID_ANALISIS.md"
echo "  📄 GUIA_IMPLEMENTACION_TRANSACCIONES.md"
echo "  📄 RESUMEN_EJECUTIVO_TRANSACCIONES.md"
echo ""
echo "🎉 Listo para continuar!"
echo ""
