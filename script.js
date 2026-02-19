// Global state
let sections = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for real-time preview
    document.getElementById('minggu').addEventListener('input', updatePreview);
    document.getElementById('tanggal').addEventListener('input', updatePreview);
    document.getElementById('seri').addEventListener('input', updatePreview);
    document.getElementById('judul').addEventListener('input', updatePreview);
    document.getElementById('subjudul').addEventListener('input', updatePreview);
    document.getElementById('pendahuluan').addEventListener('input', updatePreview);
    document.getElementById('penutup').addEventListener('input', updatePreview);
    
    // Inisialisasi 1 section kosong jika tidak ada data
    if(sections.length === 0) {
        addNewSection();
    }
    
    updatePreview();
});

// Tab switching
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`content-${tabName}`).classList.add('active');
}

// Parse JSON dari Gemini
function parseWithAI() {
    let fullText = document.getElementById('full-text-input').value;
    
    if (!fullText.trim()) {
        alert('Mohon paste hasil JSON dari Gemini terlebih dahulu!');
        return;
    }
    
    try {
        let jsonText = fullText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("Format JSON tidak ditemukan.");
        }
        
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        const parsedData = JSON.parse(jsonText);
        
        document.getElementById('minggu').value = parsedData.minggu || '';
        document.getElementById('tanggal').value = parsedData.tanggal || '';
        document.getElementById('seri').value = parsedData.seri || 'SERIAL MONOTEISME ALKITABIAH';
        document.getElementById('judul').value = parsedData.judul || '';
        document.getElementById('subjudul').value = parsedData.subjudul || '';
        document.getElementById('pendahuluan').value = parsedData.pendahuluan || '';
        document.getElementById('penutup').value = parsedData.penutup || '';
        
        // Memuat sections dan me-render form editor-nya
        sections = parsedData.sections || [];
        renderSectionsEditor(); 
        
        document.getElementById('tab-manual').click();
        updatePreview();
        showNotification('✅ Data berhasil dimuat ke dalam form!', 'success');
        
    } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Terjadi kesalahan! Pastikan teks yang di-paste adalah format JSON yang valid.\n\nError: ' + error.message);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 16px 24px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* =========================================
   DYNAMIC SECTION BUILDER LOGIC
   ========================================= */

// Render semua form input untuk sections di sebelah kiri
function renderSectionsEditor() {
    const container = document.getElementById('sections-editor-container');
    container.innerHTML = '';
    
    sections.forEach((section, sIndex) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.cssText = 'background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; position: relative;';
        
        // HTML untuk Ayat
        let versesHTML = '';
        if(section.verses) {
            section.verses.forEach((verse, vIndex) => {
                versesHTML += `
                    <div class="verse-item" style="background: white; border: 1px solid #cbd5e1;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="font-size:12px; font-weight:bold; color:#64748b;">Ayat ${vIndex + 1}</span>
                            <button type="button" onclick="removeVerse(${sIndex}, ${vIndex})" style="color:#ef4444; background:none; border:none; cursor:pointer; font-size:12px;">Hapus Ayat</button>
                        </div>
                        <input type="text" class="form-input" placeholder="Ref (Cth: Ulangan 8:2)" value="${verse.ref}" oninput="updateVerseRef(${sIndex}, ${vIndex}, this.value)">
                        <textarea class="form-textarea" rows="2" placeholder="Teks ayat..." oninput="updateVerseText(${sIndex}, ${vIndex}, this.value)">${verse.text}</textarea>
                    </div>
                `;
            });
        }

        // HTML untuk Poin
        let pointsHTML = '';
        if(section.points) {
            section.points.forEach((point, pIndex) => {
                pointsHTML += `
                    <div class="point-item" style="display:flex; gap:8px; margin-bottom:8px;">
                        <input type="text" class="form-input" placeholder="Poin penting..." value="${point}" oninput="updatePoint(${sIndex}, ${pIndex}, this.value)">
                        <button type="button" onclick="removePoint(${sIndex}, ${pIndex})" style="color:white; background:#ef4444; border:none; padding:0 12px; border-radius:4px; cursor:pointer;">✖</button>
                    </div>
                `;
            });
        }

        // Gabungkan ke dalam 1 Card Section
        sectionDiv.innerHTML = `
            <button class="btn-remove" onclick="removeSection(${sIndex})" style="top: 10px; right: 10px;">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <h3 style="color:#1e3a8a; margin-bottom:15px; font-size:16px;">Bagian ${sIndex + 1}</h3>
            
            <div class="form-group">
                <label class="form-label">Judul Bagian</label>
                <input type="text" class="form-input" value="${section.title || ''}" oninput="updateSectionTitle(${sIndex}, this.value)">
            </div>
            
            <div class="form-group">
                <label class="form-label">Ayat Alkitab</label>
                ${versesHTML}
                <button type="button" class="btn-add-verse" onclick="addVerse(${sIndex})">+ Tambah Ayat</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">Penjelasan Khotbah</label>
                <textarea class="form-textarea" rows="4" oninput="updateSectionContent(${sIndex}, this.value)">${section.content || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Poin Penting</label>
                ${pointsHTML}
                <button type="button" class="btn-add-verse" onclick="addPoint(${sIndex})">+ Tambah Poin</button>
            </div>
        `;
        container.appendChild(sectionDiv);
    });
}

