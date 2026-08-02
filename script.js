// ==========================================================================
// DAILY UTILS HUB - COMPLETE ENGINE & UTILITIES (VANILLA JS)
// ==========================================================================

// Global error tracker to display on screen if initialization fails
window.addEventListener('error', function(e) {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:rgba(220,38,38,0.95);color:white;padding:1.25rem;z-index:99999;font-family:monospace;font-size:14px;line-height:1.5;box-shadow:0 4px 20px rgba(0,0,0,0.3);box-sizing:border-box;max-height:80vh;overflow-y:auto;';
    errDiv.innerHTML = `<div style="max-width:1200px;margin:0 auto;position:relative;">
        <strong style="font-size:16px;">🚨 Runtime JS Error Detected:</strong><br>
        <span style="color:#fca5a5;">${e.message}</span><br>
        <strong>File:</strong> ${e.filename}<br>
        <strong>Line:</strong> ${e.lineno}:${e.colno}<br><br>
        <strong>Stack Trace:</strong><br>
        <pre style="margin:0.5rem 0 0 0;padding:0.75rem;background:rgba(0,0,0,0.3);border-radius:4px;overflow-x:auto;white-space:pre-wrap;font-size:12px;">${e.error ? e.error.stack : 'No stack trace available'}</pre>
        <button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:0;right:0;background:rgba(255,255,255,0.2);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-weight:bold;">Dismiss</button>
    </div>`;
    document.body.appendChild(errDiv);
});

// Global state variables
let currentTheme = 'light';
let activeDataTab = 'identity';
let todos = [];
let notes = [];
let activeNoteId = null;

// Meme generator state
let memeImage = null;

// Global security sanitizer for clipboard data to prevent pastejacking and hidden command injections
function sanitizeForClipboard(text, isSingleLine = false) {
    if (text === null || text === undefined) return "";
    let sanitized = text.toString().replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '');
    if (isSingleLine) {
        sanitized = sanitized.replace(/[\r\n]+/g, ' ');
    }
    return sanitized;
}
let memeTexts = [];
let dragIndex = -1;
let isDragging = false;
let startX = 0;
let startY = 0;

// 3D Canvas Engine Variables
let canvas3d = null;
let ctx3d = null;
let points3d = [];
let animId3d = null;
let rotationX = 0.002;
let rotationY = 0.003;
let mouseX3d = 0;
let mouseY3d = 0;


// QR Tool Variables
let qrLogoImage = null;

// PDF Utilities Variables
let pdfMergeQueueFiles = [];
let pdfSplitSelectedFile = null;
let pdfCompressSelectedFile = null;
let pdfWatermarkSelectedFile = null;

// Color Palette Variables
let generatedColors = [];

// Fake Data Generator Variables
let bulkDataCache = [];
const fakeLibraries = {
    firstNames: ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Jennifer', 'James', 'Patricia', 'Thomas', 'Linda', 'Charles', 'Elizabeth'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'],
    streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd', 'Park Ave', 'Hill Rd', 'Broadway St', 'Sunset Blvd', 'Forest Ln'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'],
    states: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'MI', 'GA', 'NC', 'NJ'],
    domains: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'icloud.com', 'corpmail.net', 'devtech.io']
};

// Lightweight pure JS implementation of QR Code structure (Kazuhiko Arase)
const QRCode = (() => {
    const PAD0 = 0xEC;
    const PAD1 = 0x11;

    class QRBitBuffer {
        constructor() { this.buffer = []; this.length = 0; }
        get(index) { return ((this.buffer[Math.floor(index / 8)] >>> (7 - index % 8)) & 1) === 1; }
        put(num, length) { for (let i = 0; i < length; i++) { this.putBit(((num >>> (length - i - 1)) & 1) === 1); } }
        putBit(bit) { const bufIndex = Math.floor(this.length / 8); if (this.buffer.length <= bufIndex) { this.buffer.push(0); } if (bit) { this.buffer[bufIndex] |= (0x80 >>> (this.length % 8)); } this.length++; }
    }

    const QRRSBlock = [
        [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], // V1 (L, M, Q, H)
        [1, 44, 34], [1, 44, 28], [2, 22, 16], [2, 22, 11], // V2
        [1, 70, 55], [1, 70, 44], [2, 35, 26], [2, 35, 15], // V3
        [1, 100, 80], [2, 50, 40], [2, 50, 24], [4, 25, 9]  // V4
    ];

    const QRMath = {
        glog: (n) => { if (n < 1) throw new Error("glog(" + n + ")"); return QRMath.LOG_TABLE[n]; },
        gexp: (n) => { while (n < 0) { n += 255; } while (n >= 255) { n -= 255; } return QRMath.EXP_TABLE[n]; },
        EXP_TABLE: new Array(256),
        LOG_TABLE: new Array(256)
    };

    for (let i = 0; i < 8; i++) { QRMath.EXP_TABLE[i] = 1 << i; }
    for (let i = 8; i < 256; i++) { QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8]; }
    for (let i = 0; i < 255; i++) { QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i; }

    class QRPolynomial {
        constructor(num, shift) {
            let offset = 0;
            while (offset < num.length && num[offset] === 0) { offset++; }
            this.num = new Array(num.length - offset + shift);
            for (let i = 0; i < num.length - offset; i++) { this.num[i] = num[i + offset]; }
            for (let i = num.length - offset; i < this.num.length; i++) { this.num[i] = 0; }
        }
        getAt(index) { return this.num[index]; }
        getLength() { return this.num.length; }
        multiply(e) {
            const num = new Array(this.getLength() + e.getLength() - 1);
            for (let i = 0; i < this.getLength(); i++) {
                for (let j = 0; j < e.getLength(); j++) {
                    num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
                }
            }
            return new QRPolynomial(num, 0);
        }
        mod(e) {
            if (this.getLength() - e.getLength() < 0) { return this; }
            const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));
            const num = new Array(this.getLength());
            for (let i = 0; i < this.getLength(); i++) { num[i] = this.getAt(i); }
            for (let i = 0; i < e.getLength(); i++) { num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio); }
            return new QRPolynomial(num, 0).mod(e);
        }
    }

    class QRModel {
        constructor(typeNumber, errorCorrectLevel) {
            this.typeNumber = typeNumber;
            this.errorCorrectLevel = errorCorrectLevel;
            this.modules = null;
            this.moduleCount = 0;
            this.dataCache = null;
        }
        addData(data) { this.dataCache = new TextEncoder().encode(data); }
        isDark(row, col) { if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) { return false; } return this.modules[row][col]; }
        make() { this.makeImpl(false, 0); }
        makeImpl(test, maskPattern) {
            this.moduleCount = this.typeNumber * 4 + 17;
            this.modules = new Array(this.moduleCount);
            for (let row = 0; row < this.moduleCount; row++) {
                this.modules[row] = new Array(this.moduleCount);
                for (let col = 0; col < this.moduleCount; col++) { this.modules[row][col] = null; }
            }
            this.setupPositionDetectionPattern(0, 0);
            this.setupPositionDetectionPattern(this.moduleCount - 7, 0);
            this.setupPositionDetectionPattern(0, this.moduleCount - 7);
            this.setupTimingPattern();
            this.setupTypeInfo(test, maskPattern);
            this.mapData(this.createData(), maskPattern);
        }
        setupPositionDetectionPattern(row, col) {
            for (let r = -1; r <= 7; r++) {
                if (row + r <= -1 || this.moduleCount <= row + r) continue;
                for (let c = -1; c <= 7; c++) {
                    if (col + c <= -1 || this.moduleCount <= col + c) continue;
                    if ((0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <= 6 && (r === 0 || r === 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    } else { this.modules[row + r][col + c] = false; }
                }
            }
        }
        setupTimingPattern() {
            for (let r = 8; r < this.moduleCount - 8; r++) { if (this.modules[r][6] !== null) continue; this.modules[r][6] = (r % 2 === 0); }
            for (let c = 8; c < this.moduleCount - 8; c++) { if (this.modules[6][c] !== null) continue; this.modules[6][c] = (c % 2 === 0); }
        }
        setupTypeInfo(test, maskPattern) {
            const bits = (this.errorCorrectLevel << 3) | maskPattern;
            let formatInfo = bits << 10;
            let r = formatInfo;
            while (true) {
                const msb = 31 - Math.clz32(r);
                if (msb < 10) break;
                r ^= (0x537 << (msb - 10));
            }
            const data = (formatInfo | r) ^ 0x5412;
            for (let i = 0; i < 15; i++) {
                const mod = (!test && ((data >>> i) & 1) === 1);
                if (i < 6) { this.modules[i][8] = mod; }
                else if (i < 8) { this.modules[i + 1][8] = mod; }
                else { this.modules[this.moduleCount - 15 + i][8] = mod; }
            }
            for (let i = 0; i < 15; i++) {
                const mod = (!test && ((data >>> i) & 1) === 1);
                if (i < 8) { this.modules[8][this.moduleCount - i - 1] = mod; }
                else if (i < 9) { this.modules[8][15 - i - 1 + 1] = mod; }
                else { this.modules[8][15 - i - 1] = mod; }
            }
            this.modules[this.moduleCount - 8][8] = !test;
        }
        mapData(data, maskPattern) {
            let inc = -1;
            let row = this.moduleCount - 1;
            let bitIndex = 7;
            let byteIndex = 0;
            for (let col = this.moduleCount - 1; col > 0; col -= 2) {
                if (col === 6) col--;
                while (true) {
                    for (let c = 0; c < 2; c++) {
                        const targetCol = col - c;
                        if (this.modules[row][targetCol] === null) {
                            let dark = false;
                            if (byteIndex < data.length) { dark = (((data[byteIndex] >>> bitIndex) & 1) === 1); }
                            const mask = ((row + targetCol) % 2 === 0); // Mask Pattern 0
                            if (mask) { dark = !dark; }
                            this.modules[row][targetCol] = dark;
                            bitIndex--;
                            if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
                        }
                    }
                    row += inc;
                    if (row < 0 || this.moduleCount <= row) { row -= inc; inc = -inc; break; }
                }
            }
        }
        createData() {
            const offset = (this.errorCorrectLevel === 1) ? 0 : (this.errorCorrectLevel === 0) ? 1 : (this.errorCorrectLevel === 3) ? 2 : 3;
            const blockIndex = (this.typeNumber - 1) * 4 + offset;
            const rsBlock = QRRSBlock[blockIndex];
            const totalDataCount = rsBlock[0] * rsBlock[2];
            const buffer = new QRBitBuffer();
            buffer.put(4, 4); // 8-bit Byte Mode
            buffer.put(this.dataCache.length, 8); // length indicator
            for (let i = 0; i < this.dataCache.length; i++) { buffer.put(this.dataCache[i], 8); }
            // terminators
            if (buffer.length + 4 <= totalDataCount * 8) { buffer.put(0, 4); }
            while (buffer.length % 8 !== 0) { buffer.putBit(false); }
            while (true) {
                if (buffer.length >= totalDataCount * 8) break;
                buffer.put(PAD0, 8);
                if (buffer.length >= totalDataCount * 8) break;
                buffer.put(PAD1, 8);
            }
            return this.createBytes(buffer, rsBlock);
        }
        createBytes(buffer, rsBlock) {
            const ecDataCount = rsBlock[1] - rsBlock[2];
            const dcDataCount = rsBlock[2];
            const dataBytes = new Array(dcDataCount);
            for (let i = 0; i < dcDataCount; i++) { dataBytes[i] = buffer.buffer[i] || 0; }
            
            // Build Generator Polynomial
            let gp = new QRPolynomial([1], 0);
            for (let i = 0; i < ecDataCount; i++) { gp = gp.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0)); }
            
            const dataPoly = new QRPolynomial(dataBytes, ecDataCount);
            const modPoly = dataPoly.mod(gp);
            const ecBytes = new Array(ecDataCount);
            for (let i = 0; i < ecDataCount; i++) {
                const modIndex = i + modPoly.getLength() - ecDataCount;
                ecBytes[i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
            }
            return dataBytes.concat(ecBytes);
        }
    }

    return { QRModel };
})();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    // 1. Theme Setup safely (in case localStorage is blocked)
    try {
        currentTheme = localStorage.getItem('theme') || 'light';
    } catch (e) {
        currentTheme = 'light';
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    try {
        updateThemeUI();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    } catch (e) {
        console.error("Theme UI initialization error:", e);
    }

    // Global mouse tracking spotlight setup
    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);
    });

    // 2. Navigation Setup
    try {
        setupNavigation();
    } catch (e) {
        console.error("Navigation setup error:", e);
    }

    // 3. Search Setup
    try {
        setupSearch();
    } catch (e) {
        console.error("Search setup error:", e);
    }

    // Helper to run each tool initializer inside its own try-catch
    const initSafe = (name, fn) => {
        try {
            fn();
        } catch (err) {
            console.error(`Error initializing tool "${name}":`, err);
            // Non-blocking warning toast
            setTimeout(() => {
                showToast(`Warning: Failed to load ${name} (${err.message})`, 'warning');
            }, 500);
        }
    };

    // 4. Initialize Individual Tools
    initSafe('Dashboard', initDashboard);
    initSafe('Password Generator', initPasswordGenerator);
    initSafe('QR Generator', initQRGenerator);
    initSafe('Color Palette', initColorPalette);
    initSafe('Meme Generator', initMemeGenerator);
    initSafe('Fake Data Generator', initFakeDataGenerator);
    initSafe('Text Case Converter', initTextCaseConverter);
    initSafe('Base64 Tool', initBase64Tool);
    initSafe('JSON Formatter', initJSONFormatter);
    initSafe('Todo List', initTodoList);
    initSafe('Note Taker', initNoteTaker);
    initSafe('PDF Utilities', initPDFUtilities);
    initSafe('HR Utilities', initHRUtilities);
    initSafe('Image Compressor', initImageCompressor);
    initSafe('Percentage Calculator', initPercentageCalculator);
    initSafe('Salary to Hourly', initSalaryToHourly);
    initSafe('Sales Tax Calculator', initSalesTaxCalculator);
    initSafe('Geometry Suite', initGeometryCalculators);
    initSafe('Test Grade Calculator', initTestGradeCalculator);
    initSafe('JWT Tool', initJWTTool);
    initSafe('Hash Generator', initHashGenerator);
    initSafe('Cron Parser', initCronParser);
    initSafe('Media Converter', initMediaConverter);
    initSafe('Video Downloader', initVideoDownloader);

    // Show initial welcome toast
    try {
        showToast('Welcome to Daily Utils Hub v3.0!', 'info');
    } catch (e) {
        console.error("Toast notification error:", e);
    }
}

// ==========================================================================
// THEME & NAVIGATION SYSTEM
// ==========================================================================

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeUI();
    showToast(`Switched to ${currentTheme} mode`, 'info');
}

function updateThemeUI() {
    const iconMoon = document.querySelector('.icon-moon');
    const iconSun = document.querySelector('.icon-sun');
    if (currentTheme === 'dark') {
        iconMoon.style.display = 'none';
        iconSun.style.display = 'block';
    } else {
        iconMoon.style.display = 'block';
        iconSun.style.display = 'none';
    }
}

function getActiveToolId() {
    const activeSection = document.querySelector('.tool-section.active');
    return activeSection ? activeSection.id : 'dashboard';
}

function updateNavActiveState(toolId) {
    const navButtons = document.querySelectorAll('.tool-btn, .bottom-nav-btn');
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tool') === toolId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dd => {
        const trigger = dd.querySelector('.dropdown-trigger');
        if (trigger) {
            const hasActiveChild = dd.querySelector(`.dropdown-item.active`);
            if (hasActiveChild) {
                trigger.classList.add('active');
            } else {
                trigger.classList.remove('active');
            }
        }
    });
}

function setupNavigation() {
    console.log('[NAV] setupNavigation() called');
    
    // 1. Tool button clicks (both header dropdown items and bottom nav buttons)
    const navButtons = document.querySelectorAll('.tool-btn, .bottom-nav-btn');
    console.log(`[NAV] Found ${navButtons.length} tool/nav buttons`);
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const toolId = btn.getAttribute('data-tool');
            console.log(`[NAV] Tool button clicked: data-tool="${toolId}"`);
            switchSection(toolId);
            
            // If this button is inside a dropdown, close the dropdown
            const dropdownMenu = btn.closest('.dropdown-menu');
            if (dropdownMenu) {
                e.stopPropagation();
                dropdownMenu.classList.remove('open');
                console.log('[NAV] Dropdown closed after item click');
            }
        });
    });

    // 2. Logo click → go to dashboard
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', () => {
            console.log('[NAV] Logo clicked → dashboard');
            switchSection('dashboard');
        });
    }

    // 3. Dropdown trigger click toggle (for mobile/tablet touch support)
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    console.log(`[NAV] Found ${dropdownTriggers.length} dropdown triggers`);
    
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parent = trigger.closest('.nav-item.dropdown');
            const menu = parent.querySelector('.dropdown-menu');
            const spanEl = trigger.querySelector('span');
            const triggerText = spanEl ? spanEl.textContent : 'unknown';
            
            const isOpen = menu.classList.contains('open');
            console.log(`[NAV] Trigger clicked: "${triggerText}", was open: ${isOpen}`);
            
            // Close all other dropdown menus first
            document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                }
            });
            
            // Toggle this menu
            if (isOpen) {
                menu.classList.remove('open');
                const activeToolId = getActiveToolId();
                updateNavActiveState(activeToolId);
            } else {
                menu.classList.add('open');
                updateNavActiveState(null);
                trigger.classList.add('active');
            }
            console.log(`[NAV] Menu now has .open: ${menu.classList.contains('open')}`);
        });
    });

    // 4. Close all dropdowns when clicking anywhere else on the page
    document.addEventListener('click', (e) => {
        const openMenus = document.querySelectorAll('.dropdown-menu.open');
        if (openMenus.length > 0) {
            console.log(`[NAV] Document click: closing ${openMenus.length} open menu(s)`);
            openMenus.forEach(m => {
                m.classList.remove('open');
            });
            const activeToolId = getActiveToolId();
            updateNavActiveState(activeToolId);
        }
    });
    
    console.log('[NAV] setupNavigation() complete');
}

function switchSection(toolId) {
    console.log(`[NAV] switchSection() called with toolId: "${toolId}"`);
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(sec => {
        if (sec.id === toolId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    updateNavActiveState(toolId);

    // Lazy load canvas-based previews if needed
    if (toolId === 'meme-generator') {
        drawMeme();
    } else if (toolId === 'qr-generator') {
        // Redraw QR if content exists
        const qrInput = document.getElementById('qrInput').value.trim();
        if (qrInput) generateQRCode();
    } else if (toolId === 'dashboard') {
        resizeCanvas3d();
    }
}

function setupSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // 1. Filter dropdown items in the header
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            const title = item.querySelector('.dropdown-item-title').textContent.toLowerCase();
            const desc = item.querySelector('.dropdown-item-desc').textContent.toLowerCase();
            if (title.includes(query) || desc.includes(query) || query === '') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide/show dropdown groups if all children are filtered out
        const dropdownGroups = document.querySelectorAll('.nav-item.dropdown');
        dropdownGroups.forEach(group => {
            const visibleChildren = group.querySelectorAll('.dropdown-item[style="display: flex;"], .dropdown-item:not([style*="display: none"])');
            if (visibleChildren.length === 0 && query !== '') {
                group.style.opacity = '0.3';
                group.style.pointerEvents = 'none';
            } else {
                group.style.opacity = '1';
                group.style.pointerEvents = 'auto';
            }
        });

        // 2. Filter dashboard cards on the home page
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        dashboardCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            if (title.includes(query) || desc.includes(query) || query === '') {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ==========================================================================
// TOAST SYSTEM
// ==========================================================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function showGlobalLoader(show, text = "Processing document on backend...") {
    const loader = document.getElementById('globalLoader');
    const loaderText = document.getElementById('globalLoaderText');
    if (loader) {
        if (show) {
            if (loaderText) loaderText.textContent = text;
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================================================
// TOOL 1: PASSWORD GENERATOR
// ==========================================================================

function initPasswordGenerator() {
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const generateBtn = document.getElementById('generatePassword');
    const copyBtn = document.getElementById('copyPassword');

    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
        generatePassword();
    });

    const checkboxes = ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols', 'excludeSimilar', 'easyToSay'];
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            // "Easy to Say" disables numbers/symbols
            if (id === 'easyToSay' && document.getElementById('easyToSay').checked) {
                document.getElementById('includeNumbers').checked = false;
                document.getElementById('includeSymbols').checked = false;
            }
            if ((id === 'includeNumbers' || id === 'includeSymbols') && document.getElementById(id).checked) {
                document.getElementById('easyToSay').checked = false;
            }
            generatePassword();
        });
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', () => {
        const val = document.getElementById('passwordOutput').value;
        if (val) {
            navigator.clipboard.writeText(sanitizeForClipboard(val, true));
            showToast('Password copied to clipboard!');
        }
    });

    generatePassword();
}

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const uppercase = document.getElementById('includeUppercase').checked;
    const lowercase = document.getElementById('includeLowercase').checked;
    const numbers = document.getElementById('includeNumbers').checked;
    const symbols = document.getElementById('includeSymbols').checked;
    const excludeSimilar = document.getElementById('excludeSimilar').checked;
    const easyToSay = document.getElementById('easyToSay').checked;

    let charset = '';
    let password = '';

    if (easyToSay) {
        // Pronounceable letters sequence (Consonant + Vowel alternator)
        const vowels = excludeSimilar ? 'aeuy' : 'aeiouy';
        const consonants = excludeSimilar ? 'bcdfghjkmnpqrstvwxz' : 'bcdfghjklmnpqrstvwxyz';
        let isVowel = Math.random() > 0.5;

        for (let i = 0; i < length; i++) {
            const pool = isVowel ? vowels : consonants;
            let char = pool.charAt(Math.floor(Math.random() * pool.length));
            if (uppercase && Math.random() > 0.5) char = char.toUpperCase();
            password += char;
            isVowel = !isVowel;
        }
    } else {
        let uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let lowers = 'abcdefghijklmnopqrstuvwxyz';
        let nums = '0123456789';
        let syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (excludeSimilar) {
            uppers = uppers.replace(/[ILOU]/g, '');
            lowers = lowers.replace(/[luy]/g, '');
            nums = nums.replace(/[018]/g, '');
            syms = syms.replace(/[|:;.,<>?+=-]/g, '');
        }

        if (uppercase) charset += uppers;
        if (lowercase) charset += lowers;
        if (numbers) charset += nums;
        if (symbols) charset += syms;

        if (!charset) {
            document.getElementById('passwordOutput').value = '';
            updateStrengthUI('', 0);
            return;
        }

        // Guarantee at least one checked type is present
        let types = [];
        if (uppercase) types.push(uppers);
        if (lowercase) types.push(lowers);
        if (numbers) types.push(nums);
        if (symbols) types.push(syms);

        types.forEach(pool => {
            password += pool.charAt(Math.floor(Math.random() * pool.length));
        });

        // Fill remainder
        for (let i = password.length; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        // Shuffle
        password = password.split('').sort(() => Math.random() - 0.5).join('');
    }

    document.getElementById('passwordOutput').value = password;
    evaluatePasswordStrength(password, length, uppercase, lowercase, numbers, symbols);
}

