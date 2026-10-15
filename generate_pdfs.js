const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'icfes_questions.json'), 'utf8'));

// Colores institucionales
const PRIMARY = '#9b111e'; // Rojo fresa profundo
const DARK = '#1f2937';
const MUTED = '#4b5563';
const LIGHT_BG = '#fff5f7';
const ACCENT = '#b91c1c';
const BORDER = '#fecdd3';

// ==========================================
// 1. GENERAR CUADERNILLO DE EVALUACIÓN (ESTUDIANTE)
// ==========================================
function generarCuadernilloEstudiante() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    bufferPages: true
  });

  const outPath = path.join(__dirname, 'Evaluacion_ICFES_Tercer_Periodo_Estudiante.pdf');
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // --- PORTADA ---
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke(PRIMARY);
  doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(0.5).stroke(BORDER);

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(PRIMARY).text('PROYECTO INTEGRAL PRODUCTIVO - TERCER PERIODO', { align: 'center', tracking: 1 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text('FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.font('Helvetica-Oblique').fontSize(11).fillColor(MUTED).text('Fresas Gourmet con Crema • Gestión Empresarial, Financiera y Tecnológica', { align: 'center' });
  
  doc.moveDown(2);
  doc.rect(60, doc.y, doc.page.width - 120, 3).fill(PRIMARY);
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(18).fillColor(PRIMARY).text('CUADERNILLO OFICIAL DE EVALUACIÓN', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text('40 PREGUNTAS TIPO ICFES POR COMPETENCIAS', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Modelo Basado en Evidencias (Saber 11 / Saber Pro)', { align: 'center' });

  doc.moveDown(2);

  // Recuadro de Instrucciones
  const boxTop = doc.y;
  doc.rect(50, boxTop, doc.page.width - 100, 200).fillAndStroke('#fff1f2', PRIMARY);
  doc.fillColor(DARK);
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('INSTRUCCIONES GENERALES PARA EL ESTUDIANTE', 65, boxTop + 14);
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
  const instText = 
    "1. Este cuadernillo contiene 40 preguntas de selección múltiple con única respuesta organizadas en 4 competencias fundamentales.\n\n" +
    "2. Cada pregunta consta de un contexto o situación problema empresarial, un enunciado y cuatro opciones identificadas con las letras (A, B, C, D), de las cuales SOLO UNA es la opción correcta.\n\n" +
    "3. Lea cuidadosamente cada caso, tabla o problema antes de responder. Puede hacer cálculos u operaciones en las hojas de borrador autorizadas.\n\n" +
    "4. Marque sus respuestas en la HOJA DE RESPUESTAS OFICIAL ubicada al final de este cuadernillo, rellenando completamente el círculo correspondiente.\n\n" +
    "5. Tiempo estimado para la prueba: 120 minutos (2 horas).\n\n" +
    "6. Materiales permitidos: Lápiz de grafito No. 2, borrador, tajalápiz y calculadora básica no programable.";
  doc.text(instText, 65, boxTop + 35, { width: doc.page.width - 130, align: 'justify', lineGap: 2 });

  doc.y = boxTop + 220;

  // Cuadro de Datos del Estudiante
  const dataBoxTop = doc.y;
  doc.rect(50, dataBoxTop, doc.page.width - 100, 110).lineWidth(1).stroke(DARK);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK);
  doc.text('DATOS DE IDENTIFICACIÓN DEL EVALUADO:', 65, dataBoxTop + 12);
  doc.font('Helvetica').fontSize(9.5);
  doc.text('Nombres y Apellidos: ____________________________________________________________________', 65, dataBoxTop + 32);
  doc.text('Documento de Identidad: ___________________________    Grado / Curso: ____________________', 65, dataBoxTop + 54);
  doc.text('Institución Educativa: _____________________________    Fecha: ____________________________', 65, dataBoxTop + 76);

  // --- PÁGINAS DE PREGUNTAS ---
  doc.addPage();

  questions.forEach((q, idx) => {
    // Si la pregunta no cabe holgadamente en la página, saltar
    if (doc.y > doc.page.height - 180) {
      doc.addPage();
    }

    const startY = doc.y;

    // Encabezado de la pregunta
    doc.rect(45, startY, doc.page.width - 90, 20).fill(LIGHT_BG);
    doc.rect(45, startY, doc.page.width - 90, 20).lineWidth(0.5).stroke(BORDER);
    
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(PRIMARY).text(`PREGUNTA ${q.id}`, 52, startY + 5);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(`[${q.competencia.toUpperCase()}]`, 140, startY + 6);
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(PRIMARY).text(`Dificultad: ${q.dificultad} | Tema: ${q.tema}`, 52, startY + 5, { align: 'right', width: doc.page.width - 100 });

    doc.moveDown(1.5);

    // Contexto
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#374151');
    doc.text(`Situación / Contexto: "${q.contexto}"`, 50, doc.y, { width: doc.page.width - 95, align: 'justify', lineGap: 1.5 });
    doc.moveDown(0.7);

    // Enunciado
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111827');
    doc.text(q.enunciado, 50, doc.y, { width: doc.page.width - 95, align: 'justify', lineGap: 1.5 });
    doc.moveDown(0.7);

    // Opciones A, B, C, D
    const letras = ['A', 'B', 'C', 'D'];
    letras.forEach(L => {
      if (doc.y > doc.page.height - 65) {
        doc.addPage();
      }
      const optY = doc.y;
      // Círculo con letra
      doc.circle(58, optY + 5, 7).lineWidth(1).stroke(PRIMARY);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(PRIMARY).text(L, 55, optY + 1.5);
      // Texto opción
      doc.font('Helvetica').fontSize(8.8).fillColor('#1f2937').text(q.opciones[L], 72, optY, {
        width: doc.page.width - 120,
        align: 'justify',
        lineGap: 1.2
      });
      doc.moveDown(0.4);
    });

    doc.moveDown(0.8);
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
    doc.moveDown(0.8);
  });

  // --- HOJA DE RESPUESTAS AL FINAL ---
  doc.addPage();
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1.5).stroke(PRIMARY);

  doc.y = 45;
  doc.font('Helvetica-Bold').fontSize(16).fillColor(PRIMARY).text('HOJA DE RESPUESTAS OFICIAL', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(DARK).text('EVALUACIÓN ICFES TERCER PERIODO • FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(
    'Rellene completamente el círculo correspondiente a su opción elegida. No haga marcas fuera del círculo ni use tachones.',
    { align: 'center' }
  );
  doc.moveDown(1);

  // Cuadro de datos
  const dY = doc.y;
  doc.rect(45, dY, doc.page.width - 90, 50).fillAndStroke('#f9fafb', '#d1d5db');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK);
  doc.text('Estudiante: ___________________________________________________________', 55, dY + 10);
  doc.text('Doc. Identidad: __________________________   Fecha: ___________________', 55, dY + 28);
  doc.text('Firma del Estudiante: __________________________________________________', 300, dY + 28);

  doc.y = dY + 65;

  // Grilla de Respuestas en 2 Columnas (1 a 20 y 21 a 40)
  const col1X = 70;
  const col2X = 330;
  const rowH = 17;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY);
  doc.text('Ítem   A    B    C    D', col1X, doc.y);
  doc.text('Ítem   A    B    C    D', col2X, doc.y);
  doc.moveDown(0.5);

  const gridStartY = doc.y;

  for (let i = 1; i <= 20; i++) {
    const currY = gridStartY + (i - 1) * rowH;
    
    // Columna 1: Preguntas 1 a 20
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text(i < 10 ? ` 0${i}.` : ` ${i}.`, col1X, currY);
    ['A', 'B', 'C', 'D'].forEach((l, idx) => {
      const circX = col1X + 38 + idx * 22;
      doc.circle(circX, currY + 4, 6).lineWidth(0.8).stroke('#6b7280');
      doc.font('Helvetica').fontSize(7).fillColor('#6b7280').text(l, circX - 2.5, currY + 1);
    });

    // Columna 2: Preguntas 21 a 40
    const q2 = i + 20;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text(` ${q2}.`, col2X, currY);
    ['A', 'B', 'C', 'D'].forEach((l, idx) => {
      const circX = col2X + 38 + idx * 22;
      doc.circle(circX, currY + 4, 6).lineWidth(0.8).stroke('#6b7280');
      doc.font('Helvetica').fontSize(7).fillColor('#6b7280').text(l, circX - 2.5, currY + 1);
    });
  }

  // Cuadro de Calificación
  const califY = gridStartY + 20 * rowH + 20;
  doc.rect(45, califY, doc.page.width - 90, 60).fillAndStroke(LIGHT_BG, BORDER);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY).text('ESPACIO EXCLUSIVO DEL DOCENTE / EVALUADOR', 55, califY + 8);
  doc.font('Helvetica').fontSize(8.5).fillColor(DARK);
  doc.text('Aciertos: _____ / 40     Puntaje Escala 100: _____ / 100     Desempeño: [ ] Superior  [ ] Alto  [ ] Básico  [ ] Bajo', 55, califY + 24);
  doc.text('Firma y Observaciones del Evaluador: ____________________________________________________________________', 55, califY + 42);

  // Números de página
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) { // En páginas interiores
      doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
      doc.text(
        'Florecita Rockera S.A.S. • Evaluación Tipo ICFES Tercer Periodo',
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
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('Cuadernillo Estudiante generado en:', outPath);
      resolve(outPath);
    });
    stream.on('error', reject);
  });
}