// Fungsi Edit State Data
function addNewSection() { sections.push({title:'', content:'', verses:[], points:[]}); renderSectionsEditor(); updatePreview(); }
function removeSection(sIndex) { sections.splice(sIndex, 1); renderSectionsEditor(); updatePreview(); }

function updateSectionTitle(sIndex, val) { sections[sIndex].title = val; updatePreview(); }
function updateSectionContent(sIndex, val) { sections[sIndex].content = val; updatePreview(); }

function addVerse(sIndex) { if(!sections[sIndex].verses) sections[sIndex].verses = []; sections[sIndex].verses.push({ref:'', text:''}); renderSectionsEditor(); }
function removeVerse(sIndex, vIndex) { sections[sIndex].verses.splice(vIndex, 1); renderSectionsEditor(); updatePreview(); }
function updateVerseRef(sIndex, vIndex, val) { sections[sIndex].verses[vIndex].ref = val; updatePreview(); }
function updateVerseText(sIndex, vIndex, val) { sections[sIndex].verses[vIndex].text = val; updatePreview(); }

function addPoint(sIndex) { if(!sections[sIndex].points) sections[sIndex].points = []; sections[sIndex].points.push(''); renderSectionsEditor(); }
function removePoint(sIndex, pIndex) { sections[sIndex].points.splice(pIndex, 1); renderSectionsEditor(); updatePreview(); }
function updatePoint(sIndex, pIndex, val) { sections[sIndex].points[pIndex] = val; updatePreview(); }

/* =========================================
   PREVIEW & PDF GENERATOR
   ========================================= */

function updatePreview() {
    document.getElementById('preview-minggu').textContent = `Minggu ${document.getElementById('minggu').value}`;
    document.getElementById('preview-tanggal').textContent = document.getElementById('tanggal').value;
    
    const elements = ['seri', 'judul', 'subjudul', 'pendahuluan', 'penutup'];
    elements.forEach(id => {
        const val = document.getElementById(id).value;
        const el = document.getElementById('preview-' + id);
        if(id === 'pendahuluan' || id === 'penutup') {
            const section = document.getElementById(`preview-${id}-section`);
            if(val) { el.textContent = val; section.style.display = 'block'; }
            else { section.style.display = 'none'; }
        } else {
            if(val) { el.textContent = val; el.style.display = 'block'; }
            else { el.style.display = 'none'; }
        }
    });
    renderSectionsPreview();
}

