const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'preguntas_extra_florecita_rockera.json'), 'utf8'));

// Colores institucionales
const PRIMARY = '#9b111e'; // Rojo fresa profundo
const DARK = '#1f2937';
const MUTED = '#4b5563';
const LIGHT_BG = '#fff5f7';
const ACCENT = '#b91c1c';
const BORDER = '#fecdd3';
const ROCK_PINK = '#ff007f';

// ==========================================
// 1. GENERAR CUADERNILLO DE EVALUACIÓN (ESTUDIANTE)
// ==========================================
function generarCuadernilloEstudiante() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    bufferPages: true
  });

  const outPath = path.join(__dirname, 'Preguntas_Extra_Florecita_Rockera_Estudiante.pdf');
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // --- PORTADA ---
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke(PRIMARY);
  doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(0.5).stroke(BORDER);

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(PRIMARY).text('BANCO DE PREGUNTAS EXTRA - PROYECTO PRODUCTIVO', { align: 'center', tracking: 1 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text('FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.font('Helvetica-Oblique').fontSize(11).fillColor(MUTED).text('Fresas Gourmet con Crema • Gestión Empresarial, Financiera, Sanitaria y Laboral', { align: 'center' });
  
  doc.moveDown(2);
  doc.rect(60, doc.y, doc.page.width - 120, 3).fill(PRIMARY);
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(18).fillColor(PRIMARY).text('PREGUNTAS EXTRA (30 ÍTEMS ESPECÍFICOS)', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text('EVALUACIÓN TIPO ICFES SABER PRO / SABER 11', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Banco Especializado sobre el Modelo de Negocio Propio', { align: 'center' });

  doc.moveDown(2);

  // Recuadro de Instrucciones
  const boxTop = doc.y;
  doc.rect(50, boxTop, doc.page.width - 100, 190).fillAndStroke('#fff1f2', PRIMARY);
  doc.fillColor(DARK);
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('INSTRUCCIONES PARA EL ESTUDIANTE', 65, boxTop + 14);
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
  const instText = 
    "1. Este cuadernillo contiene 30 preguntas extra de selección múltiple con única respuesta enfocadas directamente en el funcionamiento de Florecita Rockera S.A.S.\n\n" +
    "2. Cada pregunta consta de un contexto empresarial real, un enunciado y cuatro opciones (A, B, C, D), de las cuales SOLO UNA es la opción correcta.\n\n" +
    "3. Los temas evaluados comprenden: costeo gastronómico de recetas estándar, mermas de fruta fresca, BPM láctea, inocuidad alimentaria, liquidación de nómina con reducción de jornada (Ley 2101), régimen de S.A.S. (Ley 1258 de 2008), delivery y sostenibilidad.\n\n" +
    "4. Tiempo estimado para la prueba: 90 minutos.\n\n" +
    "5. Marque sus respuestas rellenando completamente el círculo en la HOJA DE RESPUESTAS OFICIAL al final de este cuadernillo.";
  doc.text(instText, 65, boxTop + 35, { width: doc.page.width - 130, align: 'justify', lineGap: 2 });

  doc.y = boxTop + 210;

  // Cuadro de Datos del Estudiante
  const dataBoxTop = doc.y;
  doc.rect(50, dataBoxTop, doc.page.width - 100, 110).lineWidth(1).stroke(DARK);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK);
  doc.text('DATOS DE IDENTIFICACIÓN DEL EVALUADO:', 65, dataBoxTop + 12);
  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED);
  doc.text('Nombre Completo: ____________________________________________________________________', 65, dataBoxTop + 34);
  doc.text('Documento de Identidad (T.I. / C.C.): ________________________ Grado / Curso: ________________', 65, dataBoxTop + 56);
  doc.text('Institución Educativa: _____________________________________ Fecha: ______________________', 65, dataBoxTop + 78);

  // --- CONTENIDO DE PREGUNTAS ---
  doc.addPage();
  let currentComp = '';

  questions.forEach((q) => {
    // Encabezado de Competencia si cambia
    if (q.competencia !== currentComp) {
      currentComp = q.competencia;
      
      if (doc.y > doc.page.height - 180) doc.addPage();

      doc.moveDown(0.8);
      const compY = doc.y;
      doc.rect(45, compY, doc.page.width - 90, 26).fill(PRIMARY);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(
        currentComp.toUpperCase(),
        55,
        compY + 7,
        { width: doc.page.width - 110, align: 'left' }
      );
      doc.moveDown(1.2);
    }

    // Verificar espacio para la pregunta
    if (doc.y > doc.page.height - 160) {
      doc.addPage();
    }

    // Cabecera de Pregunta
    const qTop = doc.y;
    doc.rect(45, qTop, doc.page.width - 90, 18).fill('#f3f4f6');
    doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY).text(`PREGUNTA EXTRA #${q.id}`, 52, qTop + 4);
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(`Tema: ${q.tema}  |  Dificultad: ${q.dificultad}`, 170, qTop + 4);
    
    doc.y = qTop + 24;

    // Contexto
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text('Contexto Empresarial: ', { continued: true });
    doc.font('Helvetica').fontSize(8.5).fillColor('#374151').text(q.contexto, { align: 'justify', lineGap: 1.5 });
    doc.moveDown(0.4);

    // Enunciado
    doc.font('Helvetica-Bold').fontSize(8.8).fillColor(DARK).text(q.enunciado, { align: 'justify', lineGap: 1.5 });
    doc.moveDown(0.4);

    // Opciones
    const letras = ['A', 'B', 'C', 'D'];
    letras.forEach((L) => {
      if (doc.y > doc.page.height - 50) doc.addPage();
      const optY = doc.y;
      doc.circle(53, optY + 5, 5).lineWidth(0.8).stroke(PRIMARY);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(PRIMARY).text(L, 50.5, optY + 2);
      doc.font('Helvetica').fontSize(8.3).fillColor(DARK).text(q.opciones[L], 66, optY, {
        width: doc.page.width - 115,
        align: 'justify',
        lineGap: 1
      });
      doc.moveDown(0.25);
    });

    doc.moveDown(0.8);
    doc.rect(45, doc.y, doc.page.width - 90, 0.5).fill('#e5e7eb');
    doc.moveDown(0.8);
  });

  // --- HOJA DE RESPUESTAS AL FINAL ---
  doc.addPage();
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1.5).stroke(PRIMARY);

  doc.y = 45;
  doc.font('Helvetica-Bold').fontSize(16).fillColor(PRIMARY).text('HOJA DE RESPUESTAS OFICIAL', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(DARK).text('PREGUNTAS EXTRA (30 ÍTEMS) • FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(
    'Rellene completamente el círculo correspondiente a su opción elegida. No haga marcas fuera del círculo ni use tachones.',
    { align: 'center' }
  );
  doc.moveDown(1);

  // Rejilla de Respuestas (3 columnas de 10 preguntas)
  const gridStartY = doc.y + 10;
  const colWidth = 155;
  const rowHeight = 22;

  for (let i = 1; i <= 30; i++) {
    const colIndex = Math.floor((i - 1) / 10);
    const rowIndex = (i - 1) % 10;
    const itemX = 65 + (colIndex * colWidth);
    const itemY = gridStartY + (rowIndex * rowHeight);

    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text(
      `${i < 10 ? '0' + i : i}.`,
      itemX,
      itemY + 3
    );

    const letras = ['A', 'B', 'C', 'D'];
    letras.forEach((L, idx) => {
      const circleX = itemX + 28 + (idx * 24);
      const circleY = itemY + 7;
      doc.circle(circleX, circleY, 7).lineWidth(0.8).stroke(DARK);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK).text(L, circleX - 2.8, circleY - 4.5);
    });
  }

  // Recuadro de Calificación
  const califY = gridStartY + (10 * rowHeight) + 30;
  doc.rect(50, califY, doc.page.width - 100, 75).lineWidth(1).stroke(PRIMARY);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text('ESPACIO EXCLUSIVO DEL EVALUADOR / DOCENTE', 65, califY + 12);
  doc.font('Helvetica').fontSize(9).fillColor(DARK);
  doc.text('Total Aciertos: _______ / 30       Puntaje Base 100: _______ / 100       Calificación Cualitativa: _________________', 65, califY + 30);
  doc.text('Firma y Observaciones del Evaluador: ____________________________________________________________________', 65, califY + 50);

  // Números de página
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
      doc.text(
        'Florecita Rockera S.A.S. • Banco de Preguntas Extra (30 Ítems)',
        45,
        20,
        { width: doc.page.width - 90, align: 'left' }
      );
      doc.text(
        `Página ${i + 1} de ${range.count}`,
        45,
        doc.page.height - 25,
        { width: doc.page.width - 90, align: 'center' }
      );
    }
  }

  doc.end();
}