function evaluatePasswordStrength(pass, len, up, low, num, sym) {
    let score = 0;
    
    // Check requirements
    const reqLen = document.getElementById('req-length');
    const reqCase = document.getElementById('req-case');
    const reqNum = document.getElementById('req-number');
    const reqSym = document.getElementById('req-symbol');

    if (len >= 12) { reqLen.classList.add('valid'); score++; } else { reqLen.classList.remove('valid'); }
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) { reqCase.classList.add('valid'); score++; } else { reqCase.classList.remove('valid'); }
    if (/\d/.test(pass)) { reqNum.classList.add('valid'); score++; } else { reqNum.classList.remove('valid'); }
    if (/[^a-zA-Z0-9]/.test(pass)) { reqSym.classList.add('valid'); score++; } else { reqSym.classList.remove('valid'); }

    // Pool size check for entropy calculation
    let poolSize = 0;
    if (/[a-z]/.test(pass)) poolSize += 26;
    if (/[A-Z]/.test(pass)) poolSize += 26;
    if (/\d/.test(pass)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pass)) poolSize += 30;

    const entropy = Math.round(len * Math.log2(poolSize || 2));
    document.getElementById('entropyText').textContent = `Entropy: ${entropy || 0} bits`;

    // Extra length boost
    if (len >= 16) score++;
    if (len >= 24) score++;

    updateStrengthUI(score);
}

function updateStrengthUI(score) {
    const text = document.getElementById('strengthText');
    const segments = [
        document.getElementById('strength-1'),
        document.getElementById('strength-2'),
        document.getElementById('strength-3'),
        document.getElementById('strength-4')
    ];

    // Clear segments
    segments.forEach(seg => seg.style.backgroundColor = 'transparent');

    let strengthColor = 'var(--error)';
    let strengthLabel = 'Weak';
    let activeSegs = 1;

    if (score >= 5) {
        strengthColor = 'var(--success)';
        strengthLabel = 'Excellent';
        activeSegs = 4;
    } else if (score >= 4) {
        strengthColor = 'var(--success)';
        strengthLabel = 'Strong';
        activeSegs = 3;
    } else if (score >= 3) {
        strengthColor = 'var(--warning)';
        strengthLabel = 'Medium';
        activeSegs = 2;
    }

    text.textContent = `Strength: ${strengthLabel}`;
    for (let i = 0; i < activeSegs; i++) {
        segments[i].style.backgroundColor = strengthColor;
    }
}

// ==========================================================================
// TOOL 2: QR CODE GENERATOR (KAZUHIKO ARASE PURE JS QR CODE ENGINE)
// ==========================================================================

function initQRGenerator() {
    const generateBtn = document.getElementById('generateQR');
    const downloadBtn = document.getElementById('downloadQR');
    const sizeSlider = document.getElementById('qrSize');
    const sizeVal = document.getElementById('qrSizeVal');
    const logoInput = document.getElementById('qrLogoInput');

    const forePicker = document.getElementById('qrColorFore');
    const foreHex = document.getElementById('qrColorForeHex');
    const backPicker = document.getElementById('qrColorBack');
    const backHex = document.getElementById('qrColorBackHex');

    // Color Pickers bind
    forePicker.addEventListener('input', (e) => { foreHex.value = e.target.value; generateQRCode(); });
    foreHex.addEventListener('input', (e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) { forePicker.value = e.target.value; generateQRCode(); } });
    backPicker.addEventListener('input', (e) => { backHex.value = e.target.value; generateQRCode(); });
    backHex.addEventListener('input', (e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) { backPicker.value = e.target.value; generateQRCode(); } });

    sizeSlider.addEventListener('input', (e) => {
        sizeVal.textContent = `${e.target.value} x ${e.target.value}`;
        generateQRCode();
    });

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    qrLogoImage = img;
                    generateQRCode();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            qrLogoImage = null;
            generateQRCode();
        }
    });

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);

    // Initial QR code on load
    document.getElementById('qrInput').value = 'https://github.com';
    generateQRCode();
}

function generateQRCode() {
    const text = document.getElementById('qrInput').value.trim();
    if (!text) return;

    const size = parseInt(document.getElementById('qrSize').value);
    const foreColor = document.getElementById('qrColorFore').value;
    const backColor = document.getElementById('qrColorBack').value;

    const canvas = document.getElementById('qrCanvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    try {
        // Choose QR version dynamically based on text length
        let version = 2;
        if (text.length > 50) version = 4;
        if (text.length > 110) version = 4; // limit

        const qr = new QRCode.QRModel(version, 0); // EC Level M
        qr.addData(text);
        qr.make();

        const count = qr.moduleCount;
        const cellWidth = size / count;

        ctx.fillStyle = backColor;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = foreColor;
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (qr.isDark(row, col)) {
                    // Slight padding fix for pixel gaps
                    ctx.fillRect(Math.floor(col * cellWidth), Math.floor(row * cellWidth), Math.ceil(cellWidth), Math.ceil(cellWidth));
                }
            }
        }

        // Add Center Logo if provided
        if (qrLogoImage) {
            const logoSize = size * 0.22;
            const logoPos = (size - logoSize) / 2;
            
            // White circular background for logo
            ctx.fillStyle = backColor;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw circular/squared logo
            ctx.drawImage(qrLogoImage, logoPos, logoPos, logoSize, logoSize);
        }
    } catch (err) {
        showToast('Error generating QR Code: text is too long for V4.', 'error');
    }
}

function downloadQRCode() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
    showToast('QR Code downloaded!');
}

// ==========================================================================
// TOOL 3: COLOR PALETTE GENERATOR & CONTRAST CHECKER
// ==========================================================================

function initColorPalette() {
    const generateBtn = document.getElementById('generatePalette');
    const colorPicker = document.getElementById('baseColor');
    const colorHex = document.getElementById('baseColorHex');

    colorPicker.addEventListener('input', (e) => {
        colorHex.value = e.target.value.toUpperCase();
        generateColorPalette();
    });

    colorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorPicker.value = e.target.value;
            generateColorPalette();
        }
    });

    document.getElementById('contrastTextCol').addEventListener('change', runContrastCalculation);
    document.getElementById('contrastBgCol').addEventListener('change', runContrastCalculation);

    generateBtn.addEventListener('click', generateColorPalette);

    generateColorPalette();
}

function generateColorPalette() {
    const baseColor = document.getElementById('baseColor').value;
    const mode = document.getElementById('paletteMode').value;
    const swatchesContainer = document.getElementById('paletteSwatches');

    const hsl = hexToHSL(baseColor);
    generatedColors = [];

    switch (mode) {
        case 'monochromatic':
            for (let i = 0; i < 5; i++) {
                generatedColors.push(hslToHex(hsl.h, hsl.s, 15 + i * 18));
            }
            break;
        case 'complementary':
            generatedColors.push(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 15)));
            generatedColors.push(hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 85)));
            generatedColors.push(baseColor);
            generatedColors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 180) % 360, Math.max(hsl.s - 20, 20), Math.min(hsl.l + 15, 80)));
            break;
        case 'analogous':
            generatedColors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h - 15 + 360) % 360, hsl.s, hsl.l));
            generatedColors.push(baseColor);
            generatedColors.push(hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
            break;
        case 'triadic':
            generatedColors.push(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 15)));
            generatedColors.push(baseColor);
            generatedColors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 240) % 360, hsl.s, Math.max(hsl.l - 20, 20)));
            break;
        case 'split':
            generatedColors.push(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 15)));
            generatedColors.push(baseColor);
            generatedColors.push(hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l));
            generatedColors.push(hslToHex((hsl.h + 210) % 360, hsl.s, Math.max(hsl.l - 20, 20)));
            break;
    }

    swatchesContainer.innerHTML = '';
    const textSelect = document.getElementById('contrastTextCol');
    const bgSelect = document.getElementById('contrastBgCol');
    textSelect.innerHTML = '';
    bgSelect.innerHTML = '';

    generatedColors.forEach((color, idx) => {
        const swatchHsl = hexToHSL(color);
        const card = document.createElement('div');
        card.className = 'swatch-card';
        card.innerHTML = `
            <div class="swatch-color-box" style="background-color: ${color}">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div class="swatch-details">
                <div class="swatch-hex">${color.toUpperCase()}</div>
                <div class="swatch-hsl">hsl(${Math.round(swatchHsl.h)}, ${Math.round(swatchHsl.s)}%, ${Math.round(swatchHsl.l)}%)</div>
            </div>
        `;

        card.addEventListener('click', () => {
            navigator.clipboard.writeText(sanitizeForClipboard(color, true));
            showToast(`Copied ${color.toUpperCase()} to clipboard!`);
        });

        swatchesContainer.appendChild(card);

        // Populate contrast selectors
        const optText = document.createElement('option');
        optText.value = color;
        optText.textContent = `Color ${idx + 1} (${color.toUpperCase()})`;
        if (idx === 0) optText.selected = true;
        textSelect.appendChild(optText);

        const optBg = document.createElement('option');
        optBg.value = color;
        optBg.textContent = `Color ${idx + 1} (${color.toUpperCase()})`;
        if (idx === 2) optBg.selected = true;
        bgSelect.appendChild(optBg);
    });

    runContrastCalculation();
}

function hexToHSL(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getRelativeLuminance(color) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    const a = [r, g, b].map(v => {
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function runContrastCalculation() {
    const textCol = document.getElementById('contrastTextCol').value;
    const bgCol = document.getElementById('contrastBgCol').value;
    
    if (!textCol || !bgCol) return;

    const preview = document.getElementById('contrastPreview');
    preview.style.color = textCol;
    preview.style.backgroundColor = bgCol;

    const l1 = getRelativeLuminance(textCol);
    const l2 = getRelativeLuminance(bgCol);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);

    document.getElementById('contrastRatio').textContent = ratio.toFixed(2) + ':1';
    
    const aa = document.getElementById('contrastAA');
    const aaa = document.getElementById('contrastAAA');

    if (ratio >= 4.5) {
        aa.className = 'badge badge-pass';
        aa.textContent = 'AA PASS';
    } else {
        aa.className = 'badge badge-fail';
        aa.textContent = 'AA FAIL';
    }

    if (ratio >= 7.0) {
        aaa.className = 'badge badge-pass';
        aaa.textContent = 'AAA PASS';
    } else {
        aaa.className = 'badge badge-fail';
        aaa.textContent = 'AAA FAIL';
    }
}

function exportPalette(format) {
    if (!generatedColors.length) return;
    let text = '';
    if (format === 'css') {
        text = ':root {\n';
        generatedColors.forEach((color, idx) => {
            text += `  --color-${idx + 1}: ${color.toUpperCase()};\n`;
        });
        text += '}';
    } else if (format === 'tailwind') {
        text = 'colors: {\n';
        generatedColors.forEach((color, idx) => {
            text += `  custom-${idx + 1}: '${color.toUpperCase()}',\n`;
        });
        text += '}';
    } else {
        text = JSON.stringify(generatedColors, null, 2);
    }

    navigator.clipboard.writeText(sanitizeForClipboard(text, false));
    showToast(`Palette exported as ${format.toUpperCase()} and copied!`);
}

// ==========================================================================
// TOOL 4: MEME TEXT GENERATOR (WITH CANVAS DRAGGING & CUSTOM UPLOADS)
// ==========================================================================

function initMemeGenerator() {
    const canvas = document.getElementById('memeCanvas');
    const dropZone = document.getElementById('memeDropZone');
    const fileInput = document.getElementById('memeImageInput');
    const addTextBtn = document.getElementById('addMemeText');
    const resetBtn = document.getElementById('resetMemeBg');

    // Default template state
    memeTexts = [
        { text: 'TOP MEME TEXT', x: 300, y: 45, fontSize: 40, color: '#ffffff', strokeColor: '#000000', strokeWidth: 4, fontFamily: 'Impact' },
        { text: 'BOTTOM TEXT HERE', x: 300, y: 400, fontSize: 40, color: '#ffffff', strokeColor: '#000000', strokeWidth: 4, fontFamily: 'Impact' }
    ];

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleMemeUpload(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleMemeUpload(e.target.files[0]);
    });

    resetBtn.addEventListener('click', () => {
        memeImage = null;
        fileInput.value = '';
        drawMeme();
        showToast('Background reset to default template', 'info');
    });

    addTextBtn.addEventListener('click', () => {
        memeTexts.push({
            text: 'NEW TEXT BLOCK',
            x: 300,
            y: 225,
            fontSize: 32,
            color: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 3,
            fontFamily: 'Arial'
        });
        renderMemeInputs();
        drawMeme();
    });

    document.getElementById('exportMeme').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'meme-creator.png';
        link.href = canvas.toDataURL();
        link.click();
        showToast('Meme image downloaded successfully!');
    });

    // Canvas drag-and-drop text events
    canvas.addEventListener('mousedown', handleMemeMouseDown);
    canvas.addEventListener('mousemove', handleMemeMouseMove);
    canvas.addEventListener('mouseup', handleMemeMouseUp);
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        handleMemeMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault()
        });
    });
    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMemeMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault()
        });
    });
    canvas.addEventListener('touchend', handleMemeMouseUp);

    renderMemeInputs();
    drawMeme();
}

function handleMemeUpload(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            memeImage = img;
            drawMeme();
            showToast('Image uploaded as background!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderMemeInputs() {
    const container = document.getElementById('memeFieldsContainer');
    container.innerHTML = '';

    memeTexts.forEach((item, idx) => {
        const fieldCard = document.createElement('div');
        fieldCard.className = 'meme-field-item';
        fieldCard.innerHTML = `
            <button class="meme-field-delete" data-idx="${idx}" title="Delete text block">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <div class="input-group" style="margin-bottom: 0.5rem;">
                <label>Text Line ${idx + 1}</label>
                <input type="text" class="meme-text-val" data-idx="${idx}" value="${item.text}">
            </div>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 0.5rem; align-items: center;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <span style="font-size: 0.75rem; font-weight:600; color: var(--text-secondary);">Font family</span>
                    <select class="meme-font-family" data-idx="${idx}">
                        <option value="Impact" ${item.fontFamily === 'Impact' ? 'selected' : ''}>Impact</option>
                        <option value="Arial" ${item.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                        <option value="Comic Sans MS" ${item.fontFamily === 'Comic Sans MS' ? 'selected' : ''}>Comic Sans</option>
                        <option value="Montserrat" ${item.fontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <span style="font-size: 0.75rem; font-weight:600; color: var(--text-secondary);">Text size</span>
                    <input type="number" class="meme-font-size" data-idx="${idx}" value="${item.fontSize}" min="10" max="120">
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                    <span style="font-size: 0.75rem; font-weight:600; color: var(--text-secondary);">Color</span>
                    <input type="color" class="meme-color" data-idx="${idx}" value="${item.color}">
                </div>
            </div>
        `;

        // Bind events
        fieldCard.querySelector('.meme-text-val').addEventListener('input', (e) => {
            memeTexts[idx].text = e.target.value;
            drawMeme();
        });
        fieldCard.querySelector('.meme-font-family').addEventListener('change', (e) => {
            memeTexts[idx].fontFamily = e.target.value;
            drawMeme();
        });
        fieldCard.querySelector('.meme-font-size').addEventListener('input', (e) => {
            memeTexts[idx].fontSize = parseInt(e.target.value) || 20;
            drawMeme();
        });
        fieldCard.querySelector('.meme-color').addEventListener('input', (e) => {
            memeTexts[idx].color = e.target.value;
            drawMeme();
        });
        fieldCard.querySelector('.meme-field-delete').addEventListener('click', (e) => {
            memeTexts.splice(idx, 1);
            renderMemeInputs();
            drawMeme();
        });

        container.appendChild(fieldCard);
    });
}

function drawMeme() {
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (memeImage) {
        // Draw uploaded bg fit inside canvas
        ctx.drawImage(memeImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Draw plain default gray template
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.font = '32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('UPLOAD AN IMAGE OR DEFINE CUSTOM TEXTS', canvas.width / 2, canvas.height / 2);
    }

    // Draw texts
    memeTexts.forEach(item => {
        ctx.font = `bold ${item.fontSize}px "${item.fontFamily}", sans-serif`;
        ctx.fillStyle = item.color;
        ctx.strokeStyle = item.strokeColor;
        ctx.lineWidth = item.strokeWidth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeText(item.text, item.x, item.y);
        ctx.fillText(item.text, item.x, item.y);
    });
}

// Draggable text on canvas
function handleMemeMouseDown(e) {
    const canvas = document.getElementById('memeCanvas');
    const rect = canvas.getBoundingClientRect();
    
    // Scale click relative to actual canvas width/height
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    dragIndex = -1;

    // Iterate backwards to select top text layer first
    for (let i = memeTexts.length - 1; i >= 0; i--) {
        const item = memeTexts[i];
        ctx.font = `bold ${item.fontSize}px "${item.fontFamily}", sans-serif`;
        const textWidth = ctx.measureText(item.text).width;
        const textHeight = item.fontSize;

        // Check bounding box
        if (clickX >= item.x - textWidth / 2 && 
            clickX <= item.x + textWidth / 2 && 
            clickY >= item.y - textHeight / 2 && 
            clickY <= item.y + textHeight / 2) {
            
            dragIndex = i;
            isDragging = true;
            startX = clickX - item.x;
            startY = clickY - item.y;
            break;
        }
    }
}

function handleMemeMouseMove(e) {
    if (!isDragging || dragIndex === -1) return;
    const canvas = document.getElementById('memeCanvas');
    const rect = canvas.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Update text position
    memeTexts[dragIndex].x = x - startX;
    memeTexts[dragIndex].y = y - startY;

    drawMeme();
}

function handleMemeMouseUp() {
    isDragging = false;
    dragIndex = -1;
}

// ==========================================================================
// TOOL 5: FAKE DATA GENERATOR (WITH EXPORT INTEGRATIONS & CATEGORIES)
// ==========================================================================

function initFakeDataGenerator() {
    const tabs = document.querySelectorAll('[data-data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeDataTab = tab.getAttribute('data-data-tab');

            if (activeDataTab === 'identity') {
                document.getElementById('tabContentIdentity').style.display = 'block';
                document.getElementById('identityDisplay').style.display = 'flex';
                document.getElementById('tabContentBulk').style.display = 'none';
                document.getElementById('bulkDisplay').style.display = 'none';
            } else {
                document.getElementById('tabContentIdentity').style.display = 'none';
                document.getElementById('identityDisplay').style.display = 'none';
                document.getElementById('tabContentBulk').style.display = 'block';
                document.getElementById('bulkDisplay').style.display = 'block';
                generateBulkData();
            }
        });
    });

    document.getElementById('genName').addEventListener('click', () => generateFakeField('name'));
    document.getElementById('genEmail').addEventListener('click', () => generateFakeField('email'));
    document.getElementById('genPhone').addEventListener('click', () => generateFakeField('phone'));
    document.getElementById('genAddress').addEventListener('click', () => generateFakeField('address'));
    document.getElementById('genIBAN').addEventListener('click', () => generateFakeField('iban'));

    document.getElementById('genFullProfile').addEventListener('click', generateFullFakeProfile);
    document.getElementById('copyAllData').addEventListener('click', copyFakeProfile);

    document.getElementById('bulkCount').addEventListener('input', generateBulkData);
    document.getElementById('exportJSON').addEventListener('click', exportBulkJSON);
    document.getElementById('exportCSV').addEventListener('click', exportBulkCSV);
    document.getElementById('exportXML').addEventListener('click', exportBulkXML);

    generateFullFakeProfile();
}

function generateFakeField(type) {
    const val = getSingleFakeValue(type);
    if (type === 'name') document.getElementById('fakeName').textContent = val;
    if (type === 'email') document.getElementById('fakeEmail').textContent = val;
    if (type === 'phone') document.getElementById('fakePhone').textContent = val;
    if (type === 'address') document.getElementById('fakeAddress').textContent = val;
    if (type === 'iban') document.getElementById('fakeIBAN').textContent = val;
    showToast(`Fake ${type} generated!`, 'info');
}

function getSingleFakeValue(type) {
    const lib = fakeLibraries;
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const rDigits = len => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    const rChar = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));

    if (type === 'name') {
        return `${lib.firstNames[rInt(0, lib.firstNames.length-1)]} ${lib.lastNames[rInt(0, lib.lastNames.length-1)]}`;
    }
    if (type === 'email') {
        const first = lib.firstNames[rInt(0, lib.firstNames.length-1)].toLowerCase();
        const last = lib.lastNames[rInt(0, lib.lastNames.length-1)].toLowerCase();
        const dom = lib.domains[rInt(0, lib.domains.length-1)];
        return `${first}.${last}${rInt(10, 99)}@${dom}`;
    }
    if (type === 'phone') {
        return `+1 (${rDigits(3)}) 555-${rDigits(4)}`;
    }
    if (type === 'address') {
        return `${rInt(100, 9999)} ${lib.streets[rInt(0, lib.streets.length-1)]}, ${lib.cities[rInt(0, lib.cities.length-1)]}, ${lib.states[rInt(0, lib.states.length-1)]} ${rDigits(5)}`;
    }
    if (type === 'iban') {
        return `GB82 ${rChar()}${rChar()}${rChar()}${rChar()} 4009 21${rDigits(10)}`;
    }
    return '';
}

