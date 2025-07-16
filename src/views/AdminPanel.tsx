"use client";

import React, { useState } from "react";
import Caja from "./Caja";
import Sucursales from "./Sucursales";
import Colaboradores from "./Colaboradores";
import Skills from "./Skills";
import GestionAgendamientos from "./GestionAgendamientos";
import NuevaAgendamiento from "./NuevaAgendamiento";
import Liquidaciones from "./Liquidaciones";
import CampanasFidelizacion from "./CampanasFidelizacion";
import AdminCupones from "./AdminCupones";
import AnalisisFidelizacion from "./AnalisisFidelizacion";
import GestionExistencias from "./GestionExistencias";
import GestionUsuariosWeb from "./GestionUsuariosWeb";
import GestionProductos from "./GestionProductos";
import GestionIngresosEgresos from "./GestionIngresosEgresos";
import GestionPermisos from "./GestionPermisos";
import VentaServicios from "./VentaServicios";
import VentaProductos from "./VentaProductos";
import InformePerdidas from "./InformePerdidas";
import InformeVentas from "./InformeVentas";
import InformeServicios from "./InformeServicios";
import InformeParticipacion from "./InformeParticipacion";
import GestorControlCupones from "./GestorControlCupones";
import GestorControlCampanas from "./GestorControlCampanas"; 








const menuItems = [
  { label: "Inicio", route: "/", icon: "bi bi-house-door-fill" },
  { label: "Ventas", route: "/ventas", icon: "bi bi-cart-fill", submenu: ["Caja", "Venta de servicios", "Venta de productos"] },
  { label: "Bodegas", route: "/bodegas", icon: "bi bi-box-seam", submenu: ["Gestión de existencias", "Gestión de productos", "Gestión de ingresos/egresos"] },
  { label: "Sucursales", route: "/sucursales", icon: "bi bi-shop", submenu: ["Administrador de Sucursales"] },
  { label: "Fidelización", route: "/fidelizacion", icon: "bi bi-gift-fill", submenu: ["Administrador de campañas", "Administrador de cupones", "Control uso cupones", "Control uso campañas"] }, 
  { label: "Colaboradores", route: "/colaboradores", icon: "bi bi-people-fill", submenu: ["Habilidades o Skills", "Gestión de Colaboradores", "Liquidaciones", "Gestión de permisos"] },
  { label: "Calendario", route: "/calendario", icon: "bi bi-calendar-event-fill", submenu: ["Gestión de Agendamientos", "Nuevo Agendamiento"] },
  { label: "Reportes", route: "/reportes", icon: "bi bi-bar-chart-fill", submenu: ["Análisis fidelización", "Informe de pérdidas", "Informe de ventas", "Informe de servicios", "Informe de participación"] },
  { label: "Administración", route: "/admin", icon: "bi bi-gear-fill", submenu: ["Gestión de usuarios web"] },
];

