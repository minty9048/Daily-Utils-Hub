// ========================================
// Global State & Initialization
// ========================================
let currentFilter = 'all';
let todos = JSON.parse(localStorage.getItem('todos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initialize navigation
    setupNavigation();

    // Initialize all tools
    initPasswordGenerator();
    initQRGenerator();
    initColorPalette();
    initMemeGenerator();
    initFakeDataGenerator();
    initTextCaseConverter();
    initBase64Tool();
    initJSONFormatter();
    initTodoList();
    initNoteTaker();

    // Setup theme toggle
    setupThemeToggle();

    // Setup search
    setupSearch();
}

// ========================================
// Navigation System
// ========================================
function setupNavigation() {
    const toolButtons = document.querySelectorAll('.tool-btn, .bottom-nav-btn');

    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolId = button.getAttribute('data-tool');
            switchTool(toolId);
        });
    });
}

function switchTool(toolId) {
    // Hide all tools
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected tool
    const selectedTool = document.getElementById(toolId);
    if (selectedTool) {
        selectedTool.classList.add('active');
    }

    // Update active state on buttons
    document.querySelectorAll('.tool-btn, .bottom-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelectorAll(`[data-tool="${toolId}"]`).forEach(btn => {
        btn.classList.add('active');
    });
}

// ========================================
// Theme Toggle
// ========================================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ========================================
// Search Functionality
// ========================================
function setupSearch() {
    const searchBar = document.getElementById('searchBar');

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const toolButtons = document.querySelectorAll('.tool-btn');

        toolButtons.forEach(button => {
            const toolName = button.textContent.toLowerCase();
            const listItem = button.parentElement;

            if (toolName.includes(searchTerm)) {
                listItem.style.display = 'block';
            } else {
                listItem.style.display = 'none';
            }
        });
    });
}

// ========================================
// Tool 1: Password Generator
// ========================================
function initPasswordGenerator() {
    const generateBtn = document.getElementById('generatePassword');
    const copyBtn = document.getElementById('copyPassword');
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');

    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', () => copyToClipboard('passwordOutput'));

    // Generate initial password
    generatePassword();
}

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (chars === '') {
        alert('Please select at least one character type');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('passwordOutput').value = password;
    updateStrengthMeter(password, length);
}

function updateStrengthMeter(password, length) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;
    if (length >= 12) strength += 25;
    if (length >= 16) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

    strengthBar.style.width = strength + '%';

    if (strength < 50) {
        strengthBar.style.backgroundColor = '#ea4335';
        strengthText.textContent = 'Strength: Weak';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#fbbc04';
        strengthText.textContent = 'Strength: Medium';
    } else {
        strengthBar.style.backgroundColor = '#34a853';
        strengthText.textContent = 'Strength: Strong';
    }
}

// ========================================
// Tool 2: QR Code Generator
// ========================================
function initQRGenerator() {
    const generateBtn = document.getElementById('generateQR');
    const downloadBtn = document.getElementById('downloadQR');

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
}

function generateQRCode() {
    const text = document.getElementById('qrInput').value.trim();
    if (!text) {
        alert('Please enter text or URL');
        return;
    }

    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');

    // Simple QR code implementation (basic pattern)
    const size = 256;
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Generate simple QR pattern based on text
    ctx.fillStyle = 'black';

    // Position detection patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, size - 7 * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, size - 7 * moduleSize, moduleSize);

    // Data modules (simplified - pseudo-random based on text)
    const hash = simpleHash(text);
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // Skip finder patterns
            if ((row < 8 && col < 8) ||
                (row < 8 && col >= modules - 8) ||
                (row >= modules - 8 && col < 8)) {
                continue;
            }

            // Pseudo-random pattern based on hash
            if (((hash + row * col) % 2) === 0) {
                ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
            }
        }
    }
}

function drawFinderPattern(ctx, x, y, moduleSize) {
    // Outer square
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function downloadQRCode() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
}