// ==========================================
// 2. GENERAR SOLUCIONARIO PEDAGÓGICO
// ==========================================
function generarSolucionario() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    bufferPages: true
  });

  const outPath = path.join(__dirname, 'Preguntas_Extra_Florecita_Rockera_Solucionario.pdf');
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // --- PORTADA SOLUCIONARIO ---
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#047857');
  doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(0.5).stroke('#a7f3d0');

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#065f46').text('SOLUCIONARIO DE PREGUNTAS EXTRA', { align: 'center', tracking: 1 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text('FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.font('Helvetica-Oblique').fontSize(11).fillColor(MUTED).text('Fresas Gourmet con Crema • Matriz de Claves y Argumentación Pedagógica', { align: 'center' });
  
  doc.moveDown(2);
  doc.rect(60, doc.y, doc.page.width - 120, 3).fill('#047857');
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(18).fillColor('#047857').text('SOLUCIONARIO OFICIAL Y MATRIZ PEDAGÓGICA', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text('30 PREGUNTAS EXTRA TIPO ICFES', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Clave de Respuesta Correcta y Justificación Técnica de Descarte', { align: 'center' });

  doc.moveDown(2);

  // Tabla Resumen de Claves Rápida
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#065f46').text('TABLA RESUMEN DE CLAVES DE RESPUESTA (1 A 30):', { align: 'center' });
  doc.moveDown(0.8);

  const startTableY = doc.y;
  const colW = 50;
  const rH = 22;

  // Encabezados fila 1-15
  for (let i = 1; i <= 15; i++) {
    const qObj = questions.find(x => x.id === i);
    const xPos = 45 + ((i - 1) * 34.5);
    doc.rect(xPos, startTableY, 34, rH).fillAndStroke('#ecfdf5', '#059669');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#065f46').text(`Q${i}`, xPos, startTableY + 3, { width: 34, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#047857').text(qObj ? qObj.clave : '-', xPos, startTableY + 11, { width: 34, align: 'center' });
  }

  // Encabezados fila 16-30
  for (let i = 16; i <= 30; i++) {
    const qObj = questions.find(x => x.id === i);
    const xPos = 45 + ((i - 16) * 34.5);
    const yPos = startTableY + rH + 4;
    doc.rect(xPos, yPos, 34, rH).fillAndStroke('#ecfdf5', '#059669');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#065f46').text(`Q${i}`, xPos, yPos + 3, { width: 34, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#047857').text(qObj ? qObj.clave : '-', xPos, yPos + 11, { width: 34, align: 'center' });
  }

  doc.moveDown(5);

  // --- CONTENIDO DETALLADO DE CADA RESPUESTA ---
  doc.addPage();
  questions.forEach((q) => {
    if (doc.y > doc.page.height - 140) doc.addPage();

    const boxY = doc.y;
    doc.rect(45, boxY, doc.page.width - 90, 20).fill('#047857');
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#ffffff').text(`PREGUNTA EXTRA #${q.id}: ${q.tema}`, 52, boxY + 5);
    
    doc.y = boxY + 26;

    // Fila de Clave
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#065f46').text(`OPCIÓN CORRECTA: (${q.clave})`, { continued: true });
    doc.font('Helvetica').fontSize(9).fillColor(DARK).text(` — ${q.opciones[q.clave]}`, { lineGap: 1.5 });
    doc.moveDown(0.4);

    // Justificación Pedagógica
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text('Justificación y Análisis de Distractores:');
    doc.font('Helvetica').fontSize(8.3).fillColor('#374151').text(q.justificacion, { align: 'justify', lineGap: 1.5 });

    doc.moveDown(0.8);
    doc.rect(45, doc.y, doc.page.width - 90, 0.5).fill('#d1fae5');
    doc.moveDown(0.8);
  });

  // Números de página
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
      doc.text(
        'Florecita Rockera S.A.S. • Solucionario de Preguntas Extra (30 Ítems)',
        45,
        20,
        { width: doc.page.width - 90, align: 'left' }
      );
      doc.text(
        `Página ${i + 1} de ${range.count}`,
        45,
        doc.page.height - 25,
        { width: doc.page.width - 90, align: 'center' }
      );
    }
  }

  doc.end();
}

generarCuadernilloEstudiante();
generarSolucionario();
console.log('PDFs de Preguntas Extra generados exitosamente.');
