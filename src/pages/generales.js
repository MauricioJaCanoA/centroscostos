import axios from 'axios';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ScrollPanel } from 'primereact/scrollpanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import Navbar from '../components/navbar';
import '../utils/css/generales.css';

const baseUrl = process.env.REACT_APP_API_URL;
const headerAnioStyle = { backgroundColor: '#0084C7', color: '#FFFFFF' };
const rowAnioStyle = { backgroundColor: '#2F9FDE', color: '#FFFFFF' };
const headerMesStyle = { backgroundColor: '#0791B2', color: '#FFFFFF' };
const headerDivisionStyle = { backgroundColor: '#47B3D9', color: '#FFFFFF' };

function Generales() {
    // Variables data & state
    const [loader, setLoader] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [divisiones, setDivisiones] = useState([]);
    //const [clientes, setClientes] = useState([]);
    //const [rutas, setRutas] = useState([]);

    // Filters state
    const [division, setDivision] = useState('');
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth);
    const [fechaFinal, setFechaFinal] = useState(today);
    //const [ruta, setRuta] = useState([]);
    //const [cliente, setCliente] = useState('');

    // Data state
    const [generales, setGenerales] = useState([]);

    // Column Definitions
    const columnasGenerales = [
        //{ field: 'mes', header: 'Mes' },
        //{ field: 'anio', header: 'Año' },
        { field: 'tipo_operacion', header: 'Tipo Operacion' },
        { field: 'Total_Ingresos', header: 'Total Ingresos', type: 'money' },
        { field: 'Kms_Ruta', header: 'Kms Rutas', type: 'number' },
        { field: 'KMS_Lleno', header: 'Kms Lleno', type: 'number' },
        { field: 'KMS_Vacio', header: 'Kms Vacio', type: 'number' },
        { field: 'Peso', header: 'Peso', type: 'number' },
        { field: 'Gastos_viaje_liq', header: 'Gastos Viaje Liquidacion', type: 'money' },
        { field: 'Gastos_deducciones_liq', header: 'Gastos Deducciones Liq', type: 'money' },
        { field: 'sueldo_liq', header: 'Sueldo Liquidacion', type: 'money' },
        { field: 'sueldo_operador', header: 'Sueldo Operador', type: 'money' },
        { field: 'Cas_Cred', header: 'Caseta Credito', type: 'money' },
        { field: 'casetasLiq', header: 'Caseta Liquidacion', type: 'money' },
        { field: 'casetas', header: 'Casetas', type: 'money' },
        { field: 'CostoDieselLiq', header: 'Costo Diesel Liquidacion', type: 'money' },
        { field: 'DieselLiq', header: 'Diesel Liquidacion', type: 'money' },
        { field: 'Factor_diesel', header: 'Factor Diesel', type: 'number' },
        //{ field: 'Factor_lleno_diesel', header: 'Factor Lleno Diesel', type: 'number' },
        //{ field: 'Factor_vacio_diesel', header: 'Factor Vacio Diesel', type: 'number' },
        { field: 'Total Gastos Viaje', header: 'Total Gastos Viajes', type: 'money' },
        { field: 'M_Prev', header: 'M Prev', type: 'money' },
        { field: 'Llantas', header: 'Llantas', type: 'money' },
        { field: 'M_Corr', header: 'M Corr', type: 'money' },
        { field: 'Otros_talleres', header: 'Otros Talleres', type: 'money' },
        { field: 'Siniestros', header: 'Siniestros', type: 'money' },
        { field: 'Consumibles', header: 'Consumibles', type: 'money' },
        { field: 'VSA', header: 'Vehiculos Sin Asignacion', type: 'money' },
        { field: 'otros_mantenimiento', header: 'Otros Mantenimiento', type: 'money' },
        { field: 'Total_mantenimiento', header: 'Total Mantenimiento', type: 'money' },
        { field: 'total_gastos', header: 'Total Gastos', type: 'money' },
        { field: 'Cont_Marginal', header: 'Cont Marginal', type: 'money' },
        { field: '%cont_marginal', header: 'Cont Marginal (%)', type: 'percent' },
    ];

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '';
        const val = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(val)) return value;
        return val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined) return '';
        const val = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(val)) return value;
        return val.toLocaleString('es-MX');
    };

    const formatYyyyMmDd = (date) => {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
    };

    // Body Template para formatear celdas
    const bodyTemplate = (rowData, col) => {
        if (col.type === 'money') {
            return formatCurrency(rowData[col.field]);
        }
        if (col.type === 'number') {
            return formatNumber(rowData[col.field]);
        }
        return rowData[col.field];
    };

    const getGenerales = async (fInicio = null, fFinal = null) => {
        setLoader(true);

        const params = {};
        params.fecha_inicial = fInicio ? fInicio : (fechaInicio ? formatYyyyMmDd(new Date(fechaInicio)) + ' 00:00:00' : null);
        params.fecha_final = fFinal ? fFinal : (fechaFinal ? formatYyyyMmDd(new Date(fechaFinal)) + ' 23:59:59' : null);
        params.id_division = division ? division.id_division : null;

        try {
            const res = await axios.get(baseUrl + '/CentroCostos/api/getGenerales', { params: params });        
            const dataWithId = res.data.map((item, index) => ({ ...item, id_unique: index }));
            setGenerales(dataWithId);
            setLoader(false);
        } catch (err) {
            console.log(err);
        }
    };

    const getDivisiones = async () => {
        try {
            const res = await axios.get(baseUrl + '/CentroCostos/api/getDivisiones');
            setDivisiones(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleFiltros = () => {
        const fIni = fechaInicio ? formatYyyyMmDd(new Date(fechaInicio)) + ' 00:00:00' : null;
        const fFin = fechaFinal ? formatYyyyMmDd(new Date(fechaFinal)) + ' 23:59:59' : null;
        getGenerales(fIni, fFin);
    };

    useEffect(() => {
        getGenerales();
        getDivisiones();
    }, []);


    // Group By Year -> Month -> Data
    const getCascadingData = () => {
        const groups = {};

        generales.forEach(item => {
            const yearKey = item.anio;
            const monthKey = item.mes;

            if (!groups[yearKey]) {
                groups[yearKey] = {
                    anio: yearKey,
                    months: {},
                    totalIngresos: 0,
                    totalGastos: 0,
                    totalKmsRuta: 0,
                    totalKmsLleno: 0,
                    totalKmsVacio: 0,
                    totalPeso: 0,
                    totalGastosViajeLiq: 0,
                    totalGastosDeduccionesLiq: 0,
                    totalSueldoLiq: 0,
                    totalSueldoOperador: 0,
                    totalCasetasCredito: 0,
                    totalCasetasLiquidacion: 0,
                    totalCasetas: 0,
                    totalCostoDieselLiq: 0,
                    totalDieselLiq: 0,
                    totalFactorDiesel: 0,
                    totalMPrev: 0,
                    totalLlantas: 0,
                    totalMCorr: 0,
                    totalOtrosTalleres: 0,
                    totalSiniestros: 0,
                    totalConsumibles: 0,
                    totalVSA: 0,
                    totalOtrosMantenimiento: 0,
                    totalMantenimiento: 0,
                    totalGastos: 0,
                    totalContMarginal: 0,
                    totalContMarginalPercent: 0,                    
                    uniqueId: `year-${yearKey}`
                };
            }

            // Accumulate Year Totals
            groups[yearKey].totalIngresos += parseFloat(item.Total_Ingresos || 0);
            groups[yearKey].totalGastos += parseFloat(item.total_gastos || 0);
            groups[yearKey].totalKmsRuta += parseFloat(item.Kms_Ruta || 0);
            groups[yearKey].totalKmsLleno += parseFloat(item.KMS_Lleno || 0);
            groups[yearKey].totalKmsVacio += parseFloat(item.KMS_Vacio || 0);
            groups[yearKey].totalPeso += parseFloat(item.Peso || 0);
            groups[yearKey].totalGastosViajeLiq += parseFloat(item.Gastos_viaje_liq || 0);
            groups[yearKey].totalGastosDeduccionesLiq += parseFloat(item.Gastos_deducciones_liq || 0);
            groups[yearKey].totalSueldoLiq += parseFloat(item.sueldo_liq || 0);
            groups[yearKey].totalSueldoOperador += parseFloat(item.sueldo_operador || 0);
            groups[yearKey].totalCasetasCredito += parseFloat(item.Cas_Cred || 0);
            groups[yearKey].totalCasetasLiquidacion += parseFloat(item.casetasLiq || 0);
            groups[yearKey].totalCasetas += parseFloat(item.casetas || 0);
            groups[yearKey].totalCostoDieselLiq += parseFloat(item.CostoDieselLiq || 0);
            groups[yearKey].totalDieselLiq += parseFloat(item.DieselLiq || 0);
            groups[yearKey].totalFactorDiesel += parseFloat(item.Factor_diesel || 0);
            groups[yearKey].totalMPrev += parseFloat(item.M_Prev || 0);
            groups[yearKey].totalLlantas += parseFloat(item.Llantas || 0);
            groups[yearKey].totalMCorr += parseFloat(item.M_Corr || 0);
            groups[yearKey].totalOtrosTalleres += parseFloat(item.Otros_talleres || 0);
            groups[yearKey].totalSiniestros += parseFloat(item.Siniestros || 0);
            groups[yearKey].totalConsumibles += parseFloat(item.Consumibles || 0);
            groups[yearKey].totalVSA += parseFloat(item.VSA || 0);
            groups[yearKey].totalOtrosMantenimiento += parseFloat(item.otros_mantenimiento || 0);
            groups[yearKey].totalMantenimiento += parseFloat(item.Total_mantenimiento || 0);
            groups[yearKey].totalGastos += parseFloat(item.total_gastos || 0);
            groups[yearKey].totalContMarginal += parseFloat(item.Cont_Marginal || 0);
            groups[yearKey].totalContMarginalPercent += parseFloat(item['%cont_marginal'] || 0);

            

            if (!groups[yearKey].months[monthKey]) {
                groups[yearKey].months[monthKey] = {
                    mes: monthKey,
                    anio: yearKey,
                    items: [],
                    totalIngresos: 0,
                    totalGastos: 0,
                    totalKmsRuta: 0,
                    totalKmsLleno: 0,
                    totalKmsVacio: 0,
                    totalPeso: 0,
                    totalGastosViajeLiq: 0,
                    totalGastosDeduccionesLiq: 0,
                    totalSueldoLiq: 0,
                    totalSueldoOperador: 0,
                    totalCasetasCredito: 0,
                    totalCasetasLiquidacion: 0,
                    totalCasetas: 0,
                    totalCostoDieselLiq: 0,
                    totalDieselLiq: 0,
                    totalFactorDiesel: 0,
                    totalMPrev: 0,
                    totalLlantas: 0,
                    totalMCorr: 0,
                    totalOtrosTalleres: 0,
                    totalSiniestros: 0,
                    totalConsumibles: 0,
                    totalVSA: 0,
                    totalOtrosMantenimiento: 0,
                    totalMantenimiento: 0,
                    totalGastos: 0,
                    totalContMarginal: 0,
                    totalContMarginalPercent: 0,
                    uniqueId: `month-${yearKey}-${monthKey}`
                };
            }

            // Accumulate Month Totals
            groups[yearKey].months[monthKey].totalIngresos += parseFloat(item.Total_Ingresos || 0);
            groups[yearKey].months[monthKey].totalGastos += parseFloat(item.total_gastos || 0);
            groups[yearKey].months[monthKey].totalKmsRuta += parseFloat(item.Kms_Ruta || 0);
            groups[yearKey].months[monthKey].totalKmsLleno += parseFloat(item.KMS_Lleno || 0);
            groups[yearKey].months[monthKey].totalKmsVacio += parseFloat(item.KMS_Vacio || 0);
            groups[yearKey].months[monthKey].totalPeso += parseFloat(item.Peso || 0);
            groups[yearKey].months[monthKey].totalGastosViajeLiq += parseFloat(item.Gastos_viaje_liq || 0);
            groups[yearKey].months[monthKey].totalGastosDeduccionesLiq += parseFloat(item.Gastos_deducciones_liq || 0);
            groups[yearKey].months[monthKey].totalSueldoLiq += parseFloat(item.sueldo_liq || 0);
            groups[yearKey].months[monthKey].totalSueldoOperador += parseFloat(item.sueldo_operador || 0);
            groups[yearKey].months[monthKey].totalCasetasCredito += parseFloat(item.Cas_Cred || 0);
            groups[yearKey].months[monthKey].totalCasetasLiquidacion += parseFloat(item.casetasLiq || 0);
            groups[yearKey].months[monthKey].totalCasetas += parseFloat(item.casetas || 0);
            groups[yearKey].months[monthKey].totalCostoDieselLiq += parseFloat(item.CostoDieselLiq || 0);
            groups[yearKey].months[monthKey].totalDieselLiq += parseFloat(item.DieselLiq || 0);
            groups[yearKey].months[monthKey].totalFactorDiesel += parseFloat(item.Factor_diesel || 0);
            groups[yearKey].months[monthKey].totalMPrev += parseFloat(item.M_Prev || 0);
            groups[yearKey].months[monthKey].totalLlantas += parseFloat(item.Llantas || 0);
            groups[yearKey].months[monthKey].totalMCorr += parseFloat(item.M_Corr || 0);
            groups[yearKey].months[monthKey].totalOtrosTalleres += parseFloat(item.Otros_talleres || 0);
            groups[yearKey].months[monthKey].totalSiniestros += parseFloat(item.Siniestros || 0);
            groups[yearKey].months[monthKey].totalConsumibles += parseFloat(item.Consumibles || 0);
            groups[yearKey].months[monthKey].totalVSA += parseFloat(item.VSA || 0);
            groups[yearKey].months[monthKey].totalOtrosMantenimiento += parseFloat(item.otros_mantenimiento || 0);
            groups[yearKey].months[monthKey].totalMantenimiento += parseFloat(item.Total_mantenimiento || 0);
            groups[yearKey].months[monthKey].totalGastos += parseFloat(item.total_gastos || 0);
            groups[yearKey].months[monthKey].totalContMarginal += parseFloat(item.Cont_Marginal || 0);
            groups[yearKey].months[monthKey].totalContMarginalPercent += parseFloat(item['%cont_marginal'] || 0);

            groups[yearKey].months[monthKey].items.push(item);
        });

        
        // Convert objects to arrays for DataTable
        return Object.values(groups).map(yearGroup => ({
            ...yearGroup,
            months: Object.values(yearGroup.months)
        })).sort((a, b) => b.anio - a.anio); // Sort years descending
    };

    const [expandedYearRows, setExpandedYearRows] = useState(null); // For Year expansion
    const [expandedMonthRows, setExpandedMonthRows] = useState(null); // For Month expansion

    // Level 3: Details (Leaf Nodes)
    const monthExpansionTemplate = (monthData) => {
        return (
            <div className="p-3 bg-light">
                <DataTable
                    value={monthData.items}
                    size="small"
                    showGridlines
                    stripedRows                    
                    header={<h4>Detalles Por Division: {monthData.mes} {monthData.anio}</h4>}                    
                    selection={selectedRow}
                    onSelectionChange={(e) => handleRowClick(e.value)}
                    selectionMode="single"
                    dataKey="id_unique"
                >
                    {columnasGenerales.map((col) => (
                        <Column
                            key={col.field}
                            field={col.field}
                            header={col.header}
                            sortable
                            body={(rowData) => bodyTemplate(rowData, col)}
                            style={{ minWidth: '150px' }}
                            frozen={col.field === 'tipo_operacion'}
                            alignFrozen={col.field === 'tipo_operacion' ? 'left' : undefined}
                            headerStyle={headerDivisionStyle}
                        />
                    ))}
                </DataTable>
            </div>
        );
    };

    // Level 2: Months (Nested inside Year)
    const yearExpansionTemplate = (yearData) => {
        // We filter months that belong to this year group
        const months = Object.values(yearData.months || {});
        return (
            <div className="p-3 pl-5">
                <DataTable
                    value={months}
                    expandedRows={expandedMonthRows}
                    onRowToggle={(e) => setExpandedMonthRows(e.data)}
                    rowExpansionTemplate={monthExpansionTemplate}                
                    dataKey="uniqueId"
                >
                    <Column expander style={{ width: '3rem' }} headerStyle={headerMesStyle} />
                    <Column field="mes" header="Mes" sortable headerStyle={headerMesStyle} />
                    <Column field="totalIngresos" header="Total Ingresos (Mes)" body={(rowData) => formatCurrency(rowData.totalIngresos)} headerStyle={headerMesStyle} />
                    <Column field="totalGastos" header="Total Gastos (Mes)" body={(rowData) => formatCurrency(rowData.totalGastos)} headerStyle={headerMesStyle} />
                    <Column field="totalKmsRuta" header="Total Kms Ruta (Mes)" body={(rowData) => formatCurrency(rowData.totalKmsRuta)} headerStyle={headerMesStyle} />
                    <Column field="totalKmsLleno" header="Total Kms Lleno (Mes)" body={(rowData) => formatCurrency(rowData.totalKmsLleno)} headerStyle={headerMesStyle} />
                    <Column field="totalKmsVacio" header="Total Kms Vacio (Mes)" body={(rowData) => formatCurrency(rowData.totalKmsVacio)} headerStyle={headerMesStyle} />
                    <Column field="totalPeso" header="Total Peso (Mes)" body={(rowData) => formatCurrency(rowData.totalPeso)} headerStyle={headerMesStyle} />
                    <Column field="totalGastosViajeLiq" header="Total Gastos Viaje Liq (Mes)" body={(rowData) => formatCurrency(rowData.totalGastosViajeLiq)} headerStyle={headerMesStyle} />
                    <Column field="totalGastosDeduccionesLiq" header="Total Gastos Deducciones Liq (Mes)" body={(rowData) => formatCurrency(rowData.totalGastosDeduccionesLiq)} headerStyle={headerMesStyle} />
                    <Column field="totalSueldoLiq" header="Total Sueldo Liq (Mes)" body={(rowData) => formatCurrency(rowData.totalSueldoLiq)} headerStyle={headerMesStyle} />
                    <Column field="totalSueldoOperador" header="Total Sueldo Operador (Mes)" body={(rowData) => formatCurrency(rowData.totalSueldoOperador)} headerStyle={headerMesStyle} />
                    <Column field="totalCasetasCredito" header="Total Casetas Credito (Mes)" body={(rowData) => formatCurrency(rowData.totalCasetasCredito)} headerStyle={headerMesStyle} />
                    <Column field="totalCasetasLiquidacion" header="Total Casetas Liquidacion (Mes)" body={(rowData) => formatCurrency(rowData.totalCasetasLiquidacion)} headerStyle={headerMesStyle} />
                    <Column field="totalCasetas" header="Total Casetas (Mes)" body={(rowData) => formatCurrency(rowData.totalCasetas)} headerStyle={headerMesStyle} />
                    <Column field="totalCostoDieselLiq" header="Total Costo Diesel Liq (Mes)" body={(rowData) => formatCurrency(rowData.totalCostoDieselLiq)} headerStyle={headerMesStyle} />
                    <Column field="totalDieselLiq" header="Total Diesel Liq (Mes)" body={(rowData) => formatCurrency(rowData.totalDieselLiq)} headerStyle={headerMesStyle} />
                    <Column field="totalFactorDiesel" header="Total Factor Diesel (Mes)" body={(rowData) => formatNumber(rowData.totalFactorDiesel)} headerStyle={headerMesStyle} />
                    <Column field="totalMPrev" header="Total M Prev (Mes)" body={(rowData) => formatCurrency(rowData.totalMPrev)} headerStyle={headerMesStyle} />
                    <Column field="totalLlantas" header="Total Llantas (Mes)" body={(rowData) => formatCurrency(rowData.totalLlantas)} headerStyle={headerMesStyle} />
                    <Column field="totalMCorr" header="Total M Corr (Mes)" body={(rowData) => formatCurrency(rowData.totalMCorr)} headerStyle={headerMesStyle} />
                    <Column field="totalOtrosTalleres" header="Total Otros Talleres (Mes)" body={(rowData) => formatCurrency(rowData.totalOtrosTalleres)} headerStyle={headerMesStyle} />
                    <Column field="totalSiniestros" header="Total Siniestros (Mes)" body={(rowData) => formatCurrency(rowData.totalSiniestros)} headerStyle={headerMesStyle} />
                    <Column field="totalConsumibles" header="Total Consumibles (Mes)" body={(rowData) => formatCurrency(rowData.totalConsumibles)} headerStyle={headerMesStyle} />
                    <Column field="totalVSA" header="Total VSA (Mes)" body={(rowData) => formatCurrency(rowData.totalVSA)} headerStyle={headerMesStyle} />
                    <Column field="totalOtrosMantenimiento" header="Total Otros Mantenimiento (Mes)" body={(rowData) => formatCurrency(rowData.totalOtrosMantenimiento)} headerStyle={headerMesStyle} />
                    <Column field="totalMantenimiento" header="Total Mantenimiento (Mes)" body={(rowData) => formatCurrency(rowData.totalMantenimiento)} headerStyle={headerMesStyle} />
                    <Column field="totalGastos" header="Total Gastos (Mes)" body={(rowData) => formatCurrency(rowData.totalGastos)} headerStyle={headerMesStyle} />
                    <Column field="totalContMarginal" header="Total Cont Marginal (Mes)" body={(rowData) => formatCurrency(rowData.totalContMarginal)} headerStyle={headerMesStyle} />
                    <Column field="totalContMarginalPercent" header="Total Cont Marginal (%) (Mes)" body={(rowData) => formatNumber(rowData.totalContMarginalPercent) + '%'} headerStyle={headerMesStyle} />
                    <Column header="Registros" body={(rowData) => rowData ? rowData.items.length : 0} headerStyle={headerMesStyle} />
                </DataTable>
            </div>
        );
    };

    // Instead of conditional isGrouped logic, we will use the cascading data as the main view
    const cascadingData = getCascadingData();

    const headerPanel = () => {
        return (
            <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Filtros</h5>
            </div>
        );
    };

    const headerTablePrincipal = () => (
        <div className="d-flex gap-2 justify-content-end align-items-center w-100">
            <Button severity='success' className='button-rounded ml-auto' label='Exportar' onClick={exportExcel} icon="pi pi-file-excel" />
        </div>
    );

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(generales);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });

        saveAsExcelFile(excelBuffer, 'generales');
    };

    const saveAsExcelFile = (buffer, fileName) => {
        const data = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };



    const handleRowClick = (row) => {
        setSelectedRow(row);
        console.log(row);
    };

    return (
        <div className='principal'>
            <div className="loader" style={{ display: loader ? 'flex' : 'none' }} >
                <ProgressSpinner />
            </div>
            
            <div className='main-content'>
                <ScrollPanel style={{ width: '100%', height: '90vh' }} className="pb-1">
                    <Panel header={headerPanel} className="w-100 mb-3" toggleable>
                        <div className="d-flex justify-content-center gap-2 pt-3">
                            <Dropdown value={division} onChange={(e) => setDivision(e.value)} filter options={divisiones} optionLabel='division'
                                placeholder='Selecciona Division' size="small" style={{width: '300px'}} />
                            <FloatLabel id="fechaInicial" style={{width: '150px'}} >
                                <Calendar className='w-100' value={fechaInicio} onChange={(e) => setFechaInicio(e.value)} dateFormat="dd/mm/yy" />
                                <label htmlFor="fechaInicial">Fecha Inicial</label>
                            </FloatLabel>
                            <FloatLabel id="fechaFinal" style={{width: '150px'}}>
                                <Calendar className='w-100' value={fechaFinal} onChange={(e) => setFechaFinal(e.value)} dateFormat="dd/mm/yy" />
                                <label htmlFor="fechaFinal">Fecha Final</label>
                            </FloatLabel>
                            <Button severity='info' className='button-rounded' label='Aplicar' onClick={handleFiltros} icon="pi pi-check-circle" />
                        </div>
                    </Panel>

                    <div className="card mb-2">
                        <DataTable value={cascadingData} size="small"
                            showGridlines scrollable
                            scrollHeight="1000px"
                            expandedRows={expandedYearRows}
                            onRowToggle={(e) => setExpandedYearRows(e.data)}
                            rowExpansionTemplate={yearExpansionTemplate}
                            header={headerTablePrincipal}
                            rowStyle={rowAnioStyle}
                            dataKey="uniqueId"
                        >
                            <Column expander style={{ width: '3rem' }} headerStyle={headerAnioStyle} />
                            <Column field="anio" header="Año" sortable headerStyle={headerAnioStyle} row />
                            <Column field="totalIngresos" header="Total Ingresos (Año)" body={(rowData) => formatCurrency(rowData.totalIngresos)} headerStyle={headerAnioStyle} />
                            <Column field="totalGastos" header="Total Gastos (Año)" body={(rowData) => formatCurrency(rowData.totalGastos)} headerStyle={headerAnioStyle} />
                            <Column field="totalKmsRuta" header="Total Kms Ruta (Año)" body={(rowData) => formatCurrency(rowData.totalKmsRuta)} headerStyle={headerAnioStyle} />
                            <Column field="totalKmsLleno" header="Total Kms Lleno (Año)" body={(rowData) => formatCurrency(rowData.totalKmsLleno)} headerStyle={headerAnioStyle} />
                            <Column field="totalKmsVacio" header="Total Kms Vacio (Año)" body={(rowData) => formatCurrency(rowData.totalKmsVacio)} headerStyle={headerAnioStyle} />
                            <Column field="totalPeso" header="Total Peso (Año)" body={(rowData) => formatCurrency(rowData.totalPeso)} headerStyle={headerAnioStyle} />
                            <Column field="totalGastosViajeLiq" header="Total Gastos Viaje Liq (Año)" body={(rowData) => formatCurrency(rowData.totalGastosViajeLiq)} headerStyle={headerAnioStyle} />
                            <Column field="totalGastosDeduccionesLiq" header="Total Gastos Deducciones Liq (Año)" body={(rowData) => formatCurrency(rowData.totalGastosDeduccionesLiq)} headerStyle={headerAnioStyle} />
                            <Column field="totalSueldoLiq" header="Total Sueldo Liq (Año)" body={(rowData) => formatCurrency(rowData.totalSueldoLiq)} headerStyle={headerAnioStyle} />
                            <Column field="totalSueldoOperador" header="Total Sueldo Operador (Año)" body={(rowData) => formatCurrency(rowData.totalSueldoOperador)} headerStyle={headerAnioStyle} />
                            <Column field="totalCasetasCredito" header="Total Casetas Credito (Año)" body={(rowData) => formatCurrency(rowData.totalCasetasCredito)} headerStyle={headerAnioStyle} />
                            <Column field="totalCasetasLiquidacion" header="Total Casetas Liquidacion (Año)" body={(rowData) => formatCurrency(rowData.totalCasetasLiquidacion)} headerStyle={headerAnioStyle} />
                            <Column field="totalCasetas" header="Total Casetas (Año)" body={(rowData) => formatCurrency(rowData.totalCasetas)} headerStyle={headerAnioStyle} />
                            <Column field="totalCostoDieselLiq" header="Total Costo Diesel Liq (Año)" body={(rowData) => formatCurrency(rowData.totalCostoDieselLiq)} headerStyle={headerAnioStyle} />
                            <Column field="totalDieselLiq" header="Total Diesel Liq (Año)" body={(rowData) => formatCurrency(rowData.totalDieselLiq)} headerStyle={headerAnioStyle} />
                            <Column field="totalFactorDiesel" header="Total Factor Diesel (Año)" body={(rowData) => formatNumber(rowData.totalFactorDiesel/(rowData.months ? rowData.months.length : 0))} headerStyle={headerAnioStyle} />
                            <Column field="totalMPrev" header="Total M Prev (Año)" body={(rowData) => formatCurrency(rowData.totalMPrev)} headerStyle={headerAnioStyle} />
                            <Column field="totalLlantas" header="Total Llantas (Año)" body={(rowData) => formatCurrency(rowData.totalLlantas)} headerStyle={headerAnioStyle} />
                            <Column field="totalMCorr" header="Total M Corr (Año)" body={(rowData) => formatCurrency(rowData.totalMCorr)} headerStyle={headerAnioStyle} />
                            <Column field="totalOtrosTalleres" header="Total Otros Talleres (Año)" body={(rowData) => formatCurrency(rowData.totalOtrosTalleres)} headerStyle={headerAnioStyle} />
                            <Column field="totalSiniestros" header="Total Siniestros (Año)" body={(rowData) => formatCurrency(rowData.totalSiniestros)} headerStyle={headerAnioStyle} />
                            <Column field="totalConsumibles" header="Total Consumibles (Año)" body={(rowData) => formatCurrency(rowData.totalConsumibles)} headerStyle={headerAnioStyle} />
                            <Column field="totalVSA" header="Total VSA (Año)" body={(rowData) => formatCurrency(rowData.totalVSA)} headerStyle={headerAnioStyle} />
                            <Column field="totalOtrosMantenimiento" header="Total Otros Mantenimiento (Año)" body={(rowData) => formatCurrency(rowData.totalOtrosMantenimiento)} headerStyle={headerAnioStyle} />
                            <Column field="totalMantenimiento" header="Total Mantenimiento (Año)" body={(rowData) => formatCurrency(rowData.totalMantenimiento)} headerStyle={headerAnioStyle} />
                            <Column field="totalGastos" header="Total Gastos (Año)" body={(rowData) => formatCurrency(rowData.totalGastos)} headerStyle={headerAnioStyle} />
                            <Column field="totalContMarginal" header="Total Cont Marginal (Año)" body={(rowData) => formatCurrency(rowData.totalContMarginal)} headerStyle={headerAnioStyle} />
                            <Column field="totalContMarginalPercent" header="Total Cont Marginal (%) (Año)" body={(rowData) => formatNumber(rowData.totalContMarginalPercent) + '%'} headerStyle={headerAnioStyle} />
                            <Column header="Meses" body={(rowData) => rowData ? (rowData.months ? rowData.months.length : 0) : 0} headerStyle={headerAnioStyle} />
                        </DataTable>
                    </div>

                    {selectedRow && (
                        <Panel header={`Detalles para ${selectedRow.mes}/${selectedRow.anio}`} className="p-mt-4 w-100" toggleable>
                            Información detallada para la fila seleccionada: <br />
                            <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
                        </Panel>
                    )}
                </ScrollPanel>
            </div>
        </div>
    );
}

export default Generales;