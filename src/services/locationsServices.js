const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getEntidades() {
    const entidades = await prisma.Entidad.findMany();
    return entidades;
}

async function getMunicipios(entidadId) {
    const municipios = await prisma.Municipio.findMany({
        where: { id_entidad: entidadId }
    });
    return municipios;
}

async function getLocalidades(entidadId, municipioId) {
    const localidades = await prisma.Localidad.findMany({
        where: { id_entidad: entidadId, id_municipio: municipioId }
    });
    return localidades;
}

module.exports = { getEntidades, getMunicipios, getLocalidades };