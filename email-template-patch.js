// PARCHE DIRECTO PARA CORREGIR EL TEMPLATE DE EMAIL
// Aplicar estos cambios exactos en PaymentsSection.jsx

// CAMBIO 1: Línea ~94 - Corregir nombre del estudiante
// BUSCAR:
//     <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.name},</h2>
// REEMPLAZAR POR:
//     <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>

// CAMBIO 2: Línea ~100 - Cambiar "Monto:" por "Monto Pagado:"
// BUSCAR:
//     <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
// REEMPLAZAR POR:
//     <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>

// CAMBIO 3: Línea ~103 - Agregar sección de adeudo DESPUÉS de la fila del Estado
// BUSCAR:
//     <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
// REEMPLAZAR POR:
//     <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
//     ${paymentData.debt_amount && parseFloat(paymentData.debt_amount) > 0 ? `
//     <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
//     <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${paymentData.debt_description || 'Adeudo pendiente'}</td></tr>
//     <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${paymentData.debt_amount}</td></tr>
//     <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
//     ` : ''}

// CAMBIO 4: Línea ~80 - También corregir el mensaje de error
// BUSCAR:
//     toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: `El estudiante ${student.name} no tiene un email registrado.` });
// REEMPLAZAR POR:
//     toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: `El estudiante ${student.first_name} ${student.last_name} no tiene un email registrado.` });

console.log("✅ Parche de correcciones creado. Aplicar manualmente estos 4 cambios en PaymentsSection.jsx");
