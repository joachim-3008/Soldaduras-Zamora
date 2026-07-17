const div = document.getElementById('notification');

if (div) {
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '99999';

    div.className = "fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none";

    document.body.appendChild(div);
}

export const createNotification = (isError, message) => {
    const bgColor = isError ? 'bg-red-500' : 'bg-green-500';
    const borderColor = isError ? 'border-red-600' : 'border-green-600';

    // 2. Creamos un elemento único para esta notificación
    const notificationCard = document.createElement('div');
    notificationCard.className = `transform translate-x-10 opacity-0 transition-all duration-300 ease-out ${bgColor} border-l-4 ${borderColor} text-white p-4 rounded-lg shadow-2xl font-bold flex items-center justify-between pointer-events-auto min-w-[280px] max-w-sm`;
    
    notificationCard.innerHTML = `
        <span class="mr-4">${message}</span>
        <button class="text-white hover:text-gray-200 font-bold focus:outline-none" onclick="this.parentElement.remove()">✕</button>
    `;

    div.appendChild(notificationCard);

    setTimeout(() => {
        notificationCard.classList.remove('translate-x-10', 'opacity-0');
    }, 10);

    setTimeout(() => {
        notificationCard.classList.add('translate-x-10', 'opacity-0');
        // Esperamos a que termine la animación de salida antes de borrar el elemento del DOM
        setTimeout(() => {
            notificationCard.remove();
        }, 300);
    }, 4000);
};