function renderSectionsPreview() {
    const container = document.getElementById('preview-sections');
    container.innerHTML = '';
    
    sections.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'preview-section-item';
        
        let versesHTML = '';
        if(section.verses) {
            section.verses.forEach(verse => {
                if (verse.ref || verse.text) {
                    versesHTML += `<div class="preview-verse"><div class="preview-verse-ref">📖 ${verse.ref}</div><p class="preview-verse-text">"${verse.text}"</p></div>`;
                }
            });
        }
        
        let pointsHTML = '';
        if(section.points) {
            const validPoints = section.points.filter(p => p.trim() !== '');
            if (validPoints.length > 0) {
                pointsHTML = '<div class="preview-points-label">➡ Poin penting:</div>';
                validPoints.forEach(point => { pointsHTML += `<div class="preview-point">• ${point}</div>`; });
            }
        }
        
        sectionDiv.innerHTML = `
            <div class="preview-section-title">${index + 1}. ${section.title}</div>
            ${versesHTML}
            <p class="preview-section-content">${section.content}</p>
            ${pointsHTML}
        `;
        container.appendChild(sectionDiv);
    });
}

function generatePDF() {
    const makalahData = {
        minggu: document.getElementById('minggu').value,
        tanggal: document.getElementById('tanggal').value,
        seri: document.getElementById('seri').value,
        judul: document.getElementById('judul').value,
        subjudul: document.getElementById('subjudul').value,
        pendahuluan: document.getElementById('pendahuluan').value,
        sections: sections,
        penutup: document.getElementById('penutup').value
    };
    
    if (!makalahData.judul) { alert('Mohon isi minimal Judul Makalah!'); return; }
    
    const btn = document.querySelector('.btn-generate');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Generating...'; btn.disabled = true;
    
    try {
        const htmlContent = generateHTMLForPDF(makalahData);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            btn.innerHTML = originalHTML; btn.disabled = false;
        }, 500);
    } catch (error) {
        alert('Terjadi kesalahan saat generate PDF.');
        btn.innerHTML = originalHTML; btn.disabled = false;
    }
}