// ========================================
// Tool 3: Color Palette Generator
// ========================================
function initColorPalette() {
    const generateBtn = document.getElementById('generatePalette');
    const colorPicker = document.getElementById('baseColor');
    const colorHex = document.getElementById('baseColorHex');

    colorPicker.addEventListener('input', (e) => {
        colorHex.value = e.target.value;
    });

    colorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorPicker.value = e.target.value;
        }
    });

    generateBtn.addEventListener('click', generateColorPalette);

    // Generate initial palette
    generateColorPalette();
}

function generateColorPalette() {
    const baseColor = document.getElementById('baseColor').value;
    const swatchesContainer = document.getElementById('paletteSwatches');

    const hsl = hexToHSL(baseColor);
    const shades = [
        { name: 'Lighter', l: Math.min(hsl.l + 20, 90) },
        { name: 'Light', l: Math.min(hsl.l + 10, 80) },
        { name: 'Base', l: hsl.l },
        { name: 'Dark', l: Math.max(hsl.l - 10, 20) },
        { name: 'Darker', l: Math.max(hsl.l - 20, 10) }
    ];

    swatchesContainer.innerHTML = '';

    shades.forEach(shade => {
        const color = hslToHex(hsl.h, hsl.s, shade.l);
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = '#fff';
        swatch.innerHTML = `
            <div class="swatch-color" style="background-color: ${color}"></div>
            <div class="swatch-name">${shade.name}</div>
            <div class="swatch-hex">${color}</div>
        `;
        swatch.addEventListener('click', () => {
            copyToClipboardDirect(color);
            showCopyFeedback(swatch);
        });
        swatchesContainer.appendChild(swatch);
    });
}

function hexToHSL(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function showCopyFeedback(element) {
    const originalBG = element.style.backgroundColor;
    element.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        element.style.backgroundColor = originalBG;
    }, 300);
}

// ========================================
// Tool 4: Meme Text Generator
// ========================================
function initMemeGenerator() {
    const topText = document.getElementById('topText');
    const bottomText = document.getElementById('bottomText');
    const fontSize = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const textColor = document.getElementById('textColor');
    const exportBtn = document.getElementById('exportMeme');

    fontSize.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value;
        drawMeme();
    });

    topText.addEventListener('input', drawMeme);
    bottomText.addEventListener('input', drawMeme);
    textColor.addEventListener('input', drawMeme);

    exportBtn.addEventListener('click', exportMeme);

    // Draw initial meme
    drawMeme();
}

function drawMeme() {
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    const topText = document.getElementById('topText').value.toUpperCase();
    const bottomText = document.getElementById('bottomText').value.toUpperCase();
    const fontSize = document.getElementById('fontSize').value;
    const textColor = document.getElementById('textColor').value;

    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw top text
    if (topText) {
        ctx.strokeText(topText, canvas.width / 2, 20);
        ctx.fillText(topText, canvas.width / 2, 20);
    }

    // Draw bottom text
    if (bottomText) {
        ctx.textBaseline = 'bottom';
        ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
        ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
    }
}

function exportMeme() {
    const canvas = document.getElementById('memeCanvas');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
}

// ========================================
// Tool 5: Fake Data Generator
// ========================================
function initFakeDataGenerator() {
    document.getElementById('genName').addEventListener('click', () => generateFakeData('name'));
    document.getElementById('genEmail').addEventListener('click', () => generateFakeData('email'));
    document.getElementById('genPhone').addEventListener('click', () => generateFakeData('phone'));
    document.getElementById('genAddress').addEventListener('click', () => generateFakeData('address'));
    document.getElementById('genIBAN').addEventListener('click', () => generateFakeData('iban'));
    document.getElementById('copyAllData').addEventListener('click', copyAllFakeData);
}

const fakeData = {
    firstNames: ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Jennifer'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
    streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd', 'Park Ave'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    states: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH']
};