function generateFullFakeProfile() {
    document.getElementById('fakeName').textContent = getSingleFakeValue('name');
    document.getElementById('fakeEmail').textContent = getSingleFakeValue('email');
    document.getElementById('fakePhone').textContent = getSingleFakeValue('phone');
    document.getElementById('fakeAddress').textContent = getSingleFakeValue('address');
    document.getElementById('fakeIBAN').textContent = getSingleFakeValue('iban');
}

function copyFakeProfile() {
    const name = document.getElementById('fakeName').textContent;
    const email = document.getElementById('fakeEmail').textContent;
    const phone = document.getElementById('fakePhone').textContent;
    const address = document.getElementById('fakeAddress').textContent;
    const iban = document.getElementById('fakeIBAN').textContent;

    const summary = `Full Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nIBAN: ${iban}`;
    navigator.clipboard.writeText(sanitizeForClipboard(summary, false));
    showToast('Fake profile copied to clipboard!');
}

function generateBulkData() {
    const count = Math.min(Math.max(parseInt(document.getElementById('bulkCount').value) || 10, 1), 50);
    const tbody = document.getElementById('bulkTableBody');
    tbody.innerHTML = '';
    bulkDataCache = [];

    for (let i = 0; i < count; i++) {
        const row = {
            id: i + 1,
            name: getSingleFakeValue('name'),
            email: getSingleFakeValue('email'),
            phone: getSingleFakeValue('phone'),
            address: getSingleFakeValue('address'),
            iban: getSingleFakeValue('iban')
        };
        bulkDataCache.push(row);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>${row.phone}</td>
            <td>${row.address}</td>
        `;
        tbody.appendChild(tr);
    }
}

function exportBulkJSON() {
    if (!bulkDataCache.length) return;
    const blob = new Blob([JSON.stringify(bulkDataCache, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'bulk-fake-profiles.json');
    showToast('JSON file exported!');
}

function exportBulkCSV() {
    if (!bulkDataCache.length) return;
    let csv = 'ID,Name,Email,Phone,Address,IBAN\n';
    bulkDataCache.forEach(row => {
        csv += `${row.id},"${row.name}","${row.email}","${row.phone}","${row.address}","${row.iban}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'bulk-fake-profiles.csv');
    showToast('CSV file exported!');
}

function exportBulkXML() {
    if (!bulkDataCache.length) return;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<profiles>\n';
    bulkDataCache.forEach(row => {
        xml += `  <profile id="${row.id}">\n`;
        xml += `    <name>${row.name}</name>\n`;
        xml += `    <email>${row.email}</email>\n`;
        xml += `    <phone>${row.phone}</phone>\n`;
        xml += `    <address>${row.address}</address>\n`;
        xml += `    <iban>${row.iban}</iban>\n`;
        xml += `  </profile>\n`;
    });
    xml += '</profiles>';
    const blob = new Blob([xml], { type: 'application/xml' });
    downloadBlob(blob, 'bulk-fake-profiles.xml');
    showToast('XML file exported!');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// ==========================================================================
// TOOL 6: TEXT CASE CONVERTER & STATISTICS
// ==========================================================================

function initTextCaseConverter() {
    const input = document.getElementById('textInput');
    const output = document.getElementById('textOutput');

    input.addEventListener('input', runTextStatistics);

    const actions = {
        upperCase: () => { output.value = input.value.toUpperCase(); },
        lowerCase: () => { output.value = input.value.toLowerCase(); },
        sentenceCase: () => {
            output.value = input.value.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        },
        titleCase: () => {
            output.value = input.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        },
        snakeCase: () => {
            output.value = input.value.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        },
        kebabCase: () => {
            output.value = input.value.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        camelCase: () => {
            output.value = input.value.trim().toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                .replace(/^[A-Z]/, c => c.toLowerCase());
        },
        pascalCase: () => {
            output.value = input.value.trim().toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                .replace(/^[a-z]/, c => c.toUpperCase());
        },
        alternatingCase: () => {
            output.value = input.value.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
        },
        inverseCase: () => {
            output.value = input.value.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        },
        urlEncode: () => { output.value = encodeURIComponent(input.value); },
        urlDecode: () => {
            try { output.value = decodeURIComponent(input.value); } catch (e) { showToast('Invalid URL encoded string', 'error'); }
        }
    };

    Object.keys(actions).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (!input.value.trim()) {
                showToast('Please type some input text first', 'error');
                return;
            }
            actions[id]();
            showToast('Text converted successfully!');
        });
    });

    document.getElementById('copyText').addEventListener('click', () => {
        if (output.value) {
            navigator.clipboard.writeText(sanitizeForClipboard(output.value, false));
            showToast('Output copied!');
        }
    });
}

function runTextStatistics() {
    const val = document.getElementById('textInput').value;
    
    const chars = val.length;
    const charsNoSpace = val.replace(/\s/g, '').length;
    
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const sentences = val.trim() ? val.split(/[.!?]+/).filter(Boolean).length : 0;
    
    // ~200 words per minute reading speed
    const readingTime = Math.ceil(words / 200);

    document.getElementById('statChars').textContent = chars;
    document.getElementById('statCharsNoSpace').textContent = charsNoSpace;
    document.getElementById('statWords').textContent = words;
    document.getElementById('statSentences').textContent = sentences;
    document.getElementById('statReading').textContent = `${readingTime} min`;
}

// ==========================================================================
// TOOL 7: BASE64 ENCODER & DECODER (DRAG & DROP + AUTO-PREVIEWS)
// ==========================================================================

function initBase64Tool() {
    const dropZone = document.getElementById('base64DropZone');
    const fileInput = document.getElementById('fileInput');
    const input = document.getElementById('base64Input');
    const output = document.getElementById('base64Output');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleBase64File(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleBase64File(e.target.files[0]);
    });

    document.getElementById('encodeBase64').addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) return;
        output.value = btoa(unescape(encodeURIComponent(val)));
        document.getElementById('imagePreviewContainer').style.display = 'none';
        showToast('Text encoded to Base64!');
    });

    document.getElementById('decodeBase64').addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) return;
        try {
            const decoded = decodeURIComponent(escape(atob(val)));
            output.value = decoded;
            
            // Check if output is a pretty JSON structure
            try {
                const parsed = JSON.parse(decoded);
                output.value = JSON.stringify(parsed, null, 2);
            } catch(e) {}

            document.getElementById('imagePreviewContainer').style.display = 'none';
            showToast('Base64 decoded successfully!');
        } catch(err) {
            // Attempt to treat as raw image if decodes fails standard strings
            if (val.length > 100) {
                renderBase64Image(val);
            } else {
                showToast('Invalid Base64 string', 'error');
            }
        }
    });

    document.getElementById('copyBase64').addEventListener('click', () => {
        if (output.value) {
            navigator.clipboard.writeText(sanitizeForClipboard(output.value, false));
            showToast('Result copied!');
        }
    });

    document.getElementById('clearBase64').addEventListener('click', () => {
        input.value = '';
        output.value = '';
        fileInput.value = '';
        document.getElementById('imagePreviewContainer').style.display = 'none';
    });
}

function handleBase64File(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        document.getElementById('base64Input').value = base64;
        
        if (file.type.startsWith('image/')) {
            renderBase64Image(base64);
        } else {
            document.getElementById('imagePreviewContainer').style.display = 'none';
        }
        showToast('File converted to Base64 string!');
    };
    reader.readAsDataURL(file);
}

function renderBase64Image(base64) {
    const container = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    // Add data URI prefix if missing
    const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    
    const img = new Image();
    img.src = src;
    preview.appendChild(img);
    container.style.display = 'block';
    
    document.getElementById('base64Output').value = src;
}

// ==========================================================================
// TOOL 8: JSON FORMATTER & PARSER & SYNTAX HIGHLIGHTING
// ==========================================================================

function initJSONFormatter() {
    const input = document.getElementById('jsonInput');
    
    document.getElementById('beautifyJSON').addEventListener('click', () => formatJSON(true));
    document.getElementById('minifyJSON').addEventListener('click', () => formatJSON(false));
    document.getElementById('validateJSON').addEventListener('click', validateJSONInput);
    document.getElementById('xmlToJson').addEventListener('click', convertXMLToJSON);
    
    document.getElementById('copyJSON').addEventListener('click', () => {
        const rawOutput = document.getElementById('jsonHighlightOutput').innerText;
        if (rawOutput && !rawOutput.startsWith('//')) {
            navigator.clipboard.writeText(sanitizeForClipboard(rawOutput, false));
            showToast('JSON copied to clipboard!');
        }
    });

    document.getElementById('clearJSON').addEventListener('click', () => {
        input.value = '';
        document.getElementById('jsonHighlightOutput').innerHTML = '// Formatted result will print here';
        hideJSONError();
    });

    // JSON to YAML
    const jsonToYamlBtn = document.getElementById('jsonToYaml');
    if (jsonToYamlBtn) {
        jsonToYamlBtn.addEventListener('click', () => {
            const val = input.value.trim();
            if (!val) return;
            try {
                const obj = JSON.parse(val);
                const yamlStr = jsyaml.dump(obj);
                document.getElementById('jsonHighlightOutput').textContent = yamlStr;
                hideJSONError();
                showToast("Converted JSON to YAML!", "success");
            } catch (err) {
                showJSONError(err.message, val);
                showToast("Failed to parse JSON input", "error");
            }
        });
    }

    // YAML to JSON
    const yamlToJsonBtn = document.getElementById('yamlToJson');
    if (yamlToJsonBtn) {
        yamlToJsonBtn.addEventListener('click', () => {
            const val = input.value.trim();
            if (!val) return;
            try {
                const obj = jsyaml.load(val);
                if (!obj || typeof obj !== 'object') throw new Error("Invalid YAML object structure");
                const jsonStr = JSON.stringify(obj, null, 2);
                document.getElementById('jsonHighlightOutput').innerHTML = highlightJSON(jsonStr);
                hideJSONError();
                showToast("Converted YAML to JSON!", "success");
            } catch (err) {
                showJSONError(err.message, val);
                showToast("Failed to parse YAML input", "error");
            }
        });
    }

}

function formatJSON(pretty = true) {
    const val = document.getElementById('jsonInput').value.trim();
    if (!val) return;

    try {
        const parsed = JSON.parse(val);
        const output = pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
        
        // Render with highlighted spans
        document.getElementById('jsonHighlightOutput').innerHTML = highlightJSON(output);
        hideJSONError();
        showToast('JSON formatted!');
    } catch (err) {
        showJSONError(err.message, val);
    }
}

function validateJSONInput() {
    const val = document.getElementById('jsonInput').value.trim();
    if (!val) return;
    try {
        JSON.parse(val);
        hideJSONError();
        showToast('Valid JSON structure!', 'success');
    } catch (err) {
        showJSONError(err.message, val);
    }
}

function showJSONError(message, val) {
    const banner = document.getElementById('jsonErrorBanner');
    banner.style.backgroundColor = 'var(--error-light)';
    banner.style.color = 'var(--error)';
    banner.className = 'json-error-banner show';
    
    // Extract position if available
    const match = message.match(/position (\d+)/);
    if (match) {
        const pos = parseInt(match[1]);
        const lines = val.substring(0, pos).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        banner.textContent = `❌ JSON Error: ${message} (Line ${line}, Col ${col})`;
    } else {
        banner.textContent = `❌ Error Parsing: ${message}`;
    }
}

function hideJSONError() {
    const banner = document.getElementById('jsonErrorBanner');
    banner.className = 'json-error-banner';
    banner.textContent = '';
}

function highlightJSON(json) {
    if (!json) return "";
    // Escape HTML symbols first
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    let result = '';
    let i = 0;
    const len = json.length;
    
    while (i < len) {
        const char = json[i];
        
        // Handle string literals (keys and string values)
        if (char === '"') {
            let strValue = '"';
            i++;
            let escaped = false;
            while (i < len) {
                const nextChar = json[i];
                strValue += nextChar;
                if (escaped) {
                    escaped = false;
                } else if (nextChar === '\\') {
                    escaped = true;
                } else if (nextChar === '"') {
                    i++;
                    break;
                }
                i++;
            }
            
            // Check if this string token is a key (followed by ':')
            let nextIndex = i;
            let isKey = false;
            while (nextIndex < len && /\s/.test(json[nextIndex])) {
                nextIndex++;
            }
            if (nextIndex < len && json[nextIndex] === ':') {
                isKey = true;
            }
            
            const cls = isKey ? 'json-key' : 'json-string';
            result += `<span class="${cls}">${strValue}</span>`;
            continue;
        }
        
        // Handle number, boolean, and null tokens
        if (/[0-9\-.]/.test(char) || /[a-zA-Z]/.test(char)) {
            let token = '';
            while (i < len && /[0-9\-a-zA-Z_.]/.test(json[i])) {
                token += json[i];
                i++;
            }
            let cls = 'json-number';
            if (token === 'true' || token === 'false') {
                cls = 'json-boolean';
            } else if (token === 'null') {
                cls = 'json-null';
            } else if (!/^[0-9\-.]+$/.test(token)) {
                // Fallback for other text tokens
                cls = 'json-string';
            }
            result += `<span class="${cls}">${token}</span>`;
            continue;
        }
        
        // Output structural/white-space characters
        result += char;
        i++;
    }
    
    return result;
}

function convertXMLToJSON() {
    const val = document.getElementById('jsonInput').value.trim();
    if (!val) return;
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(val, 'text/xml');
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML Parser Error: Check syntax');
        }

        const parseNode = (node) => {
            if (node.nodeType === 3) return node.nodeValue.trim(); // text
            if (node.nodeType === 1) { // element
                if (node.childNodes.length === 0) return '';
                if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
                    return node.childNodes[0].nodeValue.trim();
                }
                const obj = {};
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    if (child.nodeType === 1) {
                        const childVal = parseNode(child);
                        if (obj[child.nodeName]) {
                            if (!Array.isArray(obj[child.nodeName])) obj[child.nodeName] = [obj[child.nodeName]];
                            obj[child.nodeName].push(childVal);
                        } else {
                            obj[child.nodeName] = childVal;
                        }
                    }
                }
                return obj;
            }
            return null;
        };

        const root = xmlDoc.documentElement;
        const res = {};
        res[root.nodeName] = parseNode(root);

        const jsonStr = JSON.stringify(res, null, 2);
        document.getElementById('jsonHighlightOutput').innerHTML = highlightJSON(jsonStr);
        hideJSONError();
        showToast('XML successfully converted to JSON!');
    } catch(err) {
        showToast(err.message, 'error');
    }
}

// ==========================================================================
// TOOL 9: TODO LIST MANAGER (WITH PRIORITY, BACKUP & DATES)
// ==========================================================================

function initTodoList() {
    try {
        todos = JSON.parse(localStorage.getItem('todos')) || [
            { id: 1, text: 'Try creating a high priority task', priority: 'high', dueDate: '2026-12-31', completed: false, subtasks: [] },
            { id: 2, text: 'Review enhanced layout design system', priority: 'medium', dueDate: '', completed: true, subtasks: [] }
        ];
    } catch (e) {
        todos = [
            { id: 1, text: 'Try creating a high priority task', priority: 'high', dueDate: '2026-12-31', completed: false, subtasks: [] },
            { id: 2, text: 'Review enhanced layout design system', priority: 'medium', dueDate: '', completed: true, subtasks: [] }
        ];
    }

    document.getElementById('addTodo').addEventListener('click', addNewTodoItem);
    document.getElementById('todoInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') addNewTodoItem(); });
    document.getElementById('clearCompleted').addEventListener('click', clearCompletedTodos);

    // Filters Setup
    const filterBtns = document.querySelectorAll('.todo-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodoList(btn.getAttribute('data-filter'));
        });
    });

    // Backups
    document.getElementById('exportTodos').addEventListener('click', exportTodosBackup);
    const importBtn = document.getElementById('importTodosBtn');
    const importFile = document.getElementById('importTodosFile');
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importTodosBackup);

    renderTodoList();
}

function addNewTodoItem() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (!text) return;

    const priority = document.getElementById('todoPriority').value;
    const dueDate = document.getElementById('todoDueDate').value;

    const item = {
        id: Date.now(),
        text,
        priority,
        dueDate,
        completed: false,
        subtasks: []
    };

    todos.push(item);
    saveTodosToStorage();
    renderTodoList();

    // Reset fields
    input.value = '';
    document.getElementById('todoDueDate').value = '';
    showToast('Todo task added!');
}

function renderTodoList(filter = 'all') {
    const list = document.getElementById('todoList');
    list.innerHTML = '';

    let items = todos;
    const today = new Date().toISOString().split('T')[0];

    if (filter === 'active') items = todos.filter(t => !t.completed);
    else if (filter === 'completed') items = todos.filter(t => t.completed);
    else if (filter === 'high') items = todos.filter(t => t.priority === 'high');
    else if (filter === 'overdue') items = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today);

    document.getElementById('todoCounter').textContent = `Total Tasks: ${items.length}`;

    if (!items.length) {
        list.innerHTML = `<li style="text-align:center; padding:2rem; color:var(--text-muted);">No tasks match this filter</li>`;
        return;
    }

    // Sort: High priority first, then completed last
    items.sort((a,b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pValues = { high: 3, medium: 2, low: 1 };
        return pValues[b.priority] - pValues[a.priority];
    });

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `todo-item-card ${item.completed ? 'completed' : ''}`;
        
        let priorityTag = `<span class="todo-tag tag-${item.priority}">${item.priority}</span>`;
        
        let dateTag = '';
        if (item.dueDate) {
            const isOverdue = !item.completed && item.dueDate < today;
            
            // Generate dynamic relative-time and status badges
            let statusBadge = '';
            if (item.completed) {
                statusBadge = `<span class="due-status-badge status-completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Completed
                </span>`;
            } else {
                const todayVal = new Date(today);
                const dueVal = new Date(item.dueDate);
                const diffTime = dueVal - todayVal;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    const daysAgo = Math.abs(diffDays);
                    statusBadge = `<span class="due-status-badge status-overdue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Overdue by ${daysAgo} day${daysAgo > 1 ? 's' : ''}
                    </span>`;
                } else if (diffDays === 0) {
                    statusBadge = `<span class="due-status-badge status-today">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Due Today
                    </span>`;
                } else if (diffDays === 1) {
                    statusBadge = `<span class="due-status-badge status-tomorrow">Due Tomorrow</span>`;
                } else {
                    statusBadge = `<span class="due-status-badge status-upcoming">Due in ${diffDays} days</span>`;
                }
            }
            
            dateTag = `<div class="todo-due-container">
                <span class="todo-due-date ${isOverdue ? 'overdue' : ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    ${item.dueDate}
                </span>
                ${statusBadge}
            </div>`;
        }

        // Subtasks progress bar
        let progressHtml = '';
        if (item.subtasks && item.subtasks.length > 0) {
            const completedCount = item.subtasks.filter(s => s.completed).length;
            const pct = Math.round((completedCount / item.subtasks.length) * 100);
            progressHtml = `
                <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">${pct}%</span>
                </div>
            `;
        }

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${item.completed ? 'checked' : ''}>
            <div class="todo-item-content">
                <div class="todo-item-top">
                    <span class="todo-item-text">${item.text}</span>
                    ${priorityTag}
                </div>
                <div class="todo-item-details">
                    ${dateTag}
                    ${progressHtml}
                </div>
                <div class="subtasks-wrapper" style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.25rem;"></div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;" class="subtask-creator">
                    <input type="text" placeholder="Add subtask..." class="subtask-input" style="padding:0.25rem 0.5rem; font-size:0.8rem; height: 30px;">
                    <button class="btn btn-primary add-subtask-btn" style="padding:0.25rem 0.75rem; font-size:0.8rem; height: 30px;">Add</button>
                </div>
            </div>
            <div class="todo-actions-btns">
                <button class="todo-action-icon-btn delete" title="Delete task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Render subtasks checklist
        const subtasksContainer = li.querySelector('.subtasks-wrapper');
        if (item.subtasks && item.subtasks.length > 0) {
            item.subtasks.forEach((sub, sIdx) => {
                const subDiv = document.createElement('div');
                subDiv.className = 'subtask-item';
                subDiv.style.cssText = 'display:flex; align-items:center; gap:0.5rem; font-size:0.85rem;';
                subDiv.innerHTML = `
                    <input type="checkbox" class="subtask-checkbox-el" ${sub.completed ? 'checked' : ''} style="width:14px; height:14px;">
                    <span style="${sub.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${sub.text}</span>
                    <button class="subtask-delete-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-left:auto; font-size:0.8rem;">✕</button>
                `;

                subDiv.querySelector('.subtask-checkbox-el').addEventListener('change', () => {
                    sub.completed = !sub.completed;
                    saveTodosToStorage();
                    renderTodoList(filter);
                });

                subDiv.querySelector('.subtask-delete-btn').addEventListener('click', () => {
                    item.subtasks.splice(sIdx, 1);
                    saveTodosToStorage();
                    renderTodoList(filter);
                });

                subtasksContainer.appendChild(subDiv);
            });
        }

        // Add subtask listener
        li.querySelector('.add-subtask-btn').addEventListener('click', () => {
            const sInput = li.querySelector('.subtask-input');
            const sText = sInput.value.trim();
            if (!sText) return;

            if (!item.subtasks) item.subtasks = [];
            item.subtasks.push({ text: sText, completed: false });
            saveTodosToStorage();
            renderTodoList(filter);
        });

        // Trigger on Enter inside subtask input
        li.querySelector('.subtask-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const sText = e.target.value.trim();
                if (!sText) return;
                if (!item.subtasks) item.subtasks = [];
                item.subtasks.push({ text: sText, completed: false });
                saveTodosToStorage();
                renderTodoList(filter);
            }
        });

        li.querySelector('.todo-checkbox').addEventListener('change', () => {
            item.completed = !item.completed;
            saveTodosToStorage();
            renderTodoList(filter);
            showToast(item.completed ? 'Task completed!' : 'Task reactivated!', 'info');
        });

        li.querySelector('.delete').addEventListener('click', () => {
            todos = todos.filter(t => t.id !== item.id);
            saveTodosToStorage();
            renderTodoList(filter);
            showToast('Task deleted.', 'info');
        });

        list.appendChild(li);
    });
}

