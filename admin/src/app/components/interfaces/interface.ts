export interface IProducto {
    galeria: { imagen: string | null, _id: string }[];
    nventas: number;
    npuntos: number;
    categoria: string;
    titulo_variedad: string;
    estado: string;
    _id: string;
    titulo: string;
    stock: number;
    precio: number;
    descripcion: string;
    contenido: string;
    slug: string;
    portada: string;
    variedades: { titulo: string }[];
    createdAt: string;
    __v: number;
}

export interface IConfig {

    _id: {
        $oid: string;
    };
    categorias: Categoria[];
    titulo: string;
    logo: string;
    serie: string;
    correlativo: string;
    __v: {
        $numberInt: string;
    };
}

interface Categoria {
    titulo: string;
    icono: string;
    _id: string;
}

