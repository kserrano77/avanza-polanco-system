import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, isSameMonth, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

const PaymentsDashboard = ({ payments }) => {
  // Calcular estadísticas mensuales
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonth = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthPayments = payments.filter(payment => {
      if (!payment.payment_date) return false;
      const paymentDate = parseISO(payment.payment_date);
      return isSameMonth(paymentDate, currentMonth);
    });

    const previousMonthPayments = payments.filter(payment => {
      if (!payment.payment_date) return false;
      const paymentDate = parseISO(payment.payment_date);
      return isSameMonth(paymentDate, previousMonth);
    });

    const calculateStats = (monthPayments) => {
      return monthPayments.reduce((acc, payment) => {
        acc.total.amount += payment.amount;
        acc.total.count++;

        switch (payment.status) {
          case 'pending':
            acc.pending.amount += payment.amount;
            acc.pending.count++;
            break;
          case 'paid':
            acc.paid.amount += payment.amount;
            acc.paid.count++;
            break;
          case 'overdue':
            acc.overdue.amount += payment.amount;
            acc.overdue.count++;
            break;
        }
        return acc;
      }, {
        total: { amount: 0, count: 0 },
        pending: { amount: 0, count: 0 },
        paid: { amount: 0, count: 0 },
        overdue: { amount: 0, count: 0 }
      });
    };

    const current = calculateStats(currentMonthPayments);
    const previous = calculateStats(previousMonthPayments);

    // Calcular porcentajes de cambio
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const changes = {
      totalAmount: calculateChange(current.total.amount, previous.total.amount),
      paidAmount: calculateChange(current.paid.amount, previous.paid.amount),
      pendingAmount: calculateChange(current.pending.amount, previous.pending.amount),
      overdueAmount: calculateChange(current.overdue.amount, previous.overdue.amount)
    };

    return {
      current,
      previous,
      changes,
      currentMonthName: format(currentMonth, 'MMMM yyyy', { locale: es }),
      previousMonthName: format(previousMonth, 'MMMM yyyy', { locale: es })
    };
  }, [payments]);

  // Calcular alertas y proyecciones
  const alerts = useMemo(() => {
    const now = new Date();
    const nextWeek = addMonths(now, 0);
    const today = new Date();
    
    const upcomingDue = payments.filter(payment => {
      if (payment.status !== 'pending' || !payment.payment_date) return false;
      const paymentDate = parseISO(payment.payment_date);
      const daysUntilDue = Math.ceil((paymentDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    const overdue = payments.filter(payment => {
      if (payment.status !== 'overdue') return false;
      return true;
    });

    return {
      upcomingDue: upcomingDue.length,
      upcomingAmount: upcomingDue.reduce((sum, p) => sum + p.amount, 0),
      overdue: overdue.length,
      overdueAmount: overdue.reduce((sum, p) => sum + p.amount, 0)
    };
  }, [payments]);

  const StatCard = ({ title, value, change, icon: Icon, color, prefix = '$' }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    return (
      <Card className="glass-effect border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold text-white">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {!isNeutral && (
              <>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-white/60 text-sm ml-2">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Título del Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          📊 Dashboard de Cobranza - {monthlyStats.currentMonthName}
        </h2>
        <p className="text-white/60">
          Resumen ejecutivo y comparativa mensual
        </p>
      </motion.div>

      {/* Estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total del Mes"
          value={monthlyStats.current.total.amount}
          change={monthlyStats.changes.totalAmount}
          icon={DollarSign}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Recibidos"
          value={monthlyStats.current.paid.amount}
          change={monthlyStats.changes.paidAmount}
          icon={CheckCircle}
          color="bg-green-500/20"
        />
        <StatCard
          title="Pendientes"
          value={monthlyStats.current.pending.amount}
          change={monthlyStats.changes.pendingAmount}
          icon={Clock}
          color="bg-yellow-500/20"
        />
        <StatCard
          title="Vencidos"
          value={monthlyStats.current.overdue.amount}
          change={monthlyStats.changes.overdueAmount}
          icon={AlertTriangle}
          color="bg-red-500/20"
        />
      </motion.div>

      {/* Alertas y proyecciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Alertas */}
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas de Cobranza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div>
                <p className="text-white font-medium">Vencen esta semana</p>
                <p className="text-white/60 text-sm">{alerts.upcomingDue} pagos</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold">${alerts.upcomingAmount.toLocaleString()}</p>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Próximos
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div>
                <p className="text-white font-medium">Pagos vencidos</p>
                <p className="text-white/60 text-sm">{alerts.overdue} pagos</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-bold">${alerts.overdueAmount.toLocaleString()}</p>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Urgente
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparativa mensual */}
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Comparativa Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Mes Actual</span>
                <span className="text-white font-bold">
                  ${monthlyStats.current.total.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Mes Anterior</span>
                <span className="text-white/60">
                  ${monthlyStats.previous.total.amount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-white/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Diferencia</span>
                  <div className="flex items-center gap-2">
                    {monthlyStats.changes.totalAmount > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : monthlyStats.changes.totalAmount < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : null}
                    <span className={`font-bold ${
                      monthlyStats.changes.totalAmount > 0 ? 'text-green-400' : 
                      monthlyStats.changes.totalAmount < 0 ? 'text-red-400' : 'text-white'
                    }`}>
                      {monthlyStats.changes.totalAmount > 0 ? '+' : ''}
                      {monthlyStats.changes.totalAmount.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proyección de cobranza */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Proyección de Cobranza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {monthlyStats.current.total.amount > 0 ? 
                    Math.round((monthlyStats.current.paid.amount / monthlyStats.current.total.amount) * 100) : 0}%
                </div>
                <div className="text-white/60">Efectividad de Cobranza</div>
                <div className="text-white/40 text-sm mt-1">Este mes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  ${monthlyStats.current.pending.amount.toLocaleString()}
                </div>
                <div className="text-white/60">Por Cobrar</div>
                <div className="text-white/40 text-sm mt-1">Pendiente este mes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {monthlyStats.current.total.count}
                </div>
                <div className="text-white/60">Total de Pagos</div>
                <div className="text-white/40 text-sm mt-1">Registrados este mes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentsDashboard;