function clearCompletedTodos() {
    todos = todos.filter(t => !t.completed);
    saveTodosToStorage();
    renderTodoList();
    showToast('Cleared completed tasks.');
}

function saveTodosToStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function exportTodosBackup() {
    const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'todo-backup.json');
    showToast('Todo list exported!');
}

function importTodosBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (Array.isArray(parsed)) {
                todos = parsed;
                saveTodosToStorage();
                renderTodoList();
                showToast('Restore successful!');
            } else {
                throw new Error();
            }
        } catch(err) {
            showToast('Error parsing JSON backup file.', 'error');
        }
    };
    reader.readAsText(file);
}

// ==========================================================================
// TOOL 10: NOTE TAKER PAD (WITH ORGANIZER SIDEBAR & HTML MARKDOWN PREVIEW)
// ==========================================================================

function initNoteTaker() {
    try {
        notes = JSON.parse(localStorage.getItem('notes')) || [
            { id: '1', title: 'Welcome Note', content: '# Welcome to Markdown Pad!\n\nThis is a splitter view editor.\n\n- Support lists\n- Bold/italic texts\n- Previews live!' }
        ];
    } catch (e) {
        notes = [
            { id: '1', title: 'Welcome Note', content: '# Welcome to Markdown Pad!\n\nThis is a splitter view editor.\n\n- Support lists\n- Bold/italic texts\n- Previews live!' }
        ];
    }

    activeNoteId = localStorage.getItem('activeNoteId') || (notes.length ? notes[0].id : null);

    document.getElementById('newNote').addEventListener('click', createNewNote);
    document.getElementById('saveNote').addEventListener('click', saveActiveNote);
    document.getElementById('exportNoteMd').addEventListener('click', () => exportNoteFile('md'));
    document.getElementById('exportNoteTxt').addEventListener('click', () => exportNoteFile('txt'));

    const markdownInput = document.getElementById('markdownInput');
    markdownInput.addEventListener('input', () => {
        updateNotePreview();
        updateNoteStats();
    });

    renderNoteSidebar();
    loadActiveNote();
}

function renderNoteSidebar() {
    const list = document.getElementById('noteList');
    list.innerHTML = '';

    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = `note-sidebar-item ${note.id === activeNoteId ? 'active' : ''}`;
        li.innerHTML = `
            <span>${note.title || 'Untitled Note'}</span>
            <span class="note-delete-icon" title="Delete note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </span>
        `;

        li.addEventListener('click', (e) => {
            // Check if delete was clicked
            if (e.target.closest('.note-delete-icon')) {
                deleteNoteItem(note.id);
            } else {
                activeNoteId = note.id;
                localStorage.setItem('activeNoteId', activeNoteId);
                renderNoteSidebar();
                loadActiveNote();
            }
        });

        list.appendChild(li);
    });
}

function loadActiveNote() {
    const note = notes.find(n => n.id === activeNoteId);
    const titleInput = document.getElementById('noteTitle');
    const contentText = document.getElementById('markdownInput');

    if (note) {
        titleInput.value = note.title;
        contentText.value = note.content;
    } else {
        titleInput.value = '';
        contentText.value = '';
    }

    updateNotePreview();
    updateNoteStats();
}

function saveActiveNote() {
    const title = document.getElementById('noteTitle').value.trim() || 'Untitled Note';
    const content = document.getElementById('markdownInput').value;

    let note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.title = title;
        note.content = content;
    } else {
        const newId = Date.now().toString();
        notes.push({ id: newId, title, content });
        activeNoteId = newId;
        localStorage.setItem('activeNoteId', activeNoteId);
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    renderNoteSidebar();
    showToast('Notebook saved successfully!');
}

function createNewNote() {
    const newId = Date.now().toString();
    const item = {
        id: newId,
        title: 'New Note',
        content: '# New Title\n\nWrite something details...'
    };
    notes.push(item);
    activeNoteId = newId;
    localStorage.setItem('activeNoteId', activeNoteId);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    renderNoteSidebar();
    loadActiveNote();
    showToast('New note created!');
}

function deleteNoteItem(id) {
    notes = notes.filter(n => n.id !== id);
    if (activeNoteId === id) {
        activeNoteId = notes.length ? notes[0].id : null;
        localStorage.setItem('activeNoteId', activeNoteId);
    }
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNoteSidebar();
    loadActiveNote();
    showToast('Note deleted.', 'info');
}

function updateNotePreview() {
    const markdown = document.getElementById('markdownInput').value;
    const preview = document.getElementById('markdownPreview');

    let html = markdown;

    // Safety HTML characters escape
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Checkboxes (Todo Markdown syntax)
    html = html.replace(/^\- \[[xX]\] (.*$)/gim, '<div style="display:flex; align-items:center; gap:0.5rem;"><input type="checkbox" checked disabled> <span style="text-decoration:line-through;">$1</span></div>');
    html = html.replace(/^\- \[\s\] (.*$)/gim, '<div style="display:flex; align-items:center; gap:0.5rem;"><input type="checkbox" disabled> <span>$1</span></div>');

    // List elements
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^&gt;\s+(.*$)/gim, '<blockquote>$1</blockquote>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    preview.innerHTML = html;
}

function updateNoteStats() {
    const text = document.getElementById('markdownInput').value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('noteStats').textContent = `Words: ${words} | Characters: ${chars}`;
}

function exportNoteFile(ext) {
    const title = document.getElementById('noteTitle').value.trim() || 'note';
    const content = document.getElementById('markdownInput').value;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.${ext}`);
    showToast(`Note exported as .${ext.toUpperCase()}!`);
}

// ==========================================================================
// WELCOME DASHBOARD & 3D ART ENGINE
// ==========================================================================

function initDashboard() {
    // 1. Interactive 3D Canvas Engine
    init3DCanvas();

    // 2. Parallax card tilt effect
    initCardTilts();

    // 3. Grid clicks
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.getAttribute('data-tool');
            switchSection(toolId);
        });
    });
}

function init3DCanvas() {
    canvas3d = document.getElementById('interactive3dCanvas');
    if (!canvas3d) return;
    ctx3d = canvas3d.getContext('2d');
    
    // Set size
    resizeCanvas3d();
    window.addEventListener('resize', resizeCanvas3d);

    // Create 3D points in a sphere shell
    points3d = [];
    const numPoints = 80;
    const radius = 150;
    for (let i = 0; i < numPoints; i++) {
        const theta = Math.acos(Math.random() * 2 - 1);
        const phi = Math.random() * Math.PI * 2;
        
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(theta);
        
        points3d.push({ x, y, z });
    }

    // Mouse movement alters rotation speed slightly
    const hero = document.querySelector('.dashboard-hero');
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        mouseX3d = (e.clientX - rect.left - centerX) / centerX;
        mouseY3d = (e.clientY - rect.top - centerY) / centerY;
    });
    
    hero.addEventListener('mouseleave', () => {
        mouseX3d = 0;
        mouseY3d = 0;
    });

    // Start rendering loop
    if (animId3d) cancelAnimationFrame(animId3d);
    draw3DFrame();
}

function resizeCanvas3d() {
    if (!canvas3d) return;
    const parent = canvas3d.parentElement;
    if (parent && typeof parent.getBoundingClientRect === 'function') {
        const rect = parent.getBoundingClientRect();
        canvas3d.width = rect.width;
        canvas3d.height = rect.height;
    } else {
        canvas3d.width = 800;
        canvas3d.height = 300;
    }
}

function draw3DFrame() {
    if (!canvas3d || !ctx3d) return;
    ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
    
    // Adjust rotation speeds based on mouse position
    const currentRotX = rotationX + mouseY3d * 0.015;
    const currentRotY = rotationY + mouseX3d * 0.015;

    // Center coordinates
    const cx = canvas3d.width * 0.75;
    const cy = canvas3d.height / 2;
    const fov = 400;

    // Rotate points
    const cosX = Math.cos(currentRotX);
    const sinX = Math.sin(currentRotX);
    const cosY = Math.cos(currentRotY);
    const sinY = Math.sin(currentRotY);

    points3d.forEach(p => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Perspective projection
        const scale = fov / (fov + z2);
        p.projX = cx + x1 * scale;
        p.projY = cy + y2 * scale;
        p.projScale = scale;
    });

    // Draw lines between close points
    ctx3d.lineWidth = 0.5;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lineColor = isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(37, 99, 235, 0.06)';
    const pointColor = isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(37, 99, 235, 0.25)';

    for (let i = 0; i < points3d.length; i++) {
        const p1 = points3d[i];
        if (p1.projX < 0 || p1.projX > canvas3d.width || p1.projY < 0 || p1.projY > canvas3d.height) continue;

        for (let j = i + 1; j < points3d.length; j++) {
            const p2 = points3d[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
            if (dist < 100) {
                ctx3d.beginPath();
                ctx3d.moveTo(p1.projX, p1.projY);
                ctx3d.lineTo(p2.projX, p2.projY);
                ctx3d.strokeStyle = lineColor;
                ctx3d.stroke();
            }
        }
    }

    // Draw particles
    points3d.forEach(p => {
        if (p.projX < 0 || p.projX > canvas3d.width || p.projY < 0 || p.projY > canvas3d.height) return;
        
        ctx3d.beginPath();
        ctx3d.arc(p.projX, p.projY, Math.max(0.5, p.projScale * 2), 0, Math.PI * 2);
        ctx3d.fillStyle = pointColor;
        ctx3d.fill();
    });

    animId3d = requestAnimationFrame(draw3FrameOrLoop);
}

function draw3FrameOrLoop() {
    draw3DFrame();
}

function initCardTilts() {
    const cards = document.querySelectorAll('.dashboard-card, .pdf-tool-card, .hr-tool-card');
    cards.forEach(card => {
        // Dynamically add a .card-glow overlay if not present (excluding dashboard cards which already have it)
        if (!card.querySelector('.card-glow') && !card.classList.contains('dashboard-card')) {
            const glow = document.createElement('div');
            glow.className = 'card-glow';
            card.insertBefore(glow, card.firstChild);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// ==========================================================================
// 11. PDF & DOCUMENT UTILITIES
// ==========================================================================

function initPDFUtilities() {
    const API_BASE_URL = "http://127.0.0.1:8000/api";
    
    // State management
    let pdfCurrentTool = null;
    let selectedFiles = {}; // Holds single selected file per input ID
    let pdfMergeQueueFiles = []; // Array of { name, size, file } for merger
    let imageToPdfQueueFiles = []; // Array of { name, size, file } for image combinations

    // UI elements
    const directoryView = document.getElementById('pdfDirectoryView');
    const workspaceView = document.getElementById('pdfWorkspaceView');
    const backBtn = document.getElementById('btnPdfBackToDirectory');
    const workspaceTitle = document.getElementById('workspaceTitle');
    const workspaceDesc = document.getElementById('workspaceDesc');

    // 1. Directory-Workspace Navigation
    const toolCards = document.querySelectorAll('.pdf-tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.getAttribute('data-pdf-tool');
            const title = card.querySelector('.tool-card-title').textContent;
            const desc = card.querySelector('.tool-card-desc').textContent;

            openToolWorkspace(toolId, title, desc);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeToolWorkspace();
        });
    }

    function openToolWorkspace(toolId, title, desc) {
        pdfCurrentTool = toolId;
        
        // Update header metadata
        if (workspaceTitle) workspaceTitle.textContent = title;
        if (workspaceDesc) workspaceDesc.textContent = desc;

        // Hide all workspaces first, then show the active one
        document.querySelectorAll('.pdf-tool-workspace').forEach(ws => {
            ws.style.display = 'none';
        });

        const activeWorkspace = document.getElementById(`workspace-${toolId}`);
        if (activeWorkspace) {
            activeWorkspace.style.display = 'block';
        }

        // Toggle main views
        if (directoryView) directoryView.style.display = 'none';
        if (workspaceView) workspaceView.style.display = 'block';
    }

    function closeToolWorkspace() {
        pdfCurrentTool = null;
        
        // Hide workspace view, show directory
        if (workspaceView) workspaceView.style.display = 'none';
        if (directoryView) directoryView.style.display = 'block';

        // Clear files state for the closed workspace
        selectedFiles = {};
        pdfMergeQueueFiles = [];
        imageToPdfQueueFiles = [];
        renderPdfMergeQueue();
        renderImageToPdfQueue();

        // Reset all file info displays
        document.querySelectorAll('.pdf-selected-file-info').forEach(info => {
            info.style.display = 'none';
            info.innerHTML = '';
        });
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.value = '';
        });
    }

    // 2. Setup Generic Drag and Drop Zones
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        const inputId = zone.id.replace('DropZone', 'Input');
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            // Click to browse
            zone.addEventListener('click', () => fileInput.click());

            // Drag events
            ['dragenter', 'dragover'].forEach(eventName => {
                zone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.add('dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.remove('dragover');
                }, false);
            });

            zone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files && files.length > 0) {
                    if (fileInput.multiple) {
                        handlePdfFileSelect(zone.id, files);
                    } else {
                        handlePdfFileSelect(zone.id, files[0]);
                    }
                }
            }, false);

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    if (fileInput.multiple) {
                        handlePdfFileSelect(zone.id, e.target.files);
                    } else {
                        handlePdfFileSelect(zone.id, e.target.files[0]);
                    }
                }
            });
        }
    });

    // 3. Handle File Selection
    function handlePdfFileSelect(zoneId, fileOrFiles) {
        const inputId = zoneId.replace('DropZone', 'Input');
        const infoElId = zoneId.replace('DropZone', 'FileInfo');
        const infoEl = document.getElementById(infoElId);

        // A. PDF Merge Drop Zone
        if (zoneId === 'pdfMergeDropZone') {
            const filesArray = Array.from(fileOrFiles).filter(f => f.name.toLowerCase().endsWith('.pdf'));
            if (filesArray.length === 0) {
                showToast('Please select valid PDF documents.', 'error');
                return;
            }
            filesArray.forEach(file => {
                pdfMergeQueueFiles.push({
                    name: file.name,
                    size: file.size,
                    file: file
                });
            });
            renderPdfMergeQueue();
            showToast(`${filesArray.length} PDF(s) added to queue.`, 'success');
            return;
        }

        // B. Image to PDF Drop Zone
        if (zoneId === 'imageToPdfDropZone') {
            const filesArray = Array.from(fileOrFiles).filter(f => /\.(jpe?g|png)$/i.test(f.name));
            if (filesArray.length === 0) {
                showToast('Please select valid JPG or PNG images.', 'error');
                return;
            }
            filesArray.forEach(file => {
                imageToPdfQueueFiles.push({
                    name: file.name,
                    size: file.size,
                    file: file
                });
            });
            renderImageToPdfQueue();
            showToast(`${filesArray.length} Image(s) added to queue.`, 'success');
            return;
        }

        // C. Standard Single File Drop Zones
        selectedFiles[inputId] = fileOrFiles;
        if (infoEl && fileOrFiles) {
            infoEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Selected: <strong>${fileOrFiles.name}</strong> (${formatBytes(fileOrFiles.size)})
            `;
            infoEl.style.display = 'flex';
            showToast('Document loaded successfully.', 'success');
        }
    }

    // 4. Render Merger Queue List
    function renderPdfMergeQueue() {
        const queueList = document.getElementById('pdfMergeQueue');
        const wrapper = document.getElementById('pdfMergeListWrapper');
        if (!queueList || !wrapper) return;

        queueList.innerHTML = '';
        if (pdfMergeQueueFiles.length === 0) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';
        pdfMergeQueueFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'pdf-file-item';
            li.innerHTML = `
                <div class="pdf-file-info">
                    <div class="pdf-file-icon">🔗</div>
                    <div class="pdf-file-text-details">
                        <span class="pdf-file-name" title="${file.name}">${file.name}</span>
                        <span class="pdf-file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <div class="pdf-file-actions">
                    <button class="pdf-action-btn move-up" title="Move Up" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''}>▲</button>
                    <button class="pdf-action-btn move-down" title="Move Down" ${index === pdfMergeQueueFiles.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>▼</button>
                    <button class="pdf-action-btn delete-btn" title="Remove">✕</button>
                </div>
            `;

            li.querySelector('.move-up').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    const temp = pdfMergeQueueFiles[index];
                    pdfMergeQueueFiles[index] = pdfMergeQueueFiles[index - 1];
                    pdfMergeQueueFiles[index - 1] = temp;
                    renderPdfMergeQueue();
                }
            });

            li.querySelector('.move-down').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < pdfMergeQueueFiles.length - 1) {
                    const temp = pdfMergeQueueFiles[index];
                    pdfMergeQueueFiles[index] = pdfMergeQueueFiles[index + 1];
                    pdfMergeQueueFiles[index + 1] = temp;
                    renderPdfMergeQueue();
                }
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                pdfMergeQueueFiles.splice(index, 1);
                renderPdfMergeQueue();
            });

            queueList.appendChild(li);
        });
    }

    // 5. Render Image combinations Queue List
    function renderImageToPdfQueue() {
        const queueList = document.getElementById('imageToPdfQueue');
        const wrapper = document.getElementById('imageToPdfListWrapper');
        if (!queueList || !wrapper) return;

        queueList.innerHTML = '';
        if (imageToPdfQueueFiles.length === 0) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';
        imageToPdfQueueFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'pdf-file-item';
            li.innerHTML = `
                <div class="pdf-file-info">
                    <div class="pdf-file-icon">🖼️</div>
                    <div class="pdf-file-text-details">
                        <span class="pdf-file-name" title="${file.name}">${file.name}</span>
                        <span class="pdf-file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <div class="pdf-file-actions">
                    <button class="pdf-action-btn move-up" title="Move Up" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''}>▲</button>
                    <button class="pdf-action-btn move-down" title="Move Down" ${index === imageToPdfQueueFiles.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>▼</button>
                    <button class="pdf-action-btn delete-btn" title="Remove">✕</button>
                </div>
            `;

            li.querySelector('.move-up').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    const temp = imageToPdfQueueFiles[index];
                    imageToPdfQueueFiles[index] = imageToPdfQueueFiles[index - 1];
                    imageToPdfQueueFiles[index - 1] = temp;
                    renderImageToPdfQueue();
                }
            });

            li.querySelector('.move-down').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < imageToPdfQueueFiles.length - 1) {
                    const temp = imageToPdfQueueFiles[index];
                    imageToPdfQueueFiles[index] = imageToPdfQueueFiles[index + 1];
                    imageToPdfQueueFiles[index + 1] = temp;
                    renderImageToPdfQueue();
                }
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                imageToPdfQueueFiles.splice(index, 1);
                renderImageToPdfQueue();
            });

            queueList.appendChild(li);
        });
    }

    // 6. Color input HEX synchronization for Watermark
    const watermarkColor = document.getElementById('pdfWatermarkColor');
    const watermarkColorHex = document.getElementById('pdfWatermarkColorHex');
    if (watermarkColor && watermarkColorHex) {
        watermarkColor.addEventListener('input', (e) => {
            watermarkColorHex.value = e.target.value.toUpperCase();
        });
        watermarkColorHex.addEventListener('input', (e) => {
            let val = e.target.value;
            if (val.charAt(0) !== '#') val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                watermarkColor.value = val;
            }
        });
    }

    // 7. Core HTTP Client pipeline
    async function callPdfBackend(routePath, formData, defaultOutputName) {
        try {
            showGlobalLoader(true);
            showToast("Processing document on backend...", "info");

            const response = await fetch(`${API_BASE_URL}${routePath}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Server responded with status ${response.status}`);
            }

            const contentDisposition = response.headers.get("Content-Disposition");
            let outputName = defaultOutputName;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    outputName = filenameMatch[1];
                }
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = outputName;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            showToast("Document processed and downloaded!", "success");
        } catch (err) {
            console.error(err);
            showToast(err.message, "error");
        } finally {
            showGlobalLoader(false);
        }
    }

    // Helper: Validates if a single file has been uploaded
    function assertFileUploaded(inputId, errorMessage = "Please upload a document first.") {
        if (!selectedFiles[inputId]) {
            showToast(errorMessage, "warning");
            return false;
        }
        return true;
    }

    // ==========================================================================
    // 8. ACTION BINDINGS FOR ALL 25 UTILITIES
    // ==========================================================================

    // Tool 1: PDF Merger
    document.getElementById('btnMergeSubmit').addEventListener('click', async () => {
        if (pdfMergeQueueFiles.length < 2) {
            showToast("Please add at least 2 PDF documents to combine.", "warning");
            return;
        }
        const formData = new FormData();
        pdfMergeQueueFiles.forEach(f => {
            formData.append("files", f.file);
        });
        await callPdfBackend("/merge-split/merge", formData, "merged_document.pdf");
    });

    // Tool 2: Split by Pages
    document.getElementById('btnSplitSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfSplitInput")) return;
        const range = document.getElementById('pdfSplitRange').value.trim();
        if (!range) {
            showToast("Please enter page ranges to split.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfSplitInput"]);
        formData.append("ranges", range);
        formData.append("split_mode", document.getElementById("pdfSplitMode").value);
        await callPdfBackend("/merge-split/split-by-pages", formData, "split_pages.pdf");
    });

    // Tool 3: Split by Size
    document.getElementById('btnSplitSizeSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfSplitSizeInput")) return;
        const maxSize = document.getElementById('pdfSplitMaxSize').value;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfSplitSizeInput"]);
        formData.append("max_size_mb", maxSize);
        await callPdfBackend("/merge-split/split-by-size", formData, "split_by_size.zip");
    });

    // Tool 4: Split by Bookmarks
    document.getElementById('btnSplitBookSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfSplitBookInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfSplitBookInput"]);
        await callPdfBackend("/merge-split/split-by-bookmarks", formData, "split_by_bookmarks.zip");
    });

    // Tool 5: Alternate Mix
    document.getElementById('btnMixSubmit').addEventListener('click', async () => {
        if (!selectedFiles["pdfMixAInput"] || !selectedFiles["pdfMixBInput"]) {
            showToast("Please upload both Document A and Document B.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file_a", selectedFiles["pdfMixAInput"]);
        formData.append("file_b", selectedFiles["pdfMixBInput"]);
        formData.append("interval_a", document.getElementById('pdfMixCountA').value);
        formData.append("interval_b", document.getElementById('pdfMixCountB').value);
        formData.append("reverse_b", document.getElementById('pdfMixReverseB').checked);
        await callPdfBackend("/merge-split/alternate-mix", formData, "alternate_mixed.pdf");
    });

    // Tool 6: PDF Compressor
    document.getElementById('btnCompressSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfCompressInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfCompressInput"]);
        formData.append("quality", document.getElementById("pdfCompressQuality").value);
        formData.append("dpi_target", document.getElementById("pdfCompressDpi").value);
        formData.append("lossy", document.getElementById("pdfCompressLossy").checked);
        formData.append("lossless", document.getElementById("pdfCompressLossless").checked);
        await callPdfBackend("/optimize-security/compress", formData, "compressed_document.pdf");
    });

    // Tool 7: Password Protect
    document.getElementById('btnProtectSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfProtectInput")) return;
        const password = document.getElementById('pdfProtectPassword').value;
        if (!password) {
            showToast("Please provide an encryption password.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfProtectInput"]);
        formData.append("password", password);
        formData.append("allow_print", document.getElementById("pdfProtectAllowPrint").checked);
        formData.append("allow_copy", document.getElementById("pdfProtectAllowCopy").checked);
        formData.append("allow_modify", document.getElementById("pdfProtectAllowModify").checked);
        formData.append("allow_annotate", document.getElementById("pdfProtectAllowAnnotate").checked);
        await callPdfBackend("/optimize-security/protect", formData, "protected_document.pdf");
    });

    // Tool 8: Decrypt PDF
    document.getElementById('btnUnlockSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfUnlockInput")) return;
        const password = document.getElementById('pdfUnlockPassword').value;
        if (!password) {
            showToast("Please enter password to unlock.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfUnlockInput"]);
        formData.append("password", password);
        await callPdfBackend("/optimize-security/unlock", formData, "decrypted_document.pdf");
    });

    // Tool 9: Add Watermark
    document.getElementById('btnWatermarkSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfWatermarkInput")) return;
        const text = document.getElementById('pdfWatermarkText').value.trim();
        if (!text) {
            showToast("Please enter watermark text.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfWatermarkInput"]);
        formData.append("text", text);
        formData.append("opacity", document.getElementById("pdfWatermarkOpacity").value);
        formData.append("font_size", document.getElementById("pdfWatermarkFontSize").value);
        formData.append("color_hex", document.getElementById("pdfWatermarkColor").value);
        await callPdfBackend("/optimize-security/watermark", formData, "watermarked_document.pdf");
    });

    // Tool 10: Flatten Document
    document.getElementById('btnFlattenSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfFlattenInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfFlattenInput"]);
        formData.append("mode", document.getElementById("pdfFlattenMode").value);
        await callPdfBackend("/optimize-security/flatten", formData, "flattened_document.pdf");
    });

    // Tool 11: Delete Pages
    document.getElementById('btnDeleteSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfDeleteInput")) return;
        const pages = document.getElementById('pdfDeletePages').value.trim();
        if (!pages) {
            showToast("Please specify page numbers to remove.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfDeleteInput"]);
        formData.append("pages_to_delete", pages);
        await callPdfBackend("/page-organize/delete-pages", formData, "pages_deleted.pdf");
    });

    // Tool 12: Rotate Pages
    document.getElementById('btnRotateSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfRotateInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfRotateInput"]);
        formData.append("rotation_angle", document.getElementById("pdfRotateAngle").value);
        formData.append("pages", document.getElementById("pdfRotatePages").value.trim());
        formData.append("relative", document.getElementById("pdfRotateRelative").checked);
        await callPdfBackend("/page-organize/rotate", formData, "pages_rotated.pdf");
    });

    // Tool 13: Crop Margins
    document.getElementById('btnCropSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfCropInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfCropInput"]);
        formData.append("margin_left", document.getElementById("pdfCropLeft").value);
        formData.append("margin_right", document.getElementById("pdfCropRight").value);
        formData.append("margin_top", document.getElementById("pdfCropTop").value);
        formData.append("margin_bottom", document.getElementById("pdfCropBottom").value);
        formData.append("crop_box", document.getElementById("pdfCropBox").value.trim());
        formData.append("pages", document.getElementById("pdfCropPages").value.trim());
        await callPdfBackend("/page-organize/crop", formData, "pages_cropped.pdf");
    });

    // Tool 14: Bates Numbering
    document.getElementById('btnBatesSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfBatesInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfBatesInput"]);
        formData.append("prefix", document.getElementById("pdfBatesPrefix").value);
        formData.append("start_num", document.getElementById("pdfBatesStart").value);
        formData.append("digits", document.getElementById("pdfBatesDigits").value);
        formData.append("font_size", document.getElementById("pdfBatesFontSize").value);
        formData.append("color_hex", document.getElementById("pdfBatesColor").value);
        formData.append("position", document.getElementById("pdfBatesPosition").value);
        await callPdfBackend("/page-organize/bates-numbering", formData, "bates_numbered.pdf");
    });

    // Tool 15: Headers & Footers
    document.getElementById('btnHeaderSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfHeaderInput")) return;
        const headerText = document.getElementById("pdfHeaderText").value;
        const footerText = document.getElementById("pdfFooterText").value;
        if (!headerText && !footerText) {
            showToast("Please fill in either a header or a footer template.", "warning");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfHeaderInput"]);
        formData.append("header_center", headerText);
        formData.append("footer_center", footerText);
        formData.append("font_size", document.getElementById("pdfHeaderFontSize").value);
        formData.append("color_hex", document.getElementById("pdfHeaderColor").value);
        await callPdfBackend("/page-organize/header-footer", formData, "header_footer_added.pdf");
    });

    // Tool 16: PDF to Word
    document.getElementById('btnToWordSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfToWordInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfToWordInput"]);
        await callPdfBackend("/conversion/to-word", formData, "converted_document.docx");
    });

    // Tool 17: PDF to Excel
    document.getElementById('btnToExcelSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfToExcelInput")) return;
        const format = document.getElementById("pdfToExcelFormat").value;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfToExcelInput"]);
        formData.append("format_type", format);
        const ext = format === "csv" ? "csv" : "xlsx";
        await callPdfBackend("/conversion/to-excel", formData, `extracted_tables.${ext}`);
    });

    // Tool 18: Office to PDF
    document.getElementById('btnOfficeToPdfSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("officeToPdfInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["officeToPdfInput"]);
        await callPdfBackend("/conversion/office-to-pdf", formData, "converted_document.pdf");
    });

    // Tool 19: PDF to Image
    document.getElementById('btnToImageSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfToImageInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfToImageInput"]);
        formData.append("dpi", document.getElementById("pdfToImageDpi").value);
        await callPdfBackend("/conversion/to-image", formData, "pdf_pages_images.zip");
    });

    // Tool 20: Image to PDF
    document.getElementById('btnImageToPdfSubmit').addEventListener('click', async () => {
        if (imageToPdfQueueFiles.length === 0) {
            showToast("Please add at least 1 image to combine.", "warning");
            return;
        }
        const formData = new FormData();
        imageToPdfQueueFiles.forEach(f => {
            formData.append("files", f.file);
        });
        await callPdfBackend("/conversion/image-to-pdf", formData, "images_combined.pdf");
    });

    // Tool 21: PDF to Text
    document.getElementById('btnToTxtSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfToTxtInput")) return;
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfToTxtInput"]);
        await callPdfBackend("/conversion/to-txt", formData, "extracted_text.txt");
    });

    // Tool 22: Bake Text
    document.getElementById('btnVisEditSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfVisEditInput")) return;
        const textJson = document.getElementById("pdfVisEditText").value.trim();
        if (!textJson) {
            showToast("Please supply the Text Elements JSON data.", "warning");
            return;
        }
        try {
            JSON.parse(textJson);
        } catch (e) {
            showToast("Invalid JSON syntax in text elements config.", "error");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfVisEditInput"]);
        formData.append("text_elements", textJson);
        await callPdfBackend("/visual-annotate/visual-edit", formData, "visual_text_edited.pdf");
    });

    // Tool 23: Fill & Sign
    document.getElementById('btnSignSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfSignInput")) return;
        const signImageInput = document.getElementById("pdfSignImageInput");
        if (!signImageInput.files || !signImageInput.files[0]) {
            showToast("Please select a signature image file.", "warning");
            return;
        }
        const x = parseFloat(document.getElementById("pdfSignX").value) || 0;
        const y = parseFloat(document.getElementById("pdfSignY").value) || 0;
        const w = parseFloat(document.getElementById("pdfSignW").value) || 100;
        const h = parseFloat(document.getElementById("pdfSignH").value) || 50;
        const page = parseInt(document.getElementById("pdfSignPage").value) || 1;
        const pageNum = Math.max(0, page - 1);

        const rectCoords = JSON.stringify({
            x0: x,
            y0: y,
            x1: x + w,
            y1: y + h
        });

        const formData = new FormData();
        formData.append("file", selectedFiles["pdfSignInput"]);
        formData.append("signature_image", signImageInput.files[0]);
        formData.append("page_num", pageNum);
        formData.append("rect_coords", rectCoords);
        await callPdfBackend("/visual-annotate/fill-sign", formData, "signed_document.pdf");
    });

    // Tool 24: Whiteout Redact
    document.getElementById('btnWhiteoutSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfWhiteoutInput")) return;
        const x = parseFloat(document.getElementById("pdfWhiteoutX").value) || 0;
        const y = parseFloat(document.getElementById("pdfWhiteoutY").value) || 0;
        const w = parseFloat(document.getElementById("pdfWhiteoutW").value) || 100;
        const h = parseFloat(document.getElementById("pdfWhiteoutH").value) || 50;
        const page = parseInt(document.getElementById("pdfWhiteoutPage").value) || 1;
        const pageNum = Math.max(0, page - 1);

        const redactions = JSON.stringify([{
            page: pageNum,
            x0: x,
            y0: y,
            x1: x + w,
            y1: y + h
        }]);

        const formData = new FormData();
        formData.append("file", selectedFiles["pdfWhiteoutInput"]);
        formData.append("redactions", redactions);
        await callPdfBackend("/visual-annotate/whiteout", formData, "redacted_document.pdf");
    });

    // Tool 25: Draw Shapes
    document.getElementById('btnShapesSubmit').addEventListener('click', async () => {
        if (!assertFileUploaded("pdfShapesInput")) return;
        const shapesJson = document.getElementById("pdfShapesData").value.trim();
        if (!shapesJson) {
            showToast("Please supply the Shapes markup JSON data.", "warning");
            return;
        }
        try {
            JSON.parse(shapesJson);
        } catch (e) {
            showToast("Invalid JSON syntax in shapes markup config.", "error");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFiles["pdfShapesInput"]);
        formData.append("shapes", shapesJson);
        await callPdfBackend("/visual-annotate/add-shapes", formData, "shapes_added.pdf");
    });
}