function generateFakeData(type) {
    let value = '';

    switch (type) {
        case 'name':
            value = randomItem(fakeData.firstNames) + ' ' + randomItem(fakeData.lastNames);
            document.getElementById('fakeName').textContent = value;
            break;
        case 'email':
            const firstName = randomItem(fakeData.firstNames).toLowerCase();
            const lastName = randomItem(fakeData.lastNames).toLowerCase();
            value = `${firstName}.${lastName}@example.com`;
            document.getElementById('fakeEmail').textContent = value;
            break;
        case 'phone':
            value = `+1 (${randomDigits(3)}) ${randomDigits(3)}-${randomDigits(4)}`;
            document.getElementById('fakePhone').textContent = value;
            break;
        case 'address':
            value = `${randomInt(1, 9999)} ${randomItem(fakeData.streets)}, ${randomItem(fakeData.cities)}, ${randomItem(fakeData.states)} ${randomDigits(5)}`;
            document.getElementById('fakeAddress').textContent = value;
            break;
        case 'iban':
            value = `GB${randomDigits(2)} ${randomLetters(4)} ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(2)}`;
            document.getElementById('fakeIBAN').textContent = value;
            break;
    }
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function randomLetters(length) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
}

function copyAllFakeData() {
    const name = document.getElementById('fakeName').textContent;
    const email = document.getElementById('fakeEmail').textContent;
    const phone = document.getElementById('fakePhone').textContent;
    const address = document.getElementById('fakeAddress').textContent;
    const iban = document.getElementById('fakeIBAN').textContent;

    const allData = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nIBAN: ${iban}`;
    copyToClipboardDirect(allData);
}

// ========================================
// Tool 6: Text Case Converter
// ========================================
function initTextCaseConverter() {
    document.getElementById('upperCase').addEventListener('click', () => convertCase('upper'));
    document.getElementById('lowerCase').addEventListener('click', () => convertCase('lower'));
    document.getElementById('sentenceCase').addEventListener('click', () => convertCase('sentence'));
    document.getElementById('titleCase').addEventListener('click', () => convertCase('title'));
    document.getElementById('snakeCase').addEventListener('click', () => convertCase('snake'));
    document.getElementById('kebabCase').addEventListener('click', () => convertCase('kebab'));
    document.getElementById('camelCase').addEventListener('click', () => convertCase('camel'));
    document.getElementById('copyText').addEventListener('click', () => copyToClipboard('textOutput'));
}

function convertCase(type) {
    const input = document.getElementById('textInput').value;
    const output = document.getElementById('textOutput');

    if (!input) {
        alert('Please enter some text');
        return;
    }

    let result = '';

    switch (type) {
        case 'upper':
            result = input.toUpperCase();
            break;
        case 'lower':
            result = input.toLowerCase();
            break;
        case 'sentence':
            result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
            break;
        case 'title':
            result = input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            break;
        case 'snake':
            result = input.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
            break;
        case 'kebab':
            result = input.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            break;
        case 'camel':
            result = input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
            break;
    }

    output.value = result;
}

// ========================================
// Tool 7: Base64 Encoder/Decoder
// ========================================
function initBase64Tool() {
    const encodeBtn = document.getElementById('encodeBase64');
    const decodeBtn = document.getElementById('decodeBase64');
    const fileInput = document.getElementById('fileInput');
    const copyBtn = document.getElementById('copyBase64');

    encodeBtn.addEventListener('click', encodeBase64);
    decodeBtn.addEventListener('click', decodeBase64);
    fileInput.addEventListener('change', handleFileUpload);
    copyBtn.addEventListener('click', () => copyToClipboard('base64Output'));
}

function encodeBase64() {
    const input = document.getElementById('base64Input').value;
    if (!input) {
        alert('Please enter text to encode');
        return;
    }

    const encoded = btoa(unescape(encodeURIComponent(input)));
    document.getElementById('base64Output').value = encoded;
    document.getElementById('imagePreview').innerHTML = '';
}

function decodeBase64() {
    const input = document.getElementById('base64Input').value;
    if (!input) {
        alert('Please enter Base64 to decode');
        return;
    }

    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64Output').value = decoded;

        // Try to display as image if it's an image
        if (input.startsWith('data:image/') || input.startsWith('/9j/')) {
            const img = document.createElement('img');
            img.src = input.startsWith('data:') ? input : `data:image/jpeg;base64,${input}`;
            img.style.maxWidth = '100%';
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').appendChild(img);
        }
    } catch (e) {
        alert('Invalid Base64 string');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        document.getElementById('base64Input').value = base64;

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '100%';
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').appendChild(img);
        }
    };
    reader.readAsDataURL(file);
}

// ========================================
// Tool 8: JSON Formatter
// ========================================
function initJSONFormatter() {
    document.getElementById('beautifyJSON').addEventListener('click', () => formatJSON('beautify'));
    document.getElementById('minifyJSON').addEventListener('click', () => formatJSON('minify'));
    document.getElementById('validateJSON').addEventListener('click', validateJSON);
    document.getElementById('copyJSON').addEventListener('click', () => copyToClipboard('jsonOutput'));
}

function formatJSON(type) {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    const errorDiv = document.getElementById('jsonError');

    if (!input) {
        alert('Please enter JSON');
        return;
    }

    try {
        const parsed = JSON.parse(input);

        if (type === 'beautify') {
            output.value = JSON.stringify(parsed, null, 2);
        } else {
            output.value = JSON.stringify(parsed);
        }

        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    } catch (e) {
        errorDiv.textContent = `Error: ${e.message}`;
        errorDiv.classList.add('show');
        output.value = '';
    }
}

function validateJSON() {
    const input = document.getElementById('jsonInput').value;
    const errorDiv = document.getElementById('jsonError');

    if (!input) {
        alert('Please enter JSON');
        return;
    }

    try {
        JSON.parse(input);
        errorDiv.textContent = '✅ Valid JSON!';
        errorDiv.style.backgroundColor = '#d4edda';
        errorDiv.style.color = '#155724';
        errorDiv.classList.add('show');

        setTimeout(() => {
            errorDiv.classList.remove('show');
            errorDiv.style.backgroundColor = '#fce8e6';
            errorDiv.style.color = '#c5221f';
        }, 2000);
    } catch (e) {
        errorDiv.textContent = `❌ Invalid JSON: ${e.message}`;
        errorDiv.classList.add('show');
    }
}

// ========================================
// Tool 9: Todo List Manager
// ========================================
function initTodoList() {
    const addBtn = document.getElementById('addTodo');
    const input = document.getElementById('todoInput');
    const clearBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');

    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    clearBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTodos();
        });
    });

    renderTodos();
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (!text) return;

    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTodos();
    renderTodos();
    input.value = '';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById('todoList');

    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    list.innerHTML = '';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn">Delete</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        list.appendChild(li);
    });
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// ========================================
// Tool 10: Note Taker Pad
// ========================================
function initNoteTaker() {
    const input = document.getElementById('markdownInput');
    const saveBtn = document.getElementById('saveNote');
    const loadBtn = document.getElementById('loadNote');
    const exportBtn = document.getElementById('exportNote');

    input.addEventListener('input', updateMarkdownPreview);
    saveBtn.addEventListener('click', saveNote);
    loadBtn.addEventListener('click', loadNote);
    exportBtn.addEventListener('click', exportNote);

    // Load saved note
    loadNote();
}

function updateMarkdownPreview() {
    const input = document.getElementById('markdownInput').value;
    const preview = document.getElementById('markdownPreview');

    let html = input;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    preview.innerHTML = html;
}

function saveNote() {
    const content = document.getElementById('markdownInput').value;
    localStorage.setItem('savedNote', content);
    alert('Note saved!');
}

function loadNote() {
    const saved = localStorage.getItem('savedNote');
    if (saved) {
        document.getElementById('markdownInput').value = saved;
        updateMarkdownPreview();
    }
}

function exportNote() {
    const content = document.getElementById('markdownInput').value;

    if (!content) {
        alert('Nothing to export');
        return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'note.txt';
    link.click();
}

// ========================================
// Utility Functions
// ========================================
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    showToast('Copied to clipboard!');
}

function copyToClipboardDirect(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!');
}

function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #323232;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