// ==========================================
// 2. GENERAR SOLUCIONARIO CON RESPUESTAS Y JUSTIFICACIONES
// ==========================================
function generarSolucionarioRespuestas() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    bufferPages: true
  });

  const outPath = path.join(__dirname, 'Solucionario_Respuestas_ICFES_Tercer_Periodo.pdf');
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // --- PORTADA SOLUCIONARIO ---
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#047857'); // Verde esmeralda para solucionario
  doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(0.5).stroke('#a7f3d0');

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#065f46').text('PROYECTO INTEGRAL PRODUCTIVO - TERCER PERIODO', { align: 'center', tracking: 1 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text('FLORECITA ROCKERA S.A.S.', { align: 'center' });
  doc.font('Helvetica-Oblique').fontSize(11).fillColor(MUTED).text('Plan de Negocios, Sector Financiero, Nómina y Sistemas Tecnológicos', { align: 'center' });
  
  doc.moveDown(2);
  doc.rect(60, doc.y, doc.page.width - 120, 3).fill('#047857');
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').fontSize(18).fillColor('#047857').text('SOLUCIONARIO OFICIAL Y MATRIZ PEDAGÓGICA', { align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK).text('CLAVES DE RESPUESTAS Y JUSTIFICACIONES TÉCNICAS', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Documento Exclusivo de Retroalimentación y Calificación Docente', { align: 'center' });

  doc.moveDown(2);

  // Tabla Resumen Rápida de Claves en Portada
  const tblTop = doc.y;
  doc.rect(45, tblTop, doc.page.width - 90, 260).fillAndStroke('#f0fdf4', '#6ee7b7');
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#065f46').text('TABLA RÁPIDA DE CLAVES DE RESPUESTA (1 - 40)', 55, tblTop + 12, { align: 'center', width: doc.page.width - 110 });
  
  // 4 columnas de 10 preguntas
  const cW = (doc.page.width - 130) / 4;
  for (let col = 0; col < 4; col++) {
    const colLeft = 60 + col * cW;
    let rY = tblTop + 35;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#065f46').text('Pregunta   Clave', colLeft, rY);
    rY += 14;
    for (let r = 0; r < 10; r++) {
      const qNum = col * 10 + r + 1;
      const qObj = questions[qNum - 1];
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text(qNum < 10 ? ` 0${qNum}.` : ` ${qNum}.`, colLeft, rY);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#047857').text(`[ ${qObj.clave} ]`, colLeft + 48, rY);
      rY += 18;
    }
  }

  doc.y = tblTop + 280;
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text(
    '* A continuación se presenta el desglose analítico de cada ítem con su fundamentación conceptual, fórmulas y el descarte de distractores.',
    50,
    doc.y,
    { width: doc.page.width - 100, align: 'center' }
  );

  // --- DETALLE Y JUSTIFICACIONES ÍTEM POR ÍTEM ---
  doc.addPage();

  questions.forEach(q => {
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    const itemTop = doc.y;

    // Encabezado
    doc.rect(45, itemTop, doc.page.width - 90, 24).fill('#ecfdf5');
    doc.rect(45, itemTop, doc.page.width - 90, 24).lineWidth(0.5).stroke('#6ee7b7');
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#065f46').text(`ÍTEM #${q.id}: ${q.tema}`, 52, itemTop + 6);
    
    // Cuadro de Clave
    doc.rect(doc.page.width - 120, itemTop + 3, 65, 18).fillAndStroke('#047857', '#065f46');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(`CLAVE: ${q.clave}`, doc.page.width - 115, itemTop + 7, { align: 'center', width: 55 });

    doc.moveDown(1.8);

    // Metadata
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK).text('Competencia Evaluada: ', 50, doc.y, { continued: true });
    doc.font('Helvetica').fillColor(MUTED).text(`${q.competencia}   |   `, { continued: true });
    doc.font('Helvetica-Bold').fillColor(DARK).text('Nivel de Dificultad: ', { continued: true });
    doc.font('Helvetica').fillColor(MUTED).text(q.dificultad);
    doc.moveDown(0.5);

    // Enunciado
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Enunciado del Problema:', 50, doc.y);
    doc.font('Helvetica').fontSize(8.5).fillColor('#374151').text(q.enunciado, 50, doc.y, { width: doc.page.width - 95, align: 'justify', lineGap: 1.2 });
    doc.moveDown(0.5);

    // Opción Correcta
    doc.rect(50, doc.y, doc.page.width - 95, 22).fill('#d1fae5');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#065f46').text(`Respuesta Correcta (${q.clave}): `, 55, doc.y + 5, { continued: true });
    doc.font('Helvetica').fillColor('#064e3b').text(q.opciones[q.clave], { width: doc.page.width - 110 });
    doc.moveDown(1.5);

    // Justificación Pedagógica y Descarte
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#065f46').text('Justificación Técnica y Análisis de Distractores:', 50, doc.y);
    doc.font('Helvetica').fontSize(8.5).fillColor('#1f2937').text(q.justificacion, 50, doc.y, {
      width: doc.page.width - 95,
      align: 'justify',
      lineGap: 1.4
    });

    doc.moveDown(1);
    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
    doc.moveDown(0.8);
  });

  // Numeración
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
      doc.text(
        'Florecita Rockera S.A.S. • Solucionario y Matriz Pedagógica ICFES Tercer Periodo',
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
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('Solucionario Respuestas generado en:', outPath);
      resolve(outPath);
    });
    stream.on('error', reject);
  });
}

// Ejecutar ambas generaciones
async function run() {
  try {
    await generarCuadernilloEstudiante();
    await generarSolucionarioRespuestas();
    console.log('¡Ambos PDFs generados exitosamente!');
  } catch (err) {
    console.error('Error generando PDFs:', err);
    process.exit(1);
  }
}

run();