function initHRUtilities() {
    const API_BASE_URL = "http://127.0.0.1:8000/api";
    let hrCurrentTool = null;
    let hrLetterSelectedFile = null;

    // Pre-fill sample JSON for Bulk Letter Gen
    const hrLetterData = document.getElementById('hrLetterData');
    if (hrLetterData && !hrLetterData.value) {
        hrLetterData.value = JSON.stringify([
            {
                "NAME": "John Doe",
                "SALARY": "$75,000",
                "ROLE": "Senior Engineer",
                "DATE": "June 15, 2026"
            },
            {
                "NAME": "Jane Smith",
                "SALARY": "$85,000",
                "ROLE": "HR Specialist",
                "DATE": "July 01, 2026"
            }
        ], null, 2);
    }

    // UI elements
    const directoryView = document.getElementById('hrDirectoryView');
    const workspaceView = document.getElementById('hrWorkspaceView');
    const backBtn = document.getElementById('btnHrBackToDirectory');
    const workspaceTitle = document.getElementById('hrWorkspaceTitle');
    const workspaceDesc = document.getElementById('hrWorkspaceDesc');

    // 1. Directory-Workspace Navigation
    const toolCards = document.querySelectorAll('.hr-tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const toolId = card.getAttribute('data-hr-tool');
            const title = card.querySelector('.tool-card-title').textContent;
            const desc = card.querySelector('.tool-card-desc').textContent;
            openToolWorkspace(toolId, title, desc);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeToolWorkspace();
        });
    }

    function openToolWorkspace(toolId, title, desc) {
        hrCurrentTool = toolId;
        
        // Update header metadata
        if (workspaceTitle) workspaceTitle.textContent = title;
        if (workspaceDesc) workspaceDesc.textContent = desc;

        // Hide all workspaces first, then show the active one
        document.querySelectorAll('.hr-tool-workspace').forEach(ws => {
            ws.style.display = 'none';
        });

        const activeWorkspace = document.getElementById(`workspace-${toolId}`);
        if (activeWorkspace) {
            activeWorkspace.style.display = 'block';
        }

        // Toggle main views
        if (directoryView) directoryView.style.display = 'none';
        if (workspaceView) workspaceView.style.display = 'block';
    }

    function closeToolWorkspace() {
        hrCurrentTool = null;
        
        // Hide workspace view, show directory
        if (workspaceView) workspaceView.style.display = 'none';
        if (directoryView) directoryView.style.display = 'block';

        // Clear files state for the closed workspace
        hrLetterSelectedFile = null;
        const fileInfo = document.getElementById('hrLetterFileInfo');
        if (fileInfo) {
            fileInfo.style.display = 'none';
            fileInfo.innerHTML = '';
        }
        const fileInput = document.getElementById('hrLetterInput');
        if (fileInput) fileInput.value = '';

        // Reset result containers
        const results = ['hrSalaryResult', 'hrGratuityResult', 'hrHoursResult'];
        results.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    // 2. Setup Drag and Drop Zone for Bulk Letter Gen
    const dropZone = document.getElementById('hrLetterDropZone');
    const fileInput2 = document.getElementById('hrLetterInput');
    if (dropZone && fileInput2) {
        dropZone.addEventListener('click', () => fileInput2.click());

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                handleFileSelect(files[0]);
            }
        }, false);

        fileInput2.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        if (!file.name.toLowerCase().endsWith('.docx')) {
            showToast('Please select a valid Word Document (.docx) template.', 'error');
            return;
        }
        hrLetterSelectedFile = file;
        const infoEl = document.getElementById('hrLetterFileInfo');
        if (infoEl) {
            infoEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Selected: <strong>${file.name}</strong> (${formatBytes(file.size)})
            `;
            infoEl.style.display = 'flex';
            showToast('Template loaded successfully.', 'success');
        }
    }

    // 3. Client Pipeline helper for JSON responses
    async function callHrApi(routePath, formData) {
        try {
            showGlobalLoader(true, "Calculating details on backend...");
            const response = await fetch(`${API_BASE_URL}${routePath}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Server responded with status ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error(err);
            showToast(err.message, "error");
            return null;
        } finally {
            showGlobalLoader(false);
        }
    }

    // 4. Action Bindings

    // Tool 1: Algebraic Solver to calculate structure from CTC
    function solveSalaryStructure() {
        const inputMode = document.getElementById('hrSalaryInputMode').value;
        if (inputMode !== 'ctc') return; // Only solve in CTC mode

        const ctcValue = parseFloat(document.getElementById('hrSalaryCtc').value) || 0;
        const ctcPeriod = document.getElementById('hrSalaryCtcPeriod').value; // 'lpa', 'yearly', 'monthly'
        
        let monthlyCtc = 0;
        if (ctcPeriod === 'lpa') {
            monthlyCtc = (ctcValue * 100000) / 12;
        } else if (ctcPeriod === 'yearly') {
            monthlyCtc = ctcValue / 12;
        } else {
            monthlyCtc = ctcValue;
        }
        
        if (monthlyCtc <= 0) {
            document.getElementById('hrSalaryBasic').value = 0;
            document.getElementById('hrSalaryHra').value = 0;
            document.getElementById('hrSalaryDa').value = 0;
            document.getElementById('hrSalaryConveyance').value = 0;
            document.getElementById('hrSalaryMedical').value = 0;
            document.getElementById('hrSalarySpecial').value = 0;
            return;
        }
        
        // Read rates and settings
        const pfEnabled = document.getElementById('hrSalaryEnablePf').checked;
        const pfEmployerRate = parseFloat(document.getElementById('hrSalaryPfEmployer').value) || 12;
        const pfApplyCap = document.getElementById('hrSalaryPfCap').checked;
        const pfIncludeEmployer = document.getElementById('hrSalaryPfIncludeEmployer').checked;
        
        const esicEnabled = document.getElementById('hrSalaryEnableEsic').checked;
        const esicEmployerRate = parseFloat(document.getElementById('hrSalaryEsicEmployer').value) || 3.25;
        const esicApplyLimit = document.getElementById('hrSalaryEsicLimit').checked;
        
        const pfRatePct = pfEmployerRate / 100.0;
        const esicRatePct = esicEmployerRate / 100.0;
        
        let gross = 0;
        
        // Let's solve: Gross + Employer_PF + Employer_ESIC = monthlyCtc
        // Basic = 50% of Gross. HRA = 40% of Basic = 20% of Gross. Special Allowance = 30% of Gross.
        
        const pfFactor = (pfEnabled && pfIncludeEmployer) ? (0.5 * pfRatePct) : 0;
        const esicFactor = esicEnabled ? esicRatePct : 0;

        // We check Case 1: Gross > 21000 (ESIC cap active/no ESIC) and Basic >= 15000 (PF cap active, meaning 0.5 * Gross >= 15000 => Gross >= 30000)
        if (pfEnabled && pfIncludeEmployer && pfApplyCap) {
            const maxPfBase = 15000;
            const employerPf = maxPfBase * pfRatePct;
            const candidateGross = monthlyCtc - employerPf;
            
            // Validate case conditions:
            const basic = candidateGross * 0.5;
            const isEsicActive = esicEnabled && (!esicApplyLimit || candidateGross <= 21000);
            if (basic >= 15000 && !isEsicActive) {
                gross = candidateGross;
            }
        }
        
        // Case 2: ESIC inactive, PF cap inactive
        if (gross === 0) {
            const candidateGross = monthlyCtc / (1 + pfFactor);
            const basic = candidateGross * 0.5;
            const isEsicActive = esicEnabled && (!esicApplyLimit || candidateGross <= 21000);
            const isPfCapActive = pfEnabled && pfIncludeEmployer && pfApplyCap && (basic >= 15000);
            if (!isEsicActive && !isPfCapActive) {
                gross = candidateGross;
            }
        }
        
        // Case 3: ESIC active, PF cap inactive
        if (gross === 0) {
            const candidateGross = monthlyCtc / (1 + pfFactor + esicFactor);
            const basic = candidateGross * 0.5;
            const isEsicActive = esicEnabled && (!esicApplyLimit || candidateGross <= 21000);
            const isPfCapActive = pfEnabled && pfIncludeEmployer && pfApplyCap && (basic >= 15000);
            if (isEsicActive && !isPfCapActive) {
                gross = candidateGross;
            }
        }

        // Case 4: ESIC active, PF cap active
        if (gross === 0) {
            const maxPfBase = 15000;
            const employerPf = (pfEnabled && pfIncludeEmployer) ? (maxPfBase * pfRatePct) : 0;
            const candidateGross = (monthlyCtc - employerPf) / (1 + esicFactor);
            const basic = candidateGross * 0.5;
            const isEsicActive = esicEnabled && (!esicApplyLimit || candidateGross <= 21000);
            const isPfCapActive = pfEnabled && pfIncludeEmployer && pfApplyCap && (basic >= 15000);
            if (isEsicActive && isPfCapActive) {
                gross = candidateGross;
            }
        }
        
        // Fallback if none matches (e.g. edge boundary numerical instability)
        if (gross === 0) {
            gross = monthlyCtc / (1 + pfFactor + (esicEnabled && monthlyCtc <= 21000 ? esicRatePct : 0));
        }

        const basic = gross * 0.5;
        const hra = basic * 0.4;
        const da = 0;
        const conveyance = 0;
        const medical = 0;
        const special = gross - basic - hra;
        
        document.getElementById('hrSalaryBasic').value = Math.round(basic);
        document.getElementById('hrSalaryHra').value = Math.round(hra);
        document.getElementById('hrSalaryDa').value = da;
        document.getElementById('hrSalaryConveyance').value = conveyance;
        document.getElementById('hrSalaryMedical').value = medical;
        document.getElementById('hrSalarySpecial').value = Math.round(special);
    }

    // Toggle Calculation Mode (CTC vs Components)
    const inputModeSelect = document.getElementById('hrSalaryInputMode');
    if (inputModeSelect) {
        inputModeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            const ctcPeriodWrapper = document.getElementById('ctcPeriodWrapper');
            const btnAutoSplit = document.getElementById('btnHrSalaryAutoSplit');
            const componentsFields = document.getElementById('hrSalaryComponentsFields');
            const fieldsHeader = document.getElementById('componentsFieldsHeader');
            const ctcLabel = document.querySelector('label[for="hrSalaryCtc"]');
            
            const inputs = componentsFields.querySelectorAll('input');
            
            if (mode === 'ctc') {
                ctcPeriodWrapper.style.display = 'block';
                btnAutoSplit.style.display = 'none';
                fieldsHeader.textContent = "Salary Structure Preview (Auto-calculated)";
                ctcLabel.textContent = "CTC Value (₹ / Lakhs):";
                
                inputs.forEach(input => {
                    input.readOnly = true;
                    input.style.opacity = '0.85';
                    input.style.background = 'rgba(0, 0, 0, 0.05)';
                });
                solveSalaryStructure();
            } else {
                ctcPeriodWrapper.style.display = 'none';
                btnAutoSplit.style.display = 'inline-block';
                fieldsHeader.textContent = "Monthly Earnings (Manual Components)";
                ctcLabel.textContent = "Monthly CTC Helper (₹):";
                
                inputs.forEach(input => {
                    input.readOnly = false;
                    input.style.opacity = '1';
                    input.style.background = 'var(--bg-input)';
                });
            }
        });
    }

    // Bind reactive events
    const reactiveSelectors = [
        'hrSalaryCtc', 'hrSalaryCtcPeriod',
        'hrSalaryEnablePf', 'hrSalaryPfEmployee', 'hrSalaryPfEmployer', 'hrSalaryPfBase', 'hrSalaryPfCap', 'hrSalaryPfIncludeEmployer',
        'hrSalaryEnableEsic', 'hrSalaryEsicEmployee', 'hrSalaryEsicEmployer', 'hrSalaryEsicLimit'
    ];
    reactiveSelectors.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', solveSalaryStructure);
            el.addEventListener('change', solveSalaryStructure);
        }
    });

    // Tool 1: Auto-Split helper (used in Component mode)
    const btnAutoSplit = document.getElementById('btnHrSalaryAutoSplit');
    if (btnAutoSplit) {
        btnAutoSplit.addEventListener('click', () => {
            const ctc = parseFloat(document.getElementById('hrSalaryCtc').value) || 0;
            if (ctc <= 0) {
                showToast("Please enter a valid Monthly CTC first.", "warning");
                return;
            }
            const basic = ctc * 0.5;
            const hra = basic * 0.4;
            const da = 0;
            const conveyance = 0;
            const medical = 0;
            const special = ctc - basic - hra;
            
            document.getElementById('hrSalaryBasic').value = Math.round(basic);
            document.getElementById('hrSalaryHra').value = Math.round(hra);
            document.getElementById('hrSalaryDa').value = da;
            document.getElementById('hrSalaryConveyance').value = conveyance;
            document.getElementById('hrSalaryMedical').value = medical;
            document.getElementById('hrSalarySpecial').value = Math.round(special);
            
            showToast("Components auto-split successfully (50% Basic, 40% HRA)!", "success");
        });
    }

    // Tool 1: Salary Calculator
    const btnSalary = document.getElementById('btnHrSalarySubmit');
    if (btnSalary) {
        btnSalary.addEventListener('click', async () => {
            const basic = parseFloat(document.getElementById('hrSalaryBasic').value) || 0;
            const hra = parseFloat(document.getElementById('hrSalaryHra').value) || 0;
            const da = parseFloat(document.getElementById('hrSalaryDa').value) || 0;
            const conveyance = parseFloat(document.getElementById('hrSalaryConveyance').value) || 0;
            const medical = parseFloat(document.getElementById('hrSalaryMedical').value) || 0;
            const special = parseFloat(document.getElementById('hrSalarySpecial').value) || 0;

            const enablePf = document.getElementById('hrSalaryEnablePf').checked;
            const pfEmployee = parseFloat(document.getElementById('hrSalaryPfEmployee').value) || 0;
            const pfEmployer = parseFloat(document.getElementById('hrSalaryPfEmployer').value) || 0;
            const pfBase = document.getElementById('hrSalaryPfBase').value;
            const pfCap = document.getElementById('hrSalaryPfCap').checked;
            const pfIncludeEmployer = document.getElementById('hrSalaryPfIncludeEmployer').checked;

            const enableEsic = document.getElementById('hrSalaryEnableEsic').checked;
            const esicEmployee = parseFloat(document.getElementById('hrSalaryEsicEmployee').value) || 0;
            const esicEmployer = parseFloat(document.getElementById('hrSalaryEsicEmployer').value) || 0;
            const esicLimit = document.getElementById('hrSalaryEsicLimit').checked;

            const profTax = parseFloat(document.getElementById('hrSalaryProfTax').value) || 0;
            const lwf = parseFloat(document.getElementById('hrSalaryLwf').value) || 0;

            if (basic < 0 || hra < 0 || da < 0 || conveyance < 0 || medical < 0 || special < 0 ||
                pfEmployee < 0 || pfEmployer < 0 || esicEmployee < 0 || esicEmployer < 0 ||
                profTax < 0 || lwf < 0) {
                showToast("Please enter non-negative numeric values.", "warning");
                return;
            }

            const formData = new FormData();
            formData.append("basic", basic);
            formData.append("hra", hra);
            formData.append("da", da);
            formData.append("conveyance", conveyance);
            formData.append("medical", medical);
            formData.append("special_allowance", special);
            formData.append("enable_pf", enablePf ? "true" : "false");
            formData.append("pf_employee_rate", pfEmployee);
            formData.append("pf_employer_rate", pfEmployer);
            formData.append("pf_calc_base", pfBase);
            formData.append("pf_apply_cap", pfCap ? "true" : "false");
            formData.append("pf_include_employer", pfIncludeEmployer ? "true" : "false");
            formData.append("enable_esic", enableEsic ? "true" : "false");
            formData.append("esic_employee_rate", esicEmployee);
            formData.append("esic_employer_rate", esicEmployer);
            formData.append("esic_apply_limit", esicLimit ? "true" : "false");
            formData.append("professional_tax", profTax);
            formData.append("lwf", lwf);

            const result = await callHrApi("/hr/salary-calculator", formData);
            if (result) {
                document.getElementById('resSalaryBasic').textContent = `₹${result.earnings.basic.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryHra').textContent = `₹${result.earnings.hra.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryDa').textContent = `₹${result.earnings.da.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryConveyance').textContent = `₹${result.earnings.conveyance.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryMedical').textContent = `₹${result.earnings.medical.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalarySpecial').textContent = `₹${result.earnings.special.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryGross').textContent = `₹${result.gross_salary.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

                document.getElementById('resSalaryPf').textContent = `₹${result.deductions.employee_pf.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryEsic').textContent = `₹${result.deductions.employee_esic.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryProfTax').textContent = `₹${result.deductions.professional_tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryLwf').textContent = `₹${result.deductions.lwf.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryEmployerPf').textContent = `₹${result.deductions.employer_pf.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryDeductions').textContent = `₹${result.deductions.total_employee_deductions.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                document.getElementById('resSalaryNet').textContent = `₹${result.net_take_home.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

                const employerCost = result.deductions.total_employer_contributions;
                document.getElementById('resSalaryEmployerCost').textContent = `₹${employerCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

                document.getElementById('hrSalaryResult').style.display = 'block';
                showToast("Salary calculation complete!", "success");
            }
        });
    }

    // Tool 2: Gratuity Estimator
    const btnGratuity = document.getElementById('btnHrGratuitySubmit');
    if (btnGratuity) {
        btnGratuity.addEventListener('click', async () => {
            const basic = parseFloat(document.getElementById('hrGratuityBasic').value) || 0;
            const years = parseInt(document.getElementById('hrGratuityYears').value) || 0;

            if (basic < 0 || years < 1) {
                showToast("Please enter valid positive values.", "warning");
                return;
            }

            const formData = new FormData();
            formData.append("last_drawn_basic", basic);
            formData.append("years_of_service", years);

            const result = await callHrApi("/hr/gratuity-estimator", formData);
            if (result) {
                document.getElementById('resGratuityYears').textContent = result.years_of_service;
                document.getElementById('resGratuityLimit').textContent = `$${result.tax_exemption_limit.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
                document.getElementById('resGratuityAmount').textContent = `$${result.eligible_amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

                document.getElementById('hrGratuityResult').style.display = 'block';
                showToast("Gratuity payout estimated!", "success");
            }
        });
    }

    // Tool 3: Shift Tracker
    const btnHours = document.getElementById('btnHrHoursSubmit');
    if (btnHours) {
        btnHours.addEventListener('click', async () => {
            const clockIn = document.getElementById('hrHoursIn').value.trim();
            const clockOut = document.getElementById('hrHoursOut').value.trim();
            const breakMins = parseInt(document.getElementById('hrHoursBreak').value) || 0;
            const shiftHours = parseFloat(document.getElementById('hrHoursShift').value) || 0;

            if (!clockIn || !clockOut) {
                showToast("Please enter clock-in and clock-out times.", "warning");
                return;
            }

            const formData = new FormData();
            formData.append("clock_in", clockIn);
            formData.append("clock_out", clockOut);
            formData.append("break_minutes", breakMins);
            formData.append("standard_shift_hours", shiftHours);

            const result = await callHrApi("/hr/hours-tracker", formData);
            if (result) {
                document.getElementById('resHoursWorked').textContent = `${result.total_hours_worked.toFixed(2)} hrs`;
                document.getElementById('resHoursOvertime').textContent = `${result.overtime_hours.toFixed(2)} hrs`;
                document.getElementById('resHoursMet').textContent = result.standard_met ? 'Yes' : 'No';

                document.getElementById('hrHoursResult').style.display = 'block';
                showToast("Hours and overtime calculated!", "success");
            }
        });
    }

    // Tool 4: Bulk Letter Generator
    const btnLetter = document.getElementById('btnHrLetterSubmit');
    if (btnLetter) {
        btnLetter.addEventListener('click', async () => {
            if (!hrLetterSelectedFile) {
                showToast("Please upload a template Word Document (.docx) first.", "warning");
                return;
            }
            const rawData = document.getElementById('hrLetterData').value.trim();
            if (!rawData) {
                showToast("Please supply the employee records JSON array.", "warning");
                return;
            }

            try {
                const parsed = JSON.parse(rawData);
                if (!Array.isArray(parsed)) {
                    throw new Error("Must be a JSON array");
                }
            } catch (e) {
                showToast("Invalid JSON array format: " + e.message, "error");
                return;
            }

            try {
                showGlobalLoader(true, "Generating bulk letters...");
                const formData = new FormData();
                formData.append("file", hrLetterSelectedFile);
                formData.append("employee_data", rawData);

                const response = await fetch(`${API_BASE_URL}/hr/bulk-letter-generator`, {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || `Server responded with status ${response.status}`);
                }

                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = "bulk_letters.zip";
                document.body.appendChild(link);
                link.click();
                
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);

                showToast("Letters generated and downloaded successfully!", "success");
            } catch (err) {
                console.error(err);
                showToast(err.message, "error");
            } finally {
                showGlobalLoader(false);
            }
        });
    }

    // Call solver initially to populate default 8.5 LPA structure
    solveSalaryStructure();
}

/* ==========================================================================
   Tool Workspace: Image Compressor & Converter
   ========================================================================== */

let imgCompSelectedFile = null;

function initImageCompressor() {
    const dropZone = document.getElementById('imgCompDropZone');
    const fileInput = document.getElementById('imgCompFileInput');
    const controlsPanel = document.getElementById('imgCompControls');
    const formatSelect = document.getElementById('imgCompFormat');
    const qualitySlider = document.getElementById('imgCompQuality');
    const qualityVal = document.getElementById('imgCompQualityVal');
    const scaleSlider = document.getElementById('imgCompScale');
    const scaleVal = document.getElementById('imgCompScaleVal');
    const qualityControlContainer = document.getElementById('qualityControlContainer');
    
    // Drag and drop listeners
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImageToCompress(file);
        } else {
            showToast("Please select a valid image file.", "warning");
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadImageToCompress(file);
        }
    });
    
    // Format selector toggle quality
    formatSelect.addEventListener('change', () => {
        if (formatSelect.value === 'png') {
            qualityControlContainer.style.opacity = '0.4';
            qualitySlider.disabled = true;
        } else {
            qualityControlContainer.style.opacity = '1';
            qualitySlider.disabled = false;
        }
        compressImage();
    });
    
    qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = `${qualitySlider.value}%`;
        compressImage();
    });
    
    scaleSlider.addEventListener('input', () => {
        scaleVal.textContent = `${scaleSlider.value}%`;
        compressImage();
    });
    
    // Download trigger
    document.getElementById('btnDownloadCompressed').addEventListener('click', () => {
        const preview = document.getElementById('imgCompPreview');
        if (!imgCompSelectedFile || !preview.src || preview.src === window.location.href) {
            showToast("Please upload and compress an image first.", "warning");
            return;
        }
        const baseName = origName.substring(0, origName.lastIndexOf('.')) || origName;
        const ext = formatSelect.value === 'jpeg' ? 'jpg' : formatSelect.value;
        
        const link = document.createElement('a');
        link.href = preview.src;
        link.download = `${baseName}_compressed.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Image downloaded successfully!", "success");
    });
}

function loadImageToCompress(file) {
    imgCompSelectedFile = file;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.src = evt.target.result;
        img.onload = function() {
            // Original previews
            document.getElementById('imgOrigPreview').src = img.src;
            document.getElementById('imgCompPreview').src = img.src;
            
            // Original stats
            const sizeStr = formatBytes(file.size);
            document.getElementById('imgOrigMeta').textContent = `${file.type.split('/')[1].toUpperCase()}, ${img.width} x ${img.height}, ${sizeStr}`;
            
            // Show workspace controls
            document.getElementById('imgCompControls').style.display = 'block';
            
            // Perform initial compression
            compressImage();
            
            showToast("Image loaded successfully!", "success");
        };
    };
    reader.readAsDataURL(file);
}

function compressImage() {
    const origPreview = document.getElementById('imgOrigPreview');
    const compPreview = document.getElementById('imgCompPreview');
    const formatSelect = document.getElementById('imgCompFormat');
    const qualitySlider = document.getElementById('imgCompQuality');
    const scaleSlider = document.getElementById('imgCompScale');
    
    if (!origPreview.src || !imgCompSelectedFile) return;
    
    const img = new Image();
    img.src = origPreview.src;
    img.onload = function() {
        // Calculate new dimensions
        const scale = parseFloat(scaleSlider.value) / 100;
        const newWidth = Math.max(1, Math.round(img.width * scale));
        const newHeight = Math.max(1, Math.round(img.height * scale));
        
        // Canvas compression
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const mimeType = `image/${formatSelect.value}`;
        const quality = parseFloat(qualitySlider.value) / 100;
        
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        compPreview.src = compressedDataUrl;
        
        // Calculate compressed size from Data URL
        const base64Len = compressedDataUrl.substring(compressedDataUrl.indexOf(',') + 1).length;
        const compSizeBytes = Math.round(base64Len * 0.75);
        const compSizeStr = formatBytes(compSizeBytes);
        
        // Calculate saving percentage
        const savings = ((imgCompSelectedFile.size - compSizeBytes) / imgCompSelectedFile.size) * 100;
        let savingStr = "";
        if (savings > 0) {
            savingStr = ` (Saved ${Math.round(savings)}%)`;
        } else {
            savingStr = ` (+${Math.round(-savings)}%)`;
        }
        
        // Format meta string
        const ext = formatSelect.value.toUpperCase();
        document.getElementById('imgCompMeta').textContent = `${ext}, ${newWidth} x ${newHeight}, ${compSizeStr}${savingStr}`;
    };
}

/* ==========================================================================
   Tool Workspace: Percentage Calculators
   ========================================================================== */

function initPercentageCalculator() {
    // 1. Percentage of Value
    const pctOfX = document.getElementById('pctOfX');
    const pctOfY = document.getElementById('pctOfY');
    const pctOfResult = document.getElementById('pctOfResult');

    const calcOf = () => {
        const x = parseFloat(pctOfX.value) || 0;
        const y = parseFloat(pctOfY.value) || 0;
        pctOfResult.textContent = parseFloat(((x / 100) * y).toFixed(4));
    };

    pctOfX.addEventListener('input', calcOf);
    pctOfY.addEventListener('input', calcOf);

    // 2. Percentage Ratio
    const pctRatioX = document.getElementById('pctRatioX');
    const pctRatioY = document.getElementById('pctRatioY');
    const pctRatioResult = document.getElementById('pctRatioResult');

    const calcRatio = () => {
        const x = parseFloat(pctRatioX.value) || 0;
        const y = parseFloat(pctRatioY.value) || 0;
        if (y === 0) {
            pctRatioResult.textContent = "0%";
            return;
        }
        pctRatioResult.textContent = parseFloat(((x / y) * 100).toFixed(4)) + "%";
    };

    pctRatioX.addEventListener('input', calcRatio);
    pctRatioY.addEventListener('input', calcRatio);

    // 3. Percentage Change
    const pctChangeX = document.getElementById('pctChangeX');
    const pctChangeY = document.getElementById('pctChangeY');
    const pctChangeResult = document.getElementById('pctChangeResult');

    const calcChange = () => {
        const x = parseFloat(pctChangeX.value) || 0;
        const y = parseFloat(pctChangeY.value) || 0;
        if (x === 0) {
            pctChangeResult.textContent = "N/A (Starting value is 0)";
            return;
        }
        const diff = y - x;
        const pct = (diff / Math.abs(x)) * 100;
        const sign = pct >= 0 ? "+" : "";
        const label = pct >= 0 ? "Increase" : "Decrease";
        pctChangeResult.textContent = `${sign}${parseFloat(pct.toFixed(4))}% (${label})`;
    };

    pctChangeX.addEventListener('input', calcChange);
    pctChangeY.addEventListener('input', calcChange);

    // Run defaults
    calcOf();
    calcRatio();
    calcChange();
}

/* ==========================================================================
   Tool Workspace: Salary to Hourly Converter
   ========================================================================== */

function initSalaryToHourly() {
    const wageMode = document.getElementById('wageMode');
    const wageSalaryGroup = document.getElementById('wageSalaryGroup');
    const wageSalaryPeriodGroup = document.getElementById('wageSalaryPeriodGroup');
    const wageHourlyRateGroup = document.getElementById('wageHourlyRateGroup');
    
    const wageSalaryAmount = document.getElementById('wageSalaryAmount');
    const wageSalaryPeriod = document.getElementById('wageSalaryPeriod');
    const wageHourlyRate = document.getElementById('wageHourlyRate');
    
    const wageHoursPerWeek = document.getElementById('wageHoursPerWeek');
    const wageWeeksPerYear = document.getElementById('wageWeeksPerYear');
    
    const breakdownHourly = document.getElementById('breakdownHourly');
    const breakdownWeekly = document.getElementById('breakdownWeekly');
    const breakdownMonthly = document.getElementById('breakdownMonthly');
    const breakdownAnnually = document.getElementById('breakdownAnnually');

    const updateUIState = () => {
        if (wageMode.value === 'salaryToHourly') {
            wageSalaryGroup.style.display = 'block';
            wageSalaryPeriodGroup.style.display = 'block';
            wageHourlyRateGroup.style.display = 'none';
        } else {
            wageSalaryGroup.style.display = 'none';
            wageSalaryPeriodGroup.style.display = 'none';
            wageHourlyRateGroup.style.display = 'block';
        }
        calculateWages();
    };

    const calculateWages = () => {
        const mode = wageMode.value;
        const hours = parseFloat(wageHoursPerWeek.value) || 40;
        const weeks = parseFloat(wageWeeksPerYear.value) || 52;
        const totalHours = hours * weeks;
        
        let annual = 0;
        
        if (mode === 'salaryToHourly') {
            const amount = parseFloat(wageSalaryAmount.value) || 0;
            const period = wageSalaryPeriod.value;
            
            if (period === 'yearly') {
                annual = amount;
            } else if (period === 'monthly') {
                annual = amount * 12;
            } else if (period === 'weekly') {
                annual = amount * weeks;
            }
        } else {
            const rate = parseFloat(wageHourlyRate.value) || 0;
            annual = rate * totalHours;
        }

        const hourly = annual / totalHours;
        const weekly = annual / weeks;
        const monthly = annual / 12;

        breakdownHourly.textContent = `₹${(hourly || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        breakdownWeekly.textContent = `₹${(weekly || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        breakdownMonthly.textContent = `₹${(monthly || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        breakdownAnnually.textContent = `₹${(annual || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    wageMode.addEventListener('change', updateUIState);
    wageSalaryAmount.addEventListener('input', calculateWages);
    wageSalaryPeriod.addEventListener('change', calculateWages);
    wageHourlyRate.addEventListener('input', calculateWages);
    wageHoursPerWeek.addEventListener('input', calculateWages);
    wageWeeksPerYear.addEventListener('input', calculateWages);

    // Run initial calculation
    calculateWages();
}

/* ==========================================================================
   Tool Workspace: Sales Tax Calculator
   ========================================================================== */

function initSalesTaxCalculator() {
    const taxAmount = document.getElementById('taxAmount');
    const taxRate = document.getElementById('taxRate');
    const taxType = document.getElementById('taxType');
    
    const taxNetOut = document.getElementById('taxNetOut');
    const taxValOut = document.getElementById('taxValOut');
    const taxGrossOut = document.getElementById('taxGrossOut');

    const calculateTax = () => {
        const amount = parseFloat(taxAmount.value) || 0;
        const rate = parseFloat(taxRate.value) || 0;
        const type = taxType.value;
        
        let net = 0;
        let tax = 0;
        let gross = 0;

        if (type === 'exclusive') {
            net = amount;
            tax = net * (rate / 100);
            gross = net + tax;
        } else {
            // inclusive
            gross = amount;
            net = gross / (1 + (rate / 100));
            tax = gross - net;
        }

        taxNetOut.textContent = `₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        taxValOut.textContent = `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        taxGrossOut.textContent = `₹${gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    taxAmount.addEventListener('input', calculateTax);
    taxRate.addEventListener('input', calculateTax);
    taxType.addEventListener('change', calculateTax);
    
    calculateTax();
}

/* ==========================================================================
   Tool Workspace: Geometry Calculators
   ========================================================================== */

function initGeometryCalculators() {
    // Tabs
    const btnTabArea = document.getElementById('btnTabArea');
    const btnTabCircumference = document.getElementById('btnTabCircumference');
    const geoAreaWorkspace = document.getElementById('geoAreaWorkspace');
    const geoCircumferenceWorkspace = document.getElementById('geoCircumferenceWorkspace');

    btnTabArea.addEventListener('click', () => {
        btnTabArea.classList.add('active');
        btnTabCircumference.classList.remove('active');
        geoAreaWorkspace.style.display = 'block';
        geoCircumferenceWorkspace.style.display = 'none';
    });

    btnTabCircumference.addEventListener('click', () => {
        btnTabCircumference.classList.add('active');
        btnTabArea.classList.remove('active');
        geoCircumferenceWorkspace.style.display = 'block';
        geoAreaWorkspace.style.display = 'none';
    });

    // 1. Rectangle/Square Area
    const geoRectLength = document.getElementById('geoRectLength');
    const geoRectWidth = document.getElementById('geoRectWidth');
    const geoRectResult = document.getElementById('geoRectResult');

    const calcRect = () => {
        const l = parseFloat(geoRectLength.value) || 0;
        const w = parseFloat(geoRectWidth.value) || 0;
        geoRectResult.textContent = `${parseFloat((l * w).toFixed(4))} sq ft`;
    };
    geoRectLength.addEventListener('input', calcRect);
    geoRectWidth.addEventListener('input', calcRect);

    // 2. Circle Area
    const geoCircleRadius = document.getElementById('geoCircleRadius');
    const geoCircleResult = document.getElementById('geoCircleResult');

    const calcCircleArea = () => {
        const r = parseFloat(geoCircleRadius.value) || 0;
        geoCircleResult.textContent = `${parseFloat((Math.PI * r * r).toFixed(4))} sq ft`;
    };
    geoCircleRadius.addEventListener('input', calcCircleArea);

    // 3. Triangle Area
    const geoTriBase = document.getElementById('geoTriBase');
    const geoTriHeight = document.getElementById('geoTriHeight');
    const geoTriResult = document.getElementById('geoTriResult');

    const calcTriangle = () => {
        const b = parseFloat(geoTriBase.value) || 0;
        const h = parseFloat(geoTriHeight.value) || 0;
        geoTriResult.textContent = `${parseFloat((0.5 * b * h).toFixed(4))} sq ft`;
    };
    geoTriBase.addEventListener('input', calcTriangle);
    geoTriHeight.addEventListener('input', calcTriangle);

    // 4. Circumference
    const geoCircInputType = document.getElementById('geoCircInputType');
    const geoCircValue = document.getElementById('geoCircValue');
    const geoCircumferenceResult = document.getElementById('geoCircumferenceResult');
    const geoCircValLabel = document.getElementById('geoCircValLabel');

    const calcCircumference = () => {
        const type = geoCircInputType.value;
        const val = parseFloat(geoCircValue.value) || 0;
        
        if (type === 'radius') {
            geoCircValLabel.textContent = "Radius Value (ft)";
            geoCircumferenceResult.textContent = `${parseFloat((2 * Math.PI * val).toFixed(4))} ft`;
        } else {
            geoCircValLabel.textContent = "Diameter Value (ft)";
            geoCircumferenceResult.textContent = `${parseFloat((Math.PI * val).toFixed(4))} ft`;
        }
    };

    geoCircInputType.addEventListener('change', calcCircumference);
    geoCircValue.addEventListener('input', calcCircumference);

    // Run defaults
    calcRect();
    calcCircleArea();
    calcTriangle();
    calcCircumference();
}

/* ==========================================================================
   Tool Workspace: Test Grade Calculator
   ========================================================================== */

function initTestGradeCalculator() {
    const gradeQuestions = document.getElementById('gradeQuestions');
    const gradeWrong = document.getElementById('gradeWrong');
    const gradePercentageResult = document.getElementById('gradePercentageResult');
    const gradeLetterResult = document.getElementById('gradeLetterResult');
    const gradeTableBody = document.getElementById('gradeTableBody');

    const getLetterGrade = (pct) => {
        if (pct >= 97) return 'A+';
        if (pct >= 93) return 'A';
        if (pct >= 90) return 'A-';
        if (pct >= 87) return 'B+';
        if (pct >= 83) return 'B';
        if (pct >= 80) return 'B-';
        if (pct >= 77) return 'C+';
        if (pct >= 73) return 'C';
        if (pct >= 70) return 'C-';
        if (pct >= 67) return 'D+';
        if (pct >= 63) return 'D';
        if (pct >= 60) return 'D-';
        return 'F';
    };

    const calculateGrades = () => {
        const total = parseInt(gradeQuestions.value) || 1;
        const wrong = parseInt(gradeWrong.value) || 0;
        const correct = Math.max(0, total - wrong);
        
        const pct = (correct / total) * 100;
        gradePercentageResult.textContent = `${parseFloat(pct.toFixed(2))}%`;
        gradeLetterResult.textContent = getLetterGrade(pct);

        // Populate table up to 30 wrong answers or total questions
        gradeTableBody.innerHTML = '';
        const maxWrongInTable = Math.min(total, 30);
        for (let w = 0; w <= maxWrongInTable; w++) {
            const tablePct = ((total - w) / total) * 100;
            const letter = getLetterGrade(tablePct);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-input);">${w}</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-input);">${parseFloat(tablePct.toFixed(1))}%</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-input); font-weight:600;">${letter}</td>
            `;
            gradeTableBody.appendChild(tr);
        }
    };

    gradeQuestions.addEventListener('input', calculateGrades);
    gradeWrong.addEventListener('input', calculateGrades);

    calculateGrades();
}

/* ==========================================================================
   Tool Workspace: JWT Encoder & Decoder
   ========================================================================== */

function initJWTTool() {
    const btnTabJwtDecode = document.getElementById('btnTabJwtDecode');
    const btnTabJwtEncode = document.getElementById('btnTabJwtEncode');
    const jwtDecodeWorkspace = document.getElementById('jwtDecodeWorkspace');
    const jwtEncodeWorkspace = document.getElementById('jwtEncodeWorkspace');

    btnTabJwtDecode.addEventListener('click', () => {
        btnTabJwtDecode.classList.add('active');
        btnTabJwtEncode.classList.remove('active');
        jwtDecodeWorkspace.style.display = 'block';
        jwtEncodeWorkspace.style.display = 'none';
    });

    btnTabJwtEncode.addEventListener('click', () => {
        btnTabJwtEncode.classList.add('active');
        btnTabJwtDecode.classList.remove('active');
        jwtEncodeWorkspace.style.display = 'block';
        jwtDecodeWorkspace.style.display = 'none';
    });

    // Helper functions for base64url codecs
    const base64UrlEncode = (str) => {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    const base64UrlDecode = (str) => {
        let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) {
            b64 += '=';
        }
        try {
            return decodeURIComponent(escape(atob(b64)));
        } catch (e) {
            return null;
        }
    };

    // Decode logic
    const jwtInputToken = document.getElementById('jwtInputToken');
    const jwtDecodeSecretKey = document.getElementById('jwtDecodeSecretKey');
    const jwtDecodedHeader = document.getElementById('jwtDecodedHeader');
    const jwtDecodedPayload = document.getElementById('jwtDecodedPayload');
    const jwtStatusBox = document.getElementById('jwtStatusBox');
    const jwtStatusText = document.getElementById('jwtStatusText');

    const decodeToken = async () => {
        const token = jwtInputToken.value.trim();
        const secret = jwtDecodeSecretKey.value;
        if (!token) {
            jwtDecodedHeader.textContent = "// Header JSON will print here";
            jwtDecodedPayload.textContent = "// Payload JSON will print here";
            jwtStatusBox.style.display = 'none';
            return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            jwtDecodedHeader.textContent = "Error: Invalid JWT structure (must contain 2 dots/3 parts).";
            jwtDecodedPayload.textContent = "";
            jwtStatusBox.style.display = 'block';
            jwtStatusBox.className = "result-box";
            jwtStatusBox.style.borderColor = "var(--error)";
            jwtStatusText.textContent = "Invalid Structure";
            jwtStatusText.style.color = "var(--error)";
            return;
        }

        const headerDecoded = base64UrlDecode(parts[0]);
        const payloadDecoded = base64UrlDecode(parts[1]);

        if (headerDecoded === null || payloadDecoded === null) {
            jwtDecodedHeader.textContent = "Error: Failed to base64url decode token components.";
            jwtDecodedPayload.textContent = "";
            jwtStatusBox.style.display = 'block';
            jwtStatusText.textContent = "Decode Failed";
            return;
        }

        let headerObj = null;
        try {
            headerObj = JSON.parse(headerDecoded);
            jwtDecodedHeader.innerHTML = syntaxHighlightJson(headerObj);
        } catch (e) {
            jwtDecodedHeader.textContent = headerDecoded;
        }

        let isExpired = false;
        try {
            const payloadObj = JSON.parse(payloadDecoded);
            jwtDecodedPayload.innerHTML = syntaxHighlightJson(payloadObj);
            
            // Check exp claim
            if (payloadObj.exp) {
                const curTime = Math.floor(Date.now() / 1000);
                if (curTime > payloadObj.exp) {
                    isExpired = true;
                }
            }
        } catch (e) {
            jwtDecodedPayload.textContent = payloadDecoded;
        }

        jwtStatusBox.style.display = 'block';
        jwtStatusBox.className = "result-box";

        // Signature Verification Check
        if (headerObj && headerObj.alg && headerObj.alg.toUpperCase() === 'NONE') {
            const actualSignature = parts[2];
            if (actualSignature === "") {
                if (isExpired) {
                    jwtStatusBox.style.borderColor = "var(--error)";
                    jwtStatusText.textContent = "Unsigned Token (none algorithm) but Token Expired";
                    jwtStatusText.style.color = "var(--error)";
                } else {
                    jwtStatusBox.style.borderColor = "var(--success)";
                    jwtStatusText.textContent = "Unsigned Token (none algorithm)";
                    jwtStatusText.style.color = "var(--success)";
                }
            } else {
                jwtStatusBox.style.borderColor = "var(--error)";
                jwtStatusText.textContent = "Invalid Signature (none algorithm expects empty signature)";
                jwtStatusText.style.color = "var(--error)";
            }
        } else if (secret && headerObj && headerObj.alg) {
            const alg = headerObj.alg.toUpperCase();
            let hashName = null;
            if (alg === "HS256") hashName = "SHA-256";
            else if (alg === "HS384") hashName = "SHA-384";
            else if (alg === "HS512") hashName = "SHA-512";

            if (hashName) {
                try {
                    const enc = new TextEncoder();
                    const signatureInput = `${parts[0]}.${parts[1]}`;
                    const keyData = enc.encode(secret);
                    const key = await crypto.subtle.importKey(
                        'raw',
                        keyData,
                        { name: 'HMAC', hash: { name: hashName } },
                        false,
                        ['sign']
                    );
                    const signatureBuffer = await crypto.subtle.sign(
                        'HMAC',
                        key,
                        enc.encode(signatureInput)
                    );
                    const signatureBytes = new Uint8Array(signatureBuffer);
                    let binString = "";
                    for (let i = 0; i < signatureBytes.length; i++) {
                        binString += String.fromCharCode(signatureBytes[i]);
                    }
                    const calculatedB64 = btoa(binString)
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=/g, '');
                    
                    const actualSignature = parts[2];
                    
                    if (calculatedB64 === actualSignature) {
                        if (isExpired) {
                            jwtStatusBox.style.borderColor = "var(--error)";
                            jwtStatusText.textContent = "Signature Verified but Token Expired";
                            jwtStatusText.style.color = "var(--error)";
                        } else {
                            jwtStatusBox.style.borderColor = "var(--success)";
                            let replayWarning = "";
                            if (!payloadObj.exp || !payloadObj.jti) {
                                replayWarning = "<br><span style='font-size:0.75rem; font-weight:normal; color:var(--warning);'>⚠️ Warning: Token lacks exp (expiration) or jti (unique ID) claims. Vulnerable to replay attacks.</span>";
                            }
                            jwtStatusText.innerHTML = "Signature Verified & Token Valid" + replayWarning;
                            jwtStatusText.style.color = "var(--success)";
                        }
                    } else {
                        jwtStatusBox.style.borderColor = "var(--error)";
                        jwtStatusText.textContent = "Invalid Signature (Verification Failed)";
                        jwtStatusText.style.color = "var(--error)";
                    }
                } catch (verifyErr) {
                    jwtStatusBox.style.borderColor = "var(--error)";
                    jwtStatusText.textContent = `Verification Error: ${verifyErr.message}`;
                    jwtStatusText.style.color = "var(--error)";
                }
            } else {
                jwtStatusBox.style.borderColor = "var(--warning)";
                jwtStatusText.textContent = `Unsupported algorithm (${alg}) for auto-verification`;
                jwtStatusText.style.color = "var(--warning)";
            }
        } else {
            // No secret key entered
            if (isExpired) {
                jwtStatusBox.style.borderColor = "var(--error)";
                jwtStatusText.textContent = "Expired Token (exp claim is in the past)";
                jwtStatusText.style.color = "var(--error)";
            } else {
                jwtStatusBox.style.borderColor = "var(--warning)";
                jwtStatusText.textContent = "Structure Valid (Signature not verified - no key provided)";
                jwtStatusText.style.color = "var(--warning)";
            }
        }
    };

    jwtInputToken.addEventListener('input', decodeToken);
    jwtDecodeSecretKey.addEventListener('input', decodeToken);

    // Encode logic
    const jwtHeaderJSON = document.getElementById('jwtHeaderJSON');
    const jwtPayloadJSON = document.getElementById('jwtPayloadJSON');
    const jwtSecretKey = document.getElementById('jwtSecretKey');
    const btnJwtEncodeSubmit = document.getElementById('btnJwtEncodeSubmit');
    const jwtOutputToken = document.getElementById('jwtOutputToken');
    const btnCopyJwt = document.getElementById('btnCopyJwt');

    function syntaxHighlightJson(obj) {
        return highlightJSON(JSON.stringify(obj, null, 2));
    }

    // Dynamic HMAC signer supporting HS256, HS384, HS512, none
    const generateToken = async (isManualClick = false) => {
        try {
            const headerStr = jwtHeaderJSON.value.trim();
            const payloadStr = jwtPayloadJSON.value.trim();
            const secret = jwtSecretKey.value;

            if (!headerStr || !payloadStr) return;

            // Validate inputs as JSON
            let header, payload;
            try {
                header = JSON.parse(headerStr);
            } catch (err) {
                if (isManualClick) showToast(`Header JSON Error: ${err.message}`, "error");
                return;
            }

            try {
                payload = JSON.parse(payloadStr);
            } catch (err) {
                if (isManualClick) showToast(`Payload JSON Error: ${err.message}`, "error");
                return;
            }

            const alg = (header.alg || 'HS256').toUpperCase();
            let hashName = null;
            if (alg === 'HS256') hashName = 'SHA-256';
            else if (alg === 'HS384') hashName = 'SHA-384';
            else if (alg === 'HS512') hashName = 'SHA-512';
            else if (alg !== 'NONE') {
                if (isManualClick) {
                    showToast(`Unsupported algorithm "${alg}". Defaulting to HS256.`, "warning");
                }
                header.alg = 'HS256';
                hashName = 'SHA-256';
                jwtHeaderJSON.value = JSON.stringify(header, null, 2);
            }

            const enc = new TextEncoder();
            const headerB64 = base64UrlEncode(JSON.stringify(header));
            const payloadB64 = base64UrlEncode(JSON.stringify(payload));
            const signatureInput = `${headerB64}.${payloadB64}`;

            let signatureB64 = "";

            if (alg !== 'NONE') {
                const keyData = enc.encode(secret);
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: { name: hashName } },
                    false,
                    ['sign']
                );

                const signature = await crypto.subtle.sign(
                    'HMAC',
                    key,
                    enc.encode(signatureInput)
                );

                const signatureBytes = new Uint8Array(signature);
                let binString = "";
                for (let i = 0; i < signatureBytes.length; i++) {
                    binString += String.fromCharCode(signatureBytes[i]);
                }

                signatureB64 = btoa(binString)
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            }

            jwtOutputToken.value = `${signatureInput}.${signatureB64}`;
            if (isManualClick) {
                showToast("Token encoded successfully!", "success");
            }
        } catch (e) {
            if (isManualClick) {
                showToast(`Encoding Error: ${e.message}`, "error");
            }
        }
    };

    jwtHeaderJSON.addEventListener('input', () => generateToken(false));
    jwtPayloadJSON.addEventListener('input', () => generateToken(false));
    jwtSecretKey.addEventListener('input', () => generateToken(false));
    btnJwtEncodeSubmit.addEventListener('click', () => generateToken(true));

    btnCopyJwt.addEventListener('click', () => {
        if (!jwtOutputToken.value) return;
        navigator.clipboard.writeText(sanitizeForClipboard(jwtOutputToken.value, true));
        showToast("JWT token copied to clipboard!", "success");
    });

    // Generate secure random key on load if key input is empty
    if (jwtSecretKey && !jwtSecretKey.value) {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const randomHex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        jwtSecretKey.value = randomHex;
        generateToken(false);
    }
}

/* ==========================================================================
   Tool Workspace: Hash Generator
   ========================================================================== */

// Lightweight MD5 implementation in pure Javascript
const md5 = (function() {
    function k(a, b, c, d, e, f, g) { return h(b ^ c ^ d, a, b, e, f, g); }
    function l(a, b, c, d, e, f, g) { return h(c ^ (b | ~d), a, b, e, f, g); }
    function h(a, b, c, d, e, f) {
        a = m(m(b, a), m(d, f));
        return m(a << e | a >>> 32 - e, c);
    }
    function m(a, b) {
        const c = (a & 65535) + (b & 65535);
        return (a >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535;
    }
    function g(a, b, c, d, e, f, g) { return h(b & c | ~b & d, a, b, e, f, g); }
    function i(a, b, c, d, e, f, g) { return h(b & d | c & ~d, a, b, e, f, g); }
    return function(a) {
        var b = [];
        const c = a.length * 8;
        for (var d = 0; d < a.length * 8; d += 8) b[d >> 5] |= (a.charCodeAt(d / 8) & 255) << d % 32;
        b[c >> 5] |= 128 << c % 32;
        b[(c + 64 >>> 9 << 4) + 14] = c;
        var e = 1732584193;
        var f = -271733879;
        var p = -1732584194;
        var q = 271733878;
        for (d = 0; d < b.length; d += 16) {
            const r = e, s = f, t = p, u = q;
            e = g(e, f, p, q, b[d + 0], 7, -680876936);
            q = g(q, e, f, p, b[d + 1], 12, -389564586);
            p = g(p, q, e, f, b[d + 2], 17, 606105819);
            f = g(f, p, q, e, b[d + 3], 22, -1044525330);
            e = g(e, f, p, q, b[d + 4], 7, -176418897);
            q = g(q, e, f, p, b[d + 5], 12, 1200080426);
            p = g(p, q, e, f, b[d + 6], 17, -1473231341);
            f = g(f, p, q, e, b[d + 7], 22, -45705983);
            e = g(e, f, p, q, b[d + 8], 7, 1770035416);
            q = g(q, e, f, p, b[d + 9], 12, -1958414417);
            p = g(p, q, e, f, b[d + 10], 17, -42063);
            f = g(f, p, q, e, b[d + 11], 22, -1990404162);
            e = g(e, f, p, q, b[d + 12], 7, 1804603682);
            q = g(q, e, f, p, b[d + 13], 12, -40341101);
            p = g(p, q, e, f, b[d + 14], 17, -1502002290);
            f = g(f, p, q, e, b[d + 15], 22, 1236535329);
            e = i(e, f, p, q, b[d + 1], 5, -165796510);
            q = i(q, e, f, p, b[d + 6], 9, -1069501632);
            p = i(p, q, e, f, b[d + 11], 14, 643717713);
            f = i(f, p, q, e, b[d + 0], 20, -373897302);
            e = i(e, f, p, q, b[d + 5], 5, -701558691);
            q = i(q, e, f, p, b[d + 10], 9, 38016083);
            p = i(p, q, e, f, b[d + 15], 14, -660478335);
            f = i(f, p, q, e, b[d + 4], 20, -405537848);
            e = i(e, f, p, q, b[d + 9], 5, 568446438);
            q = i(q, e, f, p, b[d + 14], 9, -1019803690);
            p = i(p, q, e, f, b[d + 3], 14, -187363961);
            f = i(f, p, q, e, b[d + 8], 20, 1163531501);
            e = i(e, f, p, q, b[d + 13], 5, -1444681467);
            q = i(q, e, f, p, b[d + 2], 9, -51403784);
            p = i(p, q, e, f, b[d + 7], 14, 1735328473);
            f = i(f, p, q, e, b[d + 12], 20, -1926607734);
            e = k(e, f, p, q, b[d + 5], 4, -378558);
            q = k(q, e, f, p, b[d + 8], 11, -2022574463);
            p = k(p, q, e, f, b[d + 11], 16, 1839030562);
            f = k(f, p, q, e, b[d + 14], 23, -35309556);
            e = k(e, f, p, q, b[d + 1], 4, -1530992060);
            q = k(q, e, f, p, b[d + 4], 11, 1272893353);
            p = k(p, q, e, f, b[d + 7], 16, -155497632);
            f = k(f, p, q, e, b[d + 10], 23, -1094730640);
            e = k(e, f, p, q, b[d + 13], 4, 681279174);
            q = k(q, e, f, p, b[d + 0], 11, -358537222);
            p = k(p, q, e, f, b[d + 3], 16, -722521979);
            f = k(f, p, q, e, b[d + 6], 23, 76029189);
            e = k(e, f, p, q, b[d + 9], 4, -640364487);
            q = k(q, e, f, p, b[d + 12], 11, -421815835);
            p = k(p, q, e, f, b[d + 15], 16, 530742520);
            f = k(f, p, q, e, b[d + 2], 23, -995338651);
            e = l(e, f, p, q, b[d + 0], 6, -198630844);
            q = l(q, e, f, p, b[d + 7], 10, 1126891415);
            p = l(p, q, e, f, b[d + 14], 15, -1416354905);
            f = l(f, p, q, e, b[d + 5], 21, -57434055);
            e = l(e, f, p, q, b[d + 12], 6, 1700485571);
            q = l(q, e, f, p, b[d + 3], 10, -1894986606);
            p = l(p, q, e, f, b[d + 10], 15, -1051523);
            f = l(f, p, q, e, b[d + 1], 21, -2054922799);
            e = l(e, f, p, q, b[d + 8], 6, 1873313359);
            q = l(q, e, f, p, b[d + 15], 10, -30611744);
            p = l(p, q, e, f, b[d + 6], 15, -1560198380);
            f = l(f, p, q, e, b[d + 13], 21, 1309151649);
            e = l(e, f, p, q, b[d + 4], 6, -145523070);
            q = l(q, e, f, p, b[d + 11], 10, -1120210379);
            p = l(p, q, e, f, b[d + 2], 15, 718787259);
            f = l(f, p, q, e, b[d + 9], 21, -343485551);
            e = m(e, r); f = m(f, s); p = m(p, t); q = m(q, u);
        }
        b = [e, f, p, q];
        var o = "";
        for (d = 0; d < b.length * 32; d += 8) o += (b[d >> 5] >>> d % 32 & 255).toString(16).padStart(2, '0');
        return o;
    };
})();

function initHashGenerator() {
    const hashInputText = document.getElementById('hashInputText');
    const hashSecretKey = document.getElementById('hashSecretKey');
    const hashMD5Out = document.getElementById('hashMD5Out');
    const hashSHA1Out = document.getElementById('hashSHA1Out');
    const hashSHA256Out = document.getElementById('hashSHA256Out');

    const labelMD5 = document.getElementById('labelMD5');
    const labelSHA1 = document.getElementById('labelSHA1');
    const labelSHA256 = document.getElementById('labelSHA256');

    const bufferToHex = (buffer) => {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    // Lightweight HMAC-MD5 helper
    const hmacMd5 = (key, message) => {
        let k = key;
        if (k.length > 64) {
            const hexHash = md5(k);
            k = "";
            for (let i = 0; i < hexHash.length; i += 2) {
                k += String.fromCharCode(parseInt(hexHash.substr(i, 2), 16));
            }
        }
        const ipad = new Array(64);
        const opad = new Array(64);
        for (let i = 0; i < 64; i++) {
            const c = i < k.length ? k.charCodeAt(i) : 0;
            ipad[i] = c ^ 0x36;
            opad[i] = c ^ 0x5c;
        }
        const ipadStr = String.fromCharCode.apply(null, ipad);
        const opadStr = String.fromCharCode.apply(null, opad);
        
        const innerHash = md5(ipadStr + message);
        let rawInner = "";
        for (let i = 0; i < innerHash.length; i += 2) {
            rawInner += String.fromCharCode(parseInt(innerHash.substr(i, 2), 16));
        }
        
        return md5(opadStr + rawInner);
    };

    const calculateHMACWebCrypto = async (hashName, key, message) => {
        try {
            const enc = new TextEncoder();
            const keyData = enc.encode(key);
            const messageData = enc.encode(message);
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: { name: hashName } },
                false,
                ['sign']
            );
            const signatureBuffer = await crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                messageData
            );
            return bufferToHex(signatureBuffer);
        } catch (e) {
            console.error(`HMAC ${hashName} calculation failed`, e);
            return "HMAC Error";
        }
    };

    const generateHashes = async () => {
        const text = hashInputText.value;
        const key = hashSecretKey.value;
        
        if (!text) {
            hashMD5Out.value = "";
            hashSHA1Out.value = "";
            hashSHA256Out.value = "";
            return;
        }

        if (key) {
            // Update labels to show HMAC mode
            if (labelMD5) labelMD5.textContent = "HMAC-MD5 (Keyed-Hash Message Authentication Code)";
            if (labelSHA1) labelSHA1.textContent = "HMAC-SHA-1 (Keyed-Hash Message Authentication Code)";
            if (labelSHA256) labelSHA256.textContent = "HMAC-SHA-256 (Keyed-Hash Message Authentication Code)";

            // 1. HMAC-MD5
            hashMD5Out.value = hmacMd5(key, text);

            // 2. HMAC-SHA-1 & HMAC-SHA-256
            hashSHA1Out.value = await calculateHMACWebCrypto('SHA-1', key, text);
            hashSHA256Out.value = await calculateHMACWebCrypto('SHA-256', key, text);
        } else {
            // Update labels to standard hash mode
            if (labelMD5) labelMD5.textContent = "MD5 Hash (128-bit checksum)";
            if (labelSHA1) labelSHA1.textContent = "SHA-1 Hash (160-bit checksum)";
            if (labelSHA256) labelSHA256.textContent = "SHA-256 Hash (256-bit secure hash)";

            // 1. MD5
            hashMD5Out.value = md5(text);

            // 2. SHA-1 & SHA-256 using Crypto Web API
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                
                const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
                hashSHA1Out.value = bufferToHex(sha1Buffer);

                const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
                hashSHA256Out.value = bufferToHex(sha256Buffer);
            } catch (e) {
                console.error("Hash calculation failed", e);
            }
        }
    };

    hashInputText.addEventListener('input', generateHashes);
    hashSecretKey.addEventListener('input', generateHashes);

    // Wire copy buttons
    const copyBtns = document.querySelectorAll('.btn-copy');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl && targetEl.value) {
                navigator.clipboard.writeText(sanitizeForClipboard(targetEl.value, true));
                showToast("Copied to clipboard!", "success");
            }
        });
    });
}