export default function AdminPanel({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const [selectedView, setSelectedView] = useState("Caja");
  const toggleMenu = (idx: number) => {
    setOpenMenus((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };
  const handleSubmenuClick = (item: string) => {
    if (item === "Caja") setSelectedView("Caja");
    else if (item === "Venta de servicios") setSelectedView("VentaServicios");
    else if (item === "Venta de productos") setSelectedView("VentaProductos");
    else if (item === "Gestión de productos") setSelectedView("GestionProductos");
    else if (item === "Gestión de ingresos/egresos") setSelectedView("GestionIngresosEgresos");
    else if (item === "Gestión de existencias") setSelectedView("GestionExistencias");
    else if (item === "Administrador de Sucursales") setSelectedView("Sucursales");
    else if (item === "Gestión de Colaboradores") setSelectedView("Colaboradores");
    else if (item === "Habilidades o Skills") setSelectedView("Skills");
    else if (item === "Gestión de Agendamientos") setSelectedView("GestionAgendamientos");
    else if (item === "Nuevo Agendamiento") setSelectedView("NuevaAgendamiento");
    else if (item === "Liquidaciones") setSelectedView("Liquidaciones");
    else if (item === "Administrador de campañas") setSelectedView("CampanasFidelizacion");
    else if (item === "Administrador de cupones") setSelectedView("AdminCupones");
    else if (item === "Control uso cupones") setSelectedView("GestorControlCupones"); 
    else if (item === "Control uso campañas") setSelectedView("GestorControlCampanas"); 
    else if (item === "Análisis fidelización") setSelectedView("AnalisisFidelizacion");
    else if (item === "Gestión de usuarios web") setSelectedView("GestionUsuariosWeb");
    else if (item === "Gestión de permisos") setSelectedView("GestionPermisos");
    else if (item === "Informe de pérdidas") setSelectedView("InformePerdidas");
    else if (item === "InformeVentas") setSelectedView("InformeVentas");
    else if (item === "InformeServicios") setSelectedView("InformeServicios");
    else if (item === "InformeParticipacion") setSelectedView("InformeParticipacion");
    else setSelectedView("");
    setSidebarOpen(false);
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      {}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-gray-300 rounded p-2 shadow"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Open sidebar"
      >
        <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-700"></span>
      </button>
      {}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-72 bg-[#f6fffd] border-r border-gray-200 flex flex-col justify-between py-4 px-3 z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          <div className="flex items-center mb-8 px-2">
            <img src="/logo.svg" alt="logo" className="w-8 h-8 mr-2" />
            <span className="font-bold text-lg tracking-wide">Barber Racing</span>
            <button
              className="ml-auto rounded-full bg-white border border-gray-300 w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <span>&#10005;</span>
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <div key={item.route}>
                <a
                  href={item.route}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-[#7ee3ea] hover:text-black transition ${selectedView === item.label.replace(/ /g, '') ? 'bg-[#7ee3ea] text-black' : ''}`}
                  onClick={item.submenu ? (e) => { e.preventDefault(); toggleMenu(idx); } : () => setSelectedView(item.label.replace(/ /g, ''))}
                >
                  <i className={`${item.icon} text-xl`}></i>
                  {item.label}
                  {item.submenu && (
                    <span className="ml-auto text-lg">{openMenus[idx] ? '\u25B2' : '\u25BC'}</span>
                  )}
                </a>
                {item.submenu && openMenus[idx] && (
                  <div className="ml-10 mt-1 flex flex-col gap-1">
                    {item.submenu.map((sub: string) => (
                      <a key={sub} href="#" className="text-gray-600 text-sm px-2 py-1 rounded hover:bg-[#e0f7fa]" onClick={() => handleSubmenuClick(sub)}>{sub}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="mb-2 px-2">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <i className="bi bi-gear text-lg"></i>
            <span className="text-sm">Opciones</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <img src="https:
            <div className="flex-1">
              <div className="font-semibold text-sm">Nombre user</div>
              <div className="text-xs text-gray-500">f.ledz3@gmai.com</div>
            </div>
            <i className="bi bi-box-arrow-right text-2xl text-blue-600"></i>
          </div>
        </div>
      </aside>
      {}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      <main className="flex-1 p-8">
        {selectedView === "Caja" && <Caja />}
        {selectedView === "VentaServicios" && <VentaServicios />}
        {selectedView === "VentaProductos" && <VentaProductos />}
        {selectedView === "Sucursales" && <Sucursales />}
        {selectedView === "Colaboradores" && <Colaboradores />}
        
        {selectedView === "Skills" && <Skills />}
        {selectedView === "GestionAgendamientos" && <GestionAgendamientos />}
        {selectedView === "NuevaAgendamiento" && <NuevaAgendamiento />}
        {selectedView === "Liquidaciones" && <Liquidaciones />}
        {selectedView === "CampanasFidelizacion" && <CampanasFidelizacion />}
        {selectedView === "AdminCupones" && <AdminCupones />}
        {selectedView === "AnalisisFidelizacion" && <AnalisisFidelizacion />}
        {selectedView === "GestionExistencias" && <GestionExistencias />}
        {selectedView === "GestionUsuariosWeb" && <GestionUsuariosWeb />}
        {selectedView === "GestionProductos" && <GestionProductos />}
        {selectedView === "GestionIngresosEgresos" && <GestionIngresosEgresos />}
        {selectedView === "GestionPermisos" && <GestionPermisos />}
        {selectedView === "InformePerdidas" && <InformePerdidas />}
        {selectedView === "InformeVentas" && <InformeVentas />}
        {selectedView === "InformeServicios" && <InformeServicios />}
        {selectedView === "InformeParticipacion" && <InformeParticipacion />}
        {selectedView === "GestorControlCupones" && <GestorControlCupones />} {}
        {selectedView === "GestorControlCampanas" && <GestorControlCampanas />}
      </main>
    </div>
  );
}
