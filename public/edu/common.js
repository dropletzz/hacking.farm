document.addEventListener('DOMContentLoaded', () => {
    const solutionButtons = document.querySelectorAll('.show-solution');
    solutionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const solution = button.closest('.solution-container').querySelector('.solution');
            const hidden = solution.classList.toggle('hidden');
            button.innerHTML = `<span class="icon" aria-hidden="true">${hidden ? '' : ''}</span> soluzione`;
        });
    });
});