/* ==========================================================================
   Tool Workspace: Cron Expression Parser
   ========================================================================== */

function initCronParser() {
    const cronExpression = document.getElementById('cronExpression');
    const cronDescription = document.getElementById('cronDescription');
    const cronExecutionList = document.getElementById('cronExecutionList');

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const parseField = (val, min, max, labelSingular, labelPlural, names = null) => {
        if (val === '*') return `every ${labelSingular}`;
        
        // Step / Interval e.g. */15
        if (val.startsWith('*/')) {
            const step = val.split('/')[1];
            return `every ${step} ${labelPlural}`;
        }

        // Range e.g. 9-17
        if (val.includes('-')) {
            const parts = val.split('-');
            const start = names ? names[parseInt(parts[0])] : parts[0];
            const end = names ? names[parseInt(parts[1])] : parts[1];
            return `between ${start} and ${end}`;
        }

        // List e.g. 1,3,5
        if (val.includes(',')) {
            const items = val.split(',').map(item => names ? names[parseInt(item)] : item);
            return `on ${items.slice(0, -1).join(', ')} and ${items.slice(-1)}`;
        }

        return `at ${names ? names[parseInt(val)] : val}`;
    };

    const parseCronToEnglish = (expr) => {
        const fields = expr.trim().split(/\s+/);
        if (fields.length !== 5) {
            return "Invalid expression. Must contain exactly 5 space-separated fields.";
        }

        const [min, hour, dom, month, dow] = fields;

        const minDesc = parseField(min, 0, 59, "minute", "minutes");
        const hourDesc = parseField(hour, 0, 23, "hour", "hours");
        const domDesc = parseField(dom, 1, 31, "day", "days");
        const monthDesc = parseField(month, 1, 12, "month", "months", monthNames);
        const dowDesc = parseField(dow, 0, 6, "day-of-week", "days of the week", dayNames);

        let desc = "";
        
        if (min === '*' && hour === '*') {
            desc += "Every minute";
        } else if (min.startsWith('*/') && hour === '*') {
            desc += `Every ${min.split('/')[1]} minutes`;
        } else {
            const m = min.padStart(2, '0');
            const h = hour.includes('-') || hour.includes(',') || hour === '*' ? hourDesc : hour.padStart(2, '0');
            desc += `At ${h}:${m}`;
        }

        if (dom !== '*') {
            desc += `, on ${domDesc} of the month`;
        }
        
        if (month !== '*') {
            desc += `, in ${monthDesc}`;
        }

        if (dow !== '*') {
            desc += `, ${dowDesc}`;
        }

        return desc.charAt(0).toUpperCase() + desc.slice(1);
    };

    const parseFieldToSet = (field, min, max) => {
        const allowed = new Set();
        const parts = field.split(',');
        for (const part of parts) {
            if (part === '*') {
                for (let i = min; i <= max; i++) allowed.add(i);
            } else if (part.includes('/')) {
                const [range, stepStr] = part.split('/');
                const step = parseInt(stepStr, 10);
                if (isNaN(step) || step < 1) {
                    throw new Error("Interval step must be a positive integer greater than or equal to 1.");
                }
                let start = min;
                let end = max;
                if (range !== '*') {
                    if (range.includes('-')) {
                        const [s, e] = range.split('-');
                        start = parseInt(s, 10);
                        end = parseInt(e, 10);
                    } else {
                        start = parseInt(range, 10);
                    }
                }
                
                // Safety bound validation
                if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
                    throw new Error(`Out of range parameters: ${start}-${end}`);
                }
                
                for (let i = start; i <= end; i += step) {
                    allowed.add(i);
                }
            } else if (part.includes('-')) {
                const [s, e] = part.split('-');
                const start = parseInt(s, 10);
                const end = parseInt(e, 10);
                
                if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
                    throw new Error(`Out of range parameters: ${start}-${end}`);
                }
                
                for (let i = start; i <= end; i++) {
                    allowed.add(i);
                }
            } else {
                const val = parseInt(part, 10);
                if (isNaN(val) || val < min || val > max) {
                    throw new Error(`Value ${part} is out of bounds [${min}, ${max}]`);
                }
                allowed.add(val);
            }
        }
        if (allowed.size === 0) {
            throw new Error("Empty allowed set generated.");
        }
        return allowed;
    };

    const getNextExecutionTimes = (expr) => {
        const fields = expr.trim().split(/\s+/);
        if (fields.length !== 5) return [];
        
        let [minStr, hourStr, domStr, monthStr, dowStr] = fields;
        dowStr = dowStr.replace(/7/g, '0'); // standard cron 7 is Sunday, map to 0
        
        let minutes, hours, doms, months, dows;
        try {
            minutes = parseFieldToSet(minStr, 0, 59);
            hours = parseFieldToSet(hourStr, 0, 23);
            doms = parseFieldToSet(domStr, 1, 31);
            months = parseFieldToSet(monthStr, 1, 12);
            dows = parseFieldToSet(dowStr, 0, 6);
        } catch (e) {
            return ["Invalid fields value"];
        }

        const times = [];
        let current = new Date();
        current.setSeconds(0);
        current.setMilliseconds(0);
        current.setMinutes(current.getMinutes() + 1);

        const limitYear = current.getFullYear() + 5;

        while (times.length < 5 && current.getFullYear() < limitYear) {
            const m = current.getMonth() + 1; // JS month is 0-11, cron is 1-12
            if (!months.has(m)) {
                current.setMonth(current.getMonth() + 1);
                current.setDate(1);
                current.setHours(0);
                current.setMinutes(0);
                continue;
            }

            const dom = current.getDate();
            const dow = current.getDay();

            const domIsRestricted = domStr !== '*';
            const dowIsRestricted = dowStr !== '*';
            
            let dayMatch = false;
            if (domIsRestricted && dowIsRestricted) {
                dayMatch = doms.has(dom) || dows.has(dow);
            } else if (domIsRestricted) {
                dayMatch = doms.has(dom);
            } else if (dowIsRestricted) {
                dayMatch = dows.has(dow);
            } else {
                dayMatch = true;
            }

            if (!dayMatch) {
                current.setDate(current.getDate() + 1);
                current.setHours(0);
                current.setMinutes(0);
                continue;
            }

            const h = current.getHours();
            if (!hours.has(h)) {
                current.setHours(current.getHours() + 1);
                current.setMinutes(0);
                continue;
            }

            const minVal = current.getMinutes();
            if (!minutes.has(minVal)) {
                current.setMinutes(current.getMinutes() + 1);
                continue;
            }

            times.push(new Date(current));
            current.setMinutes(current.getMinutes() + 1);
        }

        return times.map(d => d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    };

    const processCron = () => {
        const expr = cronExpression.value.trim();
        if (!expr) {
            cronDescription.textContent = "Please enter a cron expression.";
            cronExecutionList.innerHTML = '';
            return;
        }

        cronDescription.textContent = parseCronToEnglish(expr);
        
        const nextTimes = getNextExecutionTimes(expr);
        cronExecutionList.innerHTML = '';
        nextTimes.forEach(time => {
            const li = document.createElement('li');
            li.className = 'result-box';
            li.textContent = time;
            cronExecutionList.appendChild(li);
        });
    };

    cronExpression.addEventListener('input', processCron);
    processCron();
}

