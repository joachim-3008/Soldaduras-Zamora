const navBar = document.getElementById("navBar");

const createNavCatalogo = () => {
    navBar.innerHTML =  `
    <div class="class="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-40">
    <header class="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 flex items-center justify-center bg-zinc-900 shadow-md">
          <img
            src="/media/logo-soldadura.jpg"
            alt="Soldaduras Zamora"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="font-sans font-black text-xs sm:text-base tracking-widest uppercase block whitespace-nowrap text-zinc-100">
          Soldaduras Zamora
        </span>
      </div>

      <nav class="flex items-center gap-4 sm:gap-6 font-mono text-xs uppercase tracking-wider">
        <a href="/cart" class="flex items-center gap-2 text-zinc-300 hover:text-amber-400 transition-all font-bold whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-amber-500 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span class="hidden sm:inline">Ver Carrito</span>
        </a>
        <button id="logout-button" class="text-zinc-400 hover:text-red-400 transition-all font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none whitespace-nowrap">
          ✕ <span class="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </nav>
    </header>
    </div>`;
};

const createNavNuevoProd = () => {
    navBar.innerHTML = `<header class="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 flex items-center justify-center bg-zinc-900 shadow-md">
          <img
            src="/media/logo-soldadura.jpg"
            alt="Soldaduras Zamora"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="font-sans font-black text-xs sm:text-base tracking-widest uppercase block whitespace-nowrap text-zinc-100">
          Soldaduras Zamora
        </span>
      </div>

      <nav class="flex items-center gap-4 sm:gap-6 font-mono text-xs uppercase tracking-wider">
        <a href="/cart" class="flex items-center gap-2 text-zinc-300 hover:text-amber-400 transition-all font-bold whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-amber-500 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span class="hidden sm:inline">Ver Carrito</span>
        </a>
        <button id="logout-button" class="text-zinc-400 hover:text-red-400 transition-all font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none whitespace-nowrap">
          ✕ <span class="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </nav>
    </header>`;
};

if (window.location.pathname === '/catalogo/index.html'){
    createNavCatalogo();

}else if (window.location.pathname === '/nuevoProd/'){
    createNavNuevoProd();
};
