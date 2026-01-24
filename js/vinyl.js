/* ========================================
   CINEMATIC MUSIC ENGINE (v1.2)
   Strict State Machine & 3D Math
   ======================================== */

// --- DATA ---
const songs = [
    { title: "Gymnopédie No. 1", artist: "Erik Satie", cover: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Gymnopedie_No_1.mp3" },
    { title: "Night Owl", artist: "Broke For Free", cover: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3" },
    { title: "Spiracles", artist: "Don Marcos", cover: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/No_Color_Preset/Don_Marcos/Don_Marcos_-_808/Don_Marcos_-_03_-_Spiracles.mp3" },
    { title: "Sentinel", artist: "Kai Engel", cover: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/wma/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3" },
    { title: "Moonlight Sonata", artist: "Beethoven", cover: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)", src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Moonlight_Sonata.mp3" },
    { title: "Summer Breeze", artist: "Nature Sounds", cover: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", src: "" },
    { title: "Deep Focus", artist: "Ambient Wave", cover: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", src: "" }
];

// --- STATE MACHINE ---
const STATES = {
    IDLE: 'IDLE',
    TRANSITION: 'TRANSITION',
    PLAYING: 'PLAYING'
};

const STATE = {
    curr: STATES.IDLE,
    activeIndex: 0, // SOURCE OF TRUTH
    spinAngle: 0,
    locked: false
};

// --- DOM ---
const els = {
    root: document.getElementById('app-root'),
    deck: document.getElementById('perspective-deck'),
    vinyl: document.getElementById('activeVinyl'),
    label: document.getElementById('vinylLabel'),
    arm: document.getElementById('tonearm'),
    audio: document.getElementById('audioPlayer'),
    flightZone: document.getElementById('flight-zone'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('trackArtist'),
    playBtn: document.getElementById('mainPlayBtn'),
    status: document.getElementById('statusIndicator')
};

// --- INIT ---
function init() {
    renderDeck();
    updateCarousel(STATE.activeIndex);
    loadTrackInfo(STATE.activeIndex); // Preload text

    // Bind Inputs
    els.playBtn.addEventListener('click', togglePlayback);

    // Keyboard
    window.addEventListener('keydown', e => {
        if (STATE.locked) return;
        if (e.key === 'ArrowLeft') selectTrack(STATE.activeIndex - 1);
        if (e.key === 'ArrowRight') selectTrack(STATE.activeIndex + 1);
        if (e.key === ' ') togglePlayback();
    });

    // Touch Swipe
    let startX = 0;
    document.body.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    document.body.addEventListener('touchend', e => {
        if (STATE.locked) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            selectTrack(STATE.activeIndex + (diff > 0 ? 1 : -1));
        }
    }, { passive: true });

    // Audio Events
    els.audio.addEventListener('ended', () => selectTrack(STATE.activeIndex + 1));
    els.audio.addEventListener('play', () => setVisState(STATES.PLAYING));
    els.audio.addEventListener('pause', () => setVisState(STATES.IDLE));

    // Check Lucky
    const params = new URLSearchParams(window.location.search);
    if (params.get('lucky') === 'true') {
        const rand = Math.floor(Math.random() * songs.length);
        selectTrack(rand, true); // Auto play
    }
}

// --- CORE SEQUENCE ENGINE ---
async function selectTrack(index, autoPlay = true) {
    if (STATE.locked) return;

    // 1. Bounds Logic (Circular)
    let nextIndex = index;
    if (nextIndex < 0) nextIndex = songs.length - 1;
    if (nextIndex >= songs.length) nextIndex = 0;

    if (nextIndex === STATE.activeIndex) return;

    // 2. LOCK STATE
    STATE.locked = true;
    STATE.curr = STATES.TRANSITION;
    updateStatus();

    // 3. SEQUENCE
    // A. Lift Arm
    setArm(false);
    await delay(300); // Wait for lift

    // B. Re-orient Deck (Instant visual update of target)
    updateCarousel(nextIndex);

    // C. Flight Animation
    // Create ghost element from deck position to platter
    await runFlightSequence(nextIndex);

    // D. Update Active Data (Source of Truth update)
    STATE.activeIndex = nextIndex;
    loadTrackInfo(STATE.activeIndex);

    // E. Drop Arm & Play?
    if (autoPlay && songs[STATE.activeIndex].src) {
        setVisState(STATES.PLAYING); // Start spinning logic
        await delay(200);
        setArm(true); // Drop arm

        // Wait for connection to reality
        try {
            await els.audio.play();
        } catch (e) {
            console.warn("Autoplay blocked", e);
            setArm(false);
            setVisState(STATES.IDLE);
        }
    } else {
        setVisState(STATES.IDLE);
    }

    // 4. UNLOCK
    STATE.locked = false;
    updateStatus();
    els.root.className = STATE.curr === STATES.PLAYING ? 'playing' : '';
}

// --- VISUAL LOGIC ---

function renderDeck() {
    els.deck.innerHTML = '';
    songs.forEach((song, i) => {
        const el = document.createElement('div');
        el.className = 'album-card';
        el.style.background = song.cover;
        el.dataset.index = i;
        el.onclick = () => selectTrack(i);
        els.deck.appendChild(el);
    });
}

function updateCarousel(centerIndex) {
    const cards = Array.from(document.querySelectorAll('.album-card'));
    const isMobile = window.innerWidth < 600;
    const spacing = isMobile ? 140 : 200;

    cards.forEach((card, i) => {
        // Wrap logic for shortest path? 
        // Simple linear for V1.2 to ensure stability first.
        let offset = i - centerIndex;

        // Circular distance logic (Optional, keeping linear for strict 1.2 plan)
        // If we want wrapping visually, we'd adjust offset here.

        const absOffset = Math.abs(offset);
        const isActive = offset === 0;

        card.classList.toggle('active', isActive);

        // 3D Math
        const tx = offset * spacing;
        const tz = isActive ? 0 : -200 - (absOffset * 50);
        const ry = offset * -25; // Rotate towards center
        const scale = isActive ? 1.2 : 0.8;
        const opacity = isActive ? 1 : 0.5 - (absOffset * 0.1);

        card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
        card.style.opacity = Math.max(0, opacity);
        card.style.zIndex = 100 - absOffset;
        // Pointer events: Only center is easily clickable or immediate neighbors
        card.style.pointerEvents = absOffset > 2 ? 'none' : 'auto';
    });
}

function loadTrackInfo(i) {
    const s = songs[i];
    els.title.innerText = s.title;
    els.artist.innerText = s.artist;
    // Set Vinyl Texture
    els.label.style.background = s.cover;
    // Set Audio
    if (els.audio.src !== s.src) els.audio.src = s.src;
}

// --- ANIMATION UTILS ---

async function runFlightSequence(targetIndex) {
    const card = document.querySelectorAll('.album-card')[targetIndex];
    if (!card) return;

    const startRect = card.getBoundingClientRect();
    const endRect = els.vinyl.getBoundingClientRect();

    // Create Ghost
    const ghost = document.createElement('div');
    ghost.className = 'flying-album';
    ghost.style.background = songs[targetIndex].cover;
    ghost.style.width = startRect.width + 'px';
    ghost.style.height = startRect.height + 'px';
    ghost.style.left = startRect.left + 'px';
    ghost.style.top = startRect.top + 'px';
    ghost.style.borderRadius = '12px';

    els.flightZone.appendChild(ghost);
    ghost.getBoundingClientRect(); // Reflow

    // Morph to Vinyl
    ghost.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    ghost.style.left = endRect.left + 'px';
    ghost.style.top = endRect.top + 'px';
    ghost.style.width = endRect.width + 'px';
    ghost.style.height = endRect.height + 'px';
    ghost.style.borderRadius = '50%';

    await delay(600);
    ghost.remove();
}

function setArm(down) {
    els.arm.classList.toggle('playing', down);
}

function setVisState(s) {
    STATE.curr = s;
    updateStatus();

    if (s === STATES.PLAYING) {
        requestAnimationFrame(spinVinyl);
    }
}

// Vinyl Spin Loop
let lastTime = 0;
function spinVinyl(timestamp) {
    if (STATE.curr !== STATES.PLAYING) return;

    const delta = timestamp - lastTime;
    lastTime = timestamp;

    STATE.spinAngle += (delta * 0.05); // Speed
    els.vinyl.style.transform = `rotate(${STATE.spinAngle}deg)`;

    requestAnimationFrame(spinVinyl);
}

function togglePlayback() {
    if (STATE.locked) return;

    if (STATE.curr === STATES.PLAYING) {
        els.audio.pause();
        setArm(false);
        setVisState(STATES.IDLE);
    } else {
        els.audio.play();
        setArm(true);
        setVisState(STATES.PLAYING);
    }
    // Update body class for icon swap
    els.root.className = STATE.curr === STATES.PLAYING ? 'playing' : '';
}

function updateStatus() {
    els.status.innerText = STATE.curr;
    els.status.style.opacity = STATE.locked ? 1 : 0.3;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Boot
document.addEventListener('DOMContentLoaded', init);
