const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Reporte de uso de un sitio (reservas, recursos, frecuencia)
async function generateSiteUsageReport(siteId, userId) {
    // Verificar que el usuario sea dueño del sitio
    const site = await prisma.Site.findFirst({
        where: { id: siteId, id_owner: BigInt(userId) }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    // Obtener datos de uso
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId },
        include: {
            reserva: {
                where: { status: { in: ["Active", "In Progress", "Completed"] } }
            }
        }
    });

    const totalReservas = resources.reduce((sum, r) => sum + r.reserva.length, 0);

    // Crear PDF
    const doc = new PDFDocument();
    doc.fontSize(20).text('Reporte de Uso del Sitio', { align: 'center' });
    doc.fontSize(12).text(`Sitio: ${site.name}`, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Resumen General', { underline: true });
    doc.fontSize(12)
        .text(`Total de Reservas: ${totalReservas}`)
        .text(`Total de Recursos: ${resources.length}`)
        .text(`Descripción: ${site.description || 'N/A'}`);
    
    doc.moveDown();

    doc.fontSize(14).text('Recursos Disponibles', { underline: true });
    resources.forEach(r => {
        doc.fontSize(11)
            .text(`${r.name} - ${r.reserva.length} reservas`)
            .fontSize(10)
            .text(`  Tipo: ${r.resource_type || 'N/A'}`, { color: '#666' });
    });

    return doc;
}

// Reporte de ocupación (tasa de ocupación, disponibilidad)
async function generateSiteOccupancyReport(siteId, userId) {
    const site = await prisma.Site.findFirst({
        where: { id: siteId, id_owner: BigInt(userId) }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    // Calcular ocupación
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId },
        include: {
            reserva: {
                where: { status: { in: ["Active", "In Progress", "Completed"] } }
            }
        }
    });

    const totalHours = resources.length * 14 * 7; // 14 horas/día * 7 días
    const reservedHours = resources.reduce((sum, r) => 
        sum + r.reserva.reduce((h, res) => {
            const duration = (new Date(res.end_date) - new Date(res.start_date)) / (1000 * 60 * 60);
            return h + duration;
        }, 0), 0
    );
    const occupancyRate = totalHours > 0 ? Math.round((reservedHours / totalHours) * 100) : 0;

    const doc = new PDFDocument();
    doc.fontSize(20).text('Reporte de Ocupación', { align: 'center' });
    doc.fontSize(12).text(`Sitio: ${site.name}`, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Tasa de Ocupación', { underline: true });
    doc.fontSize(12)
        .text(`Ocupación: ${occupancyRate}%`)
        .text(`Horas Reservadas: ${Math.round(reservedHours)}`)
        .text(`Horas Disponibles: ${Math.round(totalHours - reservedHours)}`);
    
    doc.moveDown();
    doc.fontSize(14).text('Detalle por Recurso', { underline: true });
    resources.forEach(r => {
        const resourceHours = r.reserva.reduce((h, res) => {
            const duration = (new Date(res.end_date) - new Date(res.start_date)) / (1000 * 60 * 60);
            return h + duration;
        }, 0);
        const resourceRate = Math.round((resourceHours / (14 * 7)) * 100);
        doc.fontSize(11)
            .text(`${r.name}: ${resourceRate}% ocupado (${Math.round(resourceHours)} horas)`, { color: resourceRate > 50 ? '#ff0000' : '#008000' });
    });

    return doc;
}

// Reporte administrativo (usuarios, sitios activos, ingresos)
async function generateAdministrativeReport(userId) {
    // Verificar que sea admin (puedes agregar lógica de roles)
    // Por ahora lo hacemos accessible a cualquier usuario

    const totalUsers = await prisma.User.count();
    const totalSites = await prisma.Site.count();
    const totalReservas = await prisma.Reserva.count();
    const completedReservas = await prisma.Reserva.count({
        where: { status: 'Completed' }
    });
    const activeReservas = await prisma.Reserva.count({
        where: { status: { in: ['Active', 'In Progress'] } }
    });

    const doc = new PDFDocument();
    doc.fontSize(20).text('Reporte Administrativo General', { align: 'center' });
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Estadísticas Globales', { underline: true });
    doc.fontSize(12)
        .text(`Total de Usuarios: ${totalUsers}`)
        .text(`Total de Sitios: ${totalSites}`)
        .text(`Total de Reservas: ${totalReservas}`)
        .text(`Reservas Completadas: ${completedReservas}`)
        .text(`Reservas Activas/En Curso: ${activeReservas}`);

    doc.moveDown();
    const completionRate = totalReservas > 0 ? Math.round((completedReservas / totalReservas) * 100) : 0;
    doc.fontSize(14).text('Indicadores de Desempeño', { underline: true });
    doc.fontSize(12)
        .text(`Tasa de Finalización: ${completionRate}%`)
        .text(`Promedio de Reservas por Usuario: ${totalUsers > 0 ? (totalReservas / totalUsers).toFixed(2) : 0}`);

    return doc;
}