function initMediaConverter() {
    const dropzone = document.getElementById('mediaConvDropzone');
    const fileInput = document.getElementById('mediaConvFile');
    const formatSelect = document.getElementById('mediaConvFormat');
    const qualityGroup = document.getElementById('mediaConvQualityGroup');
    const qualityInput = document.getElementById('mediaConvQuality');
    const qualityVal = document.getElementById('mediaConvQualityVal');
    const listContainer = document.getElementById('mediaConvList');
    const clearBtn = document.getElementById('mediaConvClear');
    const downloadAllBtn = document.getElementById('mediaConvDownloadAll');

    let uploadedFiles = [];

    const updateQualityVisibility = () => {
        const format = formatSelect.value;
        if (format === 'image/jpeg' || format === 'image/webp') {
            qualityGroup.style.display = 'block';
        } else {
            qualityGroup.style.display = 'none';
        }
    };
    formatSelect.addEventListener('change', () => {
        updateQualityVisibility();
        if (uploadedFiles.length > 0) {
            processAllFiles();
        }
    });

    qualityInput.addEventListener('input', (e) => {
        qualityVal.textContent = `${e.target.value}%`;
    });
    qualityInput.addEventListener('change', () => {
        if (uploadedFiles.length > 0) {
            processAllFiles();
        }
    });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = 'var(--primary-light)';
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-input)';
        dropzone.style.background = 'var(--bg-glass)';
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-input)';
        dropzone.style.background = 'var(--bg-glass)';
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addFiles(e.target.files);
        }
    });

    const addFiles = (files) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                showToast('Only image files are supported.', 'error');
                continue;
            }
            uploadedFiles.push({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                convertedDataUrl: null,
                convertedSize: null
            });
        }
        processAllFiles();
    };

    const processAllFiles = async () => {
        showGlobalLoader(true, "Converting images locally...");
        const targetFormat = formatSelect.value;
        const quality = parseInt(qualityInput.value) / 100;

        for (let item of uploadedFiles) {
            try {
                const dataUrl = await convertImage(item.file, targetFormat, quality);
                item.convertedDataUrl = dataUrl;
                const base64Content = dataUrl.split(',')[1];
                item.convertedSize = Math.round(base64Content.length * 3 / 4);
                const ext = targetFormat.split('/')[1].replace('jpeg', 'jpg');
                const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
                item.convertedName = `${baseName}_converted.${ext}`;
            } catch (err) {
                console.error("Conversion failed for file:", item.name, err);
                showToast(`Failed to convert ${item.name}`, 'error');
            }
        }
        showGlobalLoader(false);
        renderFileList();
    };

    const convertImage = (file, mimeType, quality) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    let dataUrl;
                    if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
                        dataUrl = canvas.toDataURL(mimeType, quality);
                    } else {
                        dataUrl = canvas.toDataURL(mimeType);
                    }
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error("Failed to load image."));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsDataURL(file);
        });
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderFileList = () => {
        listContainer.innerHTML = '';
        if (uploadedFiles.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No files uploaded yet</div>';
            clearBtn.disabled = true;
            downloadAllBtn.disabled = true;
            return;
        }

        clearBtn.disabled = false;
        downloadAllBtn.disabled = false;

        uploadedFiles.forEach(item => {
            const fileRow = document.createElement('div');
            fileRow.className = 'todo-item';
            fileRow.style.padding = '0.75rem 1rem';
            fileRow.style.display = 'flex';
            fileRow.style.justifyContent = 'space-between';
            fileRow.style.alignItems = 'center';
            fileRow.style.gap = '1rem';
            
            const info = document.createElement('div');
            info.style.flex = '1';
            info.style.overflow = 'hidden';
            
            const title = document.createElement('div');
            title.style.fontWeight = '600';
            title.style.fontSize = '0.9rem';
            title.style.whiteSpace = 'nowrap';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.textContent = item.name;
            
            const meta = document.createElement('div');
            meta.style.fontSize = '0.75rem';
            meta.style.color = 'var(--text-muted)';
            meta.style.marginTop = '0.2rem';
            
            const sizeStr = formatBytes(item.size);
            const convSizeStr = item.convertedSize ? ` -> ${formatBytes(item.convertedSize)}` : '';
            meta.textContent = `${sizeStr}${convSizeStr}`;
            
            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '0.5rem';
            actions.style.alignItems = 'center';

            if (item.convertedDataUrl) {
                const dlBtn = document.createElement('button');
                dlBtn.className = 'btn btn-secondary';
                dlBtn.style.padding = '0.35rem 0.6rem';
                dlBtn.style.fontSize = '0.8rem';
                dlBtn.textContent = 'Download';
                dlBtn.addEventListener('click', () => {
                    const a = document.createElement('a');
                    a.href = item.convertedDataUrl;
                    a.download = item.convertedName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                actions.appendChild(dlBtn);
            }

            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-danger';
            delBtn.style.padding = '0.35rem 0.6rem';
            delBtn.style.fontSize = '0.8rem';
            delBtn.textContent = 'Remove';
            delBtn.addEventListener('click', () => {
                uploadedFiles = uploadedFiles.filter(f => f.id !== item.id);
                renderFileList();
            });
            actions.appendChild(delBtn);

            fileRow.appendChild(info);
            fileRow.appendChild(actions);
            listContainer.appendChild(fileRow);
        });
    };

    clearBtn.addEventListener('click', () => {
        uploadedFiles = [];
        renderFileList();
    });

    downloadAllBtn.addEventListener('click', () => {
        uploadedFiles.forEach(item => {
            if (item.convertedDataUrl) {
                const a = document.createElement('a');
                a.href = item.convertedDataUrl;
                a.download = item.convertedName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    });
}

function initVideoDownloader() {
    const urlInput = document.getElementById('videoDlUrl');
    const fetchBtn = document.getElementById('videoDlFetchBtn');
    const detailsCard = document.getElementById('videoDlDetailsCard');
    const thumbnailImg = document.getElementById('videoDlThumbnail');
    const titleHeader = document.getElementById('videoDlTitle');
    const durationText = document.getElementById('videoDlDuration');
    const formatsBody = document.getElementById('videoDlFormatsBody');

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return 'Unknown';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const pad = (n) => n.toString().padStart(2, '0');
        if (h > 0) {
            return `${h}:${pad(m)}:${pad(s)}`;
        }
        return `${m}:${pad(s)}`;
    };

    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast('Please paste a valid video URL.', 'error');
            return;
        }

        showGlobalLoader(true, "Fetching video metadata and formats...");
        detailsCard.style.display = 'none';

        try {
            const response = await fetch('http://127.0.0.1:8000/api/media/fetch-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to fetch video details.');
            }

            thumbnailImg.src = data.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
            titleHeader.textContent = data.title;
            durationText.textContent = formatDuration(data.duration);

            formatsBody.innerHTML = '';
            
            if (!data.formats || data.formats.length === 0) {
                formatsBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No progressive video or audio-only streams available.</td></tr>';
            } else {
                data.formats.forEach(f => {
                    const row = document.createElement('tr');
                    
                    const typeTd = document.createElement('td');
                    typeTd.style.padding = '0.75rem';
                    const icon = f.is_audio_only 
                        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 0.35rem; color: var(--primary);"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>Audio`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 0.35rem; color: var(--primary);"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>${f.resolution}`;
                    typeTd.innerHTML = `${icon} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(${f.note || 'Direct'})</span>`;
                    
                    const extTd = document.createElement('td');
                    extTd.style.padding = '0.75rem';
                    extTd.textContent = f.ext.toUpperCase();

                    const sizeTd = document.createElement('td');
                    sizeTd.style.padding = '0.75rem';
                    sizeTd.textContent = formatBytes(f.filesize);

                    const actionTd = document.createElement('td');
                    actionTd.style.padding = '0.75rem';
                    actionTd.style.textAlign = 'center';
                    
                    const dlBtn = document.createElement('button');
                    dlBtn.className = 'btn btn-primary';
                    dlBtn.style.padding = '0.3rem 0.75rem';
                    dlBtn.style.fontSize = '0.78rem';
                    dlBtn.textContent = 'Download';
                    
                    dlBtn.addEventListener('click', () => {
                        showToast('Starting video download stream...', 'info');
                        const downloadUrl = `http://127.0.0.1:8000/api/media/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(f.format_id)}&filename=${encodeURIComponent(data.title)}`;
                        window.open(downloadUrl, '_blank');
                    });
                    
                    actionTd.appendChild(dlBtn);

                    row.appendChild(typeTd);
                    row.appendChild(extTd);
                    row.appendChild(sizeTd);
                    row.appendChild(actionTd);
                    formatsBody.appendChild(row);
                });
            }

            detailsCard.style.display = 'block';
            showToast('Video format choices retrieved!', 'success');
        } catch (err) {
            console.error("Fetch formats failed:", err);
            showToast(err.message || 'Failed to retrieve stream formats.', 'error');
        } finally {
            showGlobalLoader(false);
        }
    });
}
