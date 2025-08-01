# CORRECCIONES PARA EL TEMPLATE DE EMAIL

## 📍 Ubicación: PaymentsSection.jsx, función sendPaymentReceipt, línea ~94

## 🔧 CORRECCIÓN 1: Nombre del estudiante
**CAMBIAR:**
```javascript
<h2 style="color: #333; margin-top: 0;">Estimado/a ${student.name},</h2>
```

**POR:**
```javascript
<h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
```

## 🔧 CORRECCIÓN 2: Agregar información de adeudo
**CAMBIAR la tabla completa (líneas ~98-103):**
```javascript
<table style="width: 100%; border-collapse: collapse;">
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
</table>
```

**POR:**
```javascript
<table style="width: 100%; border-collapse: collapse;">
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
  <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
  ${paymentData.debt_amount && parseFloat(paymentData.debt_amount) > 0 ? `
  <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
  <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${paymentData.debt_description || 'Adeudo pendiente'}</td></tr>
  <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${paymentData.debt_amount}</td></tr>
  <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
  ` : ''}
</table>
```

## 📝 INSTRUCCIONES:
1. Abre PaymentsSection.jsx
2. Busca la función `sendPaymentReceipt` 
3. Encuentra la variable `receiptHtml`
4. Aplica las dos correcciones arriba
5. Guarda el archivo
6. Haz commit y push
7. Prueba enviando un email con adeudo

## ✅ RESULTADO ESPERADO:
- El email mostrará "Estimado/a Kevin Pruebas" en lugar de "Estimado/a undefined"
- Si hay adeudo, se mostrará una sección adicional con el concepto y monto del adeudo