// Reporte personal del usuario (sus reservas, historial)
async function generateUserReport(userId) {
    const user = await prisma.User.findUnique({
        where: { id: BigInt(userId) }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const reservas = await prisma.Reserva.findMany({
        where: { id_owner: BigInt(userId) },
        include: {
            Resource: {
                select: { name: true, belongs: { select: { name: true } } }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 50
    });

    const doc = new PDFDocument();
    doc.fontSize(20).text('Mi Historial de Reservas', { align: 'center' });
    doc.fontSize(12).text(`Usuario: ${user.name || user.username}`, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Total de Reservas: ${reservas.length}`, { underline: true });
    doc.moveDown();

    const groupedByStatus = {};
    reservas.forEach(r => {
        if (!groupedByStatus[r.status]) groupedByStatus[r.status] = 0;
        groupedByStatus[r.status]++;
    });

    doc.fontSize(12).text('Resumen por Estado:');
    Object.entries(groupedByStatus).forEach(([status, count]) => {
        doc.text(`  ${status}: ${count}`);
    });

    doc.moveDown();
    doc.fontSize(12).text('Últimas Reservas:');
    reservas.slice(0, 10).forEach(r => {
        const start = new Date(r.start_date).toLocaleDateString();
        doc.fontSize(10)
            .text(`${r.Resource.belongs.name} - ${r.Resource.name}`)
            .text(`  ${start} | Estado: ${r.status}`, { color: '#666' });
    });

    return doc;
}

// Reporte completo de un sitio
async function generateCompleteSiteReport(siteId, userId) {
    const site = await prisma.Site.findFirst({
        where: { id: siteId, id_owner: BigInt(userId) }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId },
        include: {
            reserva: true,
            type: true
        }
    });

    const totalReservas = resources.reduce((sum, r) => sum + r.reserva.length, 0);

    const doc = new PDFDocument();
    doc.fontSize(20).text('Reporte Completo del Sitio', { align: 'center' });
    doc.fontSize(14).text(site.name, { align: 'center' });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown();

    // Información del sitio
    doc.fontSize(14).text('Información General', { underline: true });
    doc.fontSize(11)
        .text(`Descripción: ${site.description || 'N/A'}`)
        .text(`Horario: ${site.opening_hour || '--'}:00 - ${site.closing_hour || '--'}:00`)
        .text(`Fecha de Creación: ${new Date(site.date_created).toLocaleDateString()}`);

    doc.moveDown();

    // Recursos
    doc.fontSize(14).text('Recursos', { underline: true });
    resources.forEach(r => {
        doc.fontSize(11).text(`${r.name} (${r.type?.name || 'N/A'})`);
        doc.fontSize(10)
            .text(`  Reservas: ${r.reserva.length}`)
            .text(`  Capacidad: ${r.capacity || 'N/A'}`);
    });

    doc.moveDown();

    // Estadísticas
    doc.fontSize(14).text('Estadísticas', { underline: true });
    doc.fontSize(11)
        .text(`Total de Reservas: ${totalReservas}`)
        .text(`Total de Recursos: ${resources.length}`)
        .text(`Tasa de Ocupación Promedio: ${resources.length > 0 ? Math.round((totalReservas / resources.length / 70) * 100) : 0}%`);

    return doc;
}

module.exports = {
    generateSiteUsageReport,
    generateSiteOccupancyReport,
    generateAdministrativeReport,
    generateUserReport,
    generateCompleteSiteReport
};
