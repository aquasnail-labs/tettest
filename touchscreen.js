const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const CELL = 40;
let grid, hand, score, highScore = localStorage.getItem('tettest_hs') || 0;
let drag = null, flash = 0;

// Zabrání posouvání stránky při hraní na mobilu
document.body.style.touchAction = 'none';

// --- FUNKCE PRO VSTUPY (MYŠ I DOTYK) ---

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function handleStart(e) {
    const { x, y } = getPos(e);
    hand.forEach((p, i) => {
        if(!p) return;
        const px = 70 + i*135, py = 520;
        if(x > px && x < px + 100 && y > py && y < py + 100) {
            drag = { ...p, idx: i, mx: x, my: y, scale: 0.8 };
            hand[i] = null; 
            draw();
        }
    });
}

function handleMove(e) {
    if(drag) {
        e.preventDefault(); // Zabrání scrollování
        const { x, y } = getPos(e);
        drag.mx = x; drag.my = y;
        if(drag.scale < 1.0) drag.scale += 0.1;
        draw();
    }
}

function handleEnd(e) {
    if(!drag) return;
    // Použijeme poslední známou pozici z eventu (touchend používá changedTouches)
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    
    const gx = Math.floor((clientX - rect.left - 50) / CELL);
    const gy = Math.floor((clientY - rect.top - 50) / CELL);
    
    let can = gx >= 0 && gy >= 0 && drag.shape.every((r, y) => r.every((v, x) => !v || (gy+y < 10 && gx+x < 10 && !grid[gy+y][gx+x].v)));
    
    if(can) {
        let count = 0;
        drag.shape.forEach((r, y) => r.forEach((v, x) => { if(v) { grid[gy+y][gx+x] = {v:1, c:drag.color}; count++; }}));
        score += count; 
        document.getElementById('score').innerText = score;
        resolveLines();
        if(hand.every(h => !h)) { refillHand(); checkGameOver(); }
        saveGame();
    } else { 
        hand[drag.idx] = { shape: drag.shape, color: drag.color }; 
    }
    drag = null; 
    draw();
}

// Event Listenery pro oba světy
canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, {passive: false});
window.addEventListener('touchmove', handleMove, {passive: false});
window.addEventListener('touchend', handleEnd);

// ... zbytek tvých původních funkcí (newGame, draw, resolveLines atd.) zůstává stejný ...