// Generate HTML for PDF (FIXED MARGIN & COVER)
// Generate HTML for PDF (NATURAL FLOW & CONSISTENT MARGINS)
function generateHTMLForPDF(data) {
    let sectionsHTML = '';
    data.sections.forEach((section, index) => {
        let versesHTML = '';
        if(section.verses) {
            section.verses.forEach(verse => {
                // Kotak ayat diberi 'avoid' agar satu kotak ayat tidak terpotong dua, tapi teks penjelasannya dibiarkan mengalir alami
                if (verse.ref || verse.text) versesHTML += `<div class="verse"><div class="verse-ref">📖 ${verse.ref}</div><p style="margin:0;">"${verse.text}"</p></div>`;
            });
        }
        
        let pointsHTML = '';
        if(section.points) {
            const validPoints = section.points.filter(p => p.trim() !== '');
            if (validPoints.length > 0) {
                pointsHTML = '<div style="font-weight: bold; margin: 15px 0 10px 0;">➡ Poin penting:</div>';
                validPoints.forEach(point => { pointsHTML += `<div class="point">${point}</div>`; });
            }
        }
        
        // Teks kini dibiarkan mengalir alami tanpa pembungkus page-break-inside
        sectionsHTML += `
            <div class="section-title">${index + 1}. ${section.title}</div>
            ${versesHTML}
            <p style="text-align: justify; margin: 20px 0;">${section.content}</p>
            ${pointsHTML}
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                /* 1. Set Margin 2.5cm untuk SEMUA halaman (Isi Makalah akan selalu rapi di tengah, tidak nabrak atas/bawah) */
                @page { 
                    size: A4 portrait; 
                    margin: 2.5cm; 
                }
                
                /* 2. KHUSUS halaman pertama (Cover), margin di-Nol-kan agar warna biru full mentok ujung kertas */
                @page :first { 
                    margin: 0; 
                }
                
                * { box-sizing: border-box; }
                
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                    margin: 0;
                    padding: 0;
                }
                
                /* ============ COVER ============ */
                .cover { 
                    background: linear-gradient(135deg, #003d82 0%, #0056b3 100%); 
                    color: white; 
                    width: 100%;
                    height: 297mm; /* Tinggi presisi A4 */
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    text-align: center; 
                    page-break-after: always;
                    padding: 2.5cm; /* Memberikan batas agar isi cover tidak mepet */
                }
                
                .logo-container { margin-bottom: 60px; }
                .logo-img { width: 150px; border-radius: 12px; }
                .title { font-size: 46px; font-weight: bold; margin: 15px 0; }
                .subtitle { font-size: 22px; margin: 10px 0; letter-spacing: 2px;}
                
                .date-box { 
                    background: white; 
                    color: #003d82; 
                    padding: 20px 60px; 
                    margin-top: 60px; 
                    font-size: 26px; 
                    font-weight: bold; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
                }
                
                /* ============ KONTEN ============ */
                .content-page { 
                    /* Padding dikosongkan karena margin kertas (@page) sudah di-set 2.5cm keliling */
                    padding: 0; 
                }
                
                .section-title { 
                    background: #003d82; color: white; padding: 12px 20px; margin: 30px 0 15px 0; 
                    font-size: 18px; font-weight: bold; border-radius: 4px; 
                    page-break-after: avoid; /* Mencegah judul sendirian di bawah halaman */
                }
                
                .verse { 
                    background: #f0f4f8; padding: 15px 20px; margin: 15px 0; 
                    border-left: 5px solid #003d82; border-radius: 0 4px 4px 0; 
                    page-break-inside: avoid; /* Mencegah 1 kotak ayat kepotong jadi 2 halaman */
                }
                
                .verse-ref { font-weight: bold; color: #003d82; margin-bottom: 5px; }
                .point { margin: 8px 0; padding-left: 20px; position: relative; }
                .point:before { content: "•"; color: #003d82; font-weight: bold; font-size: 20px; position: absolute; left: 0; top: -4px; }
                
                .closing-box {
                    background: linear-gradient(135deg, #003d82 0%, #0056b3 100%); color: white; 
                    padding: 25px; text-align: center; margin-top: 40px; font-style: italic; 
                    border-radius: 12px; font-size: 16px;
                    page-break-inside: avoid;
                }
            </style>
        </head>
        <body>
            <div class="cover">
                <div class="logo-container">
                    <img src="logo home.jpeg" alt="HOME Logo" class="logo-img" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='block';">
                    <div id="logo-fallback" style="display: none; font-size: 72px; font-weight: bold;">🏠<br>HOME</div>
                </div>
                <h1 class="title">Bahan Sharing<br>HOME PLUS</h1>
                <p class="subtitle">GSKI REHOBOT SURABAYA</p>
                <div class="date-box">
                    Minggu ${data.minggu}<br>${data.tanggal}
                </div>
            </div>
            
            <div class="content-page">
                <h2 style="color: #003d82; text-align: center; margin-bottom: 10px; font-size: 18px; letter-spacing: 1px;">${data.seri}</h2>
                <h1 style="text-align: center; margin-bottom: 5px; font-size: 28px;">${data.judul}</h1>
                <p style="text-align: center; color: #666; margin-bottom: 30px; font-style: italic;">${data.subjudul}</p>
                
                ${data.pendahuluan ? `
                    <h3 style="font-size: 20px; margin-top: 10px; color: #003d82;">Pendahuluan:</h3>
                    <p style="text-align: justify;">${data.pendahuluan}</p>
                ` : ''}
                
                ${sectionsHTML}
                
                ${data.penutup ? `
                    <h3 style="font-size: 20px; margin-top: 30px; color: #003d82;">Penutup:</h3>
                    <p style="text-align: justify;">${data.penutup}</p>
                    <div class="closing-box">
                        Kiranya makalah HOME ini menolong kita bukan hanya memahami Yesus,<br>tetapi mengikuti jejak hidup-Nya. Tuhan Memberkati.
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
}