import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { generateCashCutPdf } from '@/lib/pdfGenerator';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import ViewCutDetailsDialog from '@/components/cash-cut/ViewCutDetailsDialog';
import NewCashCutCard from '@/components/cash-cut/NewCashCutCard';
import RecentCutsCard from '@/components/cash-cut/RecentCutsCard';

const CashCutSection = ({ schoolSettings }) => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payments, setPayments] = useState([]);
  const [cashCuts, setCashCuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { canDeleteCashCuts } = useRolePermissions();

  const [viewingCut, setViewingCut] = useState(null);
  const [viewingCutPayments, setViewingCutPayments] = useState([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      console.log('💰 Obteniendo pagos pendientes de corte para rango:', { startDate, endDate });
      
      // Primero obtener todos los cortes existentes para identificar rangos ya cortados
      const { data: existingCuts, error: cutsError } = await supabase
        .from('cash_cuts')
        .select('start_date, end_date')
        .order('created_at', { ascending: false });
        
      if (cutsError) {
        console.error('❌ Error al obtener cortes existentes:', cutsError);
        throw cutsError;
      }
      
      console.log('💰 Cortes existentes encontrados:', existingCuts?.length || 0);
      
      // Obtener todos los pagos en el rango de fechas
      const { data: allPayments, error } = await supabase
        .from('payments')
        .select('*, students(first_name, last_name, student_number)')
        .not('paid_date', 'is', null)
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
        .order('paid_date', { ascending: false });

      if (error) {
        console.error('❌ Error al obtener pagos:', error);
        throw error;
      }
      
      console.log('💰 Pagos totales en rango:', allPayments?.length || 0);
      
      // Filtrar pagos que NO estén incluidos en cortes anteriores
      const availablePayments = allPayments.filter(payment => {
        const paymentDate = payment.paid_date;
        
        console.log('🔍 Analizando pago:', {
          id: payment.id,
          concept: payment.concept,
          amount: payment.amount,
          paid_date: paymentDate
        });
        
        // Verificar si este pago ya está incluido en algún corte anterior
        // IMPORTANTE: Normalizar fechas para comparación correcta (solo fecha, sin hora)
        const paymentDateOnly = paymentDate.split('T')[0]; // Extraer solo la fecha
        
        const conflictingCuts = existingCuts.filter(cut => {
          // Normalizar fechas del corte a solo fecha (sin timestamp)
          const cutStartDateOnly = cut.start_date.split('T')[0];
          const cutEndDateOnly = cut.end_date.split('T')[0];
          
          const isInRange = paymentDateOnly >= cutStartDateOnly && paymentDateOnly <= cutEndDateOnly;
          
          console.log('🔍 Comparando fechas normalizadas:', {
            payment_date: paymentDateOnly,
            cut_start: cutStartDateOnly,
            cut_end: cutEndDateOnly,
            isInRange
          });
          
          if (isInRange) {
            console.log('⚠️ Pago conflicta con corte:', {
              cut_number: cut.cut_number,
              cut_start: cut.start_date,
              cut_end: cut.end_date,
              payment_date: paymentDate,
              normalized_comparison: `${paymentDateOnly} entre ${cutStartDateOnly} y ${cutEndDateOnly}`
            });
          }
          return isInRange;
        });
        
        const isAlreadyCut = conflictingCuts.length > 0;
        
        console.log('🔍 Resultado para pago:', {
          payment_id: payment.id,
          isAlreadyCut,
          conflictingCuts: conflictingCuts.length
        });
        
        return !isAlreadyCut; // Solo incluir pagos que NO estén cortados
      });
      
      console.log('💰 Pagos disponibles para corte:', availablePayments?.length || 0);
      console.log('💰 Pagos filtrados (ya cortados):', (allPayments?.length || 0) - (availablePayments?.length || 0));
      
      setPayments(availablePayments);
    } catch (error) {
      console.error('❌ Error completo al cargar pagos:', error);
      setTimeout(() => {
        alert('❌ Error al cargar pagos: ' + error.message);
      }, 100);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, toast]);

  const fetchCashCuts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cash_cuts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setCashCuts(data);
    } catch (error) {
      setTimeout(() => {
        alert('❌ Error al cargar cortes: ' + error.message);
      }, 100);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
    fetchCashCuts();
  }, [fetchPayments, fetchCashCuts]);

  const handlePerformCut = async () => {
    console.log('💰 Iniciando proceso de corte de caja...');
    console.log('💰 Fechas:', { startDate, endDate });
    console.log('💰 Pagos encontrados:', payments.length);
    
    if (payments.length === 0) {
      setTimeout(() => {
        alert('⚠️ No hay pagos para procesar\n\nSelecciona un rango de fechas con pagos pagados y no incluidos en cortes anteriores.');
      }, 100);
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('💰 Calculando totales...');
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const breakdown = payments.reduce((acc, p) => {
        acc[p.concept] = (acc[p.concept] || 0) + p.amount;
        return acc;
      }, {});
      const paymentIds = payments.map(p => p.id);
      console.log('💰 Total calculado:', totalAmount);

      console.log('💰 Obteniendo último número de corte...');
      // Generate next cut number
      const { data: lastCut } = await supabase
        .from('cash_cuts')
        .select('cut_number')
        .order('cut_number', { ascending: false })
        .limit(1);
      
      const nextCutNumber = lastCut && lastCut.length > 0 ? lastCut[0].cut_number + 1 : 1;
      console.log('💰 Próximo número de corte:', nextCutNumber);

      console.log('💰 Insertando corte en base de datos...');
      console.log('💰 Datos a insertar:', {
        cut_number: nextCutNumber,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        payment_count: payments.length
      });
      
      const { data: cutData, error: cutError } = await supabase
        .from('cash_cuts')
        .insert({
          cut_number: nextCutNumber,
          start_date: startDate,
          end_date: endDate,
          total_amount: totalAmount,
          payment_count: payments.length
        })
        .select()
        .single();

      console.log('💰 Resultado de inserción:', { cutData, cutError });
      if (cutError) {
        console.error('❌ Error en inserción de corte:', cutError);
        throw cutError;
      }

      console.log('💰 Corte creado exitosamente, generando PDF...');
      
      // Nota: cash_cut_id no existe en la tabla payments
      // Los pagos se asocian al corte por fecha y rango

      setTimeout(() => {
        alert(`✅ ¡Corte de caja exitoso!\n\nSe ha generado el corte #${cutData.cut_number} con un total de $${totalAmount.toLocaleString()}.`);
      }, 100);
      
      console.log('💰 Obteniendo datos completos para PDF...');
      const cutPaymentsFullData = await fetchPaymentsForCut(cutData);
      console.log('💰 Datos de pagos para PDF:', cutPaymentsFullData?.length || 0, 'pagos');
      
      console.log('💰 Generando PDF...');
      await generateCashCutPdf(cutData, cutPaymentsFullData, schoolSettings);
      
      console.log('💰 Refrescando datos...');
      fetchPayments();
      fetchCashCuts();
      
      console.log('✅ Proceso de corte completado exitosamente');
    } catch (error) {
      console.error('❌ Error completo en corte de caja:', error);
      console.error('❌ Stack trace:', error.stack);
      setTimeout(() => {
        alert('❌ Error al realizar el corte: ' + error.message);
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPaymentsForCut = async (cut) => {
    // Obtener pagos basándose en el rango de fechas del corte
    const { data, error } = await supabase
        .from('payments')
        .select('*, students(first_name, last_name, student_number)')
        .not('paid_date', 'is', null)
        .gte('paid_date', cut.start_date)
        .lte('paid_date', cut.end_date)
        .order('paid_date', { ascending: false });
    if(error) throw error;
    return data || [];
  }

  const handleDownloadPdf = async (cut) => {
    try {
        const cutPayments = await fetchPaymentsForCut(cut);
        await generateCashCutPdf(cut, cutPayments, schoolSettings);
    } catch (error) {
        setTimeout(() => {
          alert('❌ Error al generar PDF: ' + error.message);
        }, 100);
    }
  }

  const handleViewDetails = async (cut) => {
    try {
        const cutPayments = await fetchPaymentsForCut(cut);
        setViewingCutPayments(cutPayments);
        setViewingCut(cut);
        setIsViewDialogOpen(true);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error al ver detalles', description: error.message });
    }
  };

  const handleDeleteCut = async (cut) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el corte #${cut.cut_number}? Esta acción es irreversible.`)) return;
    
    try {
        console.log('🗑️ Iniciando eliminación del corte:', cut.id, cut.cut_number);
        
        // Nota: No es necesario actualizar pagos ya que no existe columna cash_cut_id
        // Los pagos se asocian al corte por rango de fechas, no por ID específico

        const { data: deleteData, error: deleteError } = await supabase
            .from('cash_cuts')
            .delete()
            .eq('id', cut.id)
            .select(); // Agregar select para ver qué se eliminó
            
        console.log('🗑️ Resultado de eliminación:', { deleteData, deleteError });
        
        if (deleteError) {
            console.error('❌ Error en eliminación:', deleteError);
            throw deleteError;
        }
        
        if (!deleteData || deleteData.length === 0) {
            console.warn('⚠️ No se eliminó ningún registro. Posible problema de permisos RLS.');
            throw new Error('No se pudo eliminar el corte. Verifique los permisos.');
        }

        console.log('✅ Corte eliminado exitosamente, refrescando listas...');
        setTimeout(() => {
          alert(`✅ Corte eliminado\n\nEl corte #${cut.cut_number} ha sido eliminado y los pagos han sido liberados.`);
        }, 100);
        
        // IMPORTANTE: Primero actualizar la lista de cortes, luego los pagos
        // Esto asegura que el filtro de pagos use la lista actualizada de cortes
        console.log('🔄 Paso 1: Actualizando lista de cortes...');
        await fetchCashCuts();
        
        // Pequeño delay para asegurar sincronización completa
        console.log('🔄 Esperando sincronización...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Paso 2: Actualizando lista de pagos (con filtro actualizado)...');
        await fetchPayments();
        
        console.log('✅ Listas refrescadas - Los pagos del corte eliminado deberían estar disponibles nuevamente');
    } catch(error) {
        console.error('❌ Error completo en eliminación:', error);
        setTimeout(() => {
          alert('❌ Error al eliminar corte: ' + error.message);
        }, 100);
    }
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Corte de Caja</h1>
          <p className="text-white/70">Realiza cortes de caja por periodos y consulta el historial.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NewCashCutCard
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          payments={payments}
          loading={loading}
          totalAmount={totalAmount}
          isProcessing={isProcessing}
          fetchPayments={fetchPayments}
          handlePerformCut={handlePerformCut}
        />
        <RecentCutsCard
          cashCuts={cashCuts}
          handleDownloadPdf={handleDownloadPdf}
          handleViewDetails={handleViewDetails}
          handleDeleteCut={canDeleteCashCuts ? handleDeleteCut : null}
          canDelete={canDeleteCashCuts}
        />
      </div>
      <ViewCutDetailsDialog isOpen={isViewDialogOpen} setIsOpen={setIsViewDialogOpen} cut={viewingCut} payments={viewingCutPayments}/>
    </div>
  );
};

export default CashCutSection;
