import ReactDOM from 'react-dom/client';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './index.css';
import App from './App';
import { PrimeReactProvider, addLocale } from 'primereact/api';

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',
  dateFormat: 'dd/mm/yy',
  weak: 'Débil',
  medium: 'Medio',
  strong: 'Fuerte',
  passwordPrompt: 'Ingrese una contraseña',
  emptyFilterMessage: 'Sin resultados',
  emptyMessage: 'Sin resultados',
  startsWith: 'Empieza con',
  contains: 'Contiene',
  notContains: 'No contiene',
  endsWith: 'Termina con',
  equals: 'Igual a',
  notEquals: 'Diferente de',
  noFilter: 'Sin filtro',
  lt: 'Menor que',
  lte: 'Menor o igual que',
  gt: 'Mayor que',
  gte: 'Mayor o igual que',
  dateIs: 'La fecha es',
  dateIsNot: 'La fecha no es',
  dateBefore: 'Antes de',
  dateAfter: 'Después de',
  apply: 'Aplicar',
  matchAll: 'Coincidir con todo',
  matchAny: 'Coincidir con cualquiera',
  addRule: 'Agregar regla',
  removeRule: 'Eliminar regla',
  accept: 'Sí',
  reject: 'No',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar'
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrimeReactProvider value={{ locale: 'es' }}>
    <App />
  </PrimeReactProvider>
);