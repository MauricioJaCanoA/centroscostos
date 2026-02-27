import { Menu } from 'primereact/menu';
import '../utils/css/navbar.css';
import logo from '../utils/images/logo-negative.png';

function Navbar() {

    const items = [
        { label: 'Generales', icon: 'pi pi-fw pi-list', url: '/CentroCostos/generales' },
    ];

    return (
        <div className="navbar-local">
            <div className="navbar-logo">
                <img src={logo} alt="Logo" />
            </div>
            <Menu model={items} className="menu" />
        </div>
    );
}

export default Navbar;