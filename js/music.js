/* js/music.js */

const tracks = [
    {
        title: 'Harry Styles - As It Was',
        src: 'assets/mp3/Harry Styles - As It Was (Official Video).mp3',
        cover: 'assets/mp3/ab67616d0000b273b46f74097655d7f353caab14.jpg'
    },
    {
        title: 'Taylor Swift - The Fate of Ophelia',
        src: 'assets/mp3/Taylor Swift - The Fate of Ophelia.mp3',
        cover: 'assets/mp3/1900x1900-000000-80-0-0.jpg'
    },
    {
        title: 'Eminem - Superman ft. Dina Rae',
        src: 'assets/mp3/Eminem - Superman (Clean Version) ft. Dina Rae.mp3',
        cover: 'assets/mp3/superman eminem.jpg'
    },
    {
        title: 'Mohd Rafi - Abhi Na Jaao Chhod Kar',
        src: 'assets/mp3/Abhi Na Jaao Chhod Kar  Dev Anand  Sadhana  Mohd Rafi  Asha Bhosle  Hum Dono (1961).mp3',
        cover: 'assets/mp3/abhi-na-jao-chhod-kar.webp'
    },
    {
        title: 'Kishore Kumar - Mere Saamne Wali Khidiki Mein',
        src: 'assets/mp3/Rare and Unreleased Version _ Mere Saamne Wali Khidiki Mein _ Padosan _ Kishore Kumar.mp3',
        cover: 'assets/mp3/samne wali khidki me.webp'
    },
    {
        title: 'Nusrat Fateh Ali Khan - Piya Ghar Aaya',
        src: 'assets/mp3/Piya Ghar Aaya - Nusrat Fateh Ali Khan (Asad\'s Remix).mp4.mp3',
        cover: 'assets/mp3/piya ghar aya.jpg'
    },
    {
        title: 'Farhan Akhtar - Mera Yaar (Bhaag Milkha Bhaag)',
        src: 'assets/mp3/Mera Yaar Lyric Video - Bhaag Milkha Bhaag_Farhan Akhtar, Sonam Kapoor_Javed Bashir.mp3',
        cover: 'assets/mp3/mera yaar.jpg'
    },
    {
        title: 'Kaali Naagin Ke Jaise (Mann)',
        src: 'assets/mp3/कल नगन क जस  Kaali Naagin Ke Jaise  Mann (1999)  Aamir Khan  Rani Mukherjee.mp3',
        cover: 'assets/mp3/kaali nagin ke jaisi.jpg'
    },
    {
        title: 'Neha Bhasin - Kut Kut Bajra',
        src: 'assets/mp3/Kut Kut Bajra - Neha Bhasin ( Official Video ) Latest PunjabiSongs2023.mp3',
        cover: 'assets/mp3/Kut-Kut-Bajra-Selected-Image-1.png'
    },
    {
        title: 'Mitta Ror - Sheesha',
        src: 'assets/mp3/Sheesha (Official Music Video)  Mitta Ror ft. Swara Verma  Sorab Bedi  Niharika Tiwari.mp3',
        cover: 'assets/mp3/Sheesha-Punjabi-2022-20220825023036-500x500.jpg'
    },
    {
        title: 'Rawme Hooda - TOTAL',
        src: 'assets/mp3/TOTAL II RAWME HOODA II NEW HARYANAHIP HOP SONG #Total #totalsong #song #mani vlog 201.mp3',
        cover: 'assets/mp3/Total-Haryanvi-2026-20251229123656-500x500.jpg'
    }
];

let currentTrackIndex = 0;
let isPlaying = false;

const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const albumArt = document.getElementById('albumArt');
const vinylRecord = document.getElementById('vinylRecord');
const tonearm = document.getElementById('tonearm');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const playlistContainer = document.getElementById('playlist');

// Theme logic (consistent with main site)
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Format time (e.g. 1:23)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Load track
function loadTrack(index) {
    const track = tracks[index];
    audioPlayer.src = track.src;
    trackTitle.textContent = track.title;
    albumArt.src = track.cover;
    // Pre-load audio duration if possible
    audioPlayer.load();

    // Reset progress
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    
    // Update playlist UI
    updatePlaylistActiveItem();
}

// Play track
function playTrack() {
    isPlaying = true;
    audioPlayer.play().catch(e => console.log('Playback prevented', e));
    
    // Update Icons
    playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Pause SVG
    
    // Animate Vinyl & Arm
    document.querySelector('.vinyl-wrapper').classList.add('playing');
}

// Pause track
function pauseTrack() {
    isPlaying = false;
    audioPlayer.pause();
    
    // Update Icons
    playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play SVG
    
    // Revert Animations
    document.querySelector('.vinyl-wrapper').classList.remove('playing');
}

function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

// Prev/Next handlers
function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

// Render Playlist
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('playlist-item');
        if (index === currentTrackIndex) item.classList.add('active');
        item.innerHTML = `
            <img src="${track.cover}" class="playlist-thumb" alt="thumb">
            <div class="playlist-info">
                <span class="playlist-track-name">${track.title}</span>
            </div>
        `;
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            playTrack();
        });
        playlistContainer.appendChild(item);
    });
}

function updatePlaylistActiveItem() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Progress Bar Updates
audioPlayer.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audioPlayer;
    if (!isNaN(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        durationTimeEl.textContent = formatTime(duration);
    }
});

// Click to seek
progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if (!isNaN(duration)) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});

// Auto-play next track when ended
audioPlayer.addEventListener('ended', () => {
    nextTrack();
});

// Metadata loaded
audioPlayer.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(audioPlayer.duration);
});

// Init
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

// Boot
loadTrack(currentTrackIndex);
renderPlaylist();